import { Type } from '@vision/common/interfaces/type.interface';
import { LoggerService } from '@vision/common/services/logger.service';

export interface IVisionApplicationContext {
  /**
   * Allows navigating through the modules tree, for example, to pull out a specific instance from the selected module.
   * @returns {IVisionApplicationContext}
   */
  select<T>(module: Type<T>): IVisionApplicationContext;

  /**
   * Retrieves an instance of either injectable or controller available anywhere, otherwise, throws exception.
   * @returns {T}
   */
  get<T>(
    typeOrToken: Type<T> | string | symbol,
    options?: { strict: boolean },
  ): T;
}
