import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Welcome to Happy Harvest Reborn API';
  }

  async getHealthStatus() {
    let dbStatus = { isHealthy: false, message: 'Database not connected' };
    
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbStatus = { isHealthy: true, message: 'Database connected' };
      }
    } catch (error) {
      dbStatus = { isHealthy: false, message: `Database error: ${error.message}` };
    }

    return {
      isHealthy: dbStatus.isHealthy,
      timestamp: new Date().toISOString(),
      services: {
        api: { isHealthy: true, message: 'API is running' },
        database: dbStatus,
      },
    };
  }
}
