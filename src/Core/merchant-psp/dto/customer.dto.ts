export class MerchantPspCustomerDto {
  type: number;
  user: string;

  /*  bcid: string;
  birthDate: string;
  companyCode: string;
  companyFoundationDate: string;
  companyName: string;
  customerTypeId: number;
  firstName: string;
  lastName: string;
  email: string;
  foreignersPervasiveCode: string;
  ISForeignNationals: string;
  mobile: string;
  nationalCode: string;
  passportCode: string;
  nationalCardImage: string;
  firstNameEn: string;
  lastNameEn: string;
  companyNameEn: string;
  companyRegisterNo: string;
  genderId: string;
  passportCreditDate: string;
  country: string;

  {
    CustomerDocumentEntity: {
      DocumentAttachment: string;
      DocumentType: string;
      DocumentTypeID: string;
      IsRequired: string;
      IsMultiFile: string;
      CustomerDocumentID: string;
      CustomerID: string;
      CreateBy: string;
      ModifiedBy: string;
      RecordStatus: string;
      ModificationTS: string;
      CreateDate: string;
      ModifiedDate: string;
    };
  };
  */

  savedId: string;
  res: string;
  ISForeignNationals: boolean | string;
  CustomerTypeID: number;
  NationalCode: string;
  BCID: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Mobile: string;
  BirthDate: string;
  FatherName: string;
  FatherNameEn: string;
  GenderID: number;
  CompanyCode: string;
  CompanyName: string;
  CompanyFoundationDate: string;
  ForeignersPervasiveCode: string;
  PassportCode: string;
  PassportCreditDate: string;
  Country: string;
  CompanyNameEn: string;
  CompanyRegisterNo: string;
  FirstNameEN: string;
  LastNameEN: string;
  CustomerDocumentList: any[];
}
