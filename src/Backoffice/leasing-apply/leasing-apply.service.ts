import { Injectable, successOptWithPagination } from '@vision/common';
import { LeasingApplyCoreService } from '../../Core/leasing-apply/leasing-apply.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { LeasingFormTypeEnum } from '../../Core/leasing-form/enums/leasing-form-type.enum';
import { LeasingApply, LeasingApplyFormField } from '../../Core/leasing-apply/interfaces/leasing-apply.interface';
import { LeasingInfoDocument } from '../../Core/leasing-info/interfaces/leasing-info.interface';

@Injectable()
export class BackofficeLeasingApplyService {
  constructor(private readonly leasingApplyCoreService: LeasingApplyCoreService) {}

  async getAll(page: number): Promise<any> {
    const data = await this.leasingApplyCoreService.getAll(page);
    data.docs = await this.normalizeLeasingApplyData(data.docs);

    return successOptWithPagination(data);
  }

  private async normalizeLeasingApplyData(data: LeasingApply[]): Promise<LeasingApply[]> {
    const clone = [...data];
    const temp: any[] = [];

    for (let i = 0; i < clone.length; i++) {
      const element = clone[i];
      let tempElement: any;
      const formsClone = [...element.form];
      const nonFileFields = formsClone.filter((el) => el.type !== LeasingFormTypeEnum.FILE);
      const fileFields = formsClone.filter((el) => el.type === LeasingFormTypeEnum.FILE);
      let updatedFormArray: LeasingApplyFormField[] = [];

      const leasingLogo = imageTransform(element.leasingInfo.logo);
      console.log({ leasingLogo });

      // normalize formFields value, convert the value to link if field type is file
      if (fileFields.length > 0) {
        updatedFormArray = nonFileFields;
        for (const field of fileFields) {
          updatedFormArray.push({
            _id: (field as any)._id,
            link: imageTransform(field.value),
            type: field.type,
            value: field.value,
            key: field.key,
            title: field.title,
            required: field.required,
          });
        }
        tempElement = {
          form: updatedFormArray,
          leasingInfo: {
            _id: (element.leasingInfo as LeasingInfoDocument)._id,
            leasingUser: element.leasingInfo.leasingUser,
            title: element.leasingInfo.title,
            description: element.leasingInfo.description,
            logo: leasingLogo,
          },
          leasingUser: element.leasingUser,
          leasingOption: element.leasingOption,
          paidByLeasing: element.paidByLeasing,
          applicant: element.applicant,
          status: element.status,
          confirmDescription: element.confirmDescription,
          declineReasons: element.declineReasons,
          deleted: element.deleted,
          invoiceId: element.invoiceId,
          isOnProgress: element.isOnProgress,
          _id: (element as any)._id,
          createdAt: (element as any).createdAt,
          updatedAt: (element as any).updatedAt,
        };
      }

      temp.push(tempElement);
    }

    return temp;
  }
}
