export const CardTransServiceConsts = {
  Not_Found: {
    code: 404,
    message: 'کارت مبدا یافت نشد',
  },
  Invalid_Pan: {
    code: 400,
    message: 'کارت مبدا معتبر نمی باشد',
  },
  Invalid_Pin: {
    code: 401,
    message: 'رمز کارت نامعتبر',
  },
  Invalid_Expire: {
    code: 402,
    message: 'تاریخ انتقضا نا معتبر',
  },
  Invalid_Cvv2: {
    code: 403,
    message: 'cvv2 نامعتبر',
  },
  Invalid_Destination: {
    code: 405,
    message: 'کارت مقصد یافت نشد',
  },
  Success: {
    code: 200,
    message: 'عملیات با موفقیت انجام شد',
  },
  Invalid_Ip: {
    code: 501,
    message: 'Ip نامعتبر',
  },
  Invalid_UserOrPass: {
    code: 502,
    message: 'نام کاربری یا کلمه عبور اشتباه است',
  },
  Not_Enough_Money: {
    code: 301,
    message: 'موجودی ناکافی',
  },
};
