import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataProcessingService } from '../src/modules/data-processing/data-processing.service';

const command = process.argv[2] ?? 'all';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(DataProcessingService);

  switch (command) {
    case 'products':
      console.log('Importing products...');
      const p = await service.importProducts();
      console.log('Done:', JSON.stringify(p));
      break;

    case 'sales':
      console.log('Importing sales...');
      const s = await service.importSaleReports();
      console.log('Done:', JSON.stringify(s));
      break;

    case 'inventory':
      console.log('Importing inventory...');
      const i = await service.importInventoryReports();
      console.log('Done:', JSON.stringify(i));
      break;

    default:
      console.log('Importing all data...');
      const all = await service.importAll();
      console.log('Done:', JSON.stringify(all, null, 2));
      break;
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
