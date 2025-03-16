import {
  Injectable,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
  UnauthorizedException,
} from '@vision/common';
import { MerchantShareService } from '../../../Core/merchant/services/merchant-share.service';
import { UserModel } from '../../../Core/merchant/interfaces/merchantShare-model';
import { MerchantcoreService } from '../../../Core/merchant/merchantcore.service';
import * as mongoose from 'mongoose';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class MerchantShareApiService {
  constructor(
    private readonly terminalInfoService: MerchantShareService,
    private readonly merchantsService: MerchantcoreService
  ) {}

  async createShare(from: string, to: string, merchants: string[]) {
    this.terminalInfoService.addShare(from, to, merchants);
    return successOpt();
  }

  async deleteShare(_id: string, user: string) {
    const deleted = await this.terminalInfoService.removeShare(_id, user);
    if (deleted) return successOpt();
    throw new NotFoundException();
  }

  async listShares(type: 1 | 2, user) {
    if (type === 1) {
      const data = await this.terminalInfoService.findShares(user);
      console.log(data);
      return successOptWithDataNoValidation(this.normalShares(data));
    } else {
      const data = await this.terminalInfoService.findShares(null, user);
      console.log(data);

      return successOptWithDataNoValidation(this.normalShares(data));
    }
  }

  async listClubShares(type: 1 | 2, user) {
    const merchantsData = await this.merchantsService.getMerchantsByUserId(user);
    const merchants = [];
    for (const merchant of merchantsData) merchants.push(mongoose.Types.ObjectId(merchant._id));
    const data = await this.terminalInfoService.getMerchantSharesIn(merchants, type);
    console.log(data);
    return successOptWithDataNoValidation(this.normalSharesClub(data));
  }

  async acceptDelete(shareId: string, user: string) {
    const shareData = await this.terminalInfoService.getDeleteRequestedShare(shareId);
    if (!shareData) throw new NotFoundException();
    if (shareData.sharedMerchant.user.toString() != user.toString()) throw new NotFoundException();
    this.terminalInfoService.doDeleteShare(shareId);
    return successOpt();
  }

  async acceptShareRequest(shareId: string, user: string) {
    const shareData = await this.terminalInfoService.getShareRequestedForAccept(shareId);
    if (!shareData) throw new NotFoundException();
    if (shareData.sharedMerchant.user.toString() != user.toString()) throw new NotFoundException();
    this.terminalInfoService.doAcceptShare(shareId);
    return successOpt();
  }

  private normalShares(data) {
    const finalArray = [];
    if (data.length > 0) {
      for (const item of data) {
        finalArray.push({
          shareFromUser: {
            _id: (item.shareFromUser as UserModel)._id,
            name:
              //@ts-ignore
              !!item.clubInfoFrom && item.clubInfoFrom.title //@ts-ignore
                ? item.clubInfoFrom.title
                : (item.shareFromUser as UserModel).fullname,
          },
          shareToUser: {
            _id: (item.shareToUser as UserModel)._id,
            name:
              //@ts-ignore
              !!item.clubInfoTo && item.clubInfoTo.title //@ts-ignore
                ? item.clubInfoTo.title
                : (item.shareToUser as UserModel).fullname,
          },
          merchants: item.merchants,
        });
      }
    }
    return finalArray;
  }

  private normalSharesClub(data) {
    const finalArray = [];
    if (data.length > 0) {
      for (const item of data) {
        finalArray.push({
          _id: item._id,
          shareFromUser: {
            _id: (item.shareFromUser as UserModel)._id,
            name:
              !!item.clubInfoFrom && item.clubInfoFrom.title
                ? item.clubInfoFrom.title
                : (item.shareFromUser as UserModel).fullname,
          },
          shareToUser: {
            _id: (item.shareToUser as UserModel)._id,
            name:
              !!item.clubInfoTo && item.clubInfoTo.title
                ? item.clubInfoTo.title
                : (item.shareToUser as UserModel).fullname,
          },
          sharedMerchant: item.sharedMerchant,
          accepted: item.accepted,
          deleteRequested: item.deleteRequested,
        });
      }
    }
    return finalArray;
  }
}
