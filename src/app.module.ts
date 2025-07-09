import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Módulos comunes globales
    CommonModule,
  ],
  providers: [],
})
export class AppModule {}
