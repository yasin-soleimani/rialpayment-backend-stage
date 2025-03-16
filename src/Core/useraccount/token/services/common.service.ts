import { Inject, Injectable } from '@vision/common';
import { IToken } from '../interface/token.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenCoreCommonService {
  constructor(@Inject('TokenModel') private readonly tokenModel: any) {}
  async addToken(userId: string, token: string, userAgent: string, ip: string, role: string): Promise<IToken> {
    return this.tokenModel.create({
      token,
      user: userId,
      role,
      ip,
      userAgent,
      status: true,
    });
  }
  async generate(userId: string, userAgent: string, ip: string, role: string): Promise<IToken> {
    console.log('^^^^^^^^^^^^^^^generated Role^^^^^^^^^^^^^^^', role);
    return this.tokenModel.create({
      user: userId,
      role,
      ip,
      userAgent,
      status: true,
      token: jwt.sign(
        {
          id: userId,
          role: role,
        },
        process.env.SIGNIN_SECRET
      ),
    });
  }

  async getInfoByToken(token: string): Promise<IToken> {
    return this.tokenModel.findOne({ token: token });
  }

  async getInfoByIpAndAgent(userId: string, ip: string, userAgent: string): Promise<any> {
    return this.tokenModel.findOne({ user: userId, ip: ip, userAgent: userAgent, status: true });
  }

  async getLastInfo(userId: string): Promise<any> {
    return this.tokenModel.findOne({ user: userId, status: true }).sort({ _id: -1 });
  }

  async disable(id: string, userId: string): Promise<IToken> {
    return this.tokenModel.findOneAndUpdate({ _id: id, user: userId, status: true }, { status: false });
  }

  async getList(userId: string, page: number): Promise<IToken[]> {
    return this.tokenModel.paginate({ user: userId, status: true }, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async disableByToken(token: string, userId: string): Promise<IToken> {
    return this.tokenModel.findOneAndUpdate({ token: token, user: userId }, { status: false });
  }

  async getAllActiveTokensByUserId(userId: string): Promise<IToken[]> {
    return this.tokenModel.find({ user: userId, status: true });
  }
}
