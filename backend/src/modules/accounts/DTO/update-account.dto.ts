import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';

// eslint-disable-next-line prettier/prettier
export class UpdateAccountDto extends PartialType(CreateAccountDto) { }
