import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantDto } from './create-plant.dto';

// PartialType kế thừa toàn bộ

export class UpdatePlantDto extends PartialType(CreatePlantDto) {}
