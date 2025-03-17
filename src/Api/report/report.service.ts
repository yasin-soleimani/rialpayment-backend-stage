import {
  Injectable,
  successOptWithPagination,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
  NotFoundException,
  faildOpt,
} from '@vision/common';
import { ReportApiDto } from './dto/report.dto';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { ReportAllDto } from './dto/report-all.dto';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { CheckoutSubmitBankService } from '../../Core/checkout/submit/checkout-submit-core-bank.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { ReportUserBlockDto } from './dto/report-user-block.dto';
import { MerchantcoreService } from '../../Core/merchant/merchantcore.service';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PspverifyCoreService } from '../../Core/psp/pspverify/pspverifyCore.service';
import * as excel from 'exceljs';
import { ReportCashoutService } from './services/report-cashout.service';
import * as fs from 'fs';
import { todayDay } from '@vision/common/utils/month-diff.util';
import { ipgPaymentTypeSelector } from './services/payment-type-selector.service';
import { timeDateJalali } from './functions/date-time.function';
import { MipgType } from '../../Core/mipg/const/mipg-type.const';
import { getReportFromMrs, getExcelReportFromMrs } from './functions/get-report-mrs.function';
import { posQueryAggregateBuiler, posQueryBuiler } from './functions/pos.query';
import { TicketsCoreService } from '../../Core/tickets/tickets.service';
import { ReportTicketHistoryExcel } from './services/ticket-excel';
import { MerchantShareService } from '../../Core/merchant/services/merchant-share.service';
import { UserModel } from '../../Core/merchant/interfaces/merchantShare-model';
import { GroupCoreService } from '../../Core/group/group.service';
import * as mongoose from 'mongoose';
import { GroupReportCommonCoreService } from '../../Core/group-report/services/common.service';
import * as moment from 'jalali-moment';
import { MerchantSettlementsService } from '../../Core/merchant-settlement/services/merchant-settlments.service';
import { MerchantSettlementReportsService } from '../../Core/merchant-settlement/services/merchant-settlment-reports.service';
import { MerchantcoreDto } from '../../Core/merchant/dto/merchantcore.dto';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { MerchantSettlementCashoutService } from '../../Core/merchant-settlement/services/merchant-settlement-cashout.service';
import { UPLOAD_URI_USERS } from '../../__dir__';
import { GroupReportPspCoreService } from '../../Core/group-report/services/psp.service';
import { SendAsanakSms } from '@vision/common/notify/sms.util';
import { Console } from 'console';
import { CardService } from '../../Core/useraccount/card/card.service';
import { UserMerchantService } from '../merchant/merchant.service';

@Injectable()
export class ReportApiService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly submitService: CheckoutSubmitBankService,
    private readonly userService: UserService,
    private readonly merchantsService: MerchantcoreService,
    private readonly merchantTerminalService: MerchantCoreTerminalService,
    private readonly mipgService: MipgCoreService,
    private readonly reportCashoutService: ReportCashoutService,
    private readonly pspVerifyService: PspverifyCoreService,
    private readonly ticketsCoreService: TicketsCoreService,
    private readonly reportExcelTicket: ReportTicketHistoryExcel,
    private readonly merchantShareService: MerchantShareService,
    private readonly groupCoreService: GroupCoreService,
    private readonly groupCommonService: GroupReportCommonCoreService,
    private readonly merchantSettlementService: MerchantSettlementsService,
    private readonly merchantSettlementReportService: MerchantSettlementReportsService,
    private readonly chargeService: AccountService,
    private readonly merchantSettlementCashout: MerchantSettlementCashoutService,
    private readonly pspService: GroupReportPspCoreService,
    private readonly cardService: CardService,
    private readonly uMerchantService: UserMerchantService
  ) { }

  async calculateAutoCashout() {
    const merchants: MerchantcoreDto[] = await this.merchantsService.getMerchantsByActiveSettlement();
    if (merchants.length > 0) {
      for (const merchant of merchants) {
        console.log('merchant ::: ', merchant);
        const merchantDeposit = await this.chargeService.getBalance(merchant.user, 'merchant_deposit');
        if (!merchantDeposit || (!!merchantDeposit && merchantDeposit.balance == 0)) continue;
        const getLastCashout = await this.merchantSettlementCashout.getLastCashoutUser(merchant.user);
        const date = new Date().getTime();
        if (
          !!getLastCashout &&
          new Date(getLastCashout.createdAt).getTime() + merchant.autoSettlePeriod - 300000 > date
        )
          continue;
        const merchantWallet = await this.chargeService.getWallet(merchant.user);
        this.merchantSettlementCashout
          .create({
            merchant: merchant._id,
            amount: merchantDeposit.balance,
            balanceBefore: merchantWallet.balance,
            balanceAfter: merchantWallet.balance + merchantDeposit.balance,
            user: merchant.user,
          })
          .then(() => {
            this.chargeService.dechargeAccount(merchant.user, 'merchant_deposit', merchantDeposit.balance).then(() => {
              this.chargeService
                .accountSetLogg(
                  `کسر موجودی سپرده تراکنش های پذیرنده جهت تسویه`,
                  'MerchantDepositCashout',
                  merchantDeposit.balance,
                  true,
                  null,
                  merchant.user
                )
                .then();
              this.chargeService.chargeAccount(merchant.user, 'wallet', merchantDeposit.balance).then(() => {
                this.chargeService
                  .accountSetLogg(
                    `افزایش موجودی کیف پول جهت تسویه تراکنش های پذیرنده `,
                    'MerchantDepositCashout',
                    merchantDeposit.balance,
                    true,
                    null,
                    merchant.user
                  )
                  .then();
              });
            });
          });
      }
    }
    return successOpt();
  }

  async generateSettlementsOfLastDay(daysbefore: number = 1) {
    const lastDayStart = moment().locale('fa').subtract(daysbefore, 'day').startOf('day');
    const lastDayEnd = moment().locale('fa').subtract(daysbefore, 'day').endOf('day');
    console.log(new Date().toISOString(), lastDayStart, lastDayEnd);

    const lastDateJalali = lastDayStart.format('YYYY/MM/DD');
    SendAsanakSms(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      '09362428121',
      `${new Date().toISOString()} - ${lastDayStart.toISOString()} - ${lastDayEnd.toISOString()} - ${lastDateJalali}`
    );
    const checkIfLastDateDone = await this.merchantSettlementReportService.checkIfLastDateDone(lastDateJalali);
    console.log(moment().locale('fa').subtract('1', 'day').toISOString());
    if (!checkIfLastDateDone) {
      const reportData = await this.merchantSettlementReportService.create({
        date: lastDateJalali,
        merchants: [],
        endDate: new Date(lastDayEnd.toISOString()),
        startDate: new Date(lastDayStart.toISOString()),
        sum: 0,
        sumAfterWage: 0,
        wage: 0,
      });
      const merchants: MerchantcoreDto[] = await this.merchantsService.getMerchantsByActiveSettlement();
      let sumDayAmount = 0;
      let sumDayWageAmount = 0;
      let sumDayAmountAfterWage = 0;
      const merchantsArray = [];
      if (merchants.length > 0) {
        for (const merchant of merchants) {
          const merchantData = {
            merchant: merchant._id,
            sum: 0,
            sumAfterWage: 0,
            wage: 0,
          };
          const merchantTerminals = await this.merchantTerminalService.getTerminalsByMerchantId(merchant._id);
          const terminalsArray = [];
          for (const terminal of merchantTerminals) {
            const query = {
              $and: [
                {
                  terminal: terminal._id,
                },
                {
                  createdAt: {
                    $gte: new Date(lastDayStart.toISOString()),
                    $lte: new Date(lastDayEnd.toISOString()),
                  },
                },
              ],
            };
            console.log(JSON.stringify(query));
            const terminalAmount = await this.calculateAmount(query);
            const wageAmount =
              merchant.autoSettleWage && merchant.autoSettleWage > 0
                ? Math.floor((terminalAmount * merchant.autoSettleWage) / 100)
                : 0;
            merchantData.sum += terminalAmount;
            merchantData.sumAfterWage += terminalAmount - wageAmount;
            merchantData.wage += wageAmount;
            sumDayAmount += terminalAmount;
            sumDayWageAmount += wageAmount;
            sumDayAmountAfterWage += terminalAmount - wageAmount;
            terminalsArray.push({
              terminal: terminal._id,
              sum: terminalAmount,
              sumAfterWage: terminalAmount - wageAmount,
              wage: wageAmount,
            });
          }
          this.merchantSettlementService
            .create({
              report: reportData._id,
              forDate: lastDateJalali,
              fromDate: new Date(lastDayStart.toISOString()),
              toDate: new Date(lastDayEnd.toISOString()),
              terminals: terminalsArray,
              sum: merchantData.sum,
              sumAfterWage: merchantData.sumAfterWage,
              wage: merchantData.wage,
              user: merchant.user,
              merchant: merchant._id,
            })
            .then(() => {
              console.log('after add merchant settlement', merchantData);
              if (merchantData.sum > 0)
                this.chargeService
                  .chargeAccount(merchant.user, 'merchant_deposit', merchantData.sumAfterWage)
                  .then(() =>
                    this.chargeService
                      .accountSetLogg(
                        `تسویه به عنوان سپرده تراکنش های پذیرنده پس از کسر کارمزد`,
                        'MerchantDeposit',
                        merchantData.sumAfterWage,
                        true,
                        null,
                        merchant.user
                      )
                      .then()
                  );
            });
          merchantsArray.push(merchantData);
        }
        this.merchantSettlementReportService
          .update(reportData._id, {
            merchants: merchantsArray,
            sum: sumDayAmount,
            sumAfterWage: sumDayAmountAfterWage,
            wage: sumDayWageAmount,
          })
          .then();
      }
    }
    return successOpt();
  }

  private async calculateAmount(query): Promise<number> {
    const data = await this.pspVerifyService.getPspFilterAll(query);
    let counter = 0;
    for (let item in data) {
      let decode;
      if (data[item].req) {
        decode = JSON.parse(data[item].req);
      } else if (data[item].reqin) {
        decode = JSON.parse(data[item].reqin);
      } else {
        decode = {
          TrnAmt: 0,
          CardNum: 0,
        };
      }
      counter += decode.TrnAmt;
    }
    return counter;
  }

  async getFilter(getInfo: ReportApiDto, userid: string, page: number, id): Promise<any> {
    console.log(getInfo, 'getInfo psp');

    switch (true) {
      case !isEmpty(getInfo.ipg): {
        const query = await this.queryBuiler(getInfo, userid);

        return this.getIpgFilterPlay(query, page, getInfo);
      }

      case !isEmpty(getInfo.merchant): {
        if (getInfo.type === 1) {
          if (id) {
            const groups = await this.groupCoreService.getGroupAll(id);
            if (groups.length < 1) throw new NotFoundException();
            const array = [];
            for (const group of groups) array.push(mongoose.Types.ObjectId(group._id));
            const infos = await this.groupCommonService.getGroupsUsers(array);
            if (infos && infos.cardId.length > 0) {
              const queryx = posQueryAggregateBuiler(getInfo, infos.cardsNo);
              return this.getPspFilterAggregate(queryx, page, userid);
            }
            return successOptWithPagination([]);
          } else {
            console.log("without transaction request id:::");
            const queryx = posQueryBuiler(getInfo);
            console.log("transaction filter queryx yasin:::", queryx);
            return this.getPspFilter(queryx, page, userid);
          }
        } else {
          console.log('dadadadda');
          if (id) {
            // if share
            console.log('no excel in id:::::: ', id);
            const groups = await this.groupCoreService.getGroupAll(id);
            if (groups.length < 1) throw new NotFoundException();
            const array = [];
            for (const group of groups) array.push(mongoose.Types.ObjectId(group._id));
            const infos = await this.groupCommonService.getGroupsUsers(array);
            if (infos && infos.cardId.length > 0) {
              const data = await this.ticketsCoreService.getTicketsHistoriesByTerminalAndCount(
                getInfo.terminal,
                Number(getInfo.datefrom) * 1000,
                Number(getInfo.dateto) * 1000,
                page,
                infos.cardsNo
              );
              for (const index in data.data.docs) {
                //@ts-ignore
                data.data.docs[index] = { ...data.data.docs[index], user: data.data.docs[index].user?.fullname ?? '' };
              }
              return successOptWithPagination(data.data, '', data.totla);
            }
          } else {
            const data = await this.ticketsCoreService.getTicketsHistoriesByTerminalAndCount(
              getInfo.terminal,
              Number(getInfo.datefrom) * 1000,
              Number(getInfo.dateto) * 1000,
              page
            );
            for (const index in data.data.docs) {
              //@ts-ignore
              data.data.docs[index] = { ...data.data.docs[index], user: data.data.docs[index].user?.fullname ?? '' };
            }
            return successOptWithPagination(data.data, '', data.totla);
          }
        }
      }

      case !isEmpty(getInfo.cashout): {
        return this.reportCashoutService.GetReport(getInfo, userid, page);
      }
    }
  }

  async getReportExcel(getInfo: ReportApiDto, userid: string, id): Promise<any> {
    switch (true) {
      case !isEmpty(getInfo.ipg): {
        const query = await this.queryBuiler(getInfo, userid);
        return this.getIpgExcelPlay(query, userid, getInfo);
      }

      case !isEmpty(getInfo.merchant): {
        if (getInfo.type === 1) {
          if (id) {
            const groups = await this.groupCoreService.getGroupAll(id);
            if (groups.length < 1) throw new NotFoundException();
            const array = [];
            for (const group of groups) array.push(mongoose.Types.ObjectId(group._id));
            const infos = await this.groupCommonService.getGroupsUsers(array);
            if (infos && infos.cardId.length > 0) {
              const queryx = posQueryAggregateBuiler(getInfo, infos.cardsNo);
              return this.getPspFilterExcel(queryx, userid);
            }
            return successOptWithPagination([]);
          } else {
            const queryx = posQueryBuiler(getInfo);
            return this.getPspFilterExcel(queryx, userid, false);
          }
        } else {
          const user = await this.userService.findById(userid);
          const terminalInfo = await this.merchantTerminalService.findByTerminal(getInfo.terminal);
          if (id) {
            console.log('excel in id:::::: ', id);
            const groups = await this.groupCoreService.getGroupAll(id);
            if (groups.length < 1) throw new NotFoundException();
            const array = [];
            for (const group of groups) array.push(mongoose.Types.ObjectId(group._id));
            const infos = await this.groupCommonService.getGroupsUsers(array);
            if (infos && infos.cardId.length > 0) {
              const data = await this.ticketsCoreService.getTicketHistoryTerminalExcel(
                getInfo.terminal,
                Number(getInfo.datefrom) * 1000,
                Number(getInfo.dateto) * 1000,
                infos.cardsNo
              );
              return this.reportExcelTicket.makeExcel(data, userid, user, terminalInfo?.title);
            }
          } else {
            const data = await this.ticketsCoreService.getTicketHistoryTerminalExcel(
              getInfo.terminal,
              Number(getInfo.datefrom) * 1000,
              Number(getInfo.dateto) * 1000
            );
            return this.reportExcelTicket.makeExcel(data, userid, user, terminalInfo?.title);
          }
        }
      }

      case !isEmpty(getInfo.cashout): {
        return this.reportCashoutService.getExcelReport(getInfo, userid);
      }
    }
  }

  async getNewReportExcel(getInfo: ReportApiDto, userid: string, id): Promise<any> {
    switch (true) {
      case !isEmpty(getInfo.ipg): {
        const query = await this.queryBuiler(getInfo, userid);
        return this.getIpgExcelPlay(query, userid, getInfo);
      }

      case !isEmpty(getInfo.merchant): {
        if (getInfo.type === 1) {
          const merchantData = await this.merchantsService.findMerchantByID(getInfo.merchant);
          const terminalData = await this.merchantTerminalService.findByTerminal(getInfo.terminal);
          if (id) {
            const groups = await this.groupCoreService.getGroupAll(id);
            if (groups.length < 1) throw new NotFoundException();

            const array = [];
            for (const group of groups) array.push(mongoose.Types.ObjectId(group._id));
            const infos = await this.groupCommonService.getGroupsUsers(array);
            if (infos && infos.cardId.length > 0) {
              return this.getNewPspFilterExcel(
                infos.cardsNo,
                [terminalData.terminalid],
                [merchantData.merchantcode],
                new Date(getInfo.datefrom * 1000),
                new Date(getInfo.dateto ? getInfo.dateto * 1000 : new Date().getTime()),
                userid
              );
            }
            return successOptWithPagination([]);
          } else {
            return this.getNewPspFilterExcel(
              null,
              [terminalData.terminalid],
              [merchantData.merchantcode],
              new Date(getInfo.datefrom * 1000),
              new Date(getInfo.dateto ? getInfo.dateto * 1000 : new Date().getTime()),
              userid
            );
          }
        } else {
          const user = await this.userService.findById(userid);
          const terminalInfo = await this.merchantTerminalService.findByTerminal(getInfo.terminal);

          if (id) {
            console.log('excel in id:::::: ', id);
            const groups = await this.groupCoreService.getGroupAll(id);
            if (groups.length < 1) throw new NotFoundException();
            const array = [];
            for (const group of groups) array.push(mongoose.Types.ObjectId(group._id));
            const infos = await this.groupCommonService.getGroupsUsers(array);
            if (infos && infos.cardId.length > 0) {
              const data = await this.ticketsCoreService.getTicketHistoryTerminalExcel(
                getInfo.terminal,
                Number(getInfo.datefrom) * 1000,
                Number(getInfo.dateto) * 1000,
                infos.cardsNo
              );
              return this.reportExcelTicket.makeExcel(data, userid, user, terminalInfo?.title);
            }
          } else {
            const data = await this.ticketsCoreService.getTicketHistoryTerminalExcel(
              getInfo.terminal,
              Number(getInfo.datefrom) * 1000,
              Number(getInfo.dateto) * 1000
            );
            return this.reportExcelTicket.makeExcel(data, userid, user, terminalInfo?.title);
          }
        }
      }

      case !isEmpty(getInfo.cashout): {
        return this.reportCashoutService.getExcelReport(getInfo, userid);
      }
    }
  }

  private async queryBuiler(getInfo: ReportApiDto, userid) {
    let query;
    let tmpQuery = Array();
    let amount;
    let date;
    if (getInfo.amountfrom > 0 && getInfo.amountto > 0) {
      if (getInfo.amountto < getInfo.amountfrom) throw new UserCustomException('لطفا مقدار وارد شده مبلغ را چک کنید');

      if (!isEmpty(getInfo.ipg)) {
        amount = {
          $or: [
            {
              total: {
                $gte: getInfo.amountfrom,
                $lte: getInfo.amountto,
              },
            },
            {
              amount: {
                $gte: getInfo.amountfrom,
                $lte: getInfo.amountto,
              },
            },
          ],
        };
      } else {
        amount = {
          $or: [
            {
              amount: {
                $gte: getInfo.amountfrom,
                $lte: getInfo.amountto,
              },
            },
          ],
        };
      }
    }

    if (!isEmpty(getInfo.datefrom) || !isEmpty(getInfo.dateto)) {
      if (getInfo.dateto < getInfo.datefrom) throw new UserCustomException('رنج تاریخ نامعتبر');
      const dateto = new Date(getInfo.dateto * 1000);
      console.log(dateto, 'dateto');
      const datefrom = new Date(getInfo.datefrom * 1000);
      console.log(datefrom, 'datefrom');
      date = {
        createdAt: {
          $gte: datefrom,
          $lte: dateto,
        },
      };
    }

    if (amount) tmpQuery.push(amount);
    if (date) tmpQuery.push(date);
    if (getInfo.ipg) {
      if (getInfo.ipg == '0') {
        const mipgs = await this.mipgService.getMipgsByUseridTerminals(userid);
        if (isEmpty(mipgs)) throw new UserCustomException('ترمینالی برای شما تعریف نشده است');
        let tmpArray = Array();
        for (let item in mipgs) {
          tmpArray.push({
            terminalid: mipgs[item].terminalid,
          });
        }
        tmpQuery.push({
          $or: tmpArray,
        });
      } else {
        const ipgInfo = await this.mipgService.getMipgTerminalid(getInfo.ipg);
        if (!ipgInfo) throw new NotFoundException();
        tmpQuery.push({ terminalid: ipgInfo.terminalid });
      }
    } else {
      if (getInfo.merchant == '0' && getInfo.terminal == '0') {
        const x1 = await this.getAllMerchantsTerminalsReport(userid);
        console.log(x1, 'x1');
        tmpQuery.push({
          $or: x1,
        });
      } else if (getInfo.terminal == '0') {
        const x2 = await this.getMerchantTerminalsReport(getInfo.merchant, userid);
        tmpQuery.push({
          $or: x2,
        });
      } else if (
        !isEmpty(getInfo.merchant) &&
        !isEmpty(getInfo.terminal) &&
        getInfo.merchant != '0' &&
        getInfo.terminal != '0'
      ) {
        const x3 = await this.getMerchantTerminalReport(getInfo.merchant, getInfo.terminal);
        tmpQuery.push({
          $or: x3,
        });
      }
    }
    if (getInfo.ipg && getInfo.search) {
      console.log(getInfo.search, 'getInfo.search');
      if (getInfo.search.length == 16) {
        const cardno = this.maskCard(getInfo.search);
        tmpQuery.push({
          'details.cardnumber': { $regex: cardno },
        });
      } else {
        tmpQuery.push({
          userinvoice: { $regex: getInfo.search },
        });
      }
    }

    if (isEmpty(tmpQuery)) return {};
    return {
      $and: tmpQuery,
    };
  }

  async reportAll(getInfo: ReportAllDto, page): Promise<any> {
    switch (getInfo.type.toString()) {
      case '1': {
        return this.ipgReport(getInfo.datefrom, getInfo.dateto, page);
      }

      case '2': {
        return this.checkoutReport(getInfo.datefrom, getInfo.dateto, page);
      }

      default: {
        throw new FillFieldsException();
      }
    }
  }

  private async ipgReport(from, to, page): Promise<any> {
    const dateto = new Date(to * 1000);
    const datefrom = new Date(from * 1000);
    let tmpArray = Array();
    const data = await this.ipgService.getAllReport(datefrom, dateto, page);

    for (let i = 0; data.docs.length > i; i++) {
      if (data.docs[i].user) {
        let message;
        if (data.docs[i].details) {
          message = data.docs[i].details.respmsg;
        } else {
          message = 'عملیات  تکمیل نشده است';
        }
        tmpArray.push({
          fullname: data.docs[i].user.fullname || '',
          block: data.docs[i].user.block || false,
          checkout: data.docs[i].user.checkout || false,
          userid: data.docs[i].user._id,
          amount: data.docs[i].amount,
          ref: data.docs[i].ref,
          devicetype: data.docs[i].devicetype || 'web',
          invoice: data.docs[i].invoiceid || '',
          createdAt: data.docs[i].createdAt,
          message: message || 'عملیات  تکمیل نشده است',
        });
      }
    }

    data.docs = tmpArray;
    return successOptWithPagination(data);
  }

  private async checkoutReport(from, to, page): Promise<any> {
    const dateto = new Date(to * 1000);
    const datefrom = new Date(from * 1000);
    let tmpArray = Array();

    const data = await this.submitService.getAllReport(datefrom, dateto, page);
    for (let i = 0; data.docs.length > i; i++) {
      let status = false;
      let message;
      if (data.docs[i].data) {
        status = this.checkBankStatus(data.docs[i].data);
        if (status == true) {
          message = 'عملیات با موفقیت انجام شده است';
        } else {
          message = 'متاسفانه با خطا مواجه شده است';
        }
      }

      let account,
        bankname = '';
      if (data.docs[i].checkout) {
        bankname = data.docs[i].checkout.bankname;
        account = data.docs[i].checkout.account;
      } else if (data.docs[i].account) {
        account = data.docs[i].account;
        bankname = data.docs[i].bankname;
      }

      tmpArray.push({
        amount: data.docs[i].amount,
        fullname: data.docs[i].user.fullname || '',
        block: data.docs[i].user.block || false,
        checkout: data.docs[i].user.checkout || false,
        userid: data.docs[i].user._id,
        account: account,
        bankname: bankname || '',
        status: status,
        message: message,
        ref: '',
        invoice: '',
        createdAt: data.docs[i].createdAt,
      });
    }

    data.docs = tmpArray;
    return successOptWithPagination(data);
  }

  private checkBankStatus(data) {
    const res = JSON.parse(data);
    if (res.status == 200) {
      return true;
    } else {
      return false;
    }
  }

  async changeStatus(getInfo: ReportUserBlockDto): Promise<any> {
    if (getInfo.block == 'true') {
      const data = await this.userService.blockUser(getInfo.userid, true).then((res) => {
        return res;
      });
      if (!data) throw new InternalServerErrorException();
    }

    if (getInfo.block == 'false') {
      const data = await this.userService.blockUser(getInfo.userid, false).then((res) => {
        console.log(res, 'res2');
        return res;
      });
      if (!data) throw new InternalServerErrorException();
    }

    if (getInfo.checkout == 'true') {
      const datax = await this.userService.changeCheckout(getInfo.userid, true).then((res) => {
        console.log(res, 'res3');
        return res;
      });
      if (!datax) throw new InternalServerErrorException();
    }

    if (getInfo.checkout == 'false') {
      const datax = await this.userService.changeCheckout(getInfo.userid, false).then((res) => {
        console.log(res, 'res4');
        return res;
      });
      if (!datax) throw new InternalServerErrorException();
    }

    return successOpt();
  }

  async getMerchantShares(merchantId, userid) {
    const merchantInfo = await this.merchantsService.getMerchantInfoById(merchantId, userid);
    const shares = await this.merchantShareService.findShares(merchantInfo.ref, null, merchantId);
    const finalArray = [];
    if (shares.length > 0) {
      finalArray.push({
        _id: (shares[0].shareFromUser as UserModel)._id,
        name:
          //@ts-ignore
          !!shares[0].clubInfoFrom && shares[0].clubInfoFrom.title //@ts-ignore
            ? shares[0].clubInfoFrom.title
            : (shares[0].shareFromUser as UserModel).fullname,
      });

      for (const item of shares) {
        finalArray.push({
          _id: (item.shareToUser as UserModel)._id,
          name:
            //@ts-ignore
            !!item.clubInfoTo && item.clubInfoTo.title //@ts-ignore
              ? item.clubInfoTo.title
              : (item.shareToUser as UserModel).fullname,
        });
      }
    }
    return finalArray;
  }

  async getMerchantsList(userid: string): Promise<any> {
    const data = await this.merchantsService.getAllMerchantsReport(userid);
    let tmpArray = Array();
    for (let item in data) {
      tmpArray.push({
        _id: data[item]._id,
        title: data[item].title,
      });
    }

    return successOptWithDataNoValidation(tmpArray);
  }

  async getTerminalsList(id: string): Promise<any> {
    const data = await this.merchantTerminalService.getAllTerminalsReport(id);

    let tmpArray = Array();

    for (let item in data) {
      tmpArray.push({
        _id: data[item]._id,
        title: data[item].title,
      });
    }

    return successOptWithDataNoValidation(tmpArray);
  }

  async mipglist(userid: string): Promise<any> {
    const data = await this.mipgService.getAllMipgListReport(userid);
    let tmp = Array();
    for (const info of data) {
      let title;
      if (info.type == MipgType.Direct) {
        title = info.title + ' - ' + info.mrs.terminalid;
      } else {
        title = info.title;
      }

      tmp.push({
        _id: info._id,
        title: title,
      });
    }
    return successOptWithDataNoValidation(tmp);
  }

  async getIpgFilterPlay(query, page, getInfo: ReportApiDto): Promise<any> {
    const mipgInfo = await this.mipgService.getInfoById(getInfo.ipg);
    if (!mipgInfo) throw new UserCustomException('ترمینال یافت نشد');

    if (mipgInfo.type == MipgType.Direct) {
      getInfo.terminal = mipgInfo.mrs.terminalid;
      getInfo.merchant = mipgInfo.mrs.acceptorid;
      getInfo.ipg = mipgInfo.mrs.psp;
      const { data } = await getReportFromMrs(getInfo, page);
      console.log(data);
      return data;
    } else {
      return this.getIpgFilter(query, page);
    }
  }

  async getIpgFilter(query, page): Promise<any> {
    const datax = await this.ipgService.ipgFilterReport(query, page);
    let tmpArray = Array();
    const data = datax.docs;
    for (let item in data) {
      const psp = this.typePspSelector(data[item].type);
      const msgStatus: any = ipgPaymentTypeSelector(data[item]);
      if (data[item].details && data[item].details.respcode == 0) {
        tmpArray.push({
          _id: data[item]._id,
          createdAt: data[item].createdAt,
          amount: data[item].total || data[item].amount,
          customer: '',
          msg: msgStatus.msg,
          direct: msgStatus.direct,
          cardno: data[item].details.cardnumber,
          ref: data[item].userinvoice,
          psp: psp,
          confirm: data[item].trx,
          status: true,
        });
      } else if (data[item].details && data[item].details.respcode != 0) {
        tmpArray.push({
          _id: data[item]._id,
          createdAt: data[item].createdAt,
          amount: data[item].total || data[item].amount,
          customer: '',
          msg: msgStatus.msg || 'عملیات با خطا مواجه شده است',
          direct: msgStatus.direct,
          cardno: data[item].details.cardno || '',
          ref: data[item].userinvoice,
          psp: psp,
          confirm: true,
          status: false,
        });
      }
    }
    datax.docs = tmpArray;
    return successOptWithPagination(datax);
  }

  // start edit by cursor
  async getPspFilter(query, page, userid): Promise<any> {
    try {
      let datax: any = { docs: [] };

      if (query.$and[0].terminal === "") {
        const userRole = await this.userService.findById(userid);
        const terminalList = await this.uMerchantService.getListTerminals(userid, page, query.$and[0].merchant, userRole.type);
        console.log("terminal list:::", terminalList);
        if (terminalList?.data?.length > 0) {
          // Use Promise.all to handle multiple async operations in parallel
          const terminalDataPromises = terminalList.data.map(async (terminal) => {
            console.log("terminal:::", terminal);
            const terminalQuery = {
              '$and': [{ 
                merchant: query.$and[0].merchant, 
                terminal: terminal._id 
              }]
            };
            return this.pspVerifyService.getPspFilter(terminalQuery, page);
          });

          const terminalResults = await Promise.all(terminalDataPromises);

          console.log("terminal data:::", terminalResults);
          // Combine all terminal data
          datax.docs = terminalResults.reduce((acc, curr) => {
            if (curr && curr.docs) {
              return [...acc, ...curr.docs];
            }

            console.log("acc:::", acc);
            return acc;
          }, []);
        }
      } else {
        datax = await this.pspVerifyService.getPspFilter(query, page);
      }

      // Process the transaction data
      const processedData = await Promise.all(datax.docs.map(async (item) => {
        let msg;
        let status;
        
        if (item.confirm === false && item.reverse === false) {
          msg = 'در انتظار تاییدیه از شرکت پرداخت';
          status = false;
        } else if (item.confirm === true && item.reverse === false) {
          msg = 'تراکنش تایید شد';
          status = true;
        } else if (item.confirm === false && item.reverse === true) {
          msg = 'تراکنش برگشت داده شده';
          status = false;
        }

        const fullname = item.user ? item.user.fullname : '';
        
        let decode;
        try {
          if (item.req) {
            decode = JSON.parse(item.req);
          } else if (item.reqin) {
            decode = JSON.parse(item.reqin);
          } else {
            decode = {
              TrnAmt: 0,
              CardNum: 0,
            };
          }
        } catch (error) {
          console.error('Error parsing transaction data:', error);
          decode = {
            TrnAmt: 0,
            CardNum: 0,
          };
        }

        return {
          _id: item._id,
          createdAt: item.createdAt,
          amount: decode.TrnAmt,
          customer: fullname,
          msg: msg || 'عملیات با خطا مواجه شده است',
          cardno: decode.CardNum,
          ref: item.TraxID,
          psp: '',
          confirm: item.confirm,
          status: status,
        };
      }));

      datax.docs = processedData;
      return successOptWithPagination(datax);
    } catch (error) {
      console.error('Error in getPspFilter:', error);
      throw error;
    }
  }

  // end edit by cursor

  async getPspFilterAggregate(query, page, userid): Promise<any> {
    // return this.getAllMerchantsTerminalsReport( userid )
    const datax = await this.pspVerifyService.getPspFilterAggregate(query, page);
    console.log('dataaaaaaaaaa::::::::::: ', datax);
    let tmpArray = Array();
    const data = datax.docs;
    for (const item of data) {
      let msg;
      let status;
      if (item.confirm == false && item.reverse == false) {
        msg = 'در انتظار تاییدیه از شرکت پرداخت';
        status = false;
      } else if (item.confirm == true && item.reverse == false) {
        msg = 'تراکنش تایید شد';
        status = true;
      } else if (item.confirm == false && item.reverse == true) {
        msg = 'تراکنش برگشت داده شده';
        status = false;
      }

      let fullanme = '';
      if (item.user) {
        fullanme = item.user.fullname;
      }

      let decode;
      if (item.req) {
        decode = JSON.parse(item.req);
      } else if (item.reqin) {
        decode = JSON.parse(item.reqin);
      } else {
        decode = {
          TrnAmt: 0,
          CardNum: 0,
        };
      }
      tmpArray.push({
        _id: item._id,
        createdAt: item.createdAt,
        amount: decode.TrnAmt,
        customer: fullanme,
        msg: msg || 'عملیات با خطا مواجه شده است',
        cardno: decode.CardNum,
        ref: item.TraxID,
        psp: '',
        confirm: item.confirm,
        status: status,
      });
    }
    datax.docs = tmpArray;
    return successOptWithPagination(datax);
  }

  private typePspSelector(type) {
    switch (type) {
      case 1: {
        return 'پرداخت الکترونیک پارسیان';
      }

      case 2: {
        return 'آسان پرداخت پرشین';
      }

      case 3: {
        return 'تجارت الکترونیک سامان کیش';
      }
      case 4: {
        return 'پرداخت نوین آرین';
      }

      default: {
        return 'مبنا کارت آریا';
      }
    }
  }

  async confirmIpg(ref: string, userid: string): Promise<any> {
    const info = await this.ipgService.findByUserInvoiceAndUser(ref, userid);
    if (!info) throw new NotFoundException();
    const data = await this.ipgService.verify(info.terminalid, ref);
    if (data.status != 0) return faildOpt();
    return successOpt();
  }

  private async getAllMerchantsTerminalsReport(userid: string): Promise<any> {
    let tmpArray = Array();

    const merchants = await this.merchantsService.getAllMerchantsReport(userid);

    for (let item in merchants) {
      const terminals = await this.merchantTerminalService.getTerminalsByMerchantId(merchants[item]._id);
      for (let i in terminals) {
        tmpArray.push({
          TermID: terminals[i].terminalid,
          Merchant: merchants[item].merchantcode,
        });
      }
    }
    console.log(tmpArray);
    return tmpArray;
  }

  private async getMerchantTerminalsReport(merchantid: string, userid: string): Promise<any> {
    let tmpArray = Array();
    const merchants = await this.merchantsService.getMerchantInfoById(merchantid, userid);
    if (!merchants) throw new UserCustomException('پذیرنده نامعتبر');
    const terminals = await this.merchantTerminalService.getTerminalsByMerchantId(merchantid);
    if (isEmpty(terminals)) throw new UserCustomException(' ترمینالی یافت نشد');
    for (let i in terminals) {
      tmpArray.push({
        TermID: terminals[i].terminalid,
        Merchant: merchants.merchantcode,
      });
    }

    return tmpArray;
  }

  private async getMerchantTerminalReport(merchantid: string, terminal: string): Promise<any> {
    const merchantInfo = await this.merchantsService.findMerchantByID(merchantid);
    if (!merchantInfo) throw new UserCustomException('پذیرنده نامعتبر');
    const terminalInfo = await this.merchantTerminalService.getInfoByID(terminal);
    if (!terminalInfo) throw new UserCustomException('ترمینال نامعتبر ');
    return [
      {
        TermID: terminalInfo.terminalid,
        Merchant: merchantInfo.merchantcode,
      },
    ];
  }

  private maskCard(cardNumber) {
    return cardNumber.toString().replace(/(?<=.{6}).(?=.{4})/g, '*');
  }

  async getPspFilterExcel(query, userid, useAggregate = true): Promise<any> {
    let data;
    if (useAggregate) data = await this.pspVerifyService.getPspFilterExcel(query);
    else data = await this.pspVerifyService.getPspFilterAll(query);

    let tmpArray = Array();
    let counter = 1;
    for (let item in data) {
      let msg;
      let status;
      if (data[item].confirm == false && data[item].reverse == false) {
        msg = 'در انتظار تاییدیه از شرکت پرداخت';
        status = false;
      } else if (data[item].confirm == true && data[item].reverse == false) {
        msg = 'تراکنش تایید شد';
        status = true;
      } else if (data[item].confirm == false && data[item].reverse == true) {
        msg = 'تراکنش برگشت داده شده';
        status = false;
      }

      let fullanme = '';
      if (data[item].user) {
        fullanme = data[item].user.fullname;
      }

      let decode;
      if (data[item].req) {
        decode = JSON.parse(data[item].req);
      } else if (data[item].reqin) {
        decode = JSON.parse(data[item].reqin);
      } else {
        decode = {
          TrnAmt: 0,
          CardNum: 0,
        };
      }
      tmpArray.push({
        _id: counter,
        createdAt: moment(data[item].createdAt).locale('fa').format('YY/MM/DD HH:mm'),
        amount: decode.TrnAmt,
        customer: fullanme,
        msg: msg || 'عملیات با خطا مواجه شده است',
        cardno: decode.CardNum,
        ref: data[item].TraxID,
        psp: '',
        confirm: data[item].confirm,
        status: status,
      });

      counter++;
    }

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('IpgReports');

    worksheet.columns = [
      { header: 'ردیف', key: '_id', width: 5 },
      { header: 'مبلغ', key: 'amount', width: 10 },
      { header: 'تاریخ', key: 'createdAt', width: 25 },
      { header: 'پیام', key: 'msg', width: 25 },
      { header: 'شماره کارت', key: 'cardno', width: 20 },
      { header: 'کد رهگیری', key: 'ref', width: 20 },
      { header: 'پی اس پی', key: 'psp', width: 25 },
      { header: 'وضعیت تایید', key: 'confirm', width: 10 },
      { header: 'وضعیت تراکنش', key: 'status', width: 10 },
    ];

    worksheet.addRows(tmpArray);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'PspReport' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(function () {
        console.log('file saved!');
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
    return successOptWithDataNoValidation(downloadLink);
  }

  async getNewPspFilterExcel(cards, terminals, merchant, from, to, userid): Promise<any> {
    let data: {
      _id: '';
      terminalid: number;
      cardno: number;
      total: number;
      organization: number;
      discount: number;
      wallet: number;
      balanceinstore: number;
      createdAt: string;
    }[];
    console.log(cards, null, terminals, merchant, from, to);
    data = await this.pspService.getAll(cards, null, terminals, merchant, from, to);
    let tmpArray = Array();
    let counter = 1;
    for (let item in data) {
      const userInfo = await this.cardService.getCardInfo(data[item].cardno);
      tmpArray.push({
        _id: counter,
        terminalid: data[item].terminalid,
        cardno: data[item].cardno,
        customer: userInfo?.user?.fullname ? userInfo?.user?.fullname : '',
        total: data[item].total,
        organization: data[item].organization,
        discount: data[item].discount,
        wallet: data[item].wallet,
        balanceinstore: data[item].balanceinstore,
        createdAt: moment(data[item].createdAt).locale('fa').format('YYYY/MM/DD HH:mm'),
      });
      counter++;
    }

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('IpgReports');

    worksheet.columns = [
      { header: 'شماره ترمینال', key: 'terminalid', width: 10 },
      { header: 'شماره کارت', key: 'cardno', width: 20 },
      { header: 'نام خریدار', key: 'customer', width: 20 },
      { header: 'کل مبلغ', key: 'total', width: 10 },
      { header: 'شارژ سازمانی', key: 'organization', width: 10 },
      { header: 'کل تخفیف', key: 'discount', width: 10 },
      { header: 'کیف پول', key: 'wallet', width: 30 },
      { header: 'اعتبار در فروشگاه', key: 'balanceinstore', width: 30 },
      { header: 'تاریخ', key: 'createdAt', width: 10 },
    ];

    worksheet.addRows(tmpArray);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'PspReport' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(function () {
        console.log('file saved!');
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
    return successOptWithDataNoValidation(downloadLink);
  }

  async getPspFilterExcelAggregate(query, userid): Promise<any> {
    const data = await this.pspVerifyService.getPspFilterExcelAggregate(query);

    let tmpArray = Array();
    let counter = 1;
    for (let item in data) {
      let msg;
      let status;
      if (data[item].confirm == false && data[item].reverse == false) {
        msg = 'در انتظار تاییدیه از شرکت پرداخت';
        status = false;
      } else if (data[item].confirm == true && data[item].reverse == false) {
        msg = 'تراکنش تایید شد';
        status = true;
      } else if (data[item].confirm == false && data[item].reverse == true) {
        msg = 'تراکنش برگشت داده شده';
        status = false;
      }

      let fullanme = '';
      if (data[item].user) {
        fullanme = data[item].user.fullname;
      }

      let decode;
      if (data[item].req) {
        decode = JSON.parse(data[item].req);
      } else if (data[item].reqin) {
        decode = JSON.parse(data[item].reqin);
      } else {
        decode = {
          TrnAmt: 0,
          CardNum: 0,
        };
      }
      tmpArray.push({
        _id: counter,
        createdAt: moment(data[item].createdAt).locale('fa').format('YY/MM/DD HH:mm'),
        amount: decode.TrnAmt,
        customer: fullanme,
        msg: msg || 'عملیات با خطا مواجه شده است',
        cardno: decode.CardNum,
        ref: data[item].TraxID,
        psp: '',
        confirm: data[item].confirm,
        status: status,
      });

      counter++;
    }

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('IpgReports');

    worksheet.columns = [
      { header: 'ردیف', key: '_id', width: 5 },
      { header: 'مبلغ', key: 'amount', width: 10 },
      { header: 'تاریخ', key: 'createdAt', width: 25 },
      { header: 'پیام', key: 'msg', width: 25 },
      { header: 'شماره کارت', key: 'cardno', width: 20 },
      { header: 'کد رهگیری', key: 'ref', width: 20 },
      { header: 'پی اس پی', key: 'psp', width: 25 },
      { header: 'وضعیت تایید', key: 'confirm', width: 10 },
      { header: 'وضعیت تراکنش', key: 'status', width: 10 },
    ];

    worksheet.addRows(tmpArray);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'PspReport' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(function () {
        console.log('file saved!');
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
    return successOptWithDataNoValidation(downloadLink);
  }

  async getIpgExcelPlay(query, userid, getInfo: ReportApiDto): Promise<any> {
    const mipgInfo = await this.mipgService.getInfoById(getInfo.ipg);
    if (!mipgInfo) throw new UserCustomException('ترمینال یافت نشد');

    if (mipgInfo.type == MipgType.Direct) {
      return this.getExeclIpg(getInfo, userid, mipgInfo);
    } else {
      return this.getIpgFilterExcel(query, userid);
    }
  }

  async getExeclIpg(getInfo, userid, mipgInfo): Promise<any> {
    getInfo.terminal = mipgInfo.mrs.terminalid;
    getInfo.merchant = mipgInfo.mrs.acceptorid;
    getInfo.ipg = mipgInfo.mrs.psp;
    const { data } = await getExcelReportFromMrs(getInfo);

    let tmpArray = Array();
    let counter = 1;

    for (const info of data.data) {
      const date = timeDateJalali(info.createdAt);

      tmpArray.push({
        _id: counter,
        createdAt: info.createdAt,
        date: date.date,
        time: date.time,
        amount: info.amount,
        customer: '',
        msg: 'تراکنش تایید شده است',
        cardno: info.details.cardnumber,
        ref: info.orderid,
        psp: info.psp.title,
        confirm: true,
        status: true,
      });
    }

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('IpgReports');

    worksheet.columns = [
      { header: 'ردیف', key: '_id', width: 5 },
      { header: 'مبلغ', key: 'amount', width: 10 },
      { header: 'پیام', key: 'msg', width: 25 },
      { header: 'شماره کارت', key: 'cardno', width: 20 },
      { header: 'کد رهگیری', key: 'ref', width: 20 },
      { header: 'پی اس پی', key: 'psp', width: 25 },
      { header: 'وضعیت تایید', key: 'confirm', width: 10 },
      { header: 'وضعیت تراکنش', key: 'status', width: 10 },
    ];

    worksheet.addRows(tmpArray);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'IpgReport' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(function () {
        console.log('file saved!');
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
    return successOptWithDataNoValidation(downloadLink);
  }

  async getIpgFilterExcel(query, userid): Promise<any> {
    const data = await this.ipgService.ipgFilterReportExcel(query);
    let tmpArray = Array();
    let counter = 1;
    for (let item in data) {
      const psp = this.typePspSelector(data[item].type);

      if (data[item].details && data[item].details.respcode == 0) {
        let msg;
        if (data[item].trx == true) {
          msg = 'تراکنش تایید شده است';
        } else {
          msg = 'در انتظار تایید تراکنش';
        }
        const date = timeDateJalali(data[item].createdAt);
        tmpArray.push({
          _id: counter,
          createdAt: data[item].createdAt,
          date: date.date,
          time: date.time,
          amount: data[item].total || data[item].amount,
          customer: '',
          msg: msg,
          cardno: data[item].details.cardnumber,
          ref: data[item].userinvoice,
          psp: psp,
          confirm: data[item].trx,
          status: true,
        });
      } else if (data[item].details && data[item].details.respcode != 0) {
        let msg;
        if (data[item].details.respmsg == 'عملیات با موفقیت انجام شد') {
          msg = 'عملیات با خطا مواجه شده است';
        } else {
          msg = data[item].details.respmsg;
        }
        const date = timeDateJalali(data[item].createdAt);
        console.log(date, 'dateee');
        tmpArray.push({
          _id: counter,
          createdAt: data[item].createdAt,
          date: date.date,
          time: date.time,
          amount: data[item].total || data[item].amount,
          customer: '',
          msg: msg || 'عملیات با خطا مواجه شده است',
          cardno: data[item].details.cardno || '',
          ref: data[item].userinvoice,
          psp: psp,
          confirm: true,
          status: false,
        });
      }
      counter++;
    }

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('IpgReports');

    worksheet.columns = [
      { header: 'ردیف', key: '_id', width: 5 },
      { header: 'تاریخ', key: 'date', width: 7 },
      { header: 'زمان', key: 'time', width: 7 },
      { header: 'مبلغ', key: 'amount', width: 10 },
      { header: 'پیام', key: 'msg', width: 25 },
      { header: 'شماره کارت', key: 'cardno', width: 20 },
      { header: 'کد رهگیری', key: 'ref', width: 20 },
      { header: 'پی اس پی', key: 'psp', width: 25 },
      { header: 'وضعیت تایید', key: 'confirm', width: 10 },
      { header: 'وضعیت تراکنش', key: 'status', width: 10 },
    ];

    worksheet.addRows(tmpArray);

    const dir = UPLOAD_URI_USERS + userid;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const today = todayDay();
    const filname = 'IpgReport' + new Date().getTime() + today + '.xlsx';
    const worked = await workbook.xlsx
      .writeFile(dir + '/' + filname)
      .then(function () {
        console.log('file saved!');
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    const downloadLink = process.env.SITE_URL_EXCEL + userid + '/' + filname;
    return successOptWithDataNoValidation(downloadLink);
  }
}
