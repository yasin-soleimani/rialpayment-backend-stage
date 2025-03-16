export class AddressDto {
  province: string;
  city: string;
  address: string;
  postalcode: string;
  fullname: string;
  mobile: number;
  location: {
    type: 'Point';
    coordinates: number[];
  };
  userid?: string;
}
