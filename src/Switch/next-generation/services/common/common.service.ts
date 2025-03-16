import { Injectable } from '@vision/common';
import { GroupCoreService } from '../../../../Core/group/group.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { betweenTime } from '@vision/common/utils/month-diff.util';
import { DiscountTypeEnum } from '@vision/common/enums/discount-type.enum';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';
import { SwitchGetRemainService } from './getremain.service';
import { MerchantDiscountStrategyService } from '../../../../Core/merchant/services/merchant-strategy.service';

@Injectable()
export class SwitchCommonService {
  constructor(
    private readonly groupService: GroupCoreService,
    private readonly getRemainService: SwitchGetRemainService,
    private readonly strategyService: MerchantDiscountStrategyService
  ) {}

  async getRemain(getInfo: SwitchRequestDto, terminalInfo): Promise<any> {
    return this.getRemainService.getRemain(getInfo, terminalInfo);
  }

  async selectStrategy(userid, terminalInfo, amount): Promise<any> {
    if (!userid) {
      return this.zeroDisc();
    }
    let strategy: any;

    const data = await this.groupService.getUserGroup(userid, terminalInfo);

    if (!isEmpty(data)) {
      if (data[0].strategies && data[0].strategies.length > 0) {
        strategy = await this.selector(data[0].strategies, amount, terminalInfo);
      }
    }

    if (strategy && strategy._id != null) {
      return strategy;
    }

    if (strategy) {
      return strategy;
    }
    const terminalData = await this.strategyService.getStrategy(terminalInfo);
    if (terminalData && terminalData.length > 0) {
      strategy = await this.selector(terminalData, amount, terminalInfo._id);
    }

    if (!strategy) {
      console.log(strategy, 'st');
      return this.zeroDisc();
    }

    return strategy;

    // const data = await  this.groupService.getUserGroup( userid._id, terminalInfo._id );
    // let strategy;
    // if ( data ) {
    //   if ( data && data.strategy  && data.strategy.length) {
    //     strategy = await this.selector( data.strategy, amount,terminalInfo._id );
    //   }
    // }
    // if( strategy ) {
    //   strategy = await this.selector( terminalInfo.strategy, amount, terminalInfo._id );
    // }
    // if ( !strategy ) {
    //   strategy = this.zeroDisc();
    // }
    // return strategy;
  }

  private async selector(strategy, price, terminalid): Promise<any> {
    console.log(strategy, 'stra');
    let returnStrategy: any;
    if (!strategy) return this.zeroDisc();
    for (let i = 0; strategy.length > i; i++) {
      if (returnStrategy && returnStrategy.type > strategy[i].type) {
        break;
      }
      switch (strategy[i].type) {
        case DiscountTypeEnum.Base: {
          returnStrategy = this.disc(strategy[i]);
          break;
        }
        case DiscountTypeEnum.Hour: {
          if (betweenTime(strategy[i].from, strategy[i].to)) {
            returnStrategy = this.disc(strategy[i]);
          }
          break;
        }
        case DiscountTypeEnum.Price: {
          if (Number(strategy[i].from) <= Number(price) && Number(strategy[i].to) >= Number(price))
            returnStrategy = this.disc(strategy[i]);
          break;
        }
        default: {
          return this.zeroDisc();
        }
      }
    }
    return returnStrategy;
  }

  private async terminalValidator(strategyTerminals, terminalid): Promise<any> {
    return strategyTerminals.some(function (terminal) {
      return terminalid.toString() == terminal._id.toString();
    });
  }

  async getStrategy(userid, terminalInfo): Promise<any> {
    let strategyInfo = await this.groupService.getUserGroup(userid, terminalInfo);
    if (!isEmpty(strategyInfo.strategy)) return this.groupStrategy(strategyInfo.strategy);
    return terminalInfo;
  }

  private async groupStrategy(strategyInfo): Promise<any> {
    for (let i = 0; strategyInfo.length > i; i++) {}
    if (strategyInfo.length > 1) {
      const data = strategyInfo.find((a) => a.type > 100 && a.opt == 2);
    }
  }

  private zeroDisc() {
    return {
      _id: null,
      bankdisc: 0,
      nonebankdisc: 0,
    };
  }

  private disc(data) {
    return {
      _id: data._id,
      bankdisc: data.bankdisc,
      nonebankdisc: data.nonebankdisc,
    };
  }
}
