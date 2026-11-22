import { Controller, Post, Get, Body, Req, Res, UseGuards, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { validate } from '../platform/utils';
import { SessionGuard } from './session.guard';
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly auth:AuthService){}
  @Post('login') login(@Body() body:unknown,@Res({passthrough:true}) res:Response){
    const b=validate(z.object({email:z.string().email(),password:z.string().min(1)}),body);
    return this.auth.login(b.email,b.password,res);
  }
  @Post('register') register(@Body() body:unknown,@Res({passthrough:true}) res:Response){
    if(process.env.CUSTOMER_REGISTRATION_ENABLED!=='true') throw new ForbiddenException('Registration disabled until verified-email flow is configured');
    const b=validate(z.object({email:z.string().email(),password:z.string().min(12).max(128),fullName:z.string().min(2).max(120)}),body);
    return this.auth.register(b.email,b.password,b.fullName,res);
  }
  @Post('logout') logout(@Req() req:Request,@Res({passthrough:true}) res:Response){return this.auth.logout(req,res);}
  @Get('me') @UseGuards(SessionGuard) me(@Req() req:Request){return (req as any).identity;}
}
