import { Injectable } from '@vision/common';
import { IToken } from './interface/token.interface';
import { TokenCoreCommonService } from './services/common.service';

@Injectable()
export class TokenService {
  constructor(private readonly tokenCommonService: TokenCoreCommonService) {}

  async terminateAll(userId: string, token: string): Promise<boolean> {
    const tokens = await this.getAllActiveTokensByUser(userId);
    if (tokens.length < 1) return false;

    for (const item of tokens) {
      if (item.token != token) {
        this.disable(item.user, item._id);
      }
    }

    return true;
  }
  async getAllActiveTokensByUser(userId: string): Promise<IToken[]> {
    return this.tokenCommonService.getAllActiveTokensByUserId(userId);
  }

  async addToken(userId: string, token: string, userAgent: string, ip: string, role: string): Promise<IToken> {
    return this.tokenCommonService.addToken(userId, token, userAgent, ip, role);
  }

  async validate(token: string): Promise<IToken> {
    const data = await this.tokenCommonService.getInfoByToken(token);
    if (data) return data;
    return null;
  }

  async getList(userId: string, page: number): Promise<any> {
    return this.tokenCommonService.getList(userId, page);
  }

  async generate(userId: string, userAgent: string, ip: string, role: string): Promise<IToken> {
    if (role != 'admin ') {
      console.log('in not admin<<<<<<<<<<<<<<', role);

      return this.tokenCommonService.generate(userId, userAgent, ip, role);
    } else {
      return this.tokenCommonService.generate(userId, userAgent, ip, role);
    }
  }

  async disable(userId: string, id: string): Promise<boolean> {
    const data = await this.tokenCommonService.disable(id, userId);
    if (!data) return false;
    return true;
  }

  async disableByToken(token: string, userId: string): Promise<any> {
    const data = await this.tokenCommonService.disableByToken(token, userId);
    if (!data) return false;
    return true;
  }
}
