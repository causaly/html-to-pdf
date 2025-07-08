import { pino } from 'pino';
import { gcpLogOptions } from 'pino-cloud-logging';
import pinoPretty from 'pino-pretty';

import type * as LogFormat from '../models/LogFormat.ts';
import type * as LogLevel from '../models/LogLevel.ts';

export const makeLogger = (props: {
  name: string;
  level: LogLevel.LogLevel;
  format: LogFormat.LogFormat;
}): pino.Logger => {
  const loggerOptions = {
    name: props.name,
    level: props.level,
    enabled: props.level !== 'none',
    base: undefined,
    timestamp: true,
  };

  switch (props.format) {
    case 'gcp':
      return pino(gcpLogOptions(loggerOptions));
    case 'pretty':
      return pino(
        loggerOptions,
        pinoPretty({
          colorize: true,
          singleLine: true,
          translateTime: 'SYS:standard',
        })
      );
    default:
      throw new Error('Invalid log format');
  }
};
