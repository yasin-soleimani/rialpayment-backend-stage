import 'reflect-metadata';
import { ControllerMetadata } from '@vision/common/interfaces/controllers/controller-metadata.interface';
import { isUndefined, isObject } from '@vision/common/utils/shared.utils';
import { PATH_METADATA } from '@vision/common/constants';

/**
 * Defines the Controller. The controller can inject dependencies through constructor.
 * Those dependencies have to belong to the same module.
 */
export function Controller(prefix?: string): ClassDecorator {
  const path = isUndefined(prefix) ? '/' : prefix;
  return (target: object) => {
    Reflect.defineMetadata(PATH_METADATA, path, target);
  };
}
