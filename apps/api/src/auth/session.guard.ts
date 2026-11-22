import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth:AuthService){}
  async canActivate(context:ExecutionContext){
    const req=context.switchToHttp().getRequest();
    req.identity=await this.auth.identity(req);
    return true;
  }
}
