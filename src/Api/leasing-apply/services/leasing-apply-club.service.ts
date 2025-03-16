import { Injectable } from '@vision/common';
import { ClubPwa } from '../../../Core/clubpwa/interfaces/club-pwa.interface';
import { LeasingRef } from '../../../Core/leasing-ref/interfaces/leasing-ref.interface';
import { LeasingRefCoreService } from '../../../Core/leasing-ref/leasing-ref.service';

@Injectable()
export class LeasingApplyClubService {
  constructor(private readonly leasingRefCoreService: LeasingRefCoreService) {}

  async getClubLeasingRefs(clubPwaData: ClubPwa, clubUser: string): Promise<LeasingRef[]> {
    if (clubPwaData) {
      let clubUser = clubPwaData.clubUser;
      if (typeof clubUser === 'object') {
        clubUser = clubUser._id;
      }
      return this.leasingRefCoreService.getByClubUserForApplicant(clubUser);
    }

    return this.leasingRefCoreService.getByClubUserForApplicant(clubUser);
  }
}
