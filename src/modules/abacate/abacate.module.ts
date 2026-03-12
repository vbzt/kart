import { Module } from '@nestjs/common';
import { AbacateController } from './abacate.controller';
import { AbacateService } from './abacate.service';
import { WebhookModule } from './webhook/webhook.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [AbacateController],
  providers: [AbacateService],
  imports: [WebhookModule, UserModule],
  exports: [AbacateService]
})
export class AbacateModule {}
