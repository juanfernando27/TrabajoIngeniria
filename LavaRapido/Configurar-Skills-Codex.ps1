[CmdletBinding()]
param(
    [string]$ZipDirectory = (Join-Path $env:USERPROFILE 'Downloads')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-SkillName {
    param([string]$SkillFile)
    $content = Get-Content -LiteralPath $SkillFile -Raw -Encoding UTF8
    $match = [regex]::Match($content, '(?m)^name:\s*["'']?([a-z0-9-]+)')
    if (-not $match.Success) { throw "SKILL.md sin nombre válido en $SkillFile" }
    return $match.Groups[1].Value
}

function Expand-CheckedArchive {
    param([string]$ZipPath, [string]$Destination, [string[]]$IncludePrefixes)
    $zip = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
    try {
        $prefix = [System.IO.Path]::GetFullPath($Destination).TrimEnd('\') + '\'
        foreach ($entry in $zip.Entries) {
            $target = [System.IO.Path]::GetFullPath((Join-Path $Destination $entry.FullName))
            if (-not $target.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                throw "La entrada del ZIP sale de su carpeta de extracción. $($entry.FullName)"
            }
            $include = $false
            foreach ($item in $IncludePrefixes) {
                if ($entry.FullName.StartsWith($item, [System.StringComparison]::Ordinal)) { $include = $true; break }
            }
            if ($include -and $entry.Name) {
                New-Item -ItemType Directory -Path ([System.IO.Path]::GetDirectoryName($target)) -Force | Out-Null
                [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $false)
            }
        }
    } finally {
        $zip.Dispose()
    }
}

function Install-LocalSkill {
    param([string]$Source, [string]$Name, [string]$Provider, [string]$LicenseFile)
    $destination = Join-Path $script:SkillsRoot $Name
    if ($Name -eq 'improve-animations' -and -not (Test-Path -LiteralPath $destination) -and -not $script:ExistingSkills.ContainsKey($Name)) {
        $script:Results.Add([pscustomobject]@{ nombre = $Name; proveedor = $Provider; ruta = $Source; estado = 'PENDIENTE_REVISION_SEGURIDAD' })
        Write-Warning 'improve-animations requiere revisión porque su importación personal fue rechazada por el escáner de seguridad.'
        return
    }
    if (-not (Test-Path -LiteralPath $destination) -and $script:ExistingSkills.ContainsKey($Name)) {
        $script:Results.Add([pscustomobject]@{ nombre = $Name; proveedor = $Provider; ruta = $script:ExistingSkills[$Name]; estado = 'EXISTENTE_OTRA_RUTA_REVISAR' })
        return
    }
    if (Test-Path -LiteralPath $destination) {
        $skillFile = Join-Path $destination 'SKILL.md'
        if (-not (Test-Path -LiteralPath $skillFile)) { throw "Existe una carpeta sin SKILL.md en $destination. Revísala antes de instalar." }
        if ((Get-SkillName $skillFile) -ne $Name) { throw "La carpeta $destination contiene otra skill. Se conservó su contenido." }
        $script:Results.Add([pscustomobject]@{ nombre = $Name; proveedor = $Provider; ruta = $destination; estado = 'EXISTENTE_CONSERVADA' })
        return
    }

    $candidate = Join-Path $Source 'SKILL.md'
    if ((Get-SkillName $candidate) -ne $Name) { throw "El nombre de $candidate no coincide con $Name" }
    Copy-Item -LiteralPath $Source -Destination $destination -Recurse
    if ($LicenseFile -and (Test-Path -LiteralPath $LicenseFile)) { Copy-Item -LiteralPath $LicenseFile -Destination $destination }
    $skillFile = Join-Path $destination 'SKILL.md'
    $content = Get-Content -LiteralPath $skillFile -Raw -Encoding UTF8
    $explicitOnly = $content -match '(?m)^disable-model-invocation:\s*true\s*$'
    $content = [regex]::Replace($content, '(?m)^disable-model-invocation:[^\r\n]*\r?\n', '')
    $content = [regex]::Replace($content, '(?m)^version:\s*([^\r\n]+)\r?\n', 'metadata:' + "`n" + '  version: "$1"' + "`n")

    if ($Provider -eq 'Remotion' -and $Name -eq 'remotion-best-practices') {
        $content = [regex]::Replace($content, '\]\(\./(remotion-[a-z-]+)/', '](../$1/')
    }
    if ($Provider -eq 'Remotion' -and $Name -eq 'remotion-markup') {
        $content = $content.Replace('](./remotion-maps/', '](../remotion-maps/')
    }
    [System.IO.File]::WriteAllText($skillFile, $content, (New-Object System.Text.UTF8Encoding $false))

    if ($explicitOnly) {
        $agentsDirectory = Join-Path $destination 'agents'
        New-Item -ItemType Directory -Path $agentsDirectory -Force | Out-Null
        $agentFile = Join-Path $agentsDirectory 'openai.yaml'
        if (-not (Test-Path -LiteralPath $agentFile)) {
            $agentContent = "interface:`n  display_name: '$Name'`n  short_description: 'Herramientas de diseño y animación'`n  default_prompt: 'Usa `$$Name para revisar este proyecto.'`npolicy:`n  allow_implicit_invocation: false`n"
            [System.IO.File]::WriteAllText($agentFile, $agentContent, (New-Object System.Text.UTF8Encoding $false))
        }
    }
    $script:Results.Add([pscustomobject]@{ nombre = $Name; proveedor = $Provider; ruta = $destination; estado = 'INSTALADA' })
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
Get-Command node.exe -ErrorAction Stop | Out-Null
Get-Command npx.cmd -ErrorAction Stop | Out-Null
$nodeVersion = (& node.exe --version).TrimStart('v')
if ([version]$nodeVersion -lt [version]'24.0.0') { throw 'Este paquete de LavaRápido requiere Node.js 24 o superior.' }

$ZipDirectory = (Resolve-Path -LiteralPath $ZipDirectory).Path
$archives = @('impeccable-main.zip', 'skills-main.zip', 'remotion-main.zip')
foreach ($archive in $archives) {
    if (-not (Test-Path -LiteralPath (Join-Path $ZipDirectory $archive) -PathType Leaf)) {
        throw "Falta $archive en $ZipDirectory. Extrae skills diseño.zip y vuelve a ejecutar con -ZipDirectory apuntando a la carpeta que contiene los tres ZIP."
    }
}

$script:SkillsRoot = Join-Path $env:USERPROFILE '.agents\skills'
New-Item -ItemType Directory -Path $script:SkillsRoot -Force | Out-Null
$workRoot = Join-Path $env:LOCALAPPDATA ('LavaRapido\instalacion-skills-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $workRoot -Force | Out-Null
$script:Results = New-Object 'System.Collections.Generic.List[object]'
$script:ExistingSkills = @{}
$legacyRoot = Join-Path $env:USERPROFILE '.codex\skills'
if (Test-Path -LiteralPath $legacyRoot) {
    foreach ($existing in (Get-ChildItem -LiteralPath $legacyRoot -Filter SKILL.md -File -Recurse -ErrorAction SilentlyContinue)) {
        if ($existing.FullName -match '[\\/]uninstalled[\\/]') { continue }
        try { $script:ExistingSkills[(Get-SkillName $existing.FullName)] = $existing.DirectoryName } catch { }
    }
}

Write-Host 'Inspeccionando las distribuciones descargadas...'
foreach ($archive in $archives) {
    $destination = Join-Path $workRoot ([System.IO.Path]::GetFileNameWithoutExtension($archive))
    $include = switch ($archive) {
        'impeccable-main.zip' { @('impeccable-main/.agents/skills/impeccable/', 'impeccable-main/README.md', 'impeccable-main/package.json') }
        'skills-main.zip' { @('skills-main/skills/', 'skills-main/README.md', 'skills-main/LICENSE') }
        'remotion-main.zip' { @('remotion-main/packages/skills/skills/', 'remotion-main/packages/skills/README.md', 'remotion-main/LICENSE.md') }
    }
    Expand-CheckedArchive -ZipPath (Join-Path $ZipDirectory $archive) -Destination $destination -IncludePrefixes $include
}

$impeccableSource = Join-Path $workRoot 'impeccable-main\impeccable-main\.agents\skills\impeccable'
$emilRoot = Join-Path $workRoot 'skills-main\skills-main\skills'
$remotionRoot = Join-Path $workRoot 'remotion-main\remotion-main\packages\skills\skills'
foreach ($directory in @($impeccableSource, $emilRoot, $remotionRoot)) {
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) { throw "La estructura descargada cambió. Revisa $directory" }
}
$emilSkills = @(Get-ChildItem -LiteralPath $emilRoot -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') })
$remotionSkills = @(Get-ChildItem -LiteralPath $remotionRoot -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') })
if ($emilSkills.Count -ne 18 -or $remotionSkills.Count -ne 13) { throw 'Las cantidades de skills difieren de las versiones inspeccionadas. Conserva los ZIP y revisa su inventario.' }

$impeccableDestination = Join-Path $script:SkillsRoot 'impeccable'
if (Test-Path -LiteralPath $impeccableDestination) {
    if ((Get-SkillName (Join-Path $impeccableDestination 'SKILL.md')) -ne 'impeccable') { throw 'La carpeta global de Impeccable contiene otra skill.' }
    $script:Results.Add([pscustomobject]@{ nombre = 'impeccable'; proveedor = 'Impeccable'; ruta = $impeccableDestination; estado = 'EXISTENTE_CONSERVADA' })
} elseif ($script:ExistingSkills.ContainsKey('impeccable')) {
    $script:Results.Add([pscustomobject]@{ nombre = 'impeccable'; proveedor = 'Impeccable'; ruta = $script:ExistingSkills['impeccable']; estado = 'EXISTENTE_OTRA_RUTA_REVISAR' })
} else {
    Write-Host 'Instalando Impeccable 4.8.2 con su instalador oficial para Codex...'
    & npx.cmd --yes impeccable@4.8.2 install --providers=codex --scope=global --yes --no-hooks
    if ($LASTEXITCODE -ne 0) { throw 'El instalador oficial de Impeccable no pudo finalizar.' }
    if (-not (Test-Path -LiteralPath (Join-Path $impeccableDestination 'SKILL.md'))) { throw 'El instalador no dejó SKILL.md en la ubicación esperada.' }
    $script:Results.Add([pscustomobject]@{ nombre = 'impeccable'; proveedor = 'Impeccable'; ruta = $impeccableDestination; estado = 'INSTALADA' })
}

$requiredCommands = @('critique', 'audit', 'polish', 'bolder', 'quieter', 'distill', 'colorize', 'typeset', 'layout', 'animate', 'delight', 'overdrive', 'optimize', 'adapt', 'harden', 'clarify', 'onboard', 'shape', 'document', 'extract')
$commandFile = Join-Path $impeccableDestination 'scripts\command-metadata.json'
if (Test-Path -LiteralPath $commandFile) {
    $commandData = Get-Content -LiteralPath $commandFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $availableCommands = @($commandData.PSObject.Properties.Name)
    $missingCommands = @($requiredCommands | Where-Object { $_ -notin $availableCommands })
    if ($missingCommands.Count -gt 0) { Write-Warning ("Esta instalación de Impeccable requiere revisión. Faltan los comandos " + ($missingCommands -join ', ')) }
    $availableCommands | Set-Content -LiteralPath (Join-Path $workRoot 'comandos-impeccable.txt') -Encoding UTF8
} else {
    Write-Warning 'Consulta los comandos en el SKILL.md de la instalación de Impeccable que se conservó.'
}

foreach ($skill in $emilSkills) { Install-LocalSkill -Source $skill.FullName -Name $skill.Name -Provider 'Emil Kowalski' -LicenseFile (Join-Path $workRoot 'skills-main\skills-main\LICENSE') }
foreach ($skill in $remotionSkills) { Install-LocalSkill -Source $skill.FullName -Name $skill.Name -Provider 'Remotion' -LicenseFile (Join-Path $workRoot 'remotion-main\remotion-main\LICENSE.md') }

foreach ($result in $script:Results) {
    $file = Join-Path $result.ruta 'SKILL.md'
    if ((Get-SkillName $file) -ne $result.nombre) { throw "No se pudo verificar $file" }
}
$report = Join-Path $workRoot 'resultado-instalacion.json'
$script:Results | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $report -Encoding UTF8
$script:Results | Format-Table nombre, proveedor, estado, ruta -AutoSize
$installedCount = @($script:Results | Where-Object { $_.estado -eq 'INSTALADA' }).Count
Write-Host "Se revisaron $($script:Results.Count) skills y se instalaron $installedCount entradas nuevas. Informe en $report"
Write-Host 'Abre una sesión nueva de Codex en VS Code y ejecuta /skills para verificar su detección.'
Write-Host 'Para usar una skill, escribe $impeccable, $emil-design-eng o $remotion-create en el chat de Codex.'
Write-Host 'Las dependencias de video se instalan en la carpeta motion del proyecto con npm.cmd ci.'
