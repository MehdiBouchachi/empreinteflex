import { Module } from '@nestjs/common';
import { ContactController } from './contact/contact.controller';
import { MediaController,MediaAdminController } from './media/media.controller';
import { Database } from './db/database';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { SessionGuard } from './auth/session.guard';
import { PlatformController } from './platform/platform.controller';
import { CatalogController, CatalogAdminController } from './catalog/catalog.controller';
import { InventoryController } from './inventory/inventory.controller';
import { StaffController, TeamAdminController, CustomerHistoryController } from './staff/staff.controller';
import { PosController,CheckoutController,CustomerOrdersController,MyOrdersController,StaffOrdersController } from './commerce/commerce.controller';
@Module({
  controllers:[ContactController,MediaController,MediaAdminController,AuthController,PlatformController,CatalogController,CatalogAdminController,
    InventoryController,StaffController,TeamAdminController,CustomerHistoryController,PosController,CheckoutController,
    CustomerOrdersController,MyOrdersController,StaffOrdersController],
  providers:[Database,AuthService,SessionGuard]
})
export class AppModule {}
