import { MerchantPspRequestDto } from '../dto/request.dto';

export const MerchantPspPnaRequestModel = async (data: MerchantPspRequestDto): Promise<any> => {
  const editedDocumentList = await generateMerchantDocument(data);

  return {
    AccountNumber: data.accountNumber,
    ActivityLicenseNumberReferenceName: data.activityLicenseNumberReferenceName,
    BranchCode: data.branchCode,
    MainCustomerID: data.mainCustomerId,
    RentEndingDate: data.rentEndingDate,
    RentContractNo: data.rentContractNo,
    WorkTitle: data.workTitle,
    WorkTitleEn: data.workTitleEn,
    PhoneNumber: data.phoneNumber,
    PostalCode: data.postalCode,
    /* ProjectId: data.projectId,*/
    /* SwitchId: data.switchId,*/
    PortType: data.portType,
    PosType: data.posType,
    PosModel: data.posModel,
    ShaparakAddressText: data.shaparakAddressText,
    CityShaparakCode: data.cityShaparakCode,
    CityZone: data.cityZone,
    BankID: parseInt(data.bankId),
    GuildSupplementaryCode: data.guildSupplementaryCode,
    OwneringTypeID: data.owneringTypeID,
    AccountShabaCode: data.accountShabaCode,
    ActivityLicenseNumber: data.activityLicenseNumber,
    TaxPayerCode: data.taxPayerCode,
    HowToAssignID: data.howToAssignID,
    TrustKind: data.trustKind,
    TrustNumber: data.trustNumber,
    CashTrustRRN: data.cashTrustRRN,
    /*BuyingDeviceByCustomerStatus: data.buyingDeviceByCustomerStatus,*/
    WorkTypeID: data.workTypeId,
    MobileGPRS: data.mobileGPRS,
    Mobile: data.mobile,
    WorkTitleEng: data.workTitleEng,
    FaxNumber: data.faxNumber,
    IsMultiAccount: data.isMultiAccount,
    IsMultiAccountOwner: data.isMultiAccountOwner,
    MainSharingPercent: data.mainSharingPercent,
    BusinessLicenseEndDate: data.businessLicenseEndDate,
    RequestMerchantDocument: editedDocumentList,
  };
};

export const MerchantPspPnaUpdateRequestModel = async (getInfo: MerchantPspRequestDto) => {
  const dataDocument = await generateMerchantDocument(getInfo);
  return {
    AccountNumber: getInfo.accountNumber,
    FollowupCode: getInfo.followUpCode,
    RentEndingDate: getInfo.rentEndingDate,
    RentContractNo: getInfo.rentContractNo,
    WorkTitle: getInfo.workTitle,
    WorkTitleEng: getInfo.workTitleEng,
    PhoneNumber: getInfo.phoneNumber,
    PostalCode: getInfo.postalCode,
    ShaparakAddressText: getInfo.shaparakAddressText,
    CityShaparakCode: getInfo.cityShaparakCode,
    GuildSupplementaryCode: getInfo.guildSupplementaryCode,
    AccountShabaCode: getInfo.accountShabaCode,
    TaxPayerCode: getInfo.taxPayerCode,
    MainSharingPercent: getInfo.mainSharingPercent,
    RequestMerchantDocument: dataDocument,
  };
};

export const generateMerchantDocument = async (data) => {
  const editedDocumentList = [];
  await data.RequestMerchantDocument.forEach(
    (data: {
      fileType: {
        name: String;
        type: { type: Number };
      };
      savedId: { type: String };
    }) => {
      editedDocumentList.push({
        DocumentAttachment: data.savedId,
        DocumentTypeID: data.fileType.type,
      });
    }
  );
  return { Data: editedDocumentList };
};
