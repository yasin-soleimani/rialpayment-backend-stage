export const TokenApiListFunc = (data: any, token: string) => {
  let tmp = [];
  for (const item of data) {
    let current = false;
    if (item.token == token) current = true;
    tmp.push({
      _id: item._id,
      ip: item.ip,
      userAgent: item.userAgent,
      status: item.status,
      current,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  return tmp;
};
