import { Injectable } from '@vision/common';
import { NationalCommonService } from './common.service';
import { NationalCoreDto } from '../dto/national.dto';

@Injectable()
export class NationalCoreService {
  constructor(private readonly commonService: NationalCommonService) {}

  async addNew(getInfo: NationalCoreDto): Promise<any> {
    this.commonService.selectVisaType(getInfo);
    return this.commonService.new(getInfo);
  }

  async update(getInfo: NationalCoreDto): Promise<any> {
    const id = getInfo.id;
    delete getInfo.id;
    this.commonService.selectVisaType(getInfo);
    return this.commonService.update(id, getInfo);
  }

  async remove(id: string): Promise<any> {
    return this.commonService.remove(id);
  }

  async getInfo(id: string): Promise<any> {
    return this.commonService.getInfo(id);
  }

  async getInfoByIdCode(idcode): Promise<any> {
    return this.commonService.getInfoByIdCode(idcode);
  }

  async getList(query, page): Promise<any> {
    return this.commonService.getListAll(query, page);
  }

  async setDoc(user: string, field: string, img: string): Promise<any> {
    return this.commonService.setData(user, field, img);
  }

  async changeStatus(id: string, status: number, description: string): Promise<any> {
    return this.commonService.changeStatus(id, status, description);
  }
}
