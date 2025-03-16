import iterate from 'iterare';
import { VisionContainer } from '@vision/core/injector/container';
import { Injector } from '@vision/core/injector/injector';
import { Injectable } from '@vision/common/interfaces/injectable.interface';
import { Controller } from '@vision/common/interfaces/controllers/controller.interface';
import { Module } from '@vision/core/injector/module';
import { Logger, OnModuleInit } from '@vision/common';
import { moduleInitMessage } from '@vision/core/helpers/messages';
import { isUndefined, isNil } from '@vision/common/utils/shared.utils';

export class InstanceLoader {
  private readonly injector = new Injector();
  private readonly logger = new Logger(InstanceLoader.name, true);

  constructor(private readonly container: VisionContainer) {}

  public async createInstancesOfDependencies() {
    const modules = this.container.getModules();

    this.createPrototypes(modules);
    await this.createInstances(modules);
  }

  private createPrototypes(modules: Map<string, Module>) {
    modules.forEach(module => {
      this.createPrototypesOfComponents(module);
      this.createPrototypesOfInjectables(module);
      this.createPrototypesOfRoutes(module);
    });
  }

  private async createInstances(modules: Map<string, Module>) {
    await Promise.all(
      [...modules.values()].map(async module => {
        await this.createInstancesOfComponents(module);
        await this.createInstancesOfInjectables(module);
        await this.createInstancesOfRoutes(module);

        const { name } = module.metatype;
        this.logger.log(moduleInitMessage(name));
      }),
    );
  }

  private createPrototypesOfComponents(module: Module) {
    module.components.forEach(wrapper => {
      this.injector.loadPrototypeOfInstance<Injectable>(
        wrapper,
        module.components,
      );
    });
  }

  private async createInstancesOfComponents(module: Module) {
    await Promise.all(
      [...module.components.values()].map(
        async wrapper =>
          await this.injector.loadInstanceOfComponent(wrapper, module),
      ),
    );
  }

  private createPrototypesOfRoutes(module: Module) {
    module.routes.forEach(wrapper => {
      this.injector.loadPrototypeOfInstance<Controller>(wrapper, module.routes);
    });
  }

  private async createInstancesOfRoutes(module: Module) {
    await Promise.all(
      [...module.routes.values()].map(
        async wrapper =>
          await this.injector.loadInstanceOfRoute(wrapper, module),
      ),
    );
  }

  private createPrototypesOfInjectables(module: Module) {
    module.injectables.forEach(wrapper => {
      this.injector.loadPrototypeOfInstance<Controller>(
        wrapper,
        module.injectables,
      );
    });
  }

  private async createInstancesOfInjectables(module: Module) {
    await Promise.all(
      [...module.injectables.values()].map(
        async wrapper =>
          await this.injector.loadInstanceOfInjectable(wrapper, module),
      ),
    );
  }
}
