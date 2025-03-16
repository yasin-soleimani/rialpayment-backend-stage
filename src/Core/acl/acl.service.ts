import { Model } from 'mongoose';
import { Injectable, Inject, successOptWithDataNoValidation, faildOpt, UnauthorizedException } from '@vision/common';
import { AcelCoreDto } from './dto/acl.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { diffDays } from '@vision/common/utils/month-diff.util';
import { Acl } from './interfaces/acl.interface';

@Injectable()
export class AclCoreService {
  constructor(@Inject('AclModel') private readonly AclModel: Model<Acl>) {}

  async newAcl(getInfo: AcelCoreDto): Promise<any> {
    const newAcl = new this.AclModel(getInfo);
    return this.AclModel.findOneAndUpdate({ user: getInfo.user }, newAcl, { new: true, upsert: true });
  }

  async newClubAcl(userid): Promise<any> {
    return this.AclModel.create({ user: userid, customerclub: true, leasingmanager: true });
  }

  // OK
  async newClubManagerAcl(userid): Promise<any> {
    return this.AclModel.create({ user: userid, customerclubmanager: true });
  }

  async getList(): Promise<any> {
    return this.AclModel.find();
  }

  async getAllAcls(): Promise<any> {
    return this.AclModel.find({});
  }

  async findAndUpdateExpire(userid, start, expire): Promise<any> {
    return this.AclModel.findOneAndUpdate(
      {
        user: userid,
      },
      {
        expire: expire,
      }
    );
  }

  async getUser(userid: string): Promise<any> {
    if (isEmpty(userid)) throw new UserNotfoundException();
    const acl = await this.getAclUSer(userid);
    if (!acl) return successOptWithDataNoValidation(await this.faildAclForm());
    return successOptWithDataNoValidation(await this.aclTitlebar(acl));
  }

  async getAclUSer(userid): Promise<any> {
    return this.AclModel.findOne({ user: userid }).populate('user').exec();
  }

  async aclTitlebar(data): Promise<any> {
    if (!data) {
      return {
        customerclub: false,
        agentnewuser: false,
        merchant: false,
        ipg: false,
        national: false,
        nationalagent: false,
        customerclubmanager: false,
        title: 'کاربر',
        type: 'member',
        managecredit: false,
      };
    }

    switch (true) {
      case data.customerclub === true && data.merchants === false: {
        return {
          customerclub: true,
          agentnewuser: true,
          merchant: true,
          ipg: false,
          national: data.national || false,
          nationalagent: data.nationalagent || false,
          customerclubmanager: false,
          leasingmanager: true,
          leasing: data.leasing || false,
          title: 'باشگاه مشتریان',
          type: 'customerclub',
        };
      }
      case data.merchants === true && data.agentnewuser === true: {
        const remainDays = diffDays(data.createdAt, data.expire);
        if (remainDays < 1) {
          return {
            customerclub: false,
            agentnewuser: false,
            merchant: false,
            ipg: false,
            title: 'کاربر',
            type: 'member',
            customerclubmanager: false,
            national: data.national || false,
            nationalagent: data.nationalagent || false,
            leasingmanager: false,
            leasing: data.leasing || false,
          };
        }
        return {
          customerclub: false,
          agentnewuser: true,
          merchant: true,
          ipg: true,
          national: data.national || false,
          nationalagent: data.nationalagent || false,
          title: 'نماینده',
          type: 'agent',
          customerclubmanager: true,
          managecredit: data.managecredit || false,
          leasingmanager: data.leasingmanager || false,
          leasing: data.leasing || false,
        };
      }
      case data.merchants === true && data.agentnewuser === false: {
        return {
          customerclub: false,
          agentnewuser: false,
          merchant: true,
          ipg: true,
          title: 'پذیرنده',
          type: 'merchant',
          managecredit: false,
          customerclubmanager: false,
          national: data.national || false,
          nationalagent: data.nationalagent || false,
          leasingmanager: false,
          leasing: data.leasing || false,
        };
      }

      case data.customerclubmanager === true: {
        return {
          customerclub: false,
          agentnewuser: false,
          merchant: false,
          ipg: false,
          title: 'مدیر باشگاه',
          type: 'clubmanager',
          managecredit: false,
          customerclubmanager: true,
          national: data.national || false,
          nationalagent: data.nationalagent || false,
          leasingmanager: false,
          leasing: data.leasing || false,
        };
      }
      default: {
        return {
          customerclub: false,
          agentnewuser: false,
          merchant: false,
          ipg: false,
          customerclubmanager: false,
          national: data.national || false,
          nationalagent: data.nationalagent || false,
          title: 'کاربر',
          type: 'member',
          leasingmanager: false,
          leasing: data.leasing || false,
        };
      }
    }
  }

  async enableLeasingPermission(userid: string): Promise<any> {
    return this.AclModel.findOneAndUpdate({ user: userid }, { leasing: true }, { upsert: true });
  }

  async disableLeasingPermission(userid: string): Promise<any> {
    return this.AclModel.findOneAndUpdate({ user: userid }, { leasing: false });
  }

  private async aclForm(data): Promise<any> {
    return {
      customerclub: data.customerclub || false,
      agentnewuser: data.agentnewuser || false,
      merchant: data.merchants || false,
      ipg: data.ipg || false,
      title: data.title,
    };
  }

  private async faildAclForm(): Promise<any> {
    return {
      customerclub: false,
      agentnewuser: false,
      merchant: false,
      ipg: false,
      title: 'کاربر',
      type: 'member',
    };
  }
}
