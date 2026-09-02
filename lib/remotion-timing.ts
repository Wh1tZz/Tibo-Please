import {useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * The reference animations were measured on 30fps source videos. Compositions
 * render at 60fps, while all authored keyframes stay in the original 30fps
 * coordinate system. Fractional design frames provide the in-between samples.
 */
export const DESIGN_FPS = 30;
export const OUTPUT_FPS = 60;

export const toOutputFrames = (designFrames: number) =>
  Math.round((designFrames * OUTPUT_FPS) / DESIGN_FPS);

export const useDesignFrame = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (frame * DESIGN_FPS) / fps;
};

export const toDesignDuration = (outputFrames: number, fps: number) =>
  (outputFrames * DESIGN_FPS) / fps;
