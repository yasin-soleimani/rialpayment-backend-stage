import {
  Injectable,
  successOptWithPagination,
  successOptWithDataNoValidation,
  InternalServerErrorException,
  successOpt,
} from '@vision/common';
import { AccountBlockService } from '../../Core/useraccount/account/services/account-block.service';
import { BackofficeAccountBlockFilterDto } from './dto/account-block-filter.dto';
import { BackofficeAccountBlockQueryBuilder } from './func/account-block-query-builder.func';
import { BackofficeAccountBlockFilterReturnModel } from './func/account-block-return-model.func';

@Injectable()
export class BackofficeAccountBlockService {
  constructor(private readonly blockService: AccountBlockService) {}

  async getFilter(getInfo: BackofficeAccountBlockFilterDto, page: number): Promise<any> {
    const query = BackofficeAccountBlockQueryBuilder(getInfo);
    const data = await this.blockService.getFilter(query, page);
    data.docs = BackofficeAccountBlockFilterReturnModel(data.docs);
    return successOptWithPagination(data);
  }

  async confirm(id: string): Promise<any> {
    return this.blockService
      .changeStatus(id, false)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }
}
