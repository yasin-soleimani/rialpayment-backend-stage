export class UpdateStoreTransmissionSettingsDto {
  hasDelivery: boolean;
  deliveryPrice: number;
  deliveryDescription: string;
  hasPishtaz: boolean;
  pishtazPrice: number;
  pishtazDescription: string;
  hasFreeShipping: boolean;
  freeShippingAmount: number;
  user: any;
  hasDeliveryToWholeCountry: boolean;
  deliveryProvince: string;
  deliveryCity: string;
  deliveryTimeout: number;
}
