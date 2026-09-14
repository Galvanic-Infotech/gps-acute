import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DeviceManageService } from '../../../service/device-manage.service';

@Component({
  selector: 'app-device-type-view',
  templateUrl: './device-type-view.component.html'
})
export class DeviceTypeViewComponent {
  deviceTypes: any[] = [];
  loading = false;

  constructor(
    public bsModalRef: BsModalRef,
    private deviceManageService: DeviceManageService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.deviceManageService.getDeviceTypes().subscribe((res: any) => {
      this.loading = false;
      const data = res?.body?.data ?? res?.data;
      this.deviceTypes = Array.isArray(data) ? data : [];
    }, () => {
      this.loading = false;
      this.deviceTypes = [];
    });
  }

  close() {
    this.bsModalRef.hide();
  }
}
