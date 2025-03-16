import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@vision/common';
import { BasketImagesDto } from './dto/images.dto';

@Injectable()
export class BasketProductImagesService {
  constructor(@Inject('BasketImagesModel') private readonly productImageModel: any) {}

  upsertImage(getInfo: BasketImagesDto) {
    return this.productImageModel.findOneAndUpdate(
      {
        barcode: getInfo.barcode,
      },
      {
        barcode: getInfo.barcode,
        imageLink: getInfo.imageLink,
        category: getInfo.category,
        productName: getInfo.productName,
      },
      {
        new: true,
        upsert: true,
      }
    );
  }

  getImageByBarcode(barcode: string): Promise<BasketImagesDto> {
    return this.productImageModel.findOne({ barcode });
  }
}
