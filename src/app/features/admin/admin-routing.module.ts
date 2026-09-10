import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./dashboard/dashboard.module").then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: "",
    loadChildren: () =>
      import("./reseller/reseller.module").then(
        (m) => m.ResellerModule
      ),
  },
  {
    path: "customer",
    loadChildren: () =>
      import("./customer/customer.module").then(
        (m) => m.CustomerModule
      ),
  },
  {
    path: "subuser",
    loadChildren: () =>
      import("./sub-user/sub-user.module").then(
        (m) => m.SubUserModule
      ),
  },
  {
    path: "device",
    loadChildren: () =>
      import("./device/device.module").then(
        (m) => m.DeviceModule
      ),
  },
  {
    path: "reports",
    loadChildren: () =>
      import("./reports/reports.module").then(
        (m) => m.ReportsModule
      ),
  },
  {
    path: "point-summary",
    loadChildren: () =>
      import("./point-summary/point-summary.module").then(
        (m) => m.PointSummaryModule
      ),
  },

  {
    path: "admin-profile",
    loadChildren: () =>
      import("./profile/profile.module").then(
        (m) => m.ProfileModule
      ),
  },
  {
    path: "sim",
    loadChildren: () =>
      import("./sim-operator/sim-operator.module").then(
        (m) => m.SimOperatorModule
      ),
  },
  {
    path: "plan",
    loadChildren: () =>
      import("./plan-management/plan-management.module").then(
        (m) => m.PlanManagementModule
      ),
  },
  // ponytail: the overview page is gone - its old URLs (and any other stale admin link) land on the dashboard.
  // Angular only accepts ** as a whole path, so a scoped "overview/**" does not work here.
  {
    path: "**",
    redirectTo: "dashboard",
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
