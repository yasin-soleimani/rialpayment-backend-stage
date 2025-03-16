import { Injectable } from '@vision/common';
import { EditCoreService } from '../../Core/edit/edit.service';
import { BackofficeEditDto } from './dto/edit.dto';
import { GeneralService } from '../../Core/service/general.service';
import { UserService } from '../../Core/useraccount/user/user.service';

@Injectable()
export class BackofficeEditService {
  constructor(
    private readonly editService: EditCoreService,
    private readonly generalService: GeneralService,
    private readonly userService: UserService
  ) {}

  async getInfo(getInfo: BackofficeEditDto): Promise<any> {
    return this.editService.getInfo(getInfo);
  }

  async changeUserMobile(getInfo: BackofficeEditDto): Promise<any> {
    return this.editService.changeMobile(getInfo);
  }

  async changeBirthdate(getInfo: BackofficeEditDto): Promise<any> {
    return this.editService.changeBirthdate(getInfo);
  }

  async changeCard(getInfo: BackofficeEditDto): Promise<any> {
    return this.editService.changeCardNo(getInfo);
  }
}
