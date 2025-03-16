import { Transform, Paramtype } from '@vision/common/interfaces';
import { RouteParamtypes } from '@vision/common/enums/route-paramtypes.enum';
import { ParamsTokenFactory } from '@vision/core/pipes/params-token-factory';

export class PipesConsumer {
  private readonly paramsTokenFactory = new ParamsTokenFactory();

  public async apply(
    value,
    { metatype, type, data },
    transforms: Transform<any>[],
  ) {
    const token = this.paramsTokenFactory.exchangeEnumForString(type);
    return await this.applyPipes(
      value,
      { metatype, type: token, data },
      transforms,
    );
  }

  public async applyPipes(
    value,
    { metatype, type, data }: { metatype; type?; data? },
    transforms: Transform<any>[],
  ) {
    return await transforms.reduce(async (defferedValue, fn) => {
      const val = await defferedValue;
      const result = fn(val, { metatype, type, data });
      if (result instanceof Promise) {
        return result;
      }
      return Promise.resolve(result);
    }, Promise.resolve(value));
  }
}
