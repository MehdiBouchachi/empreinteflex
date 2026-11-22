import { BadRequestException, Controller, Post, Body, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../db/database';
import { z } from 'zod';
import { validate } from '../platform/utils';
const input=z.object({fullName:z.string().trim().min(2).max(120),email:z.string().email().max(254),message:z.string().trim().min(10).max(4000)});
@Controller('v1/contact')
export class ContactController {
  constructor(private db:Database){}
  @Post() async create(@Body() body:unknown){
    const b=validate(input,body);
    if(!process.env.SMTP_HOST||!process.env.CONTACT_INBOX) throw new ServiceUnavailableException('Contact email not configured');
    await this.db.query(`INSERT INTO outbox_events(event_type,aggregate_id,payload) VALUES('contact.submitted',$1,$2)`,
      [randomUUID(),JSON.stringify({email:process.env.CONTACT_INBOX,replyTo:b.email,sender:b.fullName,message:b.message})]);
    return {success:true};
  }
}
