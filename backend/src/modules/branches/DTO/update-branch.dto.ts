import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from './create-branch.dto';
// eslint-disable-next-line prettier/prettier
export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
