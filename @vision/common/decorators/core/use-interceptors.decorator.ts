import { INTERCEPTORS_METADATA } from '@vision/common/constants';
import { extendArrayMetadata } from '@vision/common/utils/extend-metadata.util';
import { isFunction } from '@vision/common/utils/shared.utils';
import { validateEach } from '@vision/common/utils/validate-each.util';
import { VisionInterceptor } from '@vision/common/interfaces';

/**
 * Binds interceptors to the particular context.
 * When the `@UseInterceptors()` is used on the controller level:
 * - Interceptor will be register to each handler (every method)
 *
 * When the `@UseInterceptors()` is used on the handle level:
 * - Interceptor will be registered only to specified method
 *
 * @param  {} ...interceptors
 */
export function UseInterceptors(
  ...interceptors: (VisionInterceptor | Function)[]
) {
  return (target: any, key?, descriptor?) => {
    const isValidInterceptor = interceptor =>
      interceptor &&
      (isFunction(interceptor) || isFunction(interceptor.intercept));

    if (descriptor) {
      validateEach(
        target.constructor,
        interceptors,
        isValidInterceptor,
        '@UseInterceptors',
        'interceptor',
      );
      extendArrayMetadata(
        INTERCEPTORS_METADATA,
        interceptors,
        descriptor.value,
      );
      return descriptor;
    }
    validateEach(
      target,
      interceptors,
      isValidInterceptor,
      '@UseInterceptors',
      'interceptor',
    );
    extendArrayMetadata(INTERCEPTORS_METADATA, interceptors, target);
    return target;
  };
}
