import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const ONDA_DISPLAY_FONT = '"Clash Display", sans-serif';
export const ONDA_BODY_FONT = '"Space Grotesk", sans-serif';
export const ONDA_HANDWRITING_FONT = '"Caveat", cursive';

const fontUrl = (filename: string) => staticFile(`fonts/${filename}`);

// Register the exact Onda typefaces before Studio or the renderer evaluates a
// composition. `loadFont()` uses Remotion's delayRender()/continueRender()
// lifecycle, so frame 0 cannot be captured with a fallback font.
export const ondaFontsReady = Promise.all([
  loadFont({
    family: 'Clash Display',
    url: fontUrl('ClashDisplay-Medium.woff2'),
    format: 'woff2',
    weight: '500',
    style: 'normal',
    display: 'block',
  }),
  loadFont({
    family: 'Clash Display',
    url: fontUrl('ClashDisplay-Semibold.woff2'),
    format: 'woff2',
    weight: '600',
    style: 'normal',
    display: 'block',
  }),
  loadFont({
    family: 'Clash Display',
    url: fontUrl('ClashDisplay-Bold.woff2'),
    format: 'woff2',
    weight: '700',
    style: 'normal',
    display: 'block',
  }),
  ...['400', '500', '600', '700'].map((weight) =>
    loadFont({
      family: 'Space Grotesk',
      url: fontUrl('SpaceGrotesk-Latin.woff2'),
      format: 'woff2',
      weight,
      style: 'normal',
      display: 'block',
    }),
  ),
  ...['500', '600', '700'].map((weight) =>
    loadFont({
      family: 'Caveat',
      url: fontUrl('Caveat-Latin.woff2'),
      format: 'woff2',
      weight,
      style: 'normal',
      display: 'block',
    }),
  ),
]);
