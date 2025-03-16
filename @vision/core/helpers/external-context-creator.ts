import 'reflect-metadata';
import { GuardsContextCreator } from '@vision/core/guards/guards-context-creator';
import { GuardsConsumer } from '@vision/core/guards/guards-consumer';
import { InterceptorsContextCreator } from '@vision/core/interceptors/interceptors-context-creator';
import { InterceptorsConsumer } from '@vision/core/interceptors/interceptors-consumer';
import { Controller } from '@vision/common/interfaces';
import { FORBIDDEN_MESSAGE } from '@vision/core/guards/constants';
import { ForbiddenException } from '@vision/common';
import { Module } from '@vision/core/injector/module';
import { ModulesContainer } from '@vision/core/injector/modules-container';
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";

export class ExternalContextCreator {
  constructor(
    private readonly guardsContextCreator: GuardsContextCreator,
    private readonly guardsConsumer: GuardsConsumer,
    private readonly interceptorsContextCreator: InterceptorsContextCreator,
    private readonly interceptorsConsumer: InterceptorsConsumer,
    private readonly modulesContainer: ModulesContainer,
  ) {}

  public create(
    instance: Controller,
    callback: (...args) => any,
    methodName: string,
  ) {
    const module = this.findContextModuleName(instance.constructor);
    const guards = this.guardsContextCreator.create(instance, callback, module);
    const interceptors = this.interceptorsContextCreator.create(
      instance,
      callback,
      module,
    );
    return async (...args) => {
      const canActivate = await this.guardsConsumer.tryActivate(
        guards,
        args,
        instance,
        callback,
      );
      if (!canActivate) {
        throw new UserCustomException('متاسفانه شما به این قسمت دسترسی ندارید', false, 401);
      }
      const handler = () => callback.apply(instance, args);
      return await this.interceptorsConsumer.intercept(
        interceptors,
        args,
        instance,
        callback,
        handler,
      );
    };
  }

  public findContextModuleName(constructor: any): string {
    const className = constructor.name;
    if (!className) {
      return '';
    }
    for (const [key, module] of [...this.modulesContainer.entries()]) {
      if (this.findComponentByClassName(module, className)) {
        return key;
      }
    }
    return '';
  }

  public findComponentByClassName(module: Module, className: string): boolean {
    const { components } = module;
    const hasComponent = [...components.keys()].find(
      component => component === className,
    );
    return !!hasComponent;
  }
}
