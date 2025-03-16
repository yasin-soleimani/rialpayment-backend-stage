import { Injectable, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { PlatnoCoreService } from '../../Core/plateno/platno.service';
import { ParkingApiDto } from './dto/parking.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class ParkingApiService {
  constructor(private platnoService: PlatnoCoreService) {}

  async addnew(getInfo: ParkingApiDto): Promise<any> {
    const data = await this.platnoService.add(getInfo.platno, getInfo.user);
    if (!data) throw new UserCustomException(' متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return successOpt();
  }

  async getList(userid): Promise<any> {
    const data = await this.platnoService.getList(userid);
    return successOptWithDataNoValidation(data);
  }

  async update(getInfo: ParkingApiDto): Promise<any> {
    const data = await this.platnoService.edit(getInfo.pid, getInfo.user, getInfo.platno);
    if (!data) throw new UserCustomException(' متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return successOpt();
  }

  async delete(pid, userid): Promise<any> {
    const data = await this.platnoService.remove(pid, userid);
    if (!data) throw new UserCustomException(' متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return successOpt();
  }
}
