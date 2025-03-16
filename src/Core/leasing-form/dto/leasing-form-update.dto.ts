import { LeasingForm } from '../interfaces/leasing-form.interface';

export type LeasingFormUpdateDto = Omit<Partial<LeasingForm>, 'key' | 'leasingUser' | 'deleted'>;
