import {
  Injectable,
  successOptWithPagination,
  successOptWithDataNoValidation,
  InternalServerErrorException,
  successOpt,
  BadRequestException,
} from '@vision/common';
import { MessagesCoreService } from '../../Core/messages/messages.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { UserService } from '../../Core/useraccount/user/user.service';
import { MessagesDto } from './dto/messages.dto';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { SessionService } from '../../Core/session/session.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class MessagesApiService {
  constructor(
    private readonly messageService: MessagesCoreService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService
  ) {}

  async getList(userid: string, page: string, type: number): Promise<any> {
    const res = await this.messageService.listMessages(userid, page);
    let tmpArray = Array();
    for (let i = 0; res.docs.length > i; i++) {
      tmpArray.push({
        _id: res.docs[i]._id,
        from: res.docs[i].from.fullname || res.docs[i].from.mobile,
        to: res.docs[i].to.fullname || res.docs[i].to.mobile,
        title: res.docs[i].title,
        description: res.docs[i].description,
        isread: res.docs[i].isread,
        type: res.docs[i].type,
        img: imageTransform(res.docs[i].img),
        createdAt: res.docs[i].createdAt,
      });
    }
    res.docs = tmpArray;
    return successOptWithPagination(res);
  }

  async viewMessage(id: string, userid: string): Promise<any> {
    const data = await this.messageService.viewMessage(id, userid);
    return successOpt();
  }

  async newMessage(getInfo: MessagesDto, userid: string, session): Promise<any> {
    this.checkValidation(getInfo);
    const userInfo = await this.userService.getInfoByAccountNo(getInfo.to);
    if (!userInfo) throw new UserNotfoundException();
    const sessionInfo = await this.sessionService.getStatusById(getInfo.id);

    if (!sessionInfo) throw new BadRequestException();

    const Json = JSON.parse(sessionInfo.session);

    if (Json.captcha != getInfo.captcha) throw new UserCustomException('کد امنیتی اشتباه می باشد');

    const data = await this.messageService.submit(userid, userInfo._id, getInfo.title, getInfo.description, 100);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  private checkValidation(getInfo: MessagesDto) {
    if (isEmpty(getInfo.description) || isEmpty(getInfo.title) || isEmpty(getInfo.to)) throw new FillFieldsException();
  }
}
