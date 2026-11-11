import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Promo } from './Promo.jsx';

/**
 * Registra el video promocional con sus dimensiones, duración y fotogramas por segundo.
 * @returns {React.ReactElement} Composición disponible en Studio.
 * @throws {never} Solo declara metadatos de la composición.
 */
const Root = () => <Composition id="LavaRapidoPromo" component={Promo} durationInFrames={240} fps={30} width={1280} height={720} />;

registerRoot(Root);
