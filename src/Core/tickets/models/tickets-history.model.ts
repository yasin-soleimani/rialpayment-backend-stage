import { Document } from 'mongoose';

export interface TicketsHistoryModel {
  terminal: string;
  ticket: string;
  user: string;
  card: string;
  cardnumber: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketsHistorySchemaModel extends TicketsHistoryModel, Document {}
