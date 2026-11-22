import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Database } from '../db/database';
@Controller('health')
export class PlatformController {
  constructor(private readonly db:Database){}
  @Get('live') live(){return {status:'ok'};}
  @Get('ready') async ready(){
    try {await this.db.query('SELECT 1');return {status:'ready'};}
    catch {throw new ServiceUnavailableException('Database unavailable');}
  }
}
