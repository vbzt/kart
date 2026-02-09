import { Module } from '@nestjs/common';
import { AbacateController } from './abacate.controller';
import { AbacateService } from './abacate.service';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  controllers: [AbacateController],
  providers: [AbacateService],
  imports: [WebhookModule],
  exports: [AbacateService]
})
export class AbacateModule {}
