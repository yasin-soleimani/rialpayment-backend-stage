import { RuntimeException } from '@vision/core/errors/exceptions/runtime.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { Request } from 'express';
import { BadRequestException } from '@vision/common/exceptions/bad-request.exception';

export class InvalidDecoratorItemException extends RuntimeException {
  constructor(decorator: string, item: string, context: string) {
    super(`Invalid ${item} passed to ${decorator}() decorator (${context}).`);
  }
}

export function validateEach(
  context: { name: string },
  arr: any[],
  predicate: Function,
  decorator: string,
  item: string,
): boolean {
  if (!context || !context.name) {
    return true;
  }
  const errors = arr.filter(str => !predicate(str));
  if (errors.length > 0) {
    throw new InvalidDecoratorItemException(decorator, item, context.name);
  }
  return true;
}

export async function getHeaderType(req: Request): Promise<any>
{
  return req.header('type');
}

export async function getHeaderCategory(req: Request): Promise<any>
{
  return req.header('category');
}

export async function getHeaderSort(req: Request): Promise<any>
{
  if (isEmpty(req.header('sort'))){
    return 0;
  } else {
    return req.header('sort');
  }
}