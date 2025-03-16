import { Injectable, Inject } from '@vision/common';
import { todayRange } from '@vision/common/utils/month-diff.util';
import { CampaignChargePrefix, CampaignCmpType, CampaignIncTypeConst, CampaignTypeConst } from '../../campaign/const/type.const';
import { CampaignCoreCommonService } from '../../campaign/services/common.service';
import { AccountService } from '../account/account.service';
import { OrganizationNewChargeCoreService } from '../../organization/new-charge/charge.service';
import { UserService } from '../user/user.service';
import { CamapignHistoryCoreService } from '../../campaign/services/history.service';

@Injectable()
export class LoginHistoryService {
  constructor(
    @Inject('LoginHistoryModel') private readonly loginModel: any,
    private readonly campaignService: CampaignCoreCommonService,
    private readonly accountService: AccountService,
    private readonly organizationService: OrganizationNewChargeCoreService,
    private readonly campaignHistory: CamapignHistoryCoreService,
    private readonly userService: UserService
  ) { }

  async new(user: string, devicetype: string, deviceinfo: string, ip): Promise<any> {
    await this.loginCheck(user, devicetype);
    return this.loginModel.create({
      user: user,
      devicetype: devicetype,
      deviceinfo: deviceinfo,
      ip: ip,
    });
  }

  async getListPaginate(userid, page): Promise<any> {
    return this.loginModel
      .paginate(
        {
          user: userid,
        },
        { page, select: { __v: 0, updatedAt: 0, user: 0 }, populate: 'user', sort: { createdAt: -1 }, limit: 50 }
      )
      .catch((err) => {
        return err;
      });
  }

  async getListWithFilterPaginate(query, page): Promise<any> {
    return this.loginModel
      .paginate(query, {
        page,
        select: { __v: 0, updatedAt: 0, user: 0 },
        populate: 'user',
        sort: { createdAt: -1 },
        limit: 50,
      })
      .catch((err) => {
        return err;
      });
  }

  async getUser(userid: string): Promise<any> {
    const today = todayRange();
    return this.loginModel
      .findOne({
        user: userid,
        createdAt: { $gte: today.start, $lte: today.end },
      })
      .populate('user');
  }

  async checkUser(userid): Promise<any> {
    const data = await this.getUser(userid);
    if (!data) return false;

    // if ( data.user.ref ) {
    //   const refInfo = await this.userService.getInfoByRefid( data.user.ref );
    //   if ( !refInfo ) return false;

    //   if ( refInfo.refid == 'norooz') {

    //   } else {

    //   }
    // }

    return data;
  }

  private async checkNorooz(userid, refInfo): Promise<any> { }

  async oldUser(userid): Promise<any> {
    // const title = 'عیدی سال 1398';
    // this.accountService.accountSetLogg(title, 'Gift', 7000, true, null, userid );
    // this.accountService.chargeAccount( userid, 'wallet', 7000 );
  }

  async getQueryfindOne(query: any): Promise<any> {
    return this.loginModel.findOne(query);
  }

  async getQueryFind(query: any): Promise<any> {
    return this.loginModel.findOne(query);
  }

  async getAggregate(query: any): Promise<any> {
    return this.loginModel.aggregate(query);
  }

  async loginCheck(userId: string, devicetype: string): Promise<any> {
    const dvType = this.getDeviceType(devicetype);
    if (!dvType) return false;

    const campaign = await this.getCampaign(dvType, userId);
    if (!campaign) return false;

    const exist = await this.getQueryfindOne({ user: userId, devicetype });
    if (exist) return false;

    if (campaign.incType == CampaignIncTypeConst.Organization) {
      this.organizationCharge(userId, campaign);
    } else if (campaign.incType == CampaignIncTypeConst.Wallet) {
      this.walletCharge(userId, campaign);
    }
  }

  async getLoggedInUsers(start: string, end: string): Promise<any> {
    const data = await this.loginModel.aggregate([
      { $match: { createdAt: { $gte: new Date(start), $lt: new Date(end) } } },
      { $group: { _id: '$user' } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      }, {
        $unwind: {
          path: '$userInfo',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          mobile: { $push: '$userInfo.mobile' },
          users: { $push: '$userInfo._id' }
        }
      }
    ]);

    if (data.length > 0) return data[0];

    return null;
  }

  private async organizationCharge(userId: string, campaign: any): Promise<any> {
    const title = 'شارژ سازمانی کمپین ' + campaign.title;
    this.organizationService.chargeUser(userId, campaign.amount, null, title, process.env.GIFT_POOL_ID).then((res) => {
      if (!res) return false;

      const ref = CampaignChargePrefix[campaign.type];
      const refId = ref + 'Org-' + new Date().getTime()
      this.accountService.chargeAccount(userId, 'org', campaign.amount);
      this.campaignHistory.addNew(campaign._id, userId, campaign.amount, refId);
      this.accountService.accountSetLoggWithRef(
        title,
        refId,
        campaign.amount,
        true,
        null,
        userId
      );
    });
  }

  private async walletCharge(userId: string, campaign: any): Promise<any> {
    this.accountService
      .chargeAccount(userId, 'wallet', campaign.amount)
      .then((res) => {
        if (!res) return false;

        const title = 'شارژ کیف پول از کمپین ' + campaign.title;

        const ref = CampaignChargePrefix[campaign.type];
        const refId = ref + 'Org-' + new Date().getTime()

        this.campaignHistory.addNew(campaign._id, userId, campaign.amount, refId);

        this.accountService.accountSetLoggWithRef(
          title,
          refId,
          campaign.amount,
          true,
          null,
          userId
        );
      })
      .catch((err) => console.log(err));
  }

  private getDeviceType(devicetype: string) {
    switch (devicetype) {
      case 'mobile': {
        return CampaignTypeConst.AppLogin;
      }

      case 'mobile_google': {
        return CampaignTypeConst.AppLogin;
      }

      case 'web': {
        return CampaignTypeConst.WebLogin;
      }

      case 'pwa': {
        return CampaignTypeConst.PwaLogin;
      }

      default: {
        return null;
      }
    }
  }

  private async getCampaign(type: number, userId: string): Promise<any> {
    const today = new Date();

    const cmp = await this.campaignService.findOne({
      $and: [{ start: { $lte: today } }, { expire: { $gte: today } }],
      status: true,
      type,
    });

    if (!cmp) return false;
    const historyCount = await this.campaignHistory.getCount(cmp._id);
    if (cmp.maxUser <= historyCount) {
      this.campaignService.disable(cmp._id, false);
      return false;
    }

    return this.club(cmp, userId);
  }

  async club(campaign, userId): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userId);
    if (!userId) return false;

    if (campaign.campType == CampaignCmpType.All) {
      return campaign;
    }

    if (campaign.campType == CampaignCmpType.Iranian) {
      if (userInfo.ref == '') return campaign;

      return false;
    }

    if (campaign.campType == CampaignCmpType.UnAuthorized) {
      return campaign;
    }

    if (campaign.campType == CampaignCmpType.ownClub) {
      if (userInfo.ref == campaign.user) return campaign;

      return false
    }

    return false;
  }

}
