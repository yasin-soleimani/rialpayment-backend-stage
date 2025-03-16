import { Injectable, Inject, InternalServerErrorException, NotFoundException, successOpt } from '@vision/common';
import { CreateMipgDto } from './dto/create-mipg.dto';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import * as uniqid from 'uniqid';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CategorycoreService } from '../category/categorycore.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { MipgAuthService } from './services/mipg-auth.service';
import { MipgWageType } from './const/wagetype.const';
import { AclCoreService } from '../acl/acl.service';
import { UserService } from '../useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { UPLOAD_URI } from '../../__dir__';

@Injectable()
export class MipgCoreService {
  constructor(
    @Inject('MipgModel') private readonly mipgModel: any,
    private readonly aclService: AclCoreService,
    private readonly mipgAuthService: MipgAuthService,
    private readonly userService: UserService,
    private readonly categoryService: CategorycoreService
  ) {}

  async create(req, createAuthDto: CreateMipgDto): Promise<any> {
    this.checkFile(req);
    const mime = this.checkMime(req.files.logo.mimetype);
    const logo = req.files.logo;
    const uuid = uniqid();
    const img = uuid + '.' + mime;
    await logo.mv(UPLOAD_URI + img, (err) => {
      if (err) throw new InternalServerErrorException();
    });
    createAuthDto.logo = img;
    const data = await this.mipgModel.create(createAuthDto);
    console.log(data, 'data');
    await this.mipgAuthService
      .addNew(
        createAuthDto.authnationalcode,
        createAuthDto.authmobile,
        createAuthDto.authshahkar,
        createAuthDto.authnahab,
        data._id,
        false
      )
      .then((res) => {
        console.log(res, 'then res');
      })
      .catch((err) => console.log(err, 'err'));
    if (!data) throw new InternalServerErrorException();
    return this.successOpt();
  }

  async getInfoById(id: string): Promise<any> {
    return this.mipgModel.findOne({ _id: id });
  }
  async getInfo(terminalidx: any): Promise<any> {
    return this.mipgModel
      .findOne({ terminalid: terminalidx })
      .populate({
        path: 'direct',
        match: { status: true },
      })
      .populate('user')
      .populate('ref')
      .populate({ path: 'terminal', populate: { path: 'merchant' } })
      .populate('voucher')
      .exec();
  }

  async getInfoDirect(terminalid: number): Promise<any> {
    return await this.mipgModel
      .findOne({
        terminalid: terminalid,
      })
      .populate('direct');
  }

  async getInfoByTerminalId(terminalid: number): Promise<any> {
    return await this.mipgModel
      .findOne({
        terminalid: terminalid,
      })
      .populate('direct')
      .populate('user')
      .populate('ref')
      .populate({ path: 'terminal', populate: { path: 'merchant' } })
      .populate('voucher');
  }

  async getMipgInfoByIdAndUserid(id: string, userid: string): Promise<any> {
    return this.mipgModel.findOne({
      _id: id,
      $or: [{ user: userid }, { red: userid }],
    });
  }

  async getInfoByAgent(userid, id): Promise<any> {
    return this.mipgModel.findOne({
      _id: id,
      ref: userid,
    });
  }

  async getInfoByAdmin(id: string): Promise<any> {
    return this.mipgModel.findOne({
      _id: id,
    });
  }

  async updateInfo(req, createAuthDto: CreateMipgDto): Promise<any> {
    const user = await this.mipgModel.findOne({ _id: createAuthDto.id });
    const acl = await this.aclService.getAclUSer(createAuthDto.ref);
    if (!acl.managecredit) {
      if (user.ref != createAuthDto.ref) throw new UserCustomException('کاربر زیرمجموعه شما نمی باشد', false, 202);
    } else {
      delete createAuthDto.ref;
    }
    if (isEmpty(createAuthDto.logo)) {
      const mime = this.checkMime(req.files.logo.mimetype);
      const logo = req.files.logo;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      await logo.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });
      createAuthDto.logo = img;
    } else {
      createAuthDto.logo = user.logo;
    }
    const data = await this.mipgModel.findOneAndUpdate({ _id: createAuthDto.id }, createAuthDto);
    this.mipgAuthService.update(
      createAuthDto.authnationalcode,
      createAuthDto.authmobile,
      createAuthDto.authshahkar,
      createAuthDto.authnahab,
      createAuthDto.id
    );
    if (!data) throw new InternalServerErrorException();
    return this.successOpt();
  }

  checkMime(mimetype: string) {
    switch (mimetype) {
      case 'image/png': {
        return 'png';
      }
      case 'image/jpg': {
        return 'jpg';
      }
      case 'image/jpeg': {
        return 'jpeg';
      }
    }
  }

  checkFile(req) {
    if (!req.files.logo) throw new FillFieldsException();
  }

  successOpt() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }

  async getAll(userid, page, category): Promise<any> {
    const query = await this.selectType(category, userid);
    const data = await this.mipgModel.paginate(query, {
      page,
      populate: 'user auth',
      sort: { createdAt: -1 },
      limit: 10,
    });
    const tmpArray = Array();
    for (let i = 0; data.docs.length > i; i++) {
      console.log(data.docs[i].auth);
      const psp = data.docs[i].psp.split(',');
      let pspArray;
      if (psp[0] == '0') {
        pspArray = [];
      } else {
        pspArray = psp;
      }

      const auth = await this.getAuthTerminals(data.docs[i].auth);

      tmpArray.push({
        _id: data.docs[i]._id,
        user: data.docs[i].user,
        title: data.docs[i].title,
        category: data.docs[i].category,
        ip: data.docs[i].ip,
        ip2: data.docs[i].ip2,
        ip3: data.docs[i].ip3,
        ip4: data.docs[i].ip4,
        ip5: data.docs[i].ip5,
        url: data.docs[i].url,
        psp: pspArray,
        terminalid: data.docs[i].terminalid,
        logo: imageTransform(data.docs[i].logo),
        email: data.docs[i].email,
        type: data.docs[i].type,
        karmozd: data.docs[i].karmozd,
        status: data.docs[i].status,
        wagetype: data.docs[i].wagetype || MipgWageType.After,
        isdirect: data.docs[i].isdirect || false,
        authmobile: auth.mobile || false,
        authnationalcode: auth.nationalcode || false,
        authshahkar: auth.shahkar || false,
        authnahab: auth.nahab || false,
        updatedAt: data.docs[i].updatedAt,
      });
    }
    data.docs = tmpArray;
    return data;
  }

  private async getAuthTerminals(auth): Promise<any> {
    if (auth) {
      return {
        mobile: auth.mobile,
        nationalcode: auth.nationalcode,
        shahkar: auth.shahkar,
        nahab: auth.nahab,
      };
    } else {
      return {
        mobile: false,
        nationalcode: false,
        shahkar: false,
        nahab: false,
      };
    }
  }
  async searchCategoryName(catid): Promise<any> {
    return await this.categoryService.searchCat(catid);
  }

  async searchInBackofficeMode(page, searchParam): Promise<any> {
    const query = await this.searchSelectBackofficeAdminMode(searchParam);
    return this.mipgModel.paginate(query, { page, populate: 'user', sort: { createdAt: -1 }, limit: 50 });
  }

  async search(userid, page, category, words): Promise<any> {
    const acl = await this.aclService.getAclUSer(userid);
    if (!acl) throw new UserCustomException('متاسفانه شمادسترسی ندارید');
    let query;
    if (acl.managecredit == true) {
      query = await this.searchSelectTypeAdminMode(category, words, userid);
    } else {
      query = await this.searchSelectType(category, words, userid);
    }
    return this.mipgModel.paginate(query, { page, populate: 'user', sort: { createdAt: -1 }, limit: 10 });
  }

  async getUsers(userid): Promise<any> {
    return this.mipgModel.find({ ref: userid });
  }

  private async selectType(categoryx, userid): Promise<any> {
    if (!isEmpty(categoryx) && categoryx != 'all') {
      const query = {
        $and: [{ ref: userid }, { category: categoryx }],
      };
      return query;
    } else {
      const query = { ref: userid };
      return query;
    }
  }

  private async searchSelectType(type, words, userid): Promise<any> {
    const where = '/^' + words + '/.test(this.terminalid)';
    if (!isEmpty(type) && !isEmpty(words) && type != 'all') {
      const query = {
        $and: [
          { ref: userid },
          {
            $or: [{ title: { $regex: words } }, { $where: where }, { ip: { $regex: words } }],
          },
          { category: type },
        ],
      };

      return query;
    }
    if (!isEmpty(type) && isEmpty(words) && type != 'all') {
      const query = {
        $and: [{ ref: userid }, { category: type }],
      };

      return query;
    }
    if (type == 'all' || !isEmpty(words)) {
      const query = {
        $and: [
          { ref: userid },
          {
            $or: [{ title: { $regex: words } }, { $where: where }, { ip: { $regex: words } }],
          },
        ],
      };
      return query;
    }
  }

  private async searchSelectBackofficeAdminMode(words): Promise<any> {
    const where = '/^' + words + '/.test(this.terminalid)';
    if (!isEmpty(words)) {
      const query = {
        $and: [
          {
            $or: [{ title: { $regex: words } }, { $where: where }, { ip: { $regex: words } }],
          },
        ],
      };

      return query;
    } else {
      const query = {};
      return query;
    }
  }

  private async searchSelectTypeAdminMode(type, words, userid): Promise<any> {
    const where = '/^' + words + '/.test(this.terminalid)';
    if (!isEmpty(type) && !isEmpty(words) && type != 'all') {
      const query = {
        $and: [
          {
            $or: [{ title: { $regex: words } }, { $where: where }, { ip: { $regex: words } }],
          },
          { category: type },
        ],
      };

      return query;
    }
    if (!isEmpty(type) && isEmpty(words) && type != 'all') {
      const query = {
        $and: [{ category: type }],
      };

      return query;
    }
    if (type == 'all' || !isEmpty(words)) {
      const query = {
        $and: [
          {
            $or: [{ title: { $regex: words } }, { $where: where }, { ip: { $regex: words } }],
          },
        ],
      };
      return query;
    }
  }

  async changeTerminalStatus(id, userid): Promise<any> {
    let terminalInfo;

    const acl = await this.aclService.getAclUSer(userid);

    if (!acl.managecredit) {
      terminalInfo = await this.mipgModel.findOne({
        _id: id,
        ref: userid,
      });
      if (!terminalInfo) throw new NotFoundException();
    } else {
      terminalInfo = await this.mipgModel.findOne({
        _id: id,
      });
      if (!terminalInfo) throw new NotFoundException();
    }

    const status = terminalInfo.status == true ? false : true;
    const info = await this.mipgModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status: status,
      }
    );
    if (!info) throw new InternalServerErrorException();
    return successOpt();
  }

  async changeTerminalStatusBackofficeMode(terminalid: number, status: boolean): Promise<any> {
    return this.mipgModel.findOneAndUpdate(
      {
        terminalid: terminalid,
      },
      {
        status: status,
      }
    );
  }

  async getAllMipgListReport(userid: string): Promise<any> {
    return this.mipgModel.find({
      $or: [{ user: userid }, { ref: userid }],
    });
  }

  async getMipgTerminalid(id: string): Promise<any> {
    return this.mipgModel.findOne({
      _id: id,
    });
  }

  async getMipgsByUseridTerminals(userid: string): Promise<any> {
    return this.mipgModel.find({
      $or: [{ user: userid }, { ref: userid }],
    });
  }

  async chnageIsDirect(id: string, status: boolean): Promise<any> {
    return this.mipgModel.findOneAndUpdate({ _id: id }, { isdirect: status });
  }

  async changeWageType(id: string, type: number): Promise<any> {
    return this.mipgModel.findOneAndUpdate({ _id: id }, { wagetype: type });
  }

  async addNewMrs(acceptorid, terminalid, psp, title, mobile): Promise<any> {
    const userInfo = await this.userService.getInfoByMobile(mobile);
    if (!userInfo) throw new UserNotfoundException();

    const mipgInfo = await this.mipgModel.findOne({
      mrs: {
        terminalid: terminalid,
        acceptorid: acceptorid,
        psp: psp,
      },
    });

    if (mipgInfo) {
      this.mipgModel.findOneAndUpdate(
        { _id: mipgInfo._id },
        {
          $set: {
            title: title,
            user: userInfo._id,
            type: 102,
            mrs: {
              terminalid: terminalid,
              acceptorid: acceptorid,
              psp: psp,
            },
          },
        }
      );
    } else {
      this.mipgModel.create({
        user: userInfo._id,
        title: title,
        ref: '5c8268d70e88895a90bd2eeb',
        ip: '127.0.0.1',
        email: ' ',
        category: ' ',
        type: 102,
        mrs: {
          terminalid: terminalid,
          acceptorid: acceptorid,
          psp: psp,
        },
      });
    }

    return successOpt();
  }

  async patchTerminalIntoMipg(mipgId: string, merchantTerminalId: string): Promise<any> {
    return this.mipgModel.findOneAndUpdate({ _id: mipgId }, { $set: { terminal: merchantTerminalId } }, { new: true });
  }
}
