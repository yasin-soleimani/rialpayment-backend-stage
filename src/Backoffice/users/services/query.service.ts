import { BackofficeUsersFilterDto } from '../dto/users-filter.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as mongoose from 'mongoose';
import { AccountSchema } from '../../../Core/useraccount/account/schemas/cardcounter.schema';
const accountModel = mongoose.model('Account', AccountSchema);

export function userFilterQueryBuilder(getInfo: BackofficeUsersFilterDto) {
  let tmpQuery = Array();
  if (!isEmpty(getInfo.fullname)) tmpQuery.push({ fullname: { $regex: getInfo.fullname } });

  if (!isEmpty(getInfo.block)) tmpQuery.push({ block: booleaner(getInfo.block) });

  if (!isEmpty(getInfo.mobile)) tmpQuery.push({ mob: { $regex: getInfo.mobile } });

  if (!isEmpty(getInfo.nationalcode)) tmpQuery.push({ nationalcode: { $regex: getInfo.nationalcode } });

  if (!isEmpty(getInfo.panelaccess)) tmpQuery.push({ access: booleaner(getInfo.panelaccess) });

  if (!isEmpty(getInfo.cashout)) tmpQuery.push({ checkout: booleaner(getInfo.cashout) });

  if (isEmpty(tmpQuery)) return {};
  return { $and: tmpQuery };
}

export function userAccounts(userAccounts) {
  let tmpAcc = Array();

  for (const aInfo of userAccounts) {
    tmpAcc.push({
      balance: aInfo.balance,
      currency: aInfo.currency,
      type: accountTypeSelector(aInfo.type),
    });
  }

  return tmpAcc;
}
export async function usersOutputArray(data) {
  let tmpArray = Array();
  for (const info of data) {
    const userAccountx: any = await accountModel.find({ user: info._id });

    let checkout = true;
    let tempRef = null;

    if (!info.checkout) checkout = info.checkout;

    let access = true;
    if (!info.access) access = info.access;
    if (info.ref)
      tempRef = {
        _id: info.ref._id,
        nationalcode: info.ref.nationalcode,
        mobile: info.ref.mobile,
        account_no: info.ref.account_no,
        fullname: info.ref.fullname,
      };

    tmpArray.push({
      _id: info._id,
      fullname: info.fullname || 'بی نام',
      mobile: info.mobile,
      nationalcode: info.nationalcode,
      block: info.block || false,
      cashout: checkout,
      panelaccess: access,
      ref: tempRef || null,
      acl: info.acl || null,
      accounts: userAccounts(userAccountx),
    });
  }

  console.log(tmpArray, 'sa');
  return tmpArray;
}

export function accountTypeSelector(type) {
  let typeName;
  switch (type) {
    case 'wallet': {
      typeName = 'کیف پول';
      break;
    }

    case 'idm': {
      typeName = 'ایرانیان دیحیتال مانی';
      break;
    }

    case 'credit': {
      typeName = 'کارت اعتباری';
      break;
    }

    case 'discount': {
      typeName = 'تخفیف';
      break;
    }

    case 'org': {
      typeName = 'سازمانی';
      break;
    }
  }

  return typeName;
}

function booleaner(value) {
  if (value == 'false') return false;
  return true;
}
