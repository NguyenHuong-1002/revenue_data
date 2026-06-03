import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as authGuard from 'src/middlewares/auth.guard';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './DTO/update-setting.dto';
import { ISystemSetting, ISystemSettingGroup } from './interfaces/settings.interface';
import {
  ApiGetAllSettingsSwagger,
  ApiGetSettingByKeySwagger,
  ApiUpdateSettingSwagger,
  ApiCreateSettingSwagger,
  ApiDeleteSettingSwagger,
} from './settings.swagger';

@ApiTags('Cài đặt hệ thống (Settings)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@authGuard.Roles('ADMIN')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiGetAllSettingsSwagger()
  @Get()
  @HttpCode(HttpStatus.OK)
  getAll(): Promise<ISystemSettingGroup[]> {
    return this.settingsService.getAllGrouped();
  }

  @ApiGetSettingByKeySwagger()
  @Get('/:key')
  @HttpCode(HttpStatus.OK)
  getByKey(@Param('key') key: string): Promise<ISystemSetting> {
    return this.settingsService.getByKey(key);
  }

  @ApiUpdateSettingSwagger()
  @Put('/:key')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('key') key: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateSettingDto,
  ): Promise<ISystemSetting> {
    return this.settingsService.update(key, dto);
  }

  @ApiCreateSettingSwagger()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ValidationPipe({ transform: true }))
    dto: {
      key: string;
      value: string;
      type?: string;
      group?: string;
      description?: string;
    },
  ): Promise<ISystemSetting> {
    return this.settingsService.create(dto);
  }

  @ApiDeleteSettingSwagger()
  @Delete('/:key')
  @HttpCode(HttpStatus.OK)
  delete(@Param('key') key: string): Promise<void> {
    return this.settingsService.delete(key);
  }
}
