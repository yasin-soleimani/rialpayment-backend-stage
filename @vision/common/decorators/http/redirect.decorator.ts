import 'reflect-metadata';
import { REDIRECT_METADATA } from '@vision/common/constants';

/**
 * Redirects request.
 */
export function Redirect(url: string): MethodDecorator {
  return (target: object, key, descriptor) => {
    Reflect.defineMetadata(REDIRECT_METADATA, url, descriptor.value);
    return descriptor;
  };
}
