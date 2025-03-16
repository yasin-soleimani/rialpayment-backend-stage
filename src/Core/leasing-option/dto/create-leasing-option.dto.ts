export class CreateLeasingOptionDto {
  amount: number
  baseOption: string | null
  months: number
  interest: number
  isCustomizable: boolean
  minCustomAmount: number | null
  maxCustomAmount: number | null
  title: string
  description: string
  tenDayPenalty: number
  twentyDayPenalty: number
}
