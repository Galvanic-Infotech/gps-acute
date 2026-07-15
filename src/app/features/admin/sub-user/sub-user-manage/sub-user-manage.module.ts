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
import { AddCreditComponent } from './component/add-credit/add-credit.component';
import { OutstandingContainerComponent } from './component/outstanding/outstanding-container.component';
import { OutstandingListComponent } from './component/outstanding/outstanding-list.component';
import { SubuserBulkUploadComponent } from './component/subuser-bulk-upload/subuser-bulk-upload.component';
import { ViewTransactionsComponent } from './component/view-transactions/view-transactions.component';


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
    AddCreditComponent,
    OutstandingContainerComponent,
    OutstandingListComponent,
    SubuserBulkUploadComponent,
    ViewTransactionsComponent
  ],
  imports: [
    CommonModule,
    SubUserManageRoutingModule,
    SharedModule
  ]
})
export class SubUserManageModule { }
