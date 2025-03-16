import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export interface TicketsModel {
  remainCount: number;
  totalCount: number;
  group: string;
  terminals: string[];
  expire: string;
  user: string;
  daysofweek: number[];
  title: string;
  card: string;
  canUseMultiTime: boolean;
}

export interface TicketsSchemaModel extends TicketsModel, Document {}
