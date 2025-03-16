import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { ClubPwa } from './interfaces/club-pwa.interface';

@Injectable()
export class ClubPwaService {
  constructor(@Inject('ClubPwaModel') private readonly clubPwaModel: Model<ClubPwa>) {}

  async getClubPwaByReferer(referer: string): Promise<ClubPwa> {
    return this.clubPwaModel
      .findOne({ $or: [{ referer }, { selfDomain: referer }] })
      .populate('clubUser')
      .populate('customerClub');
  }

  async getClubPwaByClubUserId(userid: string): Promise<ClubPwa> {
    return this.clubPwaModel.findOne({ clubUser: userid }).populate('clubUser').populate('customerClub');
  }
}
