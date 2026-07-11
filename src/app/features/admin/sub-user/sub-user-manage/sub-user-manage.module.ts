import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubUserManageRoutingModule } from './sub-user-manage-routing.module';
import { SubUserManageComponent } from './pages/sub-user-manage/sub-user-manage.component';
import { SubuserListComponent } from './component/subuser-list/subuser-list.component';
import { SubuserFilterComponent } from './component/subuser-filter/subuser-filter.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { ModifySubuserComponent } from './component/subuser-details/modify-subuser/modify-subuser.component';
import { SubuserVehicleComponent } from './component/subuser-details/subuser-vehicle/subuser-vehicle.component';
import { AddSubuserComponent } from './component/subuser-details/add-subuser/add-subuser.component';
import { SubuserLinkedVehiclesComponent } from './component/subuser-linked-vehicles/subuser-linked-vehicles.component';
import { MoveUserComponent } from './component/move-user/move-user.component';
import { BillingConfigComponent } from './component/billing-config/billing-config.component';
import { GenerateBillComponent } from './component/generate-bill/generate-bill.component';
import { AddCreditComponent } from './component/add-credit/add-credit.component';


@NgModule({
  declarations: [
    SubUserManageComponent,
    SubuserListComponent,
    SubuserFilterComponent,
    ModifySubuserComponent,
    SubuserVehicleComponent,
    AddSubuserComponent,
    SubuserLinkedVehiclesComponent,
    MoveUserComponent,
    BillingConfigComponent,
    GenerateBillComponent,
    AddCreditComponent
  ],
  imports: [
    CommonModule,
    SubUserManageRoutingModule,
    SharedModule
  ]
})
export class SubUserManageModule { }
