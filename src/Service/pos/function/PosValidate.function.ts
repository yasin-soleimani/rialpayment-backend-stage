import { PosServiceStatusCode } from '../const/status-code.const';
import { Messages } from '@vision/common/constants/messages.const';
import { imageTransform } from '@vision/common/transform/image.transform';

export function returnPosValidateServiceSuccess(data) {
  return {
    status: PosServiceStatusCode.success,
    success: true,
    message: Messages.success.opt,
    terminalid: data.terminal.terminalid,
    merchantcode: data.terminal.merchant.merchantcode,
    title: data.terminal.title,
    refid: data.terminal.merchant?.user?.refid ?? '',
    _id: data.terminal._id,
    avatar: imageTransform(data.terminal.merchant.logo),
  };
}
