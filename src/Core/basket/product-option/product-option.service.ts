import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import { BasketProductOptionDto, BasketProductOptionUpdateDto } from './dto/product-option.dto';
import { BasketProductOption } from './interfaces/product-option.interface';

@Injectable()
export class BasketProductOptionCoreService {
  constructor(
    @Inject('BasketProductOptionModel') private readonly basketProductOptionModel: Model<BasketProductOption>
  ) {}

  async create(basketProductId: string, dto: BasketProductOptionDto): Promise<BasketProductOption> {
    const data = {
      basketProduct: basketProductId,
      ...dto,
    };
    return this.basketProductOptionModel.create(data);
  }

  async delete(basketProductId: string, basketProductOptionId: string): Promise<BasketProductOption> {
    return this.basketProductOptionModel.findOneAndDelete({
      _id: basketProductOptionId,
      basketProduct: basketProductId,
    });
  }

  async getByBasketProductId(basketProductId: string): Promise<BasketProductOption[]> {
    return this.basketProductOptionModel.find({ basketProduct: basketProductId });
  }

  async getActivesByBasketProductId(basketProductId: string): Promise<BasketProductOption[]> {
    return this.basketProductOptionModel.find({ basketProduct: basketProductId, status: true });
  }

  async getByOptionId(optionId: string): Promise<BasketProductOption> {
    return this.basketProductOptionModel.findOne({ _id: optionId });
  }

  async update(
    basketProductId: string,
    basketProductOptionId: string,
    dto: BasketProductOptionUpdateDto
  ): Promise<BasketProductOption> {
    return this.basketProductOptionModel.findOneAndUpdate(
      { _id: basketProductOptionId, basketProduct: basketProductId },
      {
        $set: {
          status: dto.status,
          title: dto.title,
          price: dto.price,
        },
      },
      { upsert: true, new: true }
    );
  }
}
