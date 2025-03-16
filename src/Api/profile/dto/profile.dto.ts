export class ProfileDto {
  readonly address: string;
  readonly zipcode: number;
  readonly tell: number;
  readonly state: string;
  readonly city: string;
  readonly aboutme: string;
  readonly mywebsite: string;
  readonly email: string;
  readonly showMyTellToOthers: boolean;
  readonly showMyEmailToOthers: boolean;
  islegal?: boolean;
  readonly title?: string;
  readonly name?: string;
  birthdate: number;
}

export class ProfileLinkSettingsDto {
  readonly showMyTransferLink: boolean;
  readonly showMyOwnShopLink: boolean;
  readonly showMyIranianShopLink: boolean;
}
