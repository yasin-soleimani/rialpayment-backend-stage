import { Controller } from '@vision/common/interfaces/controllers/controller.interface';
import { ExceptionsHandler } from '@vision/core/exceptions/exceptions-handler';

export interface ExceptionsFilter {
  create(instance: Controller, callback, module: string): ExceptionsHandler;
}
