import React from 'react';
import {Composition} from 'remotion';
import {
  XiaoQiChatFirst5s,
  xiaoQiChatFirst5sDurationInFrames,
  xiaoQiChatFirst5sSchema,
} from './TiboPlease';

export const Root: React.FC = () => (
  <Composition
    id="Tibo-Please"
    component={XiaoQiChatFirst5s}
    durationInFrames={xiaoQiChatFirst5sDurationInFrames}
    fps={60}
    width={1920}
    height={1080}
    schema={xiaoQiChatFirst5sSchema}
    defaultProps={{
      prompt:
        'Speak up for the many Plus users! Please lift the 5-hour restriction for Plus users!',
    }}
  />
);
