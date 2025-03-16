import * as express from 'express';
import { ExpressAdapter } from '@vision/core/adapters/express-adapter';

export class ExpressFactory {
  public static create(): any {
    return new ExpressAdapter(express());
  }
}
