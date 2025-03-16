export function IpgTRaxReportIterator(data) {
  let tmpArray = Array();
  for (const info of data) {
    // if ( info.user ) {
    let message;
    if (info.details) {
      message = info.details.respmsg;
    } else {
      message = 'عملیات  تکمیل نشده است';
    }
    tmpArray.push({
      fullname: info?.user?.fullname || info?.user?.mobile,
      userid: info?.user?._id,
      amount: info?.amount,
      ref: info?.ref,
      userinvoice: info?.userinvoice || info?.invoiceid,
      terminalid: info?.terminalid,
      cardnumber: info?.details?.cardnumber || '',
      devicetype: info?.devicetype || 'web',
      invoice: info?.invoiceid || '',
      createdAt: info?.createdAt,
      message: message || 'عملیات  تکمیل نشده است',
    });
    // }
  }
  return tmpArray;
}
