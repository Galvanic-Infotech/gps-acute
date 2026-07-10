import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SubUserService } from '../../services/sub-user.service';
import { NotificationService } from 'src/app/features/http-services/notification.service';

@Component({
  selector: 'move-user',
  templateUrl: './move-user.component.html',
  styleUrls: ['./move-user.component.scss']
})
export class MoveUserComponent implements OnInit {
  sourceUser: any;
  @Output() moved = new EventEmitter<any>();

  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  selectedTargetId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  page: number = 1;
  count: number = 0;
  tableSize: number = 10;

  constructor(
    public bsModalRef: BsModalRef,
    private subUserService: SubUserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.subUserService.userList(null, null).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.status === 200 && res?.body?.result === true) {
        const sourceId = this.sourceUser?.id;
        // ponytail: reuse existing userList; filter dealers/customers, exclude source
        this.users = (res?.body?.data || []).filter((u: any) =>
          (u.userType === 1 || u.userType === 2) && u.id !== sourceId
        );
        this.applySearch();
      } else {
        this.users = [];
        this.filteredUsers = [];
        this.count = 0;
      }
    }, () => {
      this.isLoading = false;
      this.users = [];
      this.filteredUsers = [];
      this.count = 0;
    });
  }

  applySearch() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter((u: any) => {
        const mobileNo = (u.mobileNo || '').toString().toLowerCase();
        const loginId = (u.loginId || '').toString().toLowerCase();
        const name = (u.userName || '').toString().toLowerCase();
        return mobileNo.includes(term) || loginId.includes(term) || name.includes(term);
      });
    }
    this.count = this.filteredUsers.length;
    this.page = 1;
  }

  onTableDataChange(event: any) {
    this.page = event;
  }

  selectTarget(id: number) {
    this.selectedTargetId = id;
  }

  submit() {
    if (!this.sourceUser?.id) {
      this.notificationService.showError('Source user is missing');
      return;
    }
    if (!this.selectedTargetId) {
      this.notificationService.showError('Please select a target user');
      return;
    }

    const payload = {
      users: [this.sourceUser.id],
      moveTo: this.selectedTargetId
    };

    this.isSubmitting = true;
    this.subUserService.moveUser(payload).subscribe((res: any) => {
      this.isSubmitting = false;
      if ((res?.status === 200 || res?.status === 201) && res?.body?.result === true) {
        const item = (res?.body?.data || [])[0];
        if (item && item.success === false) {
          this.notificationService.showError(item?.message || 'Failed to move user');
          return;
        }
        this.notificationService.showSuccess('User moved successfully');
        this.moved.emit({ success: true });
        this.bsModalRef.hide();
      } else {
        const msg = res?.error?.message || res?.body?.message || 'Failed to move user';
        this.notificationService.showError(msg);
      }
    }, (error: any) => {
      this.isSubmitting = false;
      const msg = error?.error?.message || error?.message || 'Failed to move user';
      this.notificationService.showError(msg);
    });
  }

  close() {
    this.bsModalRef.hide();
  }
}
