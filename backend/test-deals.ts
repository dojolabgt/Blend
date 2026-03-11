import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DealsService } from './src/deals/deals.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dealsService = app.get(DealsService);
  
  // Replace this with the active workspace ID we saw in the logs
  const workspaceId = 'd7a949c0-7f72-4c3f-a1c9-f1c4f9ef2880';
  
  const deals = await dealsService.findAll(workspaceId);
  console.log('--- FOUND DEALS ---');
  console.log(JSON.stringify(deals, null, 2));
  console.log('-------------------');
  
  await app.close();
}

bootstrap();
