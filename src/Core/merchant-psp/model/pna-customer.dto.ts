import { MerchantPspCustomerDto } from '../dto/customer.dto';
import * as moment from 'jalali-moment';

export const MerchantPspPnaCustomerModel = async (getInfo: MerchantPspCustomerDto, needFiles = true) => {
  delete getInfo.type;
  delete getInfo.user;
  if (needFiles) {
    const editedDocumentList = [];
    await getInfo.CustomerDocumentList.forEach(
      (data: {
        fileType: {
          name: String;
          type: { type: Number };
        };
        savedId: { type: String };
      }) => {
        editedDocumentList.push({
          DocumentAttachment: data.savedId,
          DocumentType: data.fileType.name,
          DocumentTypeID: data.fileType.type,
        });
      }
    );
    return {
      ...getInfo,
      BirthDate: getInfo.BirthDate /*moment(parseInt(getInfo.BirthDate) * 1000).format('YYYY-MM-DD HH:mm:ss')*/,
      CustomerDocumentList: { CustomerDocumentEntity: editedDocumentList },
    };
  } else
    return {
      ...getInfo,
      BirthDate: getInfo.BirthDate /*moment(parseInt(getInfo.BirthDate) * 1000).format('YYYY-MM-DD HH:mm:ss')*/,
    };
};
