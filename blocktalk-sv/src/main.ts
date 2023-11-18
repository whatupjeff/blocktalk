import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT||3002);
  const url = await app.getUrl();
  console.log(`Uygulama şu linkte çalışıyor: ${url}`);
}
bootstrap();