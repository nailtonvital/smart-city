import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SensorService } from './sensor/sensor.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir requests do frontend
  app.enableCors();
  
  // Inicializar dados fictícios
  const sensorService = app.get(SensorService);
  await sensorService.initializeFakeSensors();
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Smart City API está rodando na porta ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}/dashboard/overview`);
  console.log(`🗺️  Mapa: http://localhost:${port}/dashboard/map`);
  console.log(`🔍 Analytics: http://localhost:${port}/dashboard/analytics`);
}
bootstrap();
