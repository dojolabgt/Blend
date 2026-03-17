import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { ServicesQueryDto } from './dto/services-query.dto';
import { paginate, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(workspaceId: string, dto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepo.create({
      ...dto,
      workspaceId,
    });
    return this.serviceRepo.save(service);
  }

  async findAll(
    workspaceId: string,
    query: ServicesQueryDto = new ServicesQueryDto(),
  ): Promise<PaginatedResponse<Service>> {
    const {
      search,
      category,
      chargeType,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const qb = this.serviceRepo
      .createQueryBuilder('service')
      .where('service.workspaceId = :workspaceId', { workspaceId });

    if (isActive !== undefined) {
      qb.andWhere('service.isActive = :isActive', { isActive });
    } else {
      qb.andWhere('service.isActive = true');
    }

    if (search) {
      qb.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      qb.andWhere('service.category = :category', { category });
    }

    if (chargeType) {
      qb.andWhere('service.chargeType = :chargeType', { chargeType });
    }

    const allowedSort = ['name', 'createdAt', 'category'];
    const orderField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(
      `service.${orderField}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    )
      .skip(query.skip)
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query);
  }

  async findOne(workspaceId: string, id: string): Promise<Service> {
    const service = await this.serviceRepo.findOne({
      where: { id, workspaceId },
    });
    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return service;
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(workspaceId, id);
    Object.assign(service, dto);
    return this.serviceRepo.save(service);
  }

  async remove(workspaceId: string, id: string): Promise<void> {
    const service = await this.findOne(workspaceId, id);
    service.isActive = false;
    await this.serviceRepo.save(service);
  }
}
