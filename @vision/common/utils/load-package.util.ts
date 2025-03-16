import { Logger } from '@vision/common/services/logger.service';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

const MissingRequiredDependency = (name: string, reason: string) =>
  `The "${name}" package is missing. Please, make sure to install this library ($ npm install ${name}) to take advantage of ${reason}.`;

const logger = new Logger('PackageLoader');

export function loadPackage(packageName: string, context: string) {
  try {
    return require(packageName);
  } catch (e) {
    logger.error(MissingRequiredDependency(packageName, context));
    process.exit(1);
  }
}

export function discount(value)
{
  const discountx = Math.round(( (5 * value) / 100));
  return {
    discount: discountx,
    total: value,
    amount : value - discountx,
  } ;
}

export function discountPercent(amount, percent)
{
  const discountx = Math.round(( (percent * amount) / 100));
  return {
    discount: discountx,
    total: amount,
    amount : amount - discountx,
  };
}

export function discountChangable(value, percent)
{
  const discountx = Math.round(( (percent * value) / 100));
  return {
    discount: discountx,
    total: value,
    amount : value - discountx,
  } ;
}

export function getUsernamPassword(req)
{
  const usernamex =  req.header('username');
  if (!usernamex) throw new FillFieldsException();
  const passwordx =  req.header('password');
  if (!passwordx) throw new FillFieldsException();
  return {
    username: usernamex,
    password: passwordx,
  };
}

export function getTypeFromHeader(req) {
  const type = req.header('type');
  if ( !type ) return 1;
  return type;
}