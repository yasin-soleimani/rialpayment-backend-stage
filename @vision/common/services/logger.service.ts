import * as clc from 'cli-color';
import { VisionEnvironment } from '@vision/common/enums/vision-environment.enum';
import { Constructor } from '@vision/common/utils/merge-with-values.util';

declare const process;

export interface LoggerService {
  log(message: string);
  error(message: string, trace: string);
  warn(message: string);
}

export class Logger implements LoggerService {
  private static prevTimestamp = null;
  private static contextEnv = VisionEnvironment.RUN;
  private static logger: typeof Logger | LoggerService = Logger;

  private static readonly yellow = clc.xterm(3);

  constructor(
    private readonly context: string,
    private readonly isTimeDiffEnabled = false,
  ) {}

  log(message: string) {
    const { logger } = Logger;
    logger &&
      logger.log.call(logger, message, this.context, this.isTimeDiffEnabled);
  }

  error(message: string, trace = '') {
    const { logger } = Logger;
    logger &&
      logger.error.call(
        logger,
        message,
        trace,
        this.context,
        this.isTimeDiffEnabled,
      );
  }

  warn(message: string) {
    const { logger } = Logger;
    logger &&
      logger.warn.call(logger, message, this.context, this.isTimeDiffEnabled);
  }

  static overrideLogger(logger: LoggerService | boolean) {
    this.logger = logger ? (logger as LoggerService) : null;
  }

  static setMode(mode: VisionEnvironment) {
    this.contextEnv = mode;
  }

  static log(message: string, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.green, context, isTimeDiffEnabled);
  }

  static error(
    message: string,
    trace = '',
    context = '',
    isTimeDiffEnabled = true,
  ) {
    this.printMessage(message, clc.red, context, isTimeDiffEnabled);
    this.printStackTrace(trace);
  }

  static warn(message: string, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.yellow, context, isTimeDiffEnabled);
  }

  private static printMessage(
    message: string,
    color: (msg: string) => string,
    context: string = '',
    isTimeDiffEnabled?: boolean,
  ) {
    if (Logger.contextEnv === VisionEnvironment.TEST) return;

    process.stdout.write(color(`[Vision] ${process.pid}   - `));
    process.stdout.write(`${new Date(Date.now()).toLocaleString()}   `);
    process.stdout.write(this.yellow(`[${context}] `));
    process.stdout.write(color(message));

    this.printTimestamp(isTimeDiffEnabled);
    process.stdout.write(`\n`);
  }

  private static printTimestamp(isTimeDiffEnabled?: boolean) {
    const includeTimestamp = Logger.prevTimestamp && isTimeDiffEnabled;
    if (includeTimestamp) {
      process.stdout.write(
        this.yellow(` +${Date.now() - Logger.prevTimestamp}ms`),
      );
    }
    Logger.prevTimestamp = Date.now();
  }

  private static printStackTrace(trace: string) {
    if (this.contextEnv === VisionEnvironment.TEST || !trace) return;

    process.stdout.write(trace);
    process.stdout.write(`\n`);
  }
}
