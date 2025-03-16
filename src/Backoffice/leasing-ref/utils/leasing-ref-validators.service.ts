import { BadRequestException, Injectable } from '@vision/common';
import { isNil } from '@vision/common/utils/shared.utils';
import { LeasingRefStatusEnum } from '../../../Core/leasing-ref/enums/leasing-ref-status.enum';
import { GetAllLeasingRefsFilters } from '../dto/leasing-ref-filters.dto';
import { UpdateLeasingRefStatusDto } from '../dto/update-leasing-ref-status.dto';

@Injectable()
export class BackofficeLeasingRefValidatorsService {
  async validateFilters(filters: GetAllLeasingRefsFilters): Promise<void> {
    if (!isNil(filters.status) && typeof filters.status !== 'string')
      throw new BadRequestException('نوع داده فیلد status صحیح نیست');

    return;
  }

  async validateUpdateLeasingRefStatusDto(dto: UpdateLeasingRefStatusDto): Promise<void> {
    if (isNil(dto)) throw new BadRequestException('تمامی فیلدها را پر کنید');
    if (isNil(dto.status)) throw new BadRequestException('فیلد status اجباریست');
    if (dto.status === LeasingRefStatusEnum.DECLINED && !dto.message)
      throw new BadRequestException('در صورتی که فیلد status برابر با declined باشد، فیلد message اجباریست');
  }
}
