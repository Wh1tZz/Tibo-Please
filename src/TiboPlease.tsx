import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, interpolateColors, staticFile} from 'remotion';
import {z} from 'zod';
import {ONDA_BODY_FONT} from '../lib/fonts';
import {toOutputFrames, useDesignFrame} from '../lib/remotion-timing';

const INK = '#111116';
const PAPER = '#FFFFFF';
const PURPLE = '#7168F4';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothStep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const easeOut = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const smooth = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

const INPUT_SHELL = {left: 120, top: 370, width: 1680, height: 280};
const CODEX_UNDERSCORE = {left: 759, top: 569, width: 72, height: 20};

const BRAND_LEFT = 620;
const BRAND_TOP = 400;
const LOGO_SIZE = 282;
const WORDMARK_LEFT = 920;
const WORDMARK_TOP = 486;
const WORDMARK_FONT_SIZE = 116;
const SOURCE_WORDMARK_TRACKING = 1.8;

const WORDMARK_WIDTH = 760;
const WORDMARK_HEIGHT = 140;

type LockGlyph = {
  source: string;
  middle: string;
  target: string;
  fromX: number;
  middleX: number;
  toX: number;
  delay: number;
  index: number;
};

const LOCK_GLYPHS: LockGlyph[] = [
  {source: 'C', middle: 'T', target: 'C', fromX: 0, middleX: -8, toX: 0, delay: 0, index: 0},
  {source: 'h', middle: 'i', target: 'o', fromX: 76, middleX: 42, toX: 74, delay: 1, index: 1},
  {source: 'a', middle: 'b', target: 'd', fromX: 141, middleX: 96, toX: 140, delay: 2, index: 2},
  {source: 't', middle: 'o', target: 'e', fromX: 205, middleX: 165, toX: 212, delay: 3, index: 3},
  {source: 'G', middle: '', target: 'x', fromX: 270, middleX: 238, toX: 280, delay: 4, index: 4},
  {source: 'P', middle: 'P', target: '', fromX: 343, middleX: 274, toX: 346, delay: 5, index: 5},
  {source: 'T', middle: 'l', target: '', fromX: 417, middleX: 320, toX: 404, delay: 6, index: 6},
  {source: '', middle: 'e', target: '', fromX: 474, middleX: 370, toX: 462, delay: 7, index: 7},
  {source: '', middle: 'a', target: '', fromX: 530, middleX: 434, toX: 520, delay: 8, index: 8},
  {source: '', middle: 's', target: '', fromX: 586, middleX: 492, toX: 578, delay: 9, index: 9},
  {source: '', middle: 'e', target: '', fromX: 642, middleX: 552, toX: 636, delay: 10, index: 10},
];

const REEL_START = 6;
const FIRST_FLIP_DURATION = 10.5;
const FIRST_WAVE_STAGGER = 0.85;
const LAST_MIDDLE_ARRIVAL =
  REEL_START + FIRST_FLIP_DURATION + FIRST_WAVE_STAGGER * (LOCK_GLYPHS.length - 1);
const POST_WAVE_START = LAST_MIDDLE_ARRIVAL + 0.25;
const FINAL_WAVE_STAGGER = 0.85;
const FINAL_FLIP_DURATION = 10.5;
const LOGO_TRANSFORM_END = 52;
const WORDMARK_SETTLED_AT = Math.max(
  LOGO_TRANSFORM_END,
  POST_WAVE_START + FINAL_WAVE_STAGGER * (LOCK_GLYPHS.length - 1) + FINAL_FLIP_DURATION,
);
const BLINK_START = WORDMARK_SETTLED_AT + 4;

const buildReelSequence = (glyph: LockGlyph) => [
  glyph.source,
  glyph.middle,
  glyph.target,
];

const LockGlyphLayer: React.FC<{glyph: LockGlyph; frame: number}> = ({glyph, frame}) => {
  const sequence = buildReelSequence(glyph);
  const finalIndex = sequence.length - 1;

  // The first wave reveals Tibo Please as a continuous fold. The second wave
  // performs one direct middle-to-Codex turn with no intermediate reel glyphs.
  const firstFlipStart = REEL_START + glyph.delay * FIRST_WAVE_STAGGER;
  const middleRevealProgress = interpolate(
    frame,
    [firstFlipStart, firstFlipStart + FIRST_FLIP_DURATION],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.42, 0, 0.18, 1),
    },
  );
  const postFlipStart = POST_WAVE_START + glyph.index * FINAL_WAVE_STAGGER;
  const postMiddleProgress = interpolate(
    frame,
    [postFlipStart, postFlipStart + FINAL_FLIP_DURATION],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.42, 0, 0.18, 1),
    },
  );
  const sequencePosition = Math.min(
    finalIndex,
    middleRevealProgress + (finalIndex - 1) * postMiddleProgress,
  );
  const progress = sequencePosition / finalIndex;
  const currentIndex = progress >= 1
    ? finalIndex
    : Math.min(finalIndex - 1, Math.floor(sequencePosition));
  const nextIndex = Math.min(currentIndex + 1, finalIndex);
  const turnPhase = progress >= 1 ? 0 : sequencePosition - currentIndex;
  const outgoingPhase = clamp01(turnPhase / 0.56);
  const incomingPhase = clamp01((turnPhase - 0.44) / 0.56);
  const outgoingTurn = interpolate(outgoingPhase, [0, 1], [0, -90], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const incomingTurn = interpolate(incomingPhase, [0, 1], [90, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outgoingY = interpolate(outgoingPhase, [0, 1], [0, -28]);
  const incomingY = interpolate(incomingPhase, [0, 1], [28, 0]);
  const outgoingScaleY = progress >= 1
    ? 1
    : Math.max(0.001, Math.cos((Math.abs(outgoingTurn) * Math.PI) / 180));
  const incomingScaleY = Math.max(0.001, Math.cos((Math.abs(incomingTurn) * Math.PI) / 180));
  const middleLayoutProgress = smooth(frame, REEL_START, LAST_MIDDLE_ARRIVAL);
  const rollLayoutProgress = smooth(frame, POST_WAVE_START - 1, POST_WAVE_START + 6);
  const middleSlotX = interpolate(middleLayoutProgress, [0, 1], [glyph.fromX, glyph.middleX]);
  const rollSlotX = glyph.index < 5
    ? glyph.toX
    : LOCK_GLYPHS[4].toX + (glyph.index - 4) * 74;
  const slotX = interpolate(rollLayoutProgress, [0, 1], [middleSlotX, rollSlotX]);
  const middleColor = interpolateColors(middleRevealProgress, [0, 1], [INK, PURPLE]);
  const trackColor = interpolateColors(postMiddleProgress, [0.82, 1], [middleColor, INK]);
  const currentCharacter = sequence[currentIndex];
  const nextCharacter = sequence[nextIndex];
  const currentTransform = `translate(0 ${progress >= 1 ? 0 : outgoingY}) translate(43 70) scale(1 ${outgoingScaleY}) translate(-43 -70)`;
  const nextTransform = `translate(0 ${incomingY}) translate(43 70) scale(1 ${incomingScaleY}) translate(-43 -70)`;

  return (
    <div
      style={{
        position: 'absolute',
        left: slotX,
        top: 0,
        width: 86,
        height: WORDMARK_HEIGHT,
        overflow: 'visible',
      }}
    >
      <svg
        viewBox={`0 0 86 ${WORDMARK_HEIGHT}`}
        width="86"
        height={WORDMARK_HEIGHT}
        overflow="visible"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
        }}
      >
        <text
          x="43"
          y="70"
          fill={trackColor}
          opacity={progress >= 1 || turnPhase <= 0.56 ? 1 : 0}
          fontFamily={ONDA_BODY_FONT}
          fontSize={WORDMARK_FONT_SIZE}
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="central"
          transform={currentTransform}
        >
          {currentCharacter}
        </text>
        <text
          x="43"
          y="70"
          fill={trackColor}
          opacity={turnPhase >= 0.44 && progress < 1 ? 1 : 0}
          fontFamily={ONDA_BODY_FONT}
          fontSize={WORDMARK_FONT_SIZE}
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="central"
          transform={nextTransform}
        >
          {nextCharacter}
        </text>
      </svg>
    </div>
  );
};

const BrandWordmarkRewrite: React.FC<{frame: number}> = ({frame}) => {
  const reveal = easeOut(frame, -2, 16);
  const columnHandoff = frame >= 6 ? 1 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: WORDMARK_LEFT,
        top: WORDMARK_TOP,
        width: WORDMARK_WIDTH,
        height: WORDMARK_HEIGHT,
        opacity: reveal,
        transformOrigin: '0 70%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          translate: `0 ${interpolate(reveal, [0, 1], [22, 0])}px`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 4,
            top: 0,
            height: WORDMARK_HEIGHT,
            color: INK,
            opacity: 1 - columnHandoff,
            fontFamily: ONDA_BODY_FONT,
            fontSize: WORDMARK_FONT_SIZE,
            fontWeight: 600,
            lineHeight: `${WORDMARK_HEIGHT}px`,
            letterSpacing: SOURCE_WORDMARK_TRACKING,
            fontKerning: 'normal',
            whiteSpace: 'nowrap',
          }}
        >
          ChatGPT
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: columnHandoff}}>
          {LOCK_GLYPHS.map((glyph) => (
            <LockGlyphLayer key={`${glyph.index}-${glyph.delay}`} glyph={glyph} frame={frame} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CodexCloudMark: React.FC<{frame: number}> = ({frame}) => {
  const blinkClose = interpolate(frame, [BLINK_START, BLINK_START + 3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.55, 0, 0.72, 1),
  });
  const blinkOpen = interpolate(frame, [BLINK_START + 3, BLINK_START + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const blinkAmount = blinkClose * (1 - blinkOpen);
  const blinkArmScale = interpolate(blinkAmount, [0, 1], [1, 0.62]);
  const upperArmRotation = interpolate(blinkAmount, [0, 1], [0, -59]);
  const lowerArmRotation = interpolate(blinkAmount, [0, 1], [0, 59]);

  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      <Img
        src={staticFile('brand/codex-cloud-clean-v4.png')}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain'}}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 300"
        aria-hidden="true"
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="codex-eye-fill" x1="0" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#EEF2FF" />
          </linearGradient>
        </defs>

        <path
          d="M111 151L87 111"
          fill="none"
          stroke="url(#codex-eye-fill)"
          strokeWidth="17"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          transform={`translate(111 151) rotate(${upperArmRotation}) scale(${blinkArmScale}) translate(-111 -151)`}
        />
        <path
          d="M111 151L87 191"
          fill="none"
          stroke="url(#codex-eye-fill)"
          strokeWidth="17"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          transform={`translate(111 151) rotate(${lowerArmRotation}) scale(${blinkArmScale}) translate(-111 -151)`}
        />
        <path
          d="M161 190 L215 190"
          fill="none"
          stroke="#F8FAFF"
          strokeWidth="18"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

const CodexTerminalIntro: React.FC<{frame: number}> = ({frame}) => {
  const logoReveal = easeOut(frame, -3, 18);
  const logoTransform = interpolate(frame, [18, LOGO_TRANSFORM_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.16, 1),
  });
  const logoRotation = interpolate(logoTransform, [0, 0.48, 1], [0, 168, 360]);
  const logoScale = interpolate(logoTransform, [0, 0.46, 0.72, 1], [1, 0.88, 1.045, 1]);
  const knotOpacity = interpolate(logoTransform, [0, 0.4, 0.62, 1], [1, 1, 0, 0]);
  const cloudOpacity = interpolate(logoTransform, [0, 0.38, 0.6, 1], [0, 0, 1, 1]);
  const cloudTurnOffset = interpolate(logoTransform, [0, 0.5, 1], [-26, -18, 0]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: BRAND_LEFT,
          top: BRAND_TOP,
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          opacity: logoReveal,
          rotate: `${logoRotation}deg`,
          scale: logoScale,
          transformOrigin: '50% 50%',
        }}
      >
        <Img
          src={staticFile('brand/chatgpt-knot.svg')}
          style={{
            position: 'absolute',
            inset: 25,
            width: LOGO_SIZE - 50,
            height: LOGO_SIZE - 50,
            objectFit: 'contain',
            opacity: knotOpacity,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            opacity: cloudOpacity,
            rotate: `${cloudTurnOffset}deg`,
            scale: interpolate(logoTransform, [0.38, 0.68, 1], [0.72, 1.04, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transformOrigin: '50% 50%',
          }}
        >
          <CodexCloudMark frame={frame} />
        </div>
      </div>

      <BrandWordmarkRewrite frame={frame} />

      <div
        style={{
          position: 'absolute',
          ...CODEX_UNDERSCORE,
          borderRadius: 9,
          background: PAPER,
          opacity: smooth(frame, 104, 106),
        }}
      />
    </>
  );
};

const InputShellSurface: React.FC = () => (
  <svg
    viewBox={`0 0 ${INPUT_SHELL.width} ${INPUT_SHELL.height}`}
    shapeRendering="geometricPrecision"
    style={{
      position: 'absolute',
      left: INPUT_SHELL.left,
      top: INPUT_SHELL.top,
      width: INPUT_SHELL.width,
      height: INPUT_SHELL.height,
      overflow: 'visible',
    }}
  >
    <rect
      x="1.75"
      y="1.75"
      width={INPUT_SHELL.width - 3.5}
      height={INPUT_SHELL.height - 3.5}
      rx="34.25"
      fill={PAPER}
      stroke="#CAC9D1"
      strokeWidth="3.5"
    />
  </svg>
);

const IntroUiControls: React.FC<{frame: number; children: React.ReactNode; from: number; offsetY?: number}> = ({
  frame,
  children,
  from,
  offsetY = 12,
}) => {
  const progress = easeOut(frame, from, from + 16);
  return (
    <div
      style={{
        opacity: progress,
        translate: `0 ${interpolate(progress, [0, 1], [offsetY, 0])}px`,
        scale: interpolate(progress, [0, 1], [0.92, 1]),
        transformOrigin: '50% 50%',
      }}
    >
      {children}
    </div>
  );
};

const NativeControls: React.FC<{kind: 'left' | 'right'; sendProgress?: number}> = ({kind, sendProgress = 0}) => {
  if (kind === 'left') {
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <svg width="42" height="42" viewBox="0 0 42 42" shapeRendering="geometricPrecision" aria-hidden="true">
          <path d="M21 4V38M4 21H38" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
        </svg>
        <svg width="54" height="42" viewBox="0 0 54 42" shapeRendering="geometricPrecision" aria-hidden="true">
          <path d="M3 12H51M3 30H51" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="22" cy="12" r="6" fill={PAPER} stroke={INK} strokeWidth="3.2" />
          <circle cx="36" cy="30" r="6" fill={PAPER} stroke={INK} strokeWidth="3.2" />
        </svg>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
      <svg width="44" height="54" viewBox="0 0 44 54" shapeRendering="geometricPrecision" aria-hidden="true">
        <rect x="13" y="3" width="18" height="34" rx="9" fill="none" stroke={INK} strokeWidth="3.4" />
        <path d="M5 28C5 42 12 48 22 48C32 48 39 42 39 28M22 48V53" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      <svg
        width="62"
        height="62"
        viewBox="0 0 62 62"
        shapeRendering="geometricPrecision"
        aria-hidden="true"
        style={{
          scale: interpolate(sendProgress, [0, 0.62, 1], [1, 1.08, 1]),
          transformOrigin: '50% 50%',
        }}
      >
        <circle cx="31" cy="31" r="29" fill={interpolateColors(sendProgress, [0, 1], ['#050507', PAPER])} />
        <path
          d="M31 47V14M18 28L31 14L44 28"
          fill="none"
          stroke={interpolateColors(sendProgress, [0, 1], [PAPER, INK])}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

type WordTiming = {word: string; letterStarts: number[]};

const TYPE_START = 126;
const REFERENCE_STRETCH = 1;
const TAIL_SETTLE_REFERENCE_FRAMES = 7;
const LETTER_MOTION_REFERENCE_FRAMES = 10;
const LETTER_COLOR_SETTLE_REFERENCE_FRAMES = 8;
const WORD_MARGIN = 9;
const INPUT_FONT_SIZE = 38;
const TEXT_VIEWPORT_WIDTH = 1400;

const REFERENCE_REVEAL_KNOTS = [
  {time: 0, count: 0},
  {time: 1, count: 1},
  {time: 3, count: 3},
  {time: 6, count: 6},
  {time: 9, count: 12},
  {time: 12, count: 18},
  {time: 15, count: 25},
  {time: 18, count: 31},
  {time: 21, count: 37},
  {time: 24, count: 42},
  {time: 27, count: 46},
  {time: 30, count: 49},
  {time: 33, count: 54},
  {time: 36, count: 57},
  {time: 39, count: 60},
  {time: 42, count: 60},
  {time: 45, count: 63},
  {time: 48, count: 64},
  {time: 51, count: 66},
  {time: 54, count: 67},
  {time: 57, count: 68},
  {time: 60, count: 68},
  {time: 63, count: 69},
];

const referenceCountForTime = (referenceTime: number) => {
  if (referenceTime <= REFERENCE_REVEAL_KNOTS[0].time) return REFERENCE_REVEAL_KNOTS[0].count;

  for (let index = 1; index < REFERENCE_REVEAL_KNOTS.length; index++) {
    const previous = REFERENCE_REVEAL_KNOTS[index - 1];
    const next = REFERENCE_REVEAL_KNOTS[index];
    if (referenceTime <= next.time) {
      return interpolate(referenceTime, [previous.time, next.time], [previous.count, next.count]);
    }
  }

  return REFERENCE_REVEAL_KNOTS[REFERENCE_REVEAL_KNOTS.length - 1].count;
};

const cameraProgressForTypingFront = (frame: number) => {
  const sampleCount = 25;
  const lagWindow = 12;
  let weightedProgress = 0;
  let totalWeight = 0;

  for (let index = 0; index < sampleCount; index++) {
    const age = (index / (sampleCount - 1)) * lagWindow;
    const weight = Math.exp(-age / 3.6);
    const referenceTime = (frame - TYPE_START - age) / REFERENCE_STRETCH;
    weightedProgress += (referenceCountForTime(referenceTime) / 69) * weight;
    totalWeight += weight;
  }

  return clamp01(weightedProgress / totalWeight);
};

const referenceTimeForProgress = (progress: number) => {
  const targetCount = clamp01(progress) * 69;
  for (let index = 1; index < REFERENCE_REVEAL_KNOTS.length; index++) {
    const previous = REFERENCE_REVEAL_KNOTS[index - 1];
    const next = REFERENCE_REVEAL_KNOTS[index];
    if (targetCount <= next.count) {
      const countSpan = next.count - previous.count;
      if (countSpan === 0) return next.time;
      return interpolate(targetCount, [previous.count, next.count], [previous.time, next.time]);
    }
  }
  return REFERENCE_REVEAL_KNOTS[REFERENCE_REVEAL_KNOTS.length - 1].time;
};

const buildWordTimings = (words: string[]): WordTiming[] => {
  const totalCharacters = words.reduce((sum, word) => sum + word.length, 0) + Math.max(0, words.length - 1);
  let characterIndex = 0;
  return words.map((word, wordIndex) => {
    const letterStarts = word.split('').map((_, letterIndex) => {
      const globalLetterIndex = characterIndex + letterIndex;
      const progress = totalCharacters <= 1 ? 0 : globalLetterIndex / (totalCharacters - 1);
      return TYPE_START + referenceTimeForProgress(progress) * REFERENCE_STRETCH;
    });
    const timing = {
      word,
      letterStarts,
    };
    characterIndex += word.length + (wordIndex < words.length - 1 ? 1 : 0);
    return timing;
  });
};

const ActiveWord: React.FC<{timing: WordTiming; frame: number}> = ({timing, frame}) => {
  return (
    <span style={{display: 'inline-block', marginRight: WORD_MARGIN, whiteSpace: 'pre'}}>
      {timing.word.split('').map((letter, index) => {
        const characterAge = (frame - timing.letterStarts[index]) / REFERENCE_STRETCH;
        const waveProgress = smoothStep(characterAge / LETTER_MOTION_REFERENCE_FRAMES);
        const colorProgress = smoothStep(characterAge / LETTER_COLOR_SETTLE_REFERENCE_FRAMES);
        const letterColor = interpolateColors(colorProgress, [0, 1], [PURPLE, INK]);
        const waveX = interpolate(waveProgress, [0, 0.28, 0.64, 1], [10, -3, 1, 0]);
        const waveY = interpolate(waveProgress, [0, 0.28, 0.64, 1], [18, -18, 5, 0]);

        return (
          <span
            key={`${letter}-${index}`}
            style={{
              display: 'inline-block',
              position: 'relative',
              color: letterColor,
              opacity: smoothStep((characterAge + 0.45) / 1.65),
              left: waveX,
              top: waveY,
            }}
          >
            {letter}
          </span>
        );
      })}
    </span>
  );
};

const NativeInputScene: React.FC<{frame: number; prompt: string}> = ({frame, prompt}) => {
  const openingScale = interpolate(frame, [0, 18], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const logoPush = interpolate(frame, [72, 106], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.42, 0, 0.14, 1),
  });
  const logoCameraScale = frame < 64
    ? openingScale
    : Math.exp(interpolate(logoPush, [0, 1], [Math.log(1), Math.log(56)]));
  const logoFocusX = interpolate(logoPush, [0, 1], [950, CODEX_UNDERSCORE.left + CODEX_UNDERSCORE.width / 2]);
  const logoFocusY = interpolate(logoPush, [0, 1], [540, CODEX_UNDERSCORE.top + CODEX_UNDERSCORE.height / 2]);
  const logoTrackingX = 960 - logoFocusX * logoCameraScale;
  const logoTrackingY = 540 - logoFocusY * logoCameraScale;
  const sceneSwitch = smooth(frame, 104, 108);

  const typingStarted = frame >= TYPE_START;
  const words = prompt.split(' ');
  const wordTimings = buildWordTimings(words);
  const typingEnd = TYPE_START + (63 + TAIL_SETTLE_REFERENCE_FRAMES) * REFERENCE_STRETCH;
  const inputPullBack = interpolate(frame, [105, 128], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.18, 0.84, 0.2, 1),
  });
  const pulledBackScale = Math.exp(interpolate(inputPullBack, [0, 1], [Math.log(7), Math.log(2.05)]));
  const cameraFollowProgress = cameraProgressForTypingFront(frame);
  const inputCameraScale = pulledBackScale;
  const pullBackFocusX = interpolate(inputPullBack, [0, 1], [795, 520]);
  const pullBackFocusY = interpolate(inputPullBack, [0, 1], [510, 500]);
  const inputFocusX = pullBackFocusX + cameraFollowProgress * 900;
  const inputFocusY = pullBackFocusY;
  const inputTrackingX = 960 - inputFocusX * inputCameraScale;
  const inputTrackingY = 540 - inputFocusY * inputCameraScale;
  const uiShellProgress = easeOut(frame, 112, 126);
  const placeholderProgress = easeOut(frame, 116, 124);
  const caretIntro = smooth(frame, 118, 126);
  const caretOutro = smooth(frame, TYPE_START - 1, TYPE_START);
  const sendProgress = smooth(frame, typingEnd, typingEnd + 10);

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: PAPER}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '0 0',
          scale: logoCameraScale,
          translate: `${logoTrackingX}px ${logoTrackingY}px`,
          opacity: 1 - sceneSwitch,
        }}
      >
        <CodexTerminalIntro frame={frame} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: inputTrackingX,
          top: inputTrackingY,
          width: 1920,
          height: 1080,
          opacity: sceneSwitch,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: 1920,
            height: 1080,
            zoom: inputCameraScale,
          }}
        >
          <InputShellSurface />
          <div
            style={{
              position: 'absolute',
              left: 200,
              top: 432,
              width: TEXT_VIEWPORT_WIDTH,
              height: 72,
              overflow: 'hidden',
              color: INK,
              fontFamily: ONDA_BODY_FONT,
              fontSize: INPUT_FONT_SIZE,
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: -1.7,
              whiteSpace: 'nowrap',
              textRendering: 'geometricPrecision',
              WebkitFontSmoothing: 'antialiased',
              opacity: uiShellProgress,
              clipPath: `inset(0 ${interpolate(uiShellProgress, [0, 1], [100, 0])}% 0 0)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: 72,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {typingStarted ? (
                wordTimings.map((timing, index) => (
                  <ActiveWord key={`${timing.word}-${index}`} timing={timing} frame={frame} />
                ))
              ) : (
                <span
                  style={{
                    color: '#B9B8C0',
                    fontSize: 28,
                    opacity: placeholderProgress * (1 - smooth(frame, 124, 126)),
                  }}
                >
                  Ask Codex anything
                </span>
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 2,
                top: 15,
                width: 3,
                height: 42,
                borderRadius: 2,
                background: PURPLE,
                opacity: caretIntro * (1 - caretOutro),
                scale: `1 ${interpolate(caretIntro, [0, 1], [0.2, 1])}`,
                transformOrigin: '50% 50%',
              }}
            />
          </div>

          <div style={{position: 'absolute', left: 200, top: 568}}>
            <IntroUiControls frame={frame} from={118}>
              <NativeControls kind="left" />
            </IntroUiControls>
          </div>
          <div style={{position: 'absolute', left: 1638, top: 560}}>
            <IntroUiControls frame={frame} from={124} offsetY={16}>
              <NativeControls kind="right" sendProgress={sendProgress} />
            </IntroUiControls>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Stage: React.FC<{frame: number; prompt: string}> = ({frame, prompt}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: PAPER}}>
    <NativeInputScene frame={frame} prompt={prompt} />
  </AbsoluteFill>
);

export const xiaoQiChatFirst5sSchema = z.object({
  prompt: z.string().min(1).max(96),
});

export type XiaoQiChatFirst5sProps = z.infer<typeof xiaoQiChatFirst5sSchema>;

export const XiaoQiChatFirst5s: React.FC<XiaoQiChatFirst5sProps> = ({prompt}) => {
  const frame = useDesignFrame();
  return <Stage frame={frame} prompt={prompt} />;
};

export const XiaoQiChatFirst5sStoryboard: React.FC<{state: 'start' | 'logo' | 'native'}> = ({state}) => (
  <Stage
    frame={state === 'start' ? 4 : state === 'logo' ? 72 : 117}
    prompt="Speak up for the many Plus users! Please lift the 5-hour restriction for Plus users!"
  />
);

export const xiaoQiChatFirst5sDurationInFrames = toOutputFrames(284);
