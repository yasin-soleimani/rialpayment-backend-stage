import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@vision/common';
import { BasketProductCardsDto } from './dto/cards.dto';
import { BasketProductService } from '../products/services/product.service';
import { getNowTimeWith15minSub } from '@vision/common/utils/month-diff.util';

@Injectable()
export class BasketProductCardService {
  constructor(
    @Inject('BasketCardsModel') private readonly productCardModel: any,
    private readonly productService: BasketProductService
  ) {}

  async addNew(getInfo: BasketProductCardsDto, userid: string): Promise<any> {
    const productInfo = await this.productService.getProductInfo(getInfo.productid, userid);
    if (!productInfo) throw new BadRequestException();

    getInfo.value = JSON.parse(getInfo.fields);
    getInfo.product = getInfo.productid;

    const data = await this.productCardModel.create(getInfo);
    if (!data) throw new InternalServerErrorException();

    return data;
  }

  async getList(productid: string, userid: string, page): Promise<any> {
    const productInfo = await this.productService.getProductInfo(productid, userid);
    if (!productInfo) throw new BadRequestException();

    const data = await this.productCardModel
      .paginate(
        { product: productid },
        { page, select: { product: 0, createdAt: 0, updatedAt: 0 }, sort: { createdAt: -1 }, limit: 50 }
      )
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    if (!data) throw new InternalServerErrorException();

    return data;
  }

  async edit(getInfo: BasketProductCardsDto, userid: string): Promise<any> {
    const cardInfo = await this.productCardModel.findOne({ _id: getInfo.id });
    if (!cardInfo) throw new BadRequestException();

    const productInfo = await this.productService.getProductInfo(cardInfo.product, userid);
    if (!productInfo) throw new BadRequestException();

    getInfo.value = JSON.parse(getInfo.fields);
    const data = await this.productCardModel.findOneAndUpdate(
      {
        _id: getInfo.id,
      },
      getInfo
    );

    if (!data) throw new InternalServerErrorException();

    return data;
  }

  async remove(cardid: string, userid: string): Promise<any> {
    const cardInfo = await this.productCardModel.findOne({ _id: cardid });
    if (!cardInfo) throw new BadRequestException();

    const productInfo = await this.productService.getProductInfo(cardInfo.product, userid);
    if (!productInfo) throw new BadRequestException();

    return this.productCardModel.findOneAndRemove({
      _id: cardid,
    });
  }

  async getQty(productid: string): Promise<any> {
    const now = getNowTimeWith15minSub();
    return this.productCardModel.find({
      product: productid,
      $or: [
        { $and: [{ sold: false }, { reserve: false }] },
        { $and: [{ sold: false }, { reserve: true }, { updatedAt: { $lte: now } }] },
      ],
    });
  }

  async setReserve(cardid: string, shopid: string): Promise<any> {
    return this.productCardModel.findOneAndUpdate(
      {
        _id: cardid,
      },
      { reserve: true, shop: shopid }
    );
  }

  async setSold(cardid: string): Promise<any> {
    return this.productCardModel.findOneAndUpdate(
      {
        _id: cardid,
      },
      { reserve: false, sold: true }
    );
  }

  async getCardWithLimit(productid: string, limit: number): Promise<any> {
    const now = getNowTimeWith15minSub();
    return this.productCardModel
      .find({
        product: productid,
        $or: [
          { $and: [{ sold: false }, { reserve: false }] },
          { $and: [{ sold: false }, { reserve: true }, { updatedAt: { $lte: now } }] },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(limit);
  }

  async getShopIDCard(shopid: string): Promise<any> {
    return this.productCardModel.find({
      shop: shopid,
    });
  }

  async getCards(productid: string, shopid: string): Promise<any> {
    return this.productCardModel.find({
      shop: shopid,
      product: productid,
    });
  }
}
