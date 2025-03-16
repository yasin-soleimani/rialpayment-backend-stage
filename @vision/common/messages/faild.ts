import { Messages } from "@vision/common/constants/messages.const";

export function faildOpt(message = Messages.faild.opt) {
  return {
      status: 500,
      success: false,
      message: message,
  };
}

export function wrongActivationCode() {
  return {
    status: 401,
    success: false,
    message: Messages.changePw.wrong
  }
}

export function faildOptWithData( data, message = Messages.faild.opt ) {
  return {
    success: false,
    status: 500,
    message: message,
    data: data ,
  }
}