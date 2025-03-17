import { isEmpty } from "@vision/common/utils/shared.utils";
import { Messages } from "@vision/common/constants/messages.const";

export function successOpt() {
    return {
        status: 200,
        success: true,
        message: Messages.success.opt,
    };
}

export function successOptWithData(data) {
    let datax;
    if( isEmpty(data))
    {
        datax = [];
    } else {
        datax = data;
    }

    return {
        status: 200,
        success: true,
        message: Messages.success.opt,
        data: datax
    };
}

export function successOptWithDataNoValidation(data){
    return {
        status: 200,
        success: true,
        message: Messages.success.opt,
        data: data
    };
}

export function successOptWithPagination(data, price?, details?) {
    console.log("pagination data::: ", data);
    return {
        status: 200,
        success: true,
        message: Messages.success.opt,
        data: data.docs || '',
        total: data.total || 0,
        limit: data.limit || '',
        page: parseInt(data.page) || '',
        pages: data.pages || '',
        price: price,
        details: details
    }
}

export function loginSuccessOpt(data){
    let walletx, walletcurrency, creditx, creditcurrency, discountx, discountcurrency, idmx, idmcurrency = null;
    data.accounts.forEach( data => {
        switch (data.type) {
          case 'wallet': {
            walletx = data.balance;
            walletcurrency = data.currency;
            break;
          }
          case 'credit': {
            creditx = data.balance;
            creditcurrency = data.currency;
            break;
          }
          case 'discount': {
            discountx = data.balance;
            discountcurrency = data.currency;
            break;
          }
          case 'idm': {
            idmx = data.balance;
            idmcurrency = data.currency;
            break;
          }
        }
      });
    return {
        status: 200,
        success: true,
        message: Messages.success.opt,
        mobile: data.mobile,
        fullname : data.fullname,
        birthdate: data.birthdate,
        nationalcode: data.nationalcode,
        place: data.place,
        cardno : data.card.cardno,
        walletbalance: walletx,
        walletCurrency: walletcurrency
    }
}


export function showBalanceSuccessOpt(data) {
    return {
        status: 200,
        success: true,
        message: Messages.success.opt,
        walletbalance: data.balance,
        walletCurrency: data.currency,
    }
}

export function showUserDetails(data){
    return {
        status: 200,
        success: true,
        message: Messages.success.opt,
        fullname : data.fullname,
        account_no: data.account_no,
    }
}