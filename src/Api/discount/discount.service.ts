import { Injectable, successOptWithPagination } from "@vision/common";
import { TurnoverBalanceCoreService } from "../../Core/turnover/services/balance.service";
import { MerchantCoreTerminalBalanceService } from "../../Core/merchant/services/merchant-terminal-balance.service";
import { MerchantCoreTerminalInfoService } from "../../Core/merchant/services/merchant-terminal-info.service";

@Injectable()
export class DiscountApiService {

  constructor(
    private readonly turnOverService: TurnoverBalanceCoreService,
    private readonly terminalBalances: MerchantCoreTerminalBalanceService,
    private readonly merchantTerminal: MerchantCoreTerminalInfoService,
  ) { }

  async getList(userid: string, page: number): Promise<any> {

    const data = await this.turnOverService.getListTerminals(userid, page);

    const terminals = await this.terminalBalances.getTerminalsByUserIdBalances(userid);

    let terminalsList = [];

    for (const terminal of terminals) {
      for (const item of terminal?.terminals) {
        const terminalInfo = await this.merchantTerminal.getTerminalInfo(item);
        terminalsList.push({
          title: terminalInfo?.title,
          terminalid: terminalInfo?.terminalid,
          _id: terminalInfo?._id
        })
      }
    }

    console.log("terminal list data yasin:::", data);
    console.log("terminal list info yasin:::", terminalsList);

    // let resultData = data?.docs.length > 0 ? data : data.docs = terminalsList;
    if(data?.docs.length < 1) {
      data.docs = terminalsList;
    }

    console.log("result data:::", data);

    return successOptWithPagination(data);
  }

  async getDetails(userId: string, terminalId: string, page: number): Promise<any> {

    const data = await this.turnOverService.getListUser({ user: userId, terminal: terminalId }, page);
    return successOptWithPagination(data);

  }
}