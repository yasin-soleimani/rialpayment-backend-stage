export class CampaignDto {
  id?: string;
  title: string;
  user: string;
  status: boolean;
  start: number; // Campaign Start
  expire: number; // Campaign Expire Date
  campType: number; // 
  campStart: number; //  Start Register Query Users
  campEnd: number; // End Register Query USers
  type: number;
  incType: number;
  purchaseCount: number;
  purchaseTotalAmount: number;
  amount: number;
  terminals: [];
  maxUser: number;
}