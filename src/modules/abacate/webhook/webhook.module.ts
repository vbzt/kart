import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { WebhookService } from './webhook.service';

@Module({
  imports: [PrismaModule],
  controllers: [WebhookController],
  providers: [WebhookService]
})
export class WebhookModule {}
