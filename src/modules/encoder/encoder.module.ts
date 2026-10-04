import { Global, Module } from '@nestjs/common';
import { EncoderService } from './encoder.service';

@Global()
@Module({
  providers: [EncoderService],
  exports: [EncoderService],
})
export class EncoderModule {}
