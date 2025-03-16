import { isFunction } from '@vision/common/utils/shared.utils';
import { Type } from '@vision/common/interfaces';

export const filterMiddleware = middleware => {
  return []
    .concat(middleware)
    .filter(isFunction)
    .map(ware => mapToClass(ware));
};

export const mapToClass = middleware => {
  if (isClass(middleware)) {
    return middleware;
  }
  return assignToken(
    class {
      resolve = (...args) => (...params) => middleware(...params);
    },
  );
};

export const isClass = middleware => {
  return middleware.toString().substring(0, 5) === 'class';
};

export const assignToken = (metatype): Type<any> => {
  let id = metatype.id || 1;
  Object.defineProperty(metatype, 'name', { value: ++id });
  return metatype;
};
