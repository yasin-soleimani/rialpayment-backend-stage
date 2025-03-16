import { NationalInsurancePersonApiDto } from './insurance-person.dto';

export class NationalInsuranceApiDto {
  customerid: string;
  category: string;
  company: string;
  persons: [NationalInsurancePersonApiDto];
}
