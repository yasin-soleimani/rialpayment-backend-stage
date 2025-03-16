import { Injectable } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardmanagementcoreService } from '../../../Core/cardmanagement/cardmanagementcore.service';
import { CardmanagementcoreDto } from '../../../Core/cardmanagement/dto/cardmanagementcore.dto';
import { MerchantTerminalPosInfoService } from '../../../Core/merchant/services/merchant-terminal-pos-info.service';
import { RegisterUserService } from '../../../Core/useraccount/register/resgiter-user.service';
import { PosRegisterUserDto } from '../dto/pos-register-user.dto';

@Injectable()
export class PosUserRegisterService {
  constructor(
    private readonly posInfoCoreService: MerchantTerminalPosInfoService,
    private readonly userRegisterService: RegisterUserService,
    private readonly cardManagementCoreService: CardmanagementcoreService
  ) {}

  async register(getInfo: PosRegisterUserDto): Promise<any> {
    try {
      // validate pos register dto
      await this.validateDto(getInfo);
      // get pos info from database
      const posInfo = await this.getPosInfo(getInfo);

      // if terminal or merchant are disabled, this means user cannot be registered
      if (posInfo.terminal.status == false || posInfo.terminal.merchant.status == false)
        throw new UserCustomException('پذیرنده نامعتبر');

      //  actually register the user as a customer club member
      const registeredUserData = await this.registerUser(getInfo, posInfo);

      // register user's card number (shetabi)
      await this.registerCardNumber(getInfo, registeredUserData);
      return registeredUserData;
    } catch (e) {
      console.log(e);
      throw new UserCustomException('خطا هنگام ثبت‌نام');
    }
  }

  private async registerUser(getInfo: PosRegisterUserDto, posInfo: any): Promise<any> {
    const refId = await this.getRef(posInfo);
    const password = getInfo.mobile.slice(1, getInfo.mobile.length);
    return this.userRegisterService.registerFromPos(getInfo.mobile, password, refId);
  }

  private async validateDto(getInfo: PosRegisterUserDto): Promise<void> {
    if (typeof getInfo !== 'object') throw new UserCustomException('تمامی فیلد‌ها را پر کنید');

    const objectLength = Object.keys(getInfo).length;
    if (objectLength < 5) throw new UserCustomException('تمامی فیلد‌ها را پر کنید');

    if (!getInfo.cardno) throw new UserCustomException('شماره کارت معتبر نیست');
    if (!(await this.validateCardNumber(getInfo.cardno))) throw new UserCustomException('شماره کارت معتبر نیست');

    if (!getInfo.mac || !getInfo.serial || !getInfo.modelname) throw new UserCustomException('پذیرنده نامعتبر');

    if (!getInfo.mobile) throw new UserCustomException('شماره موبایل وارد شده معتبر نیست');
    if (getInfo.mobile.length !== 11 || !getInfo.mobile.startsWith('09'))
      throw new UserCustomException('شماره موبایل وارد شده معتبر نیست');
  }

  private async getPosInfo(getInfo: PosRegisterUserDto): Promise<any> {
    const data = await this.posInfoCoreService.getInfo(getInfo.serial, getInfo.modelname, getInfo.mac);
    if (!data) throw new UserCustomException('پذیرنده نامعتبر', false, 500);

    return data;
  }

  private async getRef(posInfo: any): Promise<any> {
    return posInfo.terminal.merchant.user.refid;
  }

  private async registerCardNumber(getInfo: PosRegisterUserDto, registeredUserData: any): Promise<any> {
    const cardNumber = getInfo.cardno;
    const cardData: CardmanagementcoreDto = {
      cardno: parseInt(cardNumber, 10),
      cardowner: true,
      cardownerfullname: 'بی‌نام',
      organ: false,
      user: registeredUserData._id,
      cardrelatione: '',
    };
    return this.cardManagementCoreService.insertCard(cardData);
  }

  /**
   * CARD NUMBER VALIDATOR. this validator uses luhn algorithm to
   * check if the CARD Number is Valid or not.
   *
   * @param ctrl [AbstractControl]
   * @returns [{cardnum: boolean}] as error map, otherwise null
   */
  private async validateCardNumber(cardNumber: string): Promise<boolean> {
    if (cardNumber.length === 16) {
      // getting user input as string and makes an array of it's digits
      const card = cardNumber.split('');

      // temporary variables
      const final = [];
      let sum = 0;

      // main algorithm
      for (let i = 0; i < card.length; ++i) {
        if (i % 2 === 0) {
          const s = parseInt(card[i], 10) * 2;
          final[i] = s > 9 ? s - 9 : s;
        } else {
          final[i] = parseInt(card[i], 10) * 1;
        }
      }
      final.forEach((n) => {
        sum += n;
      });

      // if INVALID return error map, otherwise null
      return sum % 10 !== 0 ? false : true;
    } else {
      return false;
    }
  }
}
