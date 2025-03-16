import { Document, Model } from 'mongoose';

export interface PaginateOptions {
  select?: Object | string;
  sort?: Object | string;
  populate?: Array<Object> | Array<string> | Object | string | QueryPopulateOptions;
  lean?: boolean;
  leanWithId?: boolean;
  offset?: number;
  page?: number;
  limit?: number;
}

interface QueryPopulateOptions {
  /** space delimited path(s) to populate */
  path: string;
  /** optional fields to select */
  select?: any;
  /** optional query conditions to match */
  match?: any;
  /** optional model to use for population */
  model?: string | Model<any>;
  /** optional query options like sort, limit, etc */
  options?: any;
  /** deep populate */
  populate?: QueryPopulateOptions | QueryPopulateOptions[];
}

export interface PaginateResult<T> {
  docs: Array<T>;
  total: number;
  limit: number;
  page?: number;
  pages?: number;
  offset?: number;
}

export interface PaginateModel<T extends Document> extends Model<T> {
  paginate(
    query?: Object,
    options?: PaginateOptions,
    callback?: (err: any, result: PaginateResult<T>) => void
  ): Promise<PaginateResult<T>>;
}

export interface AggregatePaginateModel<T extends Document> extends Model<T>, PaginateModel<T> {
  aggregatePaginate: any;
}

export type PossibleDeviceTypes = 'web' | 'pwa' | 'mobile' | 'mobile_google';
