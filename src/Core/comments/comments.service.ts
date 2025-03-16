import { Model } from 'mongoose';
import { Injectable, Inject, InternalServerErrorException } from '@vision/common';
import { CommentsCoreDto } from './dto/comments.dto';

@Injectable()
export class CommentsCoreService {
  constructor(@Inject('CommentsModel') private readonly commentsModel: any) {}

  async newComment(getInfo: CommentsCoreDto): Promise<any> {
    return this.commentsModel.create(getInfo);
  }

  async showListComments(terminalid, page): Promise<any> {
    const data = await this.commentsModel.paginate(
      { terminal: terminalid },
      { page, sort: { createdAt: -1 }, limit: 20 }
    );
    if (!data) throw new InternalServerErrorException();

    data.docs = [
      {
        fullname: 'یونس ایشانی',
        text: 'این یک نظر برای تست می باشد',
        rate: 3.5,
      },
      {
        fullname: 'یونس ایشانی',
        text: 'این یک نظر برای تست2 می باشد',
        rate: 4,
      },
    ];

    return this.transform(data);
  }

  private transform(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: data.docs || '',
      total: data.total || '',
      limit: data.limit || '',
      page: parseInt(data.page) || '',
      pages: data.pages || '',
    };
  }

  private static successOpt(datax) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: datax,
    };
  }

  private static faildOpt() {
    return {
      status: 401,
      success: false,
      message: 'متاسفانه دسترسی برای کاربر تعریف نشده است ',
      data: {},
    };
  }
}
