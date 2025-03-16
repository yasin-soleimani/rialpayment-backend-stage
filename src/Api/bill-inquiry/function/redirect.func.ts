export const BillInquiryRedirectv = (billInfo, status, baseUrl, devicetype, res, clubPwa, ipg?) => {
  if (!ipg || ipg == false) {
    return res.send({
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: {
        billid: billInfo.billid,
        paymentid: billInfo.paymentid,
        amount: billInfo.amount,
        type: billInfo.type,
        ref: billInfo.ref || 'x',
      },
    });
  }
  if (clubPwa) {
    const url =
      '?billId=' +
      billInfo.billid +
      '&status=' +
      status +
      '&amount=' +
      billInfo.amount +
      '&type=' +
      billInfo.type +
      '&ref=x';

    res.writeHead(301, { Location: clubPwa.billCallback + url });
    res.end();
  }
  if (devicetype == 'pwa') {
    const url =
      '?billId=' +
      billInfo.billid +
      '&status=' +
      status +
      '&amount=' +
      billInfo.amount +
      '&type=' +
      billInfo.type +
      '&ref=x';

    res.writeHead(301, { Location: process.env.BILL_INQUIRY_PWA + url });
    res.end();
  }

  if (devicetype == 'mobile') {
    const url =
      '?billid=' +
      billInfo.billid +
      '&status=' +
      status +
      '&amount=' +
      billInfo.amount +
      '&type=' +
      billInfo.type +
      '&ref=x';

    res.setHeader('Content-Type', 'text/html');
    res.writeHead(301, { Location: process.env.BILL_INQUIRY_ANDROID + url });
    res.end();
  }

  if (devicetype == 'mobile_google') {
    const url =
      '?billid=' +
      billInfo.billid +
      '&status=' +
      status +
      '&amount=' +
      billInfo.amount +
      '&type=' +
      billInfo.type +
      '&ref=x';

    res.setHeader('Content-Type', 'text/html');
    res.writeHead(301, { Location: process.env.BILL_INQUIRY_ANDROID_GOOGLE + url });
    res.end();
  }

  if (devicetype == 'web') {
    const url =
      '?billid=' +
      billInfo.billid +
      '&status=' +
      status +
      '&amount=' +
      billInfo.amount +
      '&type=' +
      billInfo.type +
      '&ref=x';

    res.writeHead(301, { Location: process.env.BILL_INQUIRY_WEB + url });
    res.end();
  } else {
    return res.send({
      status: 500,
      success: false,
      message: 'عملیات با خطا مواجه شده است',
    });
  }
};
