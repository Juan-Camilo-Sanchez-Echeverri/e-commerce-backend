import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { ApiExcludeController } from '@nestjs/swagger';

import { Public } from '../decorators';

import { HealthService } from './health.service';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  async check() {
    const report = await this.healthService.check();

    if (report.status === 'degraded') {
      throw new ServiceUnavailableException({
        code: 'health-degraded',
        message: 'One or more dependencies are unavailable.',
        errors: [
          {
            property: 'services',
            errors: Object.entries(report.services)
              .filter(([, service]) => service.status === 'down')
              .map(([name]) => name),
          },
        ],
      });
    }

    return report;
  }
}
