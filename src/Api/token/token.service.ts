import { faildOpt, Injectable, successOpt, successOptWithPagination } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { TokenService } from '../../Core/useraccount/token/token.service';
import { TokenApiListFunc } from './function/token.func';

@Injectable()
export class TokenApiService {
  constructor(private readonly tokenService: TokenService) {}

  async getList(userId: string, page: number, token: string): Promise<any> {
    const data = await this.tokenService.getList(userId, page);
    data.docs = TokenApiListFunc(data.docs, token);
    return successOptWithPagination(data);
  }

  async disable(userId: string, id: string): Promise<any> {
    const data = await this.tokenService.disable(userId, id);
    if (data) return successOpt();
    return faildOpt();
  }

  async terminateAll(userId: string, token: string): Promise<any> {
    const tokens = await this.tokenService.terminateAll(userId, token);
    if (!tokens) return faildOpt();
    return successOpt();
  }
}
