import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  providers: [ChatGateway, AppService],
  controllers: [AppController],
})
export class AppModule {}