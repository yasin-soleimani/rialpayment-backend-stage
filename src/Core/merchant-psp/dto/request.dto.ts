export class MerchantPspRequestDto {
  user: string;
  type: number;
  customer: string;
  accountNumber: string;
  activityLicenseNumberReferenceName: string;
  branchCode: string;
  mainCustomerId: number;
  rentEndingDate: any;
  rentContractNo: string;
  workTitle: string;
  workTitleEn: string;
  phoneNumber: string;
  postalCode: string;
  projectId: number;
  switchId: number;
  portType: string;
  posType: string;
  posModel: string;
  shaparakAddressText: string;
  cityShaparakCode: string;
  cityZone: string;
  bankId: string;
  guildSupplementaryCode: string;
  owneringTypeID: number;
  accountShabaCode: string;
  activityLicenseNumber: string;
  taxPayerCode: string;
  howToAssignID: string;
  trustKind: string;
  trustNumber: string;
  cashTrustRRN: string;
  buyingDeviceByCustomerStatus: string;
  workTypeId: string;
  mobileGPRS: string;
  faxNumber: string;
  workTitleEng: string;
  RequestMerchantDocument: any[];
  followUpCode: string;
  businessLicenseEndDate: string;
  mobile: string;
  terminalId: string;
  isMultiAccount: boolean;
  isMultiAccountOwner: boolean;
  mainSharingPercent: number;
  middleCity: string;
  workFlowCaption: string;
  savedId: string;
  requestId: number;
  documentTypeID: number;
  documentAttachment: string;
  merchant?: string;
  productSerials?: string;
  res: [any];
}
