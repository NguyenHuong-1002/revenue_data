import { PartialType } from '@nestjs/mapped-types';
import { CreatePlantDto } from './create-plant.dto';

// PartialType kế thừa toàn bộ
// eslint-disable-next-line prettier/prettier
export class UpdatePlantDto extends PartialType(CreatePlantDto) {}
