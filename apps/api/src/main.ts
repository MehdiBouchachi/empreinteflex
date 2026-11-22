import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { AppModule } from './module';
async function bootstrap(){
  const app=await NestFactory.create(AppModule,{bodyParser:true});
  app.use(helmet({contentSecurityPolicy:false}));
  app.use(cookieParser());
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  const authLimit=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-7',legacyHeaders:false});
  const checkoutLimit=rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:'draft-7',legacyHeaders:false});
  app.use('/v1/auth/login',authLimit);
  app.use('/v1/auth/register',authLimit);
  app.use('/v1/checkout/orders',checkoutLimit);
  app.use('/v1/contact',rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:'draft-7',legacyHeaders:false}));
  app.use('/v1/track-by-code',rateLimit({windowMs:15*60*1000,limit:12,standardHeaders:'draft-7',legacyHeaders:false}));
  app.use((req:any,res:any,next:any)=>{
    // Browser mutating requests must be same origin; protects cookie sessions from cross-site posting.
    if(!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin){
      let originHost='';
      try {originHost=new URL(req.headers.origin).host;} catch{}
      const forwardedHost=String(req.headers['x-forwarded-host']||req.headers.host||'');
      if(originHost!==forwardedHost){res.status(403).json({message:'Cross-origin mutation blocked'});return;}
    }
    next();
  });
  const document=SwaggerModule.createDocument(app,new DocumentBuilder().setTitle('Empreinte Flex Retail API').setVersion('1.0').addCookieAuth('ef_session').build());
  SwaggerModule.setup('docs',app,document);
  await app.listen(Number(process.env.APP_PORT||3000),'0.0.0.0');
}
bootstrap().catch(e=>{console.error(e);process.exit(1);});
