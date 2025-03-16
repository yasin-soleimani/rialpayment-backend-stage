import { Inject, Injectable } from "@vision/common";
import { decryptCardQr, encryptCardQr } from "../function/qr-enc.func";

@Injectable()
export class CardQrCoreService {

  constructor(
    @Inject('CardModel') private readonly cardModel: any
  ) { }

  async makeQrEnc(cardno: number): Promise<any> {
    const enc = encryptCardQr(String(cardno));
    if (!enc) return false;

    const updated = await this.cardModel.findOneAndUpdate({ cardno: cardno }, { iv: enc.iv });
    if (!updated) return false;
    return enc.content;
  }

  async QrDec(cardno: number, hash: string): Promise<any> {

    const cardInfo = await this.cardModel.findOne({ cardno });
    if (!cardInfo) return false;

    const dec = decryptCardQr(hash, cardInfo.iv);
    if (!dec) return false;

    return dec;
  }
}