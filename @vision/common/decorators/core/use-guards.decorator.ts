import { GUARDS_METADATA } from '@vision/common/constants';
import { extendArrayMetadata } from '@vision/common/utils/extend-metadata.util';
import { validateEach } from '@vision/common/utils/validate-each.util';
import { isFunction } from '@vision/common/utils/shared.utils';
import { CanActivate } from '@vision/common/interfaces';

/**
 * Binds guards to the particular context.
 * When the `@UseGuards()` is used on the controller level:
 * - Guard will be register to each handler (every method)
 *
 * When the `@UseGuards()` is used on the handler level:
 * - Guard will be registered only to specified method
 *
 * @param  {} ...guards
 */
export function UseGuards(...guards: (CanActivate | Function)[]) {
  return (target: any, key?, descriptor?) => {
    const isValidGuard = guard =>
      guard && (isFunction(guard) || isFunction(guard.canActivate));

    if (descriptor) {
      validateEach(
        target.constructor,
        guards,
        isValidGuard,
        '@UseGuards',
        'guard',
      );
      extendArrayMetadata(GUARDS_METADATA, guards, descriptor.value);
      return descriptor;
    }
    validateEach(target, guards, isValidGuard, '@UseGuards', 'guard');
    extendArrayMetadata(GUARDS_METADATA, guards, target);
    return target;
  };
}
