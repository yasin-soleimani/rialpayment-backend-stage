export function UserTransform(data, usergroup?) {
  return {
    status: 200,
    success: true,
    message: 'عملیات با موفقیت انجام شد',
    data : {
      userid: data._id,
      fullname: data.fullname || 'بی نام',
      birthdate: data.birthdate,
      mobile: data.mobile,
      nationalcode: data.nationalcode || '',
      place: data.place || '',
      card: data.card,
      usergroup:usergroup,
    }
  }
}