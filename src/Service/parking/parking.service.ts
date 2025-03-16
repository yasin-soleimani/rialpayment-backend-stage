import { Injectable, successOpt } from '@vision/common';
import { PlatnoCoreService } from '../../Core/plateno/platno.service';
import { ParkingServiceDto } from './dto/parking.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AccountService } from '../../Core/useraccount/account/account.service';

@Injectable()
export class ParkingService {
  constructor(private readonly platnoService: PlatnoCoreService, private readonly accountService: AccountService) {}

  async check(getInfo: ParkingServiceDto): Promise<any> {
    // check All Fields
    await this.checkFields(getInfo);

    if (getInfo.username == 'alpnr1' && getInfo.password == 'al!@#123') {
      const platData = await this.tajikPlat(getInfo.plateno);
      const data = await this.platnoService.findPlatTajik(platData);
      if (!data) throw new UserCustomException('متاسفانه پلاک یافت نشد', false, 500);
      const walletBalance = await this.accountService.getBalance(data.user, 'wallet');
      if (walletBalance.balance < getInfo.amount) throw new UserCustomException('موجودی کافی نمی باشد', false, 702);
      this.accountService.dechargeAccount(data.user, 'wallet', getInfo.amount);
      this.accountService.chargeAccount('5c3999072da3261e3cf597df', 'wallet', getInfo.amount);
      const title = 'هزینه پارکینگ توچال';
      this.accountService.accountSetLogg(
        title,
        'ParkingPay',
        getInfo.amount,
        true,
        data.user,
        '5c3999072da3261e3cf597df'
      );
      return successOpt();
    } else {
      throw new UserCustomException('نام کاربری یا کلمه عبور اشتباه می باشد', false, 401);
    }
  }

  async checkFields(getInfo: ParkingServiceDto): Promise<any> {
    if (
      isEmpty(getInfo.amount) ||
      isEmpty(getInfo.intime) ||
      isEmpty(getInfo.outtime) ||
      isEmpty(getInfo.password) ||
      isEmpty(getInfo.plateno) ||
      isEmpty(getInfo.username)
    )
      throw new FillFieldsException();
  }

  private async tajikPlat(platno): Promise<any> {
    const regex = /^([0-9]{2})-([a-zA-z]{1,4})-([0-9]{5})$/;
    if (regex.test(platno)) {
      const datax = platno.match(regex);
      const persianChar = await this.convertPlatno(datax[2]);

      const p3 = datax[3].substr(0, 3);
      const iran = datax[3].substr(3, 4);
      const originalPlat = datax[1] + persianChar.fa + p3 + '-' + iran;
      return originalPlat;
    } else {
      throw new UserCustomException('قالب بندی پلاک مشکل دارد', false, 500);
    }
  }

  private async convertPlatno(char: string): Promise<any> {
    let platsChar = [
      {
        eng: 'Alef',
        fa: 'الف',
      },
      {
        eng: 'B',
        fa: 'ب',
      },
      {
        eng: 'T',
        fa: 'ج',
      },
      {
        eng: 'Jim',
        fa: 'ج',
      },
      {
        eng: 'De',
        fa: 'د',
      },
      {
        eng: 'Sin',
        fa: 'س',
      },
      {
        eng: 'Sad',
        fa: 'ص',
      },
      {
        eng: 'Ta',
        fa: 'ط',
      },
      {
        eng: 'Ain',
        fa: 'ع',
      },
      {
        eng: 'Gh',
        fa: 'ق',
      },
      {
        eng: 'K',
        fa: 'ک',
      },
      {
        eng: 'L',
        fa: 'ل',
      },
      {
        eng: 'M',
        fa: 'م',
      },
      {
        eng: 'N',
        fa: 'ن',
      },
      {
        eng: 'H',
        fa: 'ه',
      },
      {
        eng: 'V',
        fa: 'و',
      },
      {
        eng: 'Y',
        fa: 'ی',
      },
      {
        eng: 'P',
        fa: 'پ',
      },
      {
        eng: 'E',
        fa: 'ژ',
      },
      {
        eng: 'F',
        fa: 'ف',
      },
      {
        eng: 'Z',
        fa: 'ز',
      },
      {
        eng: 'Shin',
        fa: 'ش',
      },
      {
        eng: 'Se',
        fa: 'ث',
      },
      {
        eng: 'D',
        fa: 'D',
      },
      {
        eng: 'S',
        fa: 'S',
      },
    ];

    return platsChar.find((p) => p.eng == char);
  }
}
