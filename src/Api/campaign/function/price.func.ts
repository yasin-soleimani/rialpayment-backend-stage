import { CampaignIncTypeConst } from "../../../Core/campaign/const/type.const";
import { CampaignDto } from "../../../Core/campaign/dto/campaign.dto";

export function CampaignCalcPrice(getInfo: CampaignDto) {

  if (getInfo.incType == CampaignIncTypeConst.Wallet) {
    return Number(getInfo.amount) * getInfo.maxUser;
  } else if (getInfo.incType == CampaignIncTypeConst.Bis) {
    const bankx = Math.round((0.5 * getInfo.amount) / 100);
    return bankx * getInfo.maxUser;
  }
}