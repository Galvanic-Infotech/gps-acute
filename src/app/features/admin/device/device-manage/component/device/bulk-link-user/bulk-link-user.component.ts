import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SubUserService } from 'src/app/features/admin/sub-user/sub-user-manage/services/sub-user.service';
import { DeviceManageService } from '../../../service/device-manage.service';
import { NotificationService } from 'src/app/features/http-services/notification.service';

@Component({
  selector: 'app-bulk-link-user',
  templateUrl: './bulk-link-user.component.html',
  styleUrls: ['./bulk-link-user.component.scss']
})
export class BulkLinkUserComponent implements OnInit {
  @Output() mapdata = new EventEmitter<any>();
  selectedDevices: any[] = [];
  userList: any[] = [];
  filteredUserList: any[] = [];
  selectedUserId: number | null = null;
  searchTerm: string = '';
  isLoadingUsers: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    public bsModalRef: BsModalRef,
    private subUserService: SubUserService,
    private deviceManageService: DeviceManageService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.subUserService.userList(null, null).subscribe((res: any) => {
      this.isLoadingUsers = false;
      if (res?.status === 200 && res?.body?.result === true) {
        this.userList = (res?.body?.data || []).filter((item: any) =>
          item.userType === 1 || item.userType === 2
        );
        this.applySearch();
      } else {
        this.userList = [];
        this.filteredUserList = [];
      }
    }, () => {
      this.isLoadingUsers = false;
      this.userList = [];
      this.filteredUserList = [];
    });
  }

  applySearch() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) {
      this.filteredUserList = [...this.userList];
    } else {
      this.filteredUserList = this.userList.filter((user: any) => {
        const mobileNo = (user.mobileNo || '').toString().toLowerCase();
        const loginId = (user.loginId || '').toString().toLowerCase();
        const name = (user.userName || '').toString().toLowerCase();
        return mobileNo.includes(term) || loginId.includes(term) || name.includes(term);
      });
    }
  }

  getUserTypeLabel(userType: number): string {
    return userType === 1 ? 'Dealer' : userType === 2 ? 'Customer' : 'N/A';
  }

  linkUserToDevices() {
    if (!this.selectedUserId) {
      this.notificationService.showError('Please select a user');
      return;
    }

    if (!this.selectedDevices || this.selectedDevices.length === 0) {
      this.notificationService.showError('No devices selected');
      return;
    }

    this.isSubmitting = true;
    let completed = 0;
    let successCount = 0;
    let failCount = 0;
    const total = this.selectedDevices.length;

    for (let i = 0; i < this.selectedDevices.length; i++) {
      const device = this.selectedDevices[i];
      const deviceId = device?.id || device?.Id;

      if (!deviceId) {
        completed++;
        failCount++;
        if (completed === total) {
          this.finishLinking(successCount, failCount);
        }
        continue;
      }

      const payload = {
        userId: [this.selectedUserId],
        deviceId: deviceId
      };

      this.deviceManageService.createDeviceMapping(payload).subscribe((res: any) => {
        completed++;
        if ((res?.status === 200 || res?.status === 201) && res?.body?.result === true) {
          successCount++;
        } else {
          failCount++;
        }

        if (completed === total) {
          this.finishLinking(successCount, failCount);
        }
      }, () => {
        completed++;
        failCount++;
        if (completed === total) {
          this.finishLinking(successCount, failCount);
        }
      });
    }
  }

  private finishLinking(successCount: number, failCount: number) {
    this.isSubmitting = false;

    if (successCount > 0 && failCount === 0) {
      this.notificationService.showSuccess(`${successCount} device(s) linked to user successfully`);
      this.mapdata.emit({ success: true, successCount, failCount });
      this.bsModalRef.hide();
    } else if (successCount > 0 && failCount > 0) {
      this.notificationService.showSuccess(`${successCount} device(s) linked. ${failCount} failed.`);
      this.mapdata.emit({ success: true, successCount, failCount });
      this.bsModalRef.hide();
    } else {
      this.notificationService.showError('Failed to link devices to user');
    }
  }

  cancel() {
    this.bsModalRef.hide();
  }
}
