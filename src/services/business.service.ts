import { prisma } from '@/lib/prisma';

export class BusinessService {
  private db: typeof prisma;

  constructor(db?: typeof prisma) {
    if (!db) {
      db = prisma;
    }
    this.db = db;
  }

  async create(data: any) {
    return this.db.businesses.create({
      data
    });
  }

  async getBusinessByToken(token: string) {
    return this.db.businesses.findFirst({
      where: {
        invite_code: token
      }
    });
  }

  async updateBusiness(id: any, data: any) {
    data.status = 'Registered';
    console.log(data, id);
    return this.db.businesses.update({
      where: {
        id: id
      },
      data
    });
  }
}
