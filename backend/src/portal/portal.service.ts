import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../deals/entities/deal.entity';
import { Client } from '../clients/client.entity';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  /**
   * Finds all deals for clients linked to the given user ID.
   * Returns a flat list ordered by most recent first.
   */
  async getDealsForUser(userId: string): Promise<Deal[]> {
    // Find all client records linked to this user
    const clients = await this.clientRepo.find({
      where: { linkedUserId: userId },
      select: ['id'],
    });

    if (clients.length === 0) return [];

    const clientIds = clients.map((c) => c.id);

    return this.dealRepo
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.workspace', 'workspace')
      .leftJoinAndSelect('deal.brief', 'brief')
      .leftJoinAndSelect('deal.quotations', 'quotations')
      .leftJoinAndSelect('deal.paymentPlan', 'paymentPlan')
      .leftJoinAndSelect('paymentPlan.milestones', 'milestones')
      .where('deal.clientId IN (:...clientIds)', { clientIds })
      .orderBy('deal.createdAt', 'DESC')
      .getMany();
  }
}
