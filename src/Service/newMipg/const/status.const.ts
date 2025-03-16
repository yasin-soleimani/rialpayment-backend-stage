export const NewMipgStatusCodes = {
  Method_Post_allowed: {
    code: 100,
    message: 'نوع درخواست باید Post باشد',
  },
  Empty_or_invalid_apiKey: {
    code: 101,
    message: 'api_key ارسال نشده است یا صحیح نیست',
  },
  Invalid_Amount: {
    code: 102,
    message: 'مبلغ ارسال نشده یا کمتر از 1000 ریال است',
  },
  Empty_callback: {
    code: 103,
    message: 'آدرس بازگشت ارسال نشده است',
  },
  Error_Connect_to_bank: {
    code: 301,
    message: 'خطایی در برقرارس با سرور بانک رخ داده است',
  },
  Invalid_token: {
    code: 200,
    message: 'شناسه پرداخت صحیح نمی باشد',
  },
  Payment_aborted: {
    code: 201,
    message: 'پرداخت انجام نشده است',
  },
  Payment_cancel_or_aborted: {
    code: 202,
    message: 'پرداخت کنسل شده است یا خطایی در مراحل پرداخت رخ داده است',
  },
};
