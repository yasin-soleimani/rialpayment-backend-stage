import { NationalInsurancePersonDto } from './insurance-person.dto';

export class NationalInsuranceDto {
  customerid: string;
  category: string;
  company: string;
  persons: [NationalInsurancePersonDto];
}
