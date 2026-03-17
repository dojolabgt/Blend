import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { ClientsQueryDto } from './dto/clients-query.dto';
import { paginate, PaginatedResponse } from '../common/dto/pagination.dto';
import { Workspace, WorkspacePlan } from '../workspaces/workspace.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
  ) {}

  async create(workspaceId: string, dto: CreateClientDto): Promise<Client> {
    // Enforce limits for FREE plan
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    if (workspace?.plan === WorkspacePlan.FREE) {
      const count = await this.clientRepo.count({ where: { workspaceId } });
      if (count >= 5) {
        throw new BadRequestException(
          'Has alcanzado el límite de 5 clientes para el plan gratuito. Mejora tu plan para agregar más.',
        );
      }
    }

    const client = this.clientRepo.create({
      ...dto,
      workspaceId,
    });
    return this.clientRepo.save(client);
  }

  async findAll(
    workspaceId: string,
    query: ClientsQueryDto,
  ): Promise<PaginatedResponse<Client>> {
    const { search, type, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const qb = this.clientRepo
      .createQueryBuilder('client')
      .where('client.workspaceId = :workspaceId', { workspaceId });

    if (search) {
      qb.andWhere(
        '(client.name ILIKE :search OR client.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      qb.andWhere('client.type = :type', { type });
    }

    const allowedSort = ['name', 'email', 'createdAt'];
    const orderField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`client.${orderField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip(query.skip)
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query);
  }

  async findOne(workspaceId: string, id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id, workspaceId },
    });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return client;
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateClientDto,
  ): Promise<Client> {
    const client = await this.findOne(workspaceId, id);
    Object.assign(client, dto);
    return this.clientRepo.save(client);
  }

  async remove(workspaceId: string, id: string): Promise<void> {
    const client = await this.findOne(workspaceId, id);
    await this.clientRepo.remove(client);
  }
}
