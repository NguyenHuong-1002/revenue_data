import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { LandingFeatureEntity } from '../../../entities/landing-feature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LandingFeatureEntity])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
