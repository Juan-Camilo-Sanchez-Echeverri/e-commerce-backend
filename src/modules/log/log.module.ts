import { Module } from '@nestjs/common';
import { LogService } from './log.service';

@Module({
  exports: [LogService],
  providers: [LogService],
})
export class LogModule {}
