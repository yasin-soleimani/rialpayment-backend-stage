import { Document } from 'mongoose';

export interface ClubPwa extends Document {
  readonly referer: string;
  readonly selfDomain: string;
  readonly clubUser: any;
  readonly inAppPurchaseCallback: string;
  readonly taxiCallback: string;
  readonly chargeCallback: string;
  readonly billCallback: string;
  readonly devicetype: 'pwa' | 'mobile' | 'web';
  readonly faqs: string;
  readonly androidIntent: string;
  readonly manifestName: string;
  readonly manifestShortName: string;
  readonly manifestThemeColor: string;
  readonly manifestIconsBasePath: string;
  readonly leCreditInstallmentsCallbackUrl: string;
  readonly customerClub?: any;
}
