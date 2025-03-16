import {
  Injectable,
  Inject,
  InternalServerErrorException,
  successOpt,
  NotFoundException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { NewOperatorCoreDto } from './dto/operator.dto';
import { OperatorCommonService } from './services/common.service';
import { Model } from 'mongoose';
import { OperatorLoginCoreDto } from './dto/login.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import * as sha256 from 'sha256';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../../Api/auth/interfaces/jwt-payload.interface';

@Injectable()
export class OPeratorCoreService {
  constructor(
    @Inject('OperatorModel') private readonly operatorModel: Model<any>,
    private readonly commonService: OperatorCommonService
  ) {}

  async addNew(getInfo: NewOperatorCoreDto): Promise<any> {
    await this.commonService.regValidation(getInfo);
    getInfo.password = sha256(getInfo.password);
    const data = await this.operatorModel.create(getInfo);
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  async login(getInfo: OperatorLoginCoreDto): Promise<any> {
    await this.commonService.loginValidation(getInfo);
    const data = await this.operatorModel.findOne({ username: getInfo.username });
    if (!data) throw new NotFoundException();
    if (data.password != sha256(getInfo.password))
      throw new UserCustomException('متاسفانه کلمه عبور اشتباه می باشد', false, 500);
    const user = { id: data._id };
    const accessToken = jwt.sign(user, process.env.SIGNIN_SECRET);
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
      token: accessToken,
    };
  }
}
