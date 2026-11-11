import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, Easing, delayRender, continueRender, cancelRender
} from 'remotion';

const colores = { tinta: '#07354f', azul: '#075580', agua: '#a4f3df', fondo: '#f4f8fa' };
const curva = Easing.bezier(0.23, 1, 0.32, 1);
const limite = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curva };

/**
 * Presenta la identidad con una entrada de texto guiada por fotogramas.
 * @returns {React.ReactElement} Primera escena.
 * @throws {never} Solo calcula estilos con el fotograma actual.
 */
function Presentacion() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: colores.tinta, color: 'white', padding: 85, justifyContent: 'center' }}>
      <Img src={staticFile('marca.svg')} style={{ width: 110, height: 110, marginBottom: 35, opacity: interpolate(frame, [0, .45 * fps], [0, 1], limite) }} />
      <h1 style={{ margin: 0, fontSize: 130, fontWeight: 800, letterSpacing: '-.035em', lineHeight: 1.1, translate: interpolate(frame, [3, .65 * fps], ['0px 18px', '0px 0px'], limite), opacity: interpolate(frame, [3, .55 * fps], [0, 1], limite) }}>LavaRápido</h1>
      <p style={{ margin: '30px 0 0', fontSize: 38, color: colores.agua, opacity: interpolate(frame, [.45 * fps, .9 * fps], [0, 1], limite) }}>Un buen lavado. Un turno para ti.</p>
      <div style={{ height: 5, background: colores.agua, marginTop: 48, width: 1000, scale: interpolate(frame, [.5 * fps, 1.6 * fps], [0, 1], limite), transformOrigin: 'left center' }} />
    </AbsoluteFill>
  );
}

/**
 * Explica los tres pasos de una reserva mediante una secuencia de tarjetas.
 * @returns {React.ReactElement} Segunda escena.
 * @throws {never} Solo calcula estilos con el fotograma actual.
 */
function Recorrido() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pasos = [
    { titulo: 'Encuentra', detalle: 'Tu lavadero en Pasto', color: '#e0eef9' },
    { titulo: 'Reserva', detalle: 'Una hora con cupo', color: '#dff5ed' },
    { titulo: 'Llega', detalle: 'Con tu código único', color: '#f4ecd8' }
  ];
  return (
    <AbsoluteFill style={{ background: colores.fondo, color: colores.tinta, padding: '85px 80px' }}>
      <h2 style={{ margin: 0, fontSize: 77, lineHeight: 1.12, letterSpacing: '-.03em', fontWeight: 800 }}>Tu turno, en tres pasos.</h2>
      <div style={{ display: 'flex', gap: 22, marginTop: 60 }}>
        {pasos.map((paso, i) => (
          <div key={paso.titulo} style={{ flex: 1, minHeight: 300, padding: 32, borderRadius: 18, background: paso.color, translate: interpolate(frame, [i * .23 * fps, i * .23 * fps + .5 * fps], ['0px 24px', '0px 0px'], limite), opacity: interpolate(frame, [i * .23 * fps, i * .23 * fps + .45 * fps], [0, 1], limite) }}>
            <div style={{ fontSize: 27, fontWeight: 800, marginBottom: 55 }}>{String(i + 1).padStart(2, '0')}</div>
            <h3 style={{ fontSize: 42, margin: '0 0 18px', lineHeight: 1.1, fontWeight: 800 }}>{paso.titulo}</h3>
            <p style={{ fontSize: 28, margin: 0, lineHeight: 1.35 }}>{paso.detalle}</p>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

/**
 * Cierra la presentación con la invitación a reservar.
 * @returns {React.ReactElement} Última escena.
 * @throws {never} Solo calcula estilos con el fotograma actual.
 */
function Cierre() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: colores.tinta, color: 'white', padding: 85, justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}><Img src={staticFile('marca.svg')} style={{ width: 65, height: 65 }} /><span style={{ fontSize: 35, fontWeight: 750 }}>LavaRápido</span></div>
      <h2 style={{ margin: 0, fontSize: 92, maxWidth: 1050, lineHeight: 1.1, letterSpacing: '-.035em', opacity: interpolate(frame, [0, .45 * fps], [0, 1], limite), translate: interpolate(frame, [0, .6 * fps], ['0px 16px', '0px 0px'], limite) }}>Nos vemos<br />en el lavadero.</h2>
      <p style={{ fontSize: 35, color: colores.agua, marginTop: 35 }}>Elige tu próxima hora en Pasto.</p>
    </AbsoluteFill>
  );
}

/**
 * Organiza la tipografía y las escenas en una presentación de ocho segundos.
 * @returns {React.ReactElement} Composición de la portada.
 * @throws {Error} Si la fuente local no puede cargarse durante la captura.
 */
export function Promo() {
  const [espera] = useState(() => delayRender('Cargando tipografía local'));
  const { fps } = useVideoConfig();
  useEffect(() => {
    document.fonts.load('700 16px Manrope').then(() => continueRender(espera), cancelRender);
  }, [espera]);
  return (
    <AbsoluteFill style={{ fontFamily: 'Manrope, sans-serif' }}>
      <style>{`@font-face { font-family: Manrope; src: url('${staticFile('manrope-latin.woff2')}') format('woff2'); font-weight: 400 800; }`}</style>
      <Sequence from={0} durationInFrames={2.4 * fps}><Presentacion /></Sequence>
      <Sequence from={2.4 * fps} durationInFrames={3.3 * fps}><Recorrido /></Sequence>
      <Sequence from={5.7 * fps} durationInFrames={2.3 * fps}><Cierre /></Sequence>
    </AbsoluteFill>
  );
}
