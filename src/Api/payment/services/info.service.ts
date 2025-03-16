import { Injectable } from '@vision/common';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class PaymentInformationApiService {
  constructor(private readonly cardService: CardService, private readonly userService: UserService) {}

  async play(query): Promise<any> {
    if (isEmpty(query)) throw new FillFieldsException();
    if (query.length > 11) {
      return this.cardInfo(query);
    } else {
      return this.userInfo(query);
    }
  }

  private async userInfo(query): Promise<any> {
    const userInfo = await this.userService.findByMobile(query);
    if (!userInfo) throw new UserCustomException('یافت نشد', false, 404);

    let fullname = 'بی نام';
    if (userInfo.fullname) fullname = userInfo.fullname;

    return this.return(fullname, userInfo.avatar, userInfo.account_no, userInfo._id);
  }

  private async cardInfo(query): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(query);
    if (!cardInfo) throw new UserCustomException('یافت نشد', false, 404);

    let fullname = 'بی نام';
    let avatar,
      userid,
      accno = null;
    if (cardInfo.user && cardInfo.user.fullname) {
      fullname = cardInfo.user.fullname;
      avatar = cardInfo.user.avatar;
      userid = cardInfo.user._id;
      accno = cardInfo.user.account_no;
    }

    return this.return(fullname, avatar, accno, userid);
  }

  private return(fullname: string, avatar: string, account_no: number, userid: string) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      fullname: fullname,
      avatar: imageTransform(avatar),
      accountNo: account_no,
      userid: userid,
    };
  }
}
