export const getIp = (req) => {
  const userAgent = req.headers['user-agent'] as string;
  console.log("ip custom", req.headers['x-forwarded-for'], req.ip, req.socket.remoteAddress);
  // const ip =
  //   !req.headers['x-forwarded-for'].startsWith('10.') && !req.headers['x-forwarded-for'].startsWith('192.168')
  //     ? req.headers['x-forwarded-for']
  //     : (req.ip as string);

  const ip = req.ip;

  return {
    ip,
    userAgent,
  };
};
