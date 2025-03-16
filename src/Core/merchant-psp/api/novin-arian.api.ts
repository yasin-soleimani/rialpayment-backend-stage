import axios, { AxiosInstance } from 'axios';
import { Agent } from 'https';
import { MerchantPspRequestDto } from '../dto/request.dto';
const soap = require('soap');
const Cookie = require('soap-cookie');
const a = 9126654323;
// constants
const ASMX_END_POINT = 'https://jamservice.pna.co.ir/services/RequestService.asmx';
const WSDL_URL = ASMX_END_POINT + '?wsdl';
const username = 'v.nita';
const password = '123456';
const jsonPassword = 'di5uaXRhOjEyMzQ1Ng==';

export const PnaAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: 'https://jamservice.pna.co.ir/services/api/RequestService/',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jsonPassword,
    },
    httpsAgent: new Agent({
      rejectUnauthorized: false,
    }),
  });
};

export const PnaAddNewCustomer = async (data): Promise<any> => {
  const soapClient = await createSoapClient();
  return AddNewCustomerCall(soapClient, username, password, data);
};
export const PnaUpdateCustomer = async (data): Promise<any> => {
  const soapClient = await createSoapClient();
  return UpdateCustomerCall(soapClient, username, password, data);
};

export const PnaAddNewRequest = async (data): Promise<any> => {
  return AddNewRequestCall(username, password, data);
};
export const PnaBindPosSerialToTerminal = async (data): Promise<any> => {
  return BindPosSerialToTerminal(username, password, data);
};
export const PnaAddUpdateRequest = async (data): Promise<any> => {
  return AddUpdateCall(username, password, data);
};
export const PnaUpdateRequestDocument = async (data): Promise<any> => {
  return updateDocumentPos(username, password, data);
};
export const PnaGetRequestByFollowupCode = async (data): Promise<any> => {
  return getRequestByFollowupCode(data);
};
export const PnaGetRequestListlByCustomerCode = async (data): Promise<any> => {
  return getRequestListlByCustomerCode(data);
};
export const PnaGetRequestListlByProductSerial = async (data): Promise<any> => {
  return getRequestListlByProductSerial(data);
};

export const PnaUploadDocument = async (data): Promise<any> => {
  const soapClient = await createSoapClient();
  const datan = await uploadDocumentCall(soapClient, username, password, data);
  console.log(datan);
  return datan;
};

export const PnaInquiryByCustomerCode = async (data): Promise<any> => {
  const soapClient = await createSoapClient();
  return getInfoByCodeCall(soapClient, username, password, data);
};

export const PnaInquiryByFollowUpCode = async (data): Promise<any> => {
  const soapClient = await createSoapClient();
  return getRequestDetailByFollowUpCode(soapClient, username, password, data);
};

export const PnaGetBanksList = async (index: number, size: number): Promise<any> => {
  const soapClient = await createSoapClient();
  return getBanksList(soapClient, username, password, index, size);
};

export const PnaGetBranchList = async (index: number, size: number, bankId: number): Promise<any> => {
  const soapClient = await createSoapClient();
  return getBranchList(soapClient, username, password, index, size, bankId);
};

export const PnaGetCityList = async (index: number, size: number): Promise<any> => {
  const soapClient = await createSoapClient();
  return getCityList(soapClient, username, password, index, size);
};

export const PnaGetCustomer = async (national: number): Promise<any> => {
  const soapClient = await createSoapClient();
  return getCustomer(soapClient, username, password, national);
};
export const PnaGetCountryList = async (index: number, size: number): Promise<any> => {
  const soapClient = await createSoapClient();
  return getCountryList(soapClient, username, password, index, size);
};

export const PnaGetGuildsList = async (index: number, size: number): Promise<any> => {
  const soapClient = await createSoapClient();
  return getGuildsList(soapClient, username, password, index, size);
};

export const PnaGetPosTypes = async (index: number, size: number): Promise<any> => {
  const soapClient = await createSoapClient();
  return getPosList(soapClient, username, password, index, size);
};
export const PnaGetPosModelList = async (index: number, size: number): Promise<any> => {
  const soapClient = await createSoapClient();
  return GetPosModelList(soapClient, username, password, index, size);
};

const createSoapClient = async () => {
  const clientOptions = { disableCache: true };
  const client = await soap.createClientAsync(WSDL_URL, clientOptions);
  client.setEndpoint(ASMX_END_POINT);

  return client;
};

const AddNewRequestCall = async (username: string, password: string, data: any) => {
  try {
    const dataAxios = await PnaAxiosInstance().request({
      url: 'AddNewRequest',
      method: 'POST',
      data: { Data: data },
    });
    return dataAxios.data;
  } catch (e) {
    return e.response.data;
  }
};

const BindPosSerialToTerminal = async (username: string, password: string, data: MerchantPspRequestDto) => {
  try {
    const dataAxios = await PnaAxiosInstance().request({
      url: 'BindSerialToSwitch',
      method: 'POST',
      data: {
        Parameters: { TerminalID: data.terminalId },
        Data: { ProductSerials: data.productSerials, PosModel: data.posModel },
      },
    });
    return dataAxios.data;
  } catch (e) {
    return e.response.data;
  }
};

const AddUpdateCall = async (username: string, password: string, data: any) => {
  try {
    const newData = { ...data };
    delete data.RequestMerchantDocument;
    const lastData = {
      Parameters: {
        FollowupCode: data.FollowupCode,
      },
      Data: newData,
    };
    console.log('lastData::::::::::', lastData);
    const dataAxios = await PnaAxiosInstance().request({
      url: 'UpdateRequestByFollowUpCode',
      method: 'POST',
      data: lastData,
    });
    return dataAxios.data;
  } catch (e) {
    return e;
  }
};

const updateDocumentPos = async (username: string, password: string, data: any) => {
  try {
    delete data.RequestMerchantDocument;
    const lastData = {
      Parameters: {
        RequestID: parseInt(data.requestId),
        DocumentTypeID: parseInt(data.documentTypeID),
      },
      Data: { DocumentAttachment: data.documentAttachment },
    };
    const dataAxios = await PnaAxiosInstance().request({
      url: 'UpdateDocument',
      method: 'POST',
      data: lastData,
    });
    return dataAxios.data;
  } catch (e) {
    return e.response.data;
  }
};

const getRequestByFollowupCode = async (data: any) => {
  try {
    console.log(data);
    const dataAxios = await PnaAxiosInstance().request({
      url: 'GetRequestDetailByFollowupCode',
      method: 'POST',
      data: { Parameters: data },
    });
    return dataAxios.data;
  } catch (e) {
    return e.response.data;
  }
};
const getRequestListlByCustomerCode = async (data: any) => {
  try {
    console.log(data);
    const dataAxios = await PnaAxiosInstance().request({
      url: 'GetRequestListlByCustomerCode',
      method: 'POST',
      data: { Parameters: data },
    });
    return dataAxios.data;
  } catch (e) {
    return e.response.data;
  }
};
const getRequestListlByProductSerial = async (data: any) => {
  try {
    console.log(data);
    const dataAxios = await PnaAxiosInstance().request({
      url: 'GetRequestListlByProductSerial',
      method: 'POST',
      data: { Parameters: data },
    });
    return dataAxios.data;
  } catch (e) {
    return e.response.data;
  }
};

const AddNewCustomerCall = (soapClient, username: string, password: string, data: any) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');
      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        const newData = {
          Data: data,
        };
        soapClient.AddNewCustomer(newData, (err, result) => {
          if (err) reason(err);
          resolve(result);
        });
      }
    });
  });
};
const UpdateCustomerCall = (soapClient, username: string, password: string, data: any) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');
      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        const newData = {
          Data: data,
        };
        soapClient.UpdateCustomer(newData, (err, result) => {
          if (err) reason(err);
          resolve(result);
        });
      }
    });
  });
};

const uploadDocumentCall = (soapClient, username: string, password: string, data: any) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        const newData = {
          FData: data,
        };
        soapClient.AddFile(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};

const getFileByIdCall = (soapClient, username: string, password: string, data: any) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        const newData = {
          FileID: data,
        };
        soapClient.GetFileByID(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};

const getInfoByCodeCall = (soapClient, username: string, password: string, data: any) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        const newData = {
          CustomerCode: data,
        };
        soapClient.GetCustomerByCode(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};

const getRequestDetailByFollowUpCode = (soapClient, username: string, password: string, data: any) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        const newData = {
          FollowpCode: data,
        };
        soapClient.GetRequestDetailByFollowupCode(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};

const getBanksList = (soapClient, username: string, password: string, index: number, size: number) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        let newData = {};
        if (size !== 0)
          newData = {
            PageIndex: index,
            PageSize: size,
          };
        soapClient.GetBanks(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};

const getBranchList = (soapClient, username: string, password: string, index: number, size: number, bankid = 0) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        let newData = {};
        if (size !== 0)
          newData = {
            PageIndex: index,
            PageSize: size,
          };
        if (bankid !== 0) newData['BankID'] = bankid;
        soapClient.GetBranchList(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};

const getCityList = (soapClient, username: string, password: string, index: number, size: number) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);
    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        let newData = {};
        if (size !== 0)
          newData = {
            PageIndex: index,
            PageSize: size,
          };
        soapClient.GetCityList(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};
const getCustomer = (soapClient, username: string, password: string, national) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);

    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        let newData = {
          CustomerCode: national,
        };
        soapClient.GetCustomerByCode(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};

const getCountryList = (soapClient, username: string, password: string, index: number, size: number) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);

    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        let newData = {};
        if (size !== 0)
          newData = {
            PageIndex: index,
            PageSize: size,
          };
        soapClient.GetCountryList(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};

const getGuildsList = (soapClient, username: string, password: string, index: number, size: number) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);

    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        let newData = {};
        if (size !== 0)
          newData = {
            PageIndex: index,
            PageSize: size,
          };
        soapClient.GetGuilds(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};
const getPosList = (soapClient, username: string, password: string, index: number, size: number) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);

    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        let newData = {};
        if (size !== 0)
          newData = {
            PageIndex: index,
            PageSize: size,
          };
        soapClient.GetPosTypeList(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};
const GetPosModelList = (soapClient, username: string, password: string, index: number, size: number) => {
  return new Promise((resolve, reason) => {
    const LoginData = {
      UserName: username,
      Password: password,
    };
    console.log('LoginData:::::::::::::::::::::', LoginData);

    soapClient.ValidateLogin(LoginData, (err, result) => {
      if (!err && !result) reason('Failed to connect Server novin arian server');

      if (err) reason(err);
      if (result && result.ValidateLoginResult === '1') {
        soapClient.setSecurity(new Cookie(soapClient.lastResponseHeaders));

        let newData = {};
        if (size !== 0)
          newData = {
            PageIndex: index,
            PageSize: size,
          };
        soapClient.GetPosModelList(newData, (err, result) => {
          if (err) reason(err);

          resolve(result);
        });
      }
    });
  });
};
