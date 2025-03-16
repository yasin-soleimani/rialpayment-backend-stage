import { LeasingFormTypeEnum } from '../../../Core/leasing-form/enums/leasing-form-type.enum';

export class CreateLeasingFormDto {
  type: LeasingFormTypeEnum;
  title: string;
  description: string;
  required: boolean;
}
