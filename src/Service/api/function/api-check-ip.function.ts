export function ApiCheckIp(reqip, ips) {
  for (const info of ips) {
    if (info == reqip) {
      return true;
    }
  }
  return false;
}
