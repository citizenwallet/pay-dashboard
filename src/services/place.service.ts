import { prisma, } from '@/lib/prisma';
import { places } from '@prisma/client';
import { HttpError } from 'http-errors-enhanced';

type PlaceOfId = places['id'] | places;

export class PlaceService {
  private db: typeof prisma;

  constructor(
    db : typeof prisma,
  ) {
    this.db = db;
  }

  async findById(id: places['id']) {
    const place = this.db.places.findFirst({
      where: {
        id: id
      }
    });

    if(!place) {
      throw new HttpError(404, 'Place not found');
    }

    return place;
  }

  async resolve(item: places['id'] | places) {
    if(typeof item === 'object') {
      return item;
    }
    return this.findById(item);
  }

  async getAccounts(placeOrId: any) {
    const place = await this.resolve(placeOrId);
    const placesIds: any = [];
    const accounts = place?.accounts as any[] || [];
    accounts.map(account => placesIds.push(account));
  }

  async getTransactions(placeOrId: PlaceOfId) {
    const place = await this.resolve(placeOrId);

    return this.db.a_transactions.findMany({

    });
  }
}
