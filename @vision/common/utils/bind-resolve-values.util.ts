import { Constructor } from '@vision/common/utils/merge-with-values.util';
import { VisionMiddleware } from '@vision/common/interfaces/middleware/vision-middleware.interface';
import { Injectable } from '@vision/common/decorators/core/component.decorator';

export const BindResolveMiddlewareValues = <
  T extends Constructor<VisionMiddleware>
>(
  data: Array<any>,
) => {
  return (Metatype: T): any => {
    const type = class extends Metatype {
      public resolve() {
        return super.resolve(...data);
      }
    };
    const token = Metatype.name + JSON.stringify(data);
    Object.defineProperty(type, 'name', { value: token });
    Injectable()(type);
    return type;
  };
};
