import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { PlantEntity } from 'src/entities/plant.entity';
import { CreatePlantDto } from './DTO/create-plant.dto';
import { GetPlantAllDto } from './DTO/get-plant-all.dto';
import { UpdatePlantDto } from './DTO/update-plant.dto';
import { IPlant, IPaginatedPlants } from './interfaces/plant.interface';
import { NotificationService } from '../notifications/notification.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PlantService {
  constructor(
    @InjectRepository(PlantEntity)
    private readonly plantRepository: Repository<PlantEntity>,
    private readonly notificationService: NotificationService,
    // eslint-disable-next-line prettier/prettier
  ) { }

  async getAll(filters: GetPlantAllDto): Promise<IPaginatedPlants> {
    const { page, limit, address, manager_name } = filters;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<PlantEntity> = {};
    if (address) where.address = Like(`%${address}%`);
    if (manager_name) where.manager_name = Like(`%${manager_name}%`);

    const [data, total] = await this.plantRepository.findAndCount({
      where,
      order: { plant_id: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string): Promise<IPlant> {
    const plant = await this.plantRepository.findOneBy({ plant_id: id });
    if (!plant) {
      throw new NotFoundException(`Nhà máy với mã '${id}' không tồn tại`);
    }
    return plant;
  }

  async create(dto: CreatePlantDto, adminUsername?: string): Promise<IPlant> {
    const id = uuidv4();
    const plant = this.plantRepository.create({
      plant_id: id,
      name_plant: dto.name_plant,
      address: dto.address,
      manager_name: dto.manager_name,
      phone: dto.phone,
    });
    await this.plantRepository.save(plant);

    await this.notificationService.createNotification({
      title: 'Tạo nhà máy mới',
      content: `Admin ${adminUsername || 'hệ thống'} đã tạo nhà máy ${id} - ${dto.name_plant}.`,
      type: 'SYSTEM',
    });

    return plant;
  }

  async update(id: string, dto: UpdatePlantDto, adminUsername?: string): Promise<IPlant> {
    const plant = await this.plantRepository.findOneBy({ plant_id: id });
    if (!plant) {
      throw new NotFoundException(`Nhà máy với mã '${id}' không tồn tại`);
    }

    if (dto.name_plant !== undefined) plant.name_plant = dto.name_plant;
    if (dto.address !== undefined) plant.address = dto.address;
    if (dto.manager_name !== undefined) plant.manager_name = dto.manager_name;
    if (dto.phone !== undefined) plant.phone = dto.phone;

    await this.plantRepository.save(plant);

    await this.notificationService.createNotification({
      title: 'Cập nhật nhà máy',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật nhà máy ${id}.`,
      type: 'SYSTEM',
    });

    return plant;
  }

  async delete(id: string, adminUsername?: string): Promise<void> {
    const plant = await this.plantRepository.findOneBy({ plant_id: id });
    if (!plant) {
      throw new NotFoundException(`Nhà máy với mã '${id}' không tồn tại`);
    }

    await this.plantRepository.remove(plant);

    await this.notificationService.createNotification({
      title: 'Xóa nhà máy',
      content: `Admin ${adminUsername || 'hệ thống'} đã xóa nhà máy ${id} khỏi hệ thống.`,
      type: 'SYSTEM',
    });
  }
}
