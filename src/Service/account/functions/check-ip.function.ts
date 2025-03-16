export function AuthorizeAccountCheckIp(input, ip) {
  let okay = false;
  for (const info of input) {
    if (info == ip) {
      okay = true;
    }
  }

  return okay;
}
