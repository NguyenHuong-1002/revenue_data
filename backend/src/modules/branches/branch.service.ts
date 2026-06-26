import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { StoreBranchEntity } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { GetBranchAllDto } from './dto/get-branch-all.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { IBranch } from './interfaces/branch.interface';
import { NotificationService } from '../notifications/notification.service';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(StoreBranchEntity)
    private readonly branchRepository: Repository<StoreBranchEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async getAll(filters: GetBranchAllDto): Promise<PaginatedResponseDto<IBranch>> {
    const { page, limit, city } = filters;
    const skip = (page - 1) * limit;

    const where = city ? { city: Like(`%${city}%`) } : {};

    const [data, total] = await this.branchRepository.findAndCount({
      where,
      order: { store_id: 'ASC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getById(id: string): Promise<IBranch> {
    const branch = await this.branchRepository.findOneBy({ store_id: id });
    if (!branch) {
      throw new NotFoundException(`Chi nhánh với mã '${id}' không tồn tại`);
    }
    return branch;
  }

  async create(dto: CreateBranchDto, adminUsername?: string): Promise<IBranch> {
    const id = uuidv4();
    const branch = this.branchRepository.create({
      store_id: id,
      name: dto.name,
      city: dto.city,
    });
    await this.branchRepository.save(branch);

    await this.notificationService.createNotification({
      title: 'Tạo chi nhánh mới',
      content: `Admin ${adminUsername || 'hệ thống'} đã tạo chi nhánh ${id} - ${dto.name}.`,
      type: 'SYSTEM',
    });

    return branch;
  }

  async update(id: string, dto: UpdateBranchDto, adminUsername?: string): Promise<IBranch> {
    const branch = await this.branchRepository.findOneBy({ store_id: id });
    if (!branch) {
      throw new NotFoundException(`Chi nhánh với mã '${id}' không tồn tại`);
    }

    if (dto.name !== undefined) branch.name = dto.name;
    if (dto.city !== undefined) branch.city = dto.city;

    await this.branchRepository.save(branch);

    await this.notificationService.createNotification({
      title: 'Cập nhật chi nhánh',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật chi nhánh ${id}.`,
      type: 'SYSTEM',
    });

    return branch;
  }

  async delete(id: string, adminUsername?: string): Promise<void> {
    const branch = await this.branchRepository.findOneBy({ store_id: id });
    if (!branch) {
      throw new NotFoundException(`Chi nhánh với mã '${id}' không tồn tại`);
    }

    await this.branchRepository.remove(branch);

    await this.notificationService.createNotification({
      title: 'Xóa chi nhánh',
      content: `Admin ${adminUsername || 'hệ thống'} đã xóa chi nhánh ${id} khỏi hệ thống.`,
      type: 'SYSTEM',
    });
  }
}
