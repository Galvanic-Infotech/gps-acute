import { Component, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ResellerService } from 'src/app/features/admin/reseller/service/reseller.service';
import { BillingConfigComponent } from '../billing-config/billing-config.component';
import { AddCreditComponent } from '../add-credit/add-credit.component';

@Component({
  selector: 'outstanding-list',
  templateUrl: './outstanding-list.component.html',
  styleUrls: ['./outstanding-list.component.scss'],
})
export class OutstandingListComponent {
  spinnerLoading = false;
  items: any[] = [];
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  searchTerm = '';
  private searchSub$ = new Subject<string>();

  columns = [
    { key: 'sno', title: 'Sno.' },
    { key: 'dealerName', title: 'Dealer Name' },
    { key: 'loginId', title: 'Login Id' },
    { key: 'mobileNo', title: 'Mobile No' },
    { key: 'creditLimit', title: 'Credit Limit' },
    { key: 'currentOutstanding', title: 'Outstanding' },
    { key: 'taxRate', title: 'Tax %' },
    { key: 'lastUpdateOn', title: 'Last Update' },
    { key: 'action', title: 'Action' },
  ];

  contextMenuPosition = { x: '0px', y: '0px' };
  contextMenuItems: { path: string; name: string }[] = [];
  selectedRow: any;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger | any;

  constructor(
    private resellerService: ResellerService,
    private modalService: BsModalService,
  ) {}

  ngOnInit() {
    this.load();
    this.searchSub$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.load();
      });
  }

  load() {
    this.spinnerLoading = true;
    this.resellerService
      .getOutstanding(this.page, this.pageSize, this.searchTerm)
      .subscribe((res: any) => {
        this.spinnerLoading = false;
        const body = res?.body ?? res;
        if (body?.result === true && body?.data) {
          this.items = body.data.items || [];
          this.totalCount = body.data.totalCount || 0;
          this.totalPages = body.data.totalPages || 0;
        } else {
          this.items = [];
          this.totalCount = 0;
          this.totalPages = 0;
        }
      });
  }

  onSearchChange() {
    this.searchSub$.next(this.searchTerm);
  }

  onPageChange(next: number) {
    if (next < 1 || (this.totalPages && next > this.totalPages)) return;
    this.page = next;
    this.load();
  }

  isBillingEnabled(row: any): boolean {
    return row?.lastUpdateOn != null;
  }

  onContextMenu(event: MouseEvent, row: any) {
    event.preventDefault();
    this.selectedRow = row;
    this.contextMenuItems = this.isBillingEnabled(row)
      ? [
          { path: 'billing-config', name: 'Billing Config' },
          { path: 'add-credit', name: 'Add Credit' },
        ]
      : [{ path: 'billing-config', name: 'Billing Config' }];
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { row };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  redirectTo(path: string) {
    const row = this.selectedRow;
    if (!row?.dealerId) return;

    const initialState: ModalOptions = {
      initialState: {
        dealerId: row.dealerId,
        dealerName: row.dealerName || row.loginId || '',
      },
    };
    const modalClass = { class: 'modal-md modal-dialog-centered' };

    if (path === 'billing-config') {
      const ref = this.modalService.show(
        BillingConfigComponent,
        Object.assign(initialState, modalClass)
      );
      ref?.content?.saved?.subscribe(() => this.load());
    } else if (path === 'add-credit') {
      const ref = this.modalService.show(
        AddCreditComponent,
        Object.assign(initialState, modalClass)
      );
      ref?.content?.saved?.subscribe(() => this.load());
    }
  }
}
