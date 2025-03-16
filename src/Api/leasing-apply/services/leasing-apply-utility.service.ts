import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@vision/common';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { isNil } from '@vision/common/utils/shared.utils';
import { ClubPwaService } from '../../../Core/clubpwa/club-pwa.service';
import { ClubPwa } from '../../../Core/clubpwa/interfaces/club-pwa.interface';
import { LeasingOptionCoreService } from '../../../Core/leasing-option/leasing-option.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import * as uniqid from 'uniqid';
import { CreateLeasingApplyDto } from '../../../Core/leasing-apply/dto/create-leasing-apply.dto';
import { AclCoreService } from '../../../Core/acl/acl.service';
import { UpdateLeasingApplyDto } from '../../../Core/leasing-apply/dto/update-leasing-apply.dto';
import { LeasingApplyStatusEnum } from '../../../Core/leasing-apply/enums/leasing-apply-status.enum';
import { LeasingApplyCoreService } from '../../../Core/leasing-apply/leasing-apply.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GetApplyListForLeasingQueryParams } from '../dto/get-apply-list-for-leasing-query-params.dto';
import { Types } from 'mongoose';
import { LeasingApplyFormDto } from '../dto/leasing-apply-form.dto';
import { LeasingForm } from '../../../Core/leasing-form/interfaces/leasing-form.interface';
import { LeasingFormTypeEnum } from '../../../Core/leasing-form/enums/leasing-form-type.enum';
import {
  LeasingApply,
  LeasingApplyDocument,
  LeasingApplyFormField,
} from '../../../Core/leasing-apply/interfaces/leasing-apply.interface';
import { UpdateLeasingApplyForm } from '../dto/update-leasing-apply-form.dto';
import { isValidLeasingApplyForm } from '../../../Core/leasing-form/helpers/type-guards';
import { leasingFormFieldTypeValidators } from '../functions/form-field-type-validators';
import { LeasingContractCoreService } from '../../../Core/leasing-contract/leasing-contract.service';
import { LeasingContractUtilityService } from '../../../Core/leasing-contract/services/leasing-contract-utility.service';
import { LeasingContract } from '../../../Core/leasing-contract/interfaces/leasing-contract.interface';
import { PaginateResult } from '../../../utils/types.util';
import { LeasingUserCreditDocument } from '../../../Core/leasing-user-credit/interfaces/leasing-user-credit.interface';
import { LeasingUserCreditCoreService } from '../../../Core/leasing-user-credit/leasing-user-credit.service';
import { LeasingInstallments } from '../../../Core/leasing-installments/interfaces/leasing-installments.interface';
import { LeasingInstallmentsCoreService } from '../../../Core/leasing-installments/leasing-installments.service';
import { LeasingOption } from '../../../Core/leasing-option/interfaces/leasing-option.interface';
import { normalizeInstallments } from '../../leasing-installments/helpers/normalize-installments.helper';
import { UPLOAD_URI } from '../../../__dir__';

@Injectable()
export class LeasingApplyUtilityService {
  constructor(
    private readonly userCoreService: UserService,
    private readonly clubPwaService: ClubPwaService,
    private readonly leasingOptionCoreService: LeasingOptionCoreService,
    private readonly leasingApplyCoreService: LeasingApplyCoreService,
    private readonly leasingContractCoreService: LeasingContractCoreService,
    private readonly leasingContractUtilityService: LeasingContractUtilityService,
    private readonly aclCoreService: AclCoreService,
    private readonly leasingUserCreditCoreService: LeasingUserCreditCoreService,
    private readonly leasingInstallmentsCoreService: LeasingInstallmentsCoreService
  ) {}

  async checkIfUserAlreadyHasPendingRequest(userId: string, leasingUser: string): Promise<void> {
    const leasingApplyData = await this.leasingApplyCoreService.getByApplicantAndLeasingUser(userId, leasingUser);
    if (leasingApplyData)
      throw new BadRequestException(
        'شما در حال حاضر یک درخواست اعتبار در دست بررسی یا تأیید شده از این سرمایه‌گذار دارید.'
      );
  }

  async checkIfLeasingApplyIsUpdatable(leasingApplyId: string): Promise<LeasingApply> {
    const leasingApply = await this.leasingApplyCoreService.getById(leasingApplyId);
    if (leasingApply[0].status !== LeasingApplyStatusEnum.DECLINED) {
      throw new UserCustomException('این درخواست در یکی از حالات در انتظار بررسی و تأیید شده است و قابل ویرایش نیست');
    } else {
      return leasingApply[0];
    }
  }

  async validateUpdateApplyByLeasingDto(dto: UpdateLeasingApplyDto): Promise<void> {
    if (isNil(dto)) throw new BadRequestException('تمامی فیلد‌ها را پر کنید');
    if (isNil(dto.status)) throw new BadRequestException('فیلد status الزامیست');
    if (
      (dto.status === LeasingApplyStatusEnum.DECLINED || dto.status === LeasingApplyStatusEnum.ACCEPTED_BY_LEASING) &&
      !dto.message
    ) {
      throw new BadRequestException('در صورت رد یا قبول درخواست اعتبار، وارد کردن توضیحات تکمیلی الزامیست');
    }

    if (dto.status === LeasingApplyStatusEnum.ACCEPTED_BY_LEASING) {
      if (dto.message.length < 8) throw new BadRequestException('توضیحات پس از تأیید باید حداقل 8 حرفی باشد');
      if (dto.message.length > 1000) throw new BadRequestException('توضیحات پس از تأیید باید حداکثر 1000 حرفی باشد');
    }
  }

  async checkLeasingAcl(userId: any): Promise<any> {
    const acl = await this.aclCoreService.getAclUSer(userId);
    if (!acl || !acl.leasing) throw new ForbiddenException('شما به این قسمت دسترسی ندارید');
  }

  async checkUser(userId: any): Promise<any> {
    const userData = await this.userCoreService.getInfoByUserid(userId);
    if (!userData) throw new UserNotfoundException('کاربر یافت نشد');
    else return userData;
  }

  async getClubPwaDataByClubUser(clubUser: string): Promise<ClubPwa> {
    return await this.clubPwaService.getClubPwaByClubUserId(clubUser);
  }

  async validateLeasingApplyDto(
    body: LeasingApplyFormDto,
    req: any,
    leasingForms: LeasingForm[],
    leasingUser: string,
    leasingOption: string
  ): Promise<void> {
    if (isNil(body)) throw new BadRequestException('تمامی فیلد‌ها را پر کنید');
    if (isNil(leasingUser)) throw new BadRequestException('انتخاب سرمایه‌گذار الزامیست');

    const nonFileFields = leasingForms.filter((el) => el.type !== LeasingFormTypeEnum.FILE);
    const fileFields = leasingForms.filter((el) => el.type === LeasingFormTypeEnum.FILE);
    await this.validateNonFileFields(nonFileFields, body);
    await this.validateFileFields(fileFields, req);

    const option = await this.leasingOptionCoreService.getById(leasingOption);
    if (!option) throw new BadRequestException('نوع اعتبار انتخاب شده یافت نشد');

    const contractQuery = await this.leasingContractUtilityService.getLeasingContractsQueryBuilder(leasingUser, {
      status: 'active',
    });
    const leasingContract = await this.leasingContractCoreService.getByLeasingUser(contractQuery);

    console.log(leasingContract);

    if (option.amount > leasingContract[0]?.remain) {
      throw new BadRequestException('متأسفانه در حال حاضر سرمایه‌گذار امکان ارائه تسهیلات ندارد');
    }
    // if (!isNil(body.customAmount)) {
    //   throw new BadRequestException('در حال حاضر امکان تعریف اعتبار با قابلیت شخصی سازی وجود ندارد.');

    //   // if (body.customAmount < option.minCustomAmount)
    //   //   throw new BadRequestException('مبلغ شخصی سازی شده نباید کمتر از حداقل مبلغ اعتبار باشد');
    //   // if (body.customAmount < option.maxCustomAmount)
    //   //   throw new BadRequestException('مبلغ شخصی سازی شده نباید بیشتر از حداکثر مبلغ اعتبار باشد');
    // }
  }

  async normalizeUpdateLeasingApplyByApplicantDto(
    req: any,
    body: UpdateLeasingApplyForm,
    leasingForms: LeasingForm[]
  ): Promise<LeasingApplyFormField[]> {
    const leasingFileFormFields = leasingForms.filter((el) => el.type === LeasingFormTypeEnum.FILE);
    const uploadedFiles = await this.uploadDocsIfExists(req, leasingFileFormFields);

    const formFields = await this.normalizeFormFieldsForUpdate(body, leasingForms);

    return [...uploadedFiles, ...formFields];
  }

  async uploadDocsIfExists(req: any, leasingFileFormFields: LeasingForm[]): Promise<LeasingApplyFormField[]> {
    const filesToUpload = req.files;
    if (!filesToUpload) return [];
    if (Object.keys(filesToUpload).length < 1) return []; // there is nothing to upload

    if (!isValidLeasingApplyForm(filesToUpload)) throw new BadRequestException('فرم ارسالی معتبر نیست');
    let uploadedFiles: LeasingApplyFormField[] = [];

    for (const key in filesToUpload) {
      if (Object.prototype.hasOwnProperty.call(filesToUpload, key)) {
        const leasingFormElement = leasingFileFormFields.find((el) => el.key === key);
        const element = filesToUpload[key];
        uploadedFiles.push({
          value: element ? await this.doUpload(element) : null,
          key: leasingFormElement.key,
          title: leasingFormElement.title,
          type: leasingFormElement.type,
          required: leasingFormElement.required,
        });
      }
    }

    return this.removeNullValuesFromLeasingApplyFilesToUpload(uploadedFiles);
  }

  private async removeNullValuesFromLeasingApplyFilesToUpload(
    result: LeasingApplyFormField[]
  ): Promise<LeasingApplyFormField[]> {
    let normalizedResult: LeasingApplyFormField[] = [];

    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        const element = result[key];
        if (element.value !== null) normalizedResult.push(element);
      }
    }

    return normalizedResult;
  }

  async normalizeLeasingApplyFormLoanDto(
    body: LeasingApplyFormDto,
    req: any,
    userId: string,
    leasingForms: LeasingForm[],
    leasingUser: string,
    leasingOptionId: string
  ): Promise<CreateLeasingApplyDto> {
    const leasingOption = await this.leasingOptionCoreService.getAccessibleOptionById(leasingOptionId);
    if (!leasingOption) throw new BadRequestException('نوع اعتبار انتخاب شده معتبر نمی‌باشد');

    const uploadedFiles = await this.uploadDocs(req, leasingForms);
    const formFields = await this.normalizeFormFields(body, leasingForms);

    return {
      applicant: userId,
      leasingOption: leasingOption._id,
      leasingUser: leasingUser,
      form: [...formFields, ...uploadedFiles],
    };
    // FIX: disable custom amount for now
    // if (body.customAmount) {
    //   const leasingOption = await this.leasingOptionCoreService.getById(body.leasingOption);
    //   const createNewOptionDto: CreateLeasingOptionDto = {
    //     amount: leasingOption.amount,
    //     baseOption: body.leasingOption,
    //     description: leasingOption.description,
    //     interest: leasingOption.interest,
    //     isCustomizable: leasingOption.isCustomizable,
    //     maxCustomAmount: leasingOption.maxCustomAmount,
    //     minCustomAmount: leasingOption.minCustomAmount,
    //     months: leasingOption.months,
    //     title: leasingOption.title,
    //   };
    //   const newOption = await this.leasingOptionCoreService.create(leasingOption.leasingUser, createNewOptionDto);

    //   return {
    //     ...body,
    //     applicant: userId,
    //     birthCertificate,
    //     nationalCard,
    //     guarantorCheck,
    //     salaryReceipt,
    //     leasingOption: newOption._id,
    //   };
    // } else {
    // }
  }

  async normalizeFormFields(body: LeasingApplyFormDto, leasingForms: LeasingForm[]): Promise<LeasingApplyFormField[]> {
    const forms = leasingForms.filter((el) => el.type !== LeasingFormTypeEnum.FILE);
    console.log({ leasingForms });
    let formFields: LeasingApplyFormField[] = [];

    // iterate over leasingForms from database and normalize the data submitted by user
    for (let i = 0; i < forms.length; i++) {
      const formField = forms[i];
      const dtoValue = body[formField.key];
      formFields.push({
        value: dtoValue ? dtoValue : '',
        key: formField.key,
        title: formField.title,
        type: formField.type,
        required: formField.required,
      });
    }

    return formFields;
  }

  async normalizeFormFieldsForUpdate(
    body: LeasingApplyFormDto,
    leasingForms: LeasingForm[]
  ): Promise<LeasingApplyFormField[]> {
    const forms = leasingForms.filter((el) => el.type !== LeasingFormTypeEnum.FILE);
    console.log({ leasingForms });
    let formFields: LeasingApplyFormField[] = [];

    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const dtoValue = body[key];
        const formField = forms.find((el) => el.key === key);
        formFields.push({
          value: dtoValue ? dtoValue : '',
          key: formField.key,
          title: formField.title,
          type: formField.type,
          required: formField.required,
        });
      }
    }

    console.log({ willBeUpdated: formFields });

    // iterate over leasingForms from database and normalize the data submitted by user
    // for (let i = 0; i < forms.length; i++) {
    //   const formField = forms[i];
    //   const dtoValue = body[formField.key];
    //   formFields.push({
    //     value: dtoValue ? dtoValue : '',
    //     key: formField.key,
    //     title: formField.title,
    //     type: formField.type,
    //   });
    // }

    return formFields;
  }

  async getApplyListForLeasingQueryBuilder(userId: any, queryParams: GetApplyListForLeasingQueryParams): Promise<any> {
    const aggregate = [];
    const initialMatchQuery = { $match: { leasingUser: Types.ObjectId(userId) } };

    if (queryParams.status) {
      initialMatchQuery['$match']['status'] = queryParams.status;
    }

    aggregate.push(initialMatchQuery);

    if (queryParams.sortBy === 'createdAt' || queryParams.sortBy === 'updatedAt') {
      aggregate.push({
        $sort: {
          [queryParams.sortBy]: !queryParams.sortType ? -1 : queryParams.sortType === 'ASC' ? -1 : 1,
        },
      });
    }

    aggregate.push({
      $lookup: {
        from: 'users',
        localField: 'applicant',
        foreignField: '_id',
        as: 'applicant',
      },
    });

    aggregate.push({
      $unwind: {
        path: '$applicant',
        preserveNullAndEmptyArrays: true,
      },
    });

    aggregate.push({
      $lookup: {
        from: 'leasingoptions',
        localField: 'leasingOption',
        foreignField: '_id',
        as: 'leasingOption',
      },
    });
    aggregate.push({
      $unwind: {
        path: '$leasingOption',
        preserveNullAndEmptyArrays: true,
      },
    });

    if (queryParams.q) {
      const regex = new RegExp(`${queryParams.q}`);
      aggregate.push({
        $addFields: {
          'applicant.convertedMobile': { $toString: { $toLong: '$applicant.mobile' } },
        },
      });
      aggregate.push({
        $match: {
          $or: [
            { 'applicant.convertedMobile': { $regex: regex } },
            { 'applicant.nationalcode': { $regex: regex } },
            { 'applicant.fullname': { $regex: regex } },
          ],
        },
      });
    }

    aggregate.push({
      $project: {
        leasingOption: 1,
        'applicant.avatar': { $concat: [process.env.SITE_URL, '$applicant.avatar'] },
        'applicant.birthdate': 1,
        'applicant.fathername': 1,
        'applicant.fullname': 1,
        'applicant.islegal': 1,
        'applicant.legal': 1,
        'applicant.mobile': 1,
        'applicant.nationalcode': 1,
        'applicant.convertedMobile': 1,
        confirmDescription: 1,
        declineReasons: 1,
        deleted: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        paidByLeasing: 1,
        invoiceId: 1,
        _id: 1,
        'form.title': 1,
        'form.key': 1,
        'form.type': 1,
        'form.value': 1,
      },
    });
    return aggregate;
  }

  private async uploadDocs(req: any, forms: LeasingForm[]): Promise<LeasingApplyFormField[]> {
    const formFiles = forms.filter((el) => el.type === LeasingFormTypeEnum.FILE);
    let uploadedFiles: LeasingApplyFormField[] = [];
    const files = req.files;

    for (let i = 0; i < formFiles.length; i++) {
      const formField = formFiles[i];
      const dtoFile = files[formField.key];
      uploadedFiles.push({
        value: dtoFile ? await this.doUpload(dtoFile) : '',
        key: formField.key,
        title: formField.title,
        type: formField.type,
        required: formField.required,
      });
    }

    return uploadedFiles;
  }

  private async doUpload(logo: any): Promise<string> {
    const mime = await this.checkMime(logo.mimetype);
    const originalFile = logo;
    const uuid = uniqid();
    const normalizedFileName = uuid + '.' + mime;
    await originalFile.mv(UPLOAD_URI + normalizedFileName, (err) => {
      if (err) throw new InternalServerErrorException();
    });

    return normalizedFileName;
  }

  private async checkMime(mimetype: string): Promise<string> {
    switch (mimetype) {
      case 'image/png': {
        return 'png';
      }
      case 'image/jpg': {
        return 'jpg';
      }
      case 'image/jpeg': {
        return 'jpeg';
      }
      case 'application/pdf': {
        return 'pdf';
      }
      default:
        throw new BadRequestException('فایل باید به یکی از فرمت‌های png, jpg, jpeg و یا pdf باشد');
    }
  }

  private async validateNonFileFields(fields: LeasingForm[], body: LeasingApplyFormDto): Promise<void> {
    console.log({ formFields: fields });
    if (fields.length < 1) return;
    if (!isValidLeasingApplyForm(body)) throw new BadRequestException('نوع داده ارسالی نامعتبر است');

    for (let i = 0; i < fields.length; i++) {
      const fieldFromDb = fields[i];
      const { key, title, type, required } = fieldFromDb;

      const bodyFieldValue = body[key];

      if (required) {
        if (isNil(bodyFieldValue) || bodyFieldValue === '') {
          throw new BadRequestException(`فیلد ${title} الزامیست`);
        }
      }

      if (bodyFieldValue) {
        const validator = leasingFormFieldTypeValidators[type];
        if (!validator) continue;
        if (!validator(bodyFieldValue)) {
          throw new BadRequestException(`مقدار فیلد ${title} معتبر نیست!`);
        }
      }
    }
  }

  private async validateFileFields(fields: LeasingForm[], req: any): Promise<void> {
    if (fields.length < 1) return;
    else if (isNil(req.files)) throw new BadRequestException('آپلود مدارک الزامیست');
    for (let i = 0; i < fields.length; i++) {
      const element = fields[i];
      if (element.required && isNil(req.files[element.key]))
        throw new BadRequestException(`آپلود ${element.title} الزامیست`);
    }
  }

  async checkIfLeasingContractIsInvalid(id: string): Promise<LeasingContract> {
    return this.leasingContractCoreService.getInvalidContractByLeasingRef(id);
  }

  async getApplyById(applyId: string): Promise<LeasingApplyDocument> {
    const result = await this.leasingApplyCoreService.getById(applyId);
    if (result.length < 1) throw new BadRequestException('درخواست اعتبار یافت نشد');
    return result[0];
  }

  async setInvoiceId(applyId: string, invoiceid: any): Promise<LeasingApply> {
    return this.leasingApplyCoreService.setInvoiceId(applyId, invoiceid);
  }

  async getApplyByInvoiceId(invoiceId: any): Promise<LeasingApply> {
    return this.leasingApplyCoreService.getByInvoiceId(invoiceId);
  }

  async getClubPwaByReferer(referer: string): Promise<ClubPwa> {
    return this.clubPwaService.getClubPwaByReferer(referer);
  }

  async getUserCreditsForLeasing(userId: string): Promise<LeasingUserCreditDocument[]> {
    return this.leasingUserCreditCoreService.getAllByLeasingUser(userId);
  }

  async getInstallmentsForLeasing(userCreditId: string): Promise<LeasingInstallments[]> {
    const leasingUserCredit = await this.leasingUserCreditCoreService.getById(userCreditId);
    if (!leasingUserCredit) throw new UserCustomException('اعتبار یافت نشد');
    const option = leasingUserCredit.leasingOption as LeasingOption;
    const data = await this.leasingInstallmentsCoreService.getByLeasingUserCreditId(userCreditId);

    return normalizeInstallments(data, option);
  }
}
