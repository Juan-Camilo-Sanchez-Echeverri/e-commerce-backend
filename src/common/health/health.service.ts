import { Injectable } from '@nestjs/common';

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { CacheService } from '@modules/cache/cache.service';

type ServiceStatus = 'up' | 'down';

interface ServiceCheck {
  status: ServiceStatus;
  latencyMs: number;
}

export interface HealthReport {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  services: {
    mongodb: ServiceCheck;
    redis: ServiceCheck;
  };
}

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly cacheService: CacheService,
  ) {}

  async check(): Promise<HealthReport> {
    const [mongodb, redis] = await Promise.all([
      this.checkMongo(),
      this.checkRedis(),
    ]);

    const services = { mongodb, redis };
    const degraded = Object.values(services).some(
      (service) => service.status === 'down',
    );

    return {
      status: degraded ? 'degraded' : 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services,
    };
  }

  private async checkMongo(): Promise<ServiceCheck> {
    const start = Date.now();

    try {
      await this.connection.db?.admin().ping();
      return { status: 'up', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start };
    }
  }

  private async checkRedis(): Promise<ServiceCheck> {
    const start = Date.now();
    const healthy = await this.cacheService.isHealthy();

    return { status: healthy ? 'up' : 'down', latencyMs: Date.now() - start };
  }
}
