import { Inject, Injectable } from '@vision/common';

@Injectable()
export class MerchantCoreBookmarkService {
  constructor(@Inject('TerminalBookmarkModel') private readonly terminalBookmarkModel: any) {}

  async showTerminalBookmark(userid, merchantid): Promise<any> {
    return this.terminalBookmarkModel.findOne({ user: userid, terminal: merchantid });
  }

  async addBookmark(userid, merchantid, status): Promise<any> {
    if (await this.checkBookmark(userid, merchantid)) {
      return this.terminalBookmarkModel.findOneAndUpdate(
        { user: userid, terminal: merchantid },
        { bookmarked: status }
      );
    } else {
      return this.terminalBookmarkModel.create({ user: userid, terminal: merchantid, bookmarked: status });
    }
  }

  async checkBookmark(userid, merchantid): Promise<any> {
    return this.terminalBookmarkModel.findOne({ user: userid, terminal: merchantid });
  }
}
