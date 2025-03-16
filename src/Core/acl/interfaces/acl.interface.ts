import { Document } from 'mongoose';

export interface Acl extends Document {
  readonly user: any;
  readonly expire: string;
  readonly agentnewuser: boolean;
  readonly merchants: boolean;
  readonly ipg: boolean;
  readonly managecredit: boolean;
  readonly customerclub: boolean;
  readonly customerclubmanager: boolean;
  readonly national: boolean;
  readonly nationalagent: boolean;
  readonly leasingmanager: boolean;
  readonly leasing: boolean;
}
