import { Injectable, InternalServerErrorException, successOpt, faildOptWithData } from '@vision/common';
import { Sitad } from '@vision/common/utils/sitad.util';
import { RegisterUserCoreDto } from '../dto/register-user.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import * as persianize from 'persianize';
import { UserService } from '../../user/user.service';
import { CardService } from '../../card/card.service';
import { AccountService } from '../../account/account.service';
import { RegisterFromUserDto } from '../dto/register-from-user.dto';
import xlsx from 'node-xlsx';
import { CardmanagementcoreService } from '../../../cardmanagement/cardmanagementcore.service';
import { GroupCoreService } from '../../../group/group.service';
import { CardcounterService } from '../../cardcounter/cardcounter.service';
import * as farmhash from 'farmhash';
import { GeneralService } from '../../../../Core/service/general.service';
import { sendWelcomeToIranian, sendWelcomeToIranianClub } from '@vision/common/messages/SMS';
import { ClubCoreService } from '../../../../Core/customerclub/club.service';

@Injectable()
export class RegisterCommonInService {
  private sitad;

  constructor(
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly accountService: AccountService,
    private readonly cardManagementService: CardmanagementcoreService,
    private readonly groupService: GroupCoreService,
    private readonly generalService: GeneralService,
    private readonly counterService: CardcounterService,
    private readonly clubService: ClubCoreService
  ) {
    this.sitad = new Sitad();
  }

  async requestSitad(getInfo: RegisterUserCoreDto): Promise<any> {
    const dataUser = await this.sitad.getInfo(getInfo.nationalcode, getInfo.birthdate);
    if (isEmpty(dataUser.name)) throw new UserCustomException('متاسفانه اطلاعات شما معتبر نمی باشد', false, 201);
    return dataUser;
  }

  async reqSitad(nationalcode, birthdate): Promise<any> {
    const dataUser = await this.sitad.getInfo(nationalcode, birthdate);
    if (isEmpty(dataUser.name)) throw new UserCustomException('متاسفانه اطلاعات شما معتبر نمی باشد', false, 201);
    return dataUser;
  }

  async checkFields(getInfo: RegisterUserCoreDto): Promise<any> {
    if (!persianize.validator().meliCode(getInfo.nationalcode))
      throw new UserCustomException('کد ملی را به صورت صحیح وارد نمایید');

    if (
      isEmpty(getInfo.birthdate) ||
      isEmpty(getInfo.devicetype) ||
      isEmpty(getInfo.nationalcode) ||
      isEmpty(getInfo.password) ||
      isEmpty(getInfo.mobile)
    )
      throw new FillFieldsException();
  }

  async checkFieldBulk(getInfo: RegisterFromUserDto): Promise<any> {
    if (isEmpty(getInfo.mobile)) return false;
    return true;
  }

  async checkFields2(getInfo: RegisterUserCoreDto): Promise<any> {
    if (isEmpty(getInfo.nationalcode) || isEmpty(getInfo.mobile) || isEmpty(getInfo.birthdate))
      throw new FillFieldsException();
    if (!persianize.validator().meliCode(getInfo.nationalcode))
      throw new UserCustomException('کد ملی را به صورت صحیح وارد نمایید');
  }

  async register(getInfo: RegisterFromUserDto, userid?, role?: string): Promise<any> {
    // const dataUser = await this.requestSitad( getInfo );

    // getInfo.fullname = dataUser.name + ' ' + dataUser.family;
    // getInfo.place = dataUser.officeName;
    getInfo.profilestatus = this.userService.checkStatus(getInfo.devicetype);

    getInfo.ref = userid;

    const data = await this.userService.create(getInfo).then(async (data) => {
      await this.cardService.generateCard(data._id);
      await this.accountService.makeWallet(data._id);
      await this.accountService.makeCredit(data._id);
      await this.accountService.makeDiscount(data._id);
      await this.accountService.makeIdm(data._id);
      await this.accountService.makeAccountID(data._id);
      await this.userService.makeRefID(data._id);
      if (role == 'agent') {
        const msg = await sendWelcomeToIranian();
        this.generalService.AsanaksendSMS('', '', '', getInfo.mobile.toString(), msg);
      } else if (role == 'customerclub') {
        const clubInfo = await this.clubService.getClubInfoByOwner(userid);
        if (clubInfo) {
          const msg =
            'به ' +
            clubInfo.title +
            '  خوش آمدید \n' +
            'جهت کسب اطلاعات بیشتر به آدرس ذیل مراجعه نمایید \n' +
            '' +
            clubInfo.clubinfo.website +
            ' \n' +
            'پشتیبانی: ' +
            '\n' +
            `0${clubInfo.clubinfo.tell}`;

          this.generalService.AsanaksendSMS('', '', '', getInfo.mobile.toString(), msg);
        }
      }
      return data;
    });
    if (!data) throw new InternalServerErrorException();

    return data;
  }

  async bulkRegister(getInfo: RegisterFromUserDto, group?, card?): Promise<any> {
    // const dataUser = await this.requestSitad( getInfo );
    console.log('------------- bulk register started ---------------');
    console.log('************* before check field ***************');
    const checkField = await this.checkFieldBulk(getInfo);
    console.log('************* after check field ***************');

    // getInfo.fullname = dataUser.name + ' ' + dataUser.family;
    // getInfo.place = dataUser.officeName;
    getInfo.profilestatus = 11;

    if (checkField) {
      console.log('************* before insert user ***************');
      const data = await this.userService.bulkInsert(getInfo).then(async (data) => {
        console.log('...............................................');

        await this.cardService.generateCardBulk(data[0]._id);
        console.log('************* card generated ***************');
        await this.accountService.makeWalletBulk(data[0]._id);
        console.log('************* wallet generated ***************');
        await this.accountService.makeCreditBulk(data[0]._id);
        console.log('************* credit generated ***************');
        await this.accountService.makeDiscountBulk(data[0]._id);
        console.log('************* discount generated ***************');
        await this.accountService.makeIdmBulk(data[0]._id);
        console.log('************* idm generated ***************');
        await this.accountService.makeAccountIDwithXlsx(data[0]._id);
        console.log('************* accId generated ***************');
        await this.userService.makeRefID(data[0]._id);
        console.log('************* refid generated ***************');
        return data;
      });
      console.log('...............................................');
      console.log('************* before card new register *************** :', card);
      if (!isEmpty(card)) {
        // todo make it async
        this.cardManagementService.insertCardWithNewRegister(data[0]._id, card, '');
      }
      console.log('************* before add to group ***************');
      if (!isEmpty(group)) {
        // todo make it async
        this.groupService.addUserToGroup(data[0]._id, group);
      }
      console.log('************* after add to group ***************');
      return data;
    } else {
      return null;
    }
  }

  async newMethod(mobile, password, ref: string): Promise<any> {
    if (isEmpty(mobile) || isEmpty(password)) throw new FillFieldsException();
    let refx = null;
    if (!isEmpty(ref)) {
      const refInfo = await this.userService.getInfoByRefid(ref.toUpperCase());
      if (!refInfo) throw new UserCustomException('متاسفانه معرف یافت نشد', false, 404);
      refx = refInfo._id;
    }
    const userInfo = await this.userService.newMethodRegister(mobile, password, refx);
    if (!userInfo) throw new InternalServerErrorException();

    this.cardService.generateCard(userInfo._id);
    this.accountService.makeWallet(userInfo._id);
    this.accountService.makeCredit(userInfo._id);
    this.accountService.makeDiscount(userInfo._id);
    this.accountService.makeIdm(userInfo._id);
    this.userService.makeRefID(userInfo._id);
    await this.accountService.makeAccountID(userInfo._id);
    return userInfo;
  }

  async readXlsx(req, userid, group): Promise<any> {
    const excelFile = req.files.filesxlsx;
    if (isEmpty(excelFile.data)) throw new UserCustomException('متاسفانه قالب بندی فایل شما درست نمی باشد', false, 500);
    const workSheetsFromBuffer = xlsx.parse(excelFile.data);

    const returnData = await this.submitForEach(workSheetsFromBuffer[0].data, userid, group);
    if (returnData.length > 0) {
      return faildOptWithData(returnData);
    } else {
      return successOpt();
    }
  }

  private isValidIranianNationalCode(input: string) {
    if (!/^\d{10}$/.test(input)) return false;
    const check = +input[9];
    const sum =
      input
        .split('')
        .slice(0, 9)
        .reduce((acc, x, i) => acc + +x * (10 - i), 0) % 11;
    return sum < 2 ? check === sum : check + sum === 11;
  }

  private async submitForEach(data, userid, group): Promise<any> {
    let errorArray = Array();
    // filter out all empty arrays
    const filteredXlsxData = data.filter((element) => element.length > 0);
    // filter first row of xlsx file, cause it's just header
    const actualXlsxData = filteredXlsxData.slice(1, filteredXlsxData.length);

    for (const index in actualXlsxData) {
      const value = actualXlsxData[index];

      const mcode = value[6].toString().replace(/'/g, '');
      const mobile = value[0].toString().replace(/'/g, '');
      console.log('----------------- mobile: ', mobile);
      console.log('----------------- nationalcode: ', mcode);
      if (!isEmpty(value) && new RegExp('^(090|091|092|093|099).{8}$').test(mobile)) {
        console.log('_______________ mobile regexp check ________________');
        if (this.isValidIranianNationalCode(mcode)) {
          console.log('_______________ national code check ________________');
          const nationalCodeChecker = await this.userService.getInfoByNationalCode(mcode);
          console.log('_______________ national code check db ________________');
          if (!nationalCodeChecker) {
            const mobileCodeChecker = await this.userService.getInfoByMobile(mobile);
            console.log('_______________ mobile db check ________________');
            if (!mobileCodeChecker) {
              console.log('_______________ before counter check ________________');
              const counter = await this.counterService.getNumbersAccounts();
              console.log('_______________ after counter check ________________', counter);
              const accountnumber = farmhash.fingerprint32(new Buffer(counter.acc));
              console.log('_______________ after fingerprint check ________________');
              const bulki = {
                mobile: mobile,
                password: mobile,
                fullname: value[2],
                birthdate: value[3],
                fathername: value[4],
                place: value[5],
                nationalcode: mcode,
                active: true,
                profilestatus: 11,
                ref: userid,
                account_no: accountnumber,
                devicetype: 'web',
              };
              console.log('_______________ before bulk ________________');

              // todo make it async
              this.bulkRegister(bulki, group, value[1])
                .then((res) => {
                  console.log(res, ' reg res');
                })
                .catch((err) => {
                  console.log(err, 'reg err');
                });
            } else {
              errorArray.push({
                index: parseInt(index) + 2,
                msg: 'شماره موبایل در سیستم قبلا ثبت شده است',
              });
            }
          } else {
            console.log('dup mcode');
            errorArray.push({
              index: parseInt(index) + 2,
              msg: 'کد ملی در سیستم قبلا ثبت شده است',
            });
            console.log(errorArray);
          }
        } else {
          errorArray.push({
            index: parseInt(index) + 2,
            msg: `فرمت کد ملی صحیح نمیباشد - ${mcode}`,
          });
        }
      } else {
        errorArray.push({
          index: parseInt(index) + 2,
          msg: `شماره موبایل صحیح نمی باشد - ${mobile}`,
        });
      }
    }

    return errorArray;
  }
}
