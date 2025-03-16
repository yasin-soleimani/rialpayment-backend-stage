import { MiddlewareContainer, MiddlewareWrapper } from '@vision/core/middleware/container';
import { Injector } from '@vision/core/injector/injector';
import { Module } from '@vision/core/injector/module';

export class MiddlewareResolver {
  private readonly instanceLoader = new Injector();

  constructor(private readonly middlewareContainer: MiddlewareContainer) {}

  public async resolveInstances(module: Module, moduleName: string) {
    const middleware = this.middlewareContainer.getMiddleware(moduleName);
    await Promise.all(
      [...middleware.values()].map(
        async wrapper =>
          await this.resolveMiddlewareInstance(wrapper, middleware, module),
      ),
    );
  }

  private async resolveMiddlewareInstance(
    wrapper: MiddlewareWrapper,
    middleware: Map<string, MiddlewareWrapper>,
    module: Module,
  ) {
    await this.instanceLoader.loadInstanceOfMiddleware(
      wrapper,
      middleware,
      module,
    );
  }
}
