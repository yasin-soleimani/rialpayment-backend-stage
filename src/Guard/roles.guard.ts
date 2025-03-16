import { Injectable, CanActivate, ExecutionContext } from '@vision/common';
import { Reflector } from '@vision/core';
import * as jwt from 'jsonwebtoken';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { TokenService } from '../Core/useraccount/token/token.service';
import { getIp } from './ip.decoration';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    console.log('[[[[[[[[[[ in roles guard started: ', roles);
    if (!roles) return true;

    const req = context.switchToHttp().getRequest();
    if (isEmpty(req.header('Authorization'))) return false;
    console.log('[[[[[[[[[[ after 1 ]]]]]]]]]]');
    const token = req.header('Authorization').split(' ');
    console.log('[[[[[[[[[[ after 2 ]]]]]]]]]]');
    const tokenValidation = token[1].split('.');

    if (tokenValidation.length < 3 || tokenValidation.length > 3) return false;
    console.log('[[[[[[[[[[ after 3 ]]]]]]]]]]');
    const userData = jwt.verify(token[1], process.env.SIGNIN_SECRET);
    const rolesArray = userData.role.split(',');

    const userRequest = getIp(req);
    const tokenValidate = await this.tokenService.validate(token);
    console.log('[[[[[[[[[[ after validate ]]]]]]]]]]', tokenValidate);
    if (!tokenValidate) return false;
    //if (tokenValidate.userAgent != userRequest.userAgent) return false;
    //if (tokenValidate.ip != userRequest.ip) return false;

    const result = roles.some((role) => rolesArray.includes(role));
    console.log('[[[[[[[[[[ last result ]]]]]]]]]]', result);
    return result;
  }
}
