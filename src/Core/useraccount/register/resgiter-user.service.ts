import { Injectable } from '@vision/common';
import { RegisterUserCoreDto } from './dto/register-user.dto';
import { RegisterUserInService } from './services/register-user.service';
import { RegisterOperatorInService } from './services/register-operator.service';

@Injectable()
export class RegisterUserService {
  constructor(
    private readonly registerUserService: RegisterUserInService,
    private readonly registerOperatorService: RegisterOperatorInService
  ) {}

  async registerUser(getInfo: RegisterUserCoreDto): Promise<any> {
    return this.registerUserService.regUser(getInfo);
  }

  async registerFromUser(getInfo: RegisterUserCoreDto, refid, role: string): Promise<any> {
    return this.registerUserService.registerFromUser(getInfo, refid, role);
  }

  async registerBulk(req, userid, group): Promise<any> {
    return this.registerUserService.BulkRegister(req, userid, group);
  }

  async registerOperator(mobile, password, fullname, ref, nationalcode, type): Promise<any> {
    return this.registerOperatorService.regOpt(mobile, password, fullname, ref, nationalcode, type);
  }

  async newMethodRegister(mobile, password, ref): Promise<any> {
    return this.registerUserService.newMethod(mobile, password, ref);
  }

  async registerFromPos(mobile, password, ref): Promise<any> {
    return this.registerUserService.registerFromPos(mobile, password, ref);
  }

  async authUser(nationalcode, birthdate, userid, type): Promise<any> {
    return this.registerUserService.authUser(nationalcode, birthdate, userid, type);
  }
}
