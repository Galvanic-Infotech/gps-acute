import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubUserManageComponent } from './pages/sub-user-manage/sub-user-manage.component';
import { AddSubuserComponent } from './component/subuser-details/add-subuser/add-subuser.component';
import { SubuserVehicleComponent } from './component/subuser-details/subuser-vehicle/subuser-vehicle.component';
import { OutstandingContainerComponent } from './component/outstanding/outstanding-container.component';

const routes: Routes = [
  {
    path:'customer-sub-user', component: SubUserManageComponent,
    children: [
      { path: ':id/:cusID/add-subuser', component: AddSubuserComponent },
      { path: ':id/:cusID/:subUserId/modify-subuser', component: AddSubuserComponent },
      { path: ':id/:cusID/:subUserId/device-mapping', component: SubuserVehicleComponent },
    ]
  },
  {
    path: 'outstanding', component: OutstandingContainerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubUserManageRoutingModule { }
