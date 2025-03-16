import { CampaignFilterDto } from "../../../Backoffice/campaign/dto/filter.dto";

export const CampaignApiFilter = (getInfo: CampaignFilterDto, userId: string) => {

  let tmp = Array();

  tmp.push({ user: userId })
  if (getInfo.status == true || String(getInfo.status) == 'true' || getInfo.status == false || String(getInfo.status) == 'false') {
    tmp.push({
      status: getInfo.status
    });
  }

  if (getInfo.type.toString().length > 0 || getInfo.type > 0) {
    tmp.push({
      type: getInfo.type
    });
  }

  if (tmp.length > 0) {
    return {
      $and: tmp
    }
  } else {
    return { user: userId }
  }
}