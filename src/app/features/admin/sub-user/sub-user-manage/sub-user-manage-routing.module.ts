import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubUserManageComponent } from './pages/sub-user-manage/sub-user-manage.component';
import { AddSubuserComponent } from './component/subuser-details/add-subuser/add-subuser.component';
import { SubuserVehicleComponent } from './component/subuser-details/subuser-vehicle/subuser-vehicle.component';
import { BillingConfigComponent } from './component/billing-config/billing-config.component';
import { GenerateBillComponent } from './component/generate-bill/generate-bill.component';
import { AddCreditComponent } from './component/add-credit/add-credit.component';

const routes: Routes = [
  {
    path:'customer-sub-user', component: SubUserManageComponent,
    children: [
      { path: ':id/:cusID/add-subuser', component: AddSubuserComponent },
      { path: ':id/:cusID/:subUserId/modify-subuser', component: AddSubuserComponent },
      { path: ':id/:cusID/:subUserId/device-mapping', component: SubuserVehicleComponent },
      { path: ':dealerId/billing-config', component: BillingConfigComponent },
      { path: ':dealerId/generate-bill', component: GenerateBillComponent },
      { path: ':dealerId/add-credit', component: AddCreditComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubUserManageRoutingModule { }
