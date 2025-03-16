import 'reflect-metadata';
import iterate from 'iterare';
import {
  Controller,
  PipeTransform,
  Transform,
} from '@vision/common/interfaces';
import { PIPES_METADATA } from '@vision/common/constants';
import {
  isUndefined,
  isFunction,
  isEmpty,
} from '@vision/common/utils/shared.utils';
import { ApplicationConfig } from '@vision/core/application-config';
import { ContextCreator } from '@vision/core/helpers/context-creator';
import { VisionContainer } from '@vision/core/injector/container';

export class PipesContextCreator extends ContextCreator {
  private moduleContext: string;

  constructor(
    private readonly container: VisionContainer,
    private readonly config?: ApplicationConfig,
  ) {
    super();
  }

  public create(
    instance: Controller,
    callback: (...args) => any,
    module: string,
  ): Transform<any>[] {
    this.moduleContext = module;
    return this.createContext(instance, callback, PIPES_METADATA);
  }

  public createConcreteContext<T extends any[], R extends any[]>(
    metadata: T,
  ): R {
    if (isUndefined(metadata) || isEmpty(metadata)) {
      return [] as R;
    }
    return iterate(metadata)
      .filter((pipe: any) => pipe && (pipe.name || pipe.transform))
      .map(pipe => this.getPipeInstance(pipe))
      .filter(pipe => pipe && pipe.transform && isFunction(pipe.transform))
      .map(pipe => pipe.transform.bind(pipe))
      .toArray() as R;
  }

  public getPipeInstance(pipe: Function | PipeTransform) {
    const isObject = (pipe as PipeTransform).transform;
    if (isObject) {
      return pipe;
    }
    const instanceWrapper = this.getInstanceByMetatype(pipe);
    return instanceWrapper && instanceWrapper.instance
      ? instanceWrapper.instance
      : null;
  }

  public getInstanceByMetatype(metatype): { instance: any } | undefined {
    if (!this.moduleContext) {
      return undefined;
    }
    const collection = this.container.getModules();
    const module = collection.get(this.moduleContext);
    if (!module) {
      return undefined;
    }
    return module.injectables.get((metatype as any).name);
  }

  public getGlobalMetadata<T extends any[]>(): T {
    if (!this.config) {
      return [] as T;
    }
    return this.config.getGlobalPipes() as T;
  }

  public setModuleContext(context: string) {
    this.moduleContext = context;
  }
}
