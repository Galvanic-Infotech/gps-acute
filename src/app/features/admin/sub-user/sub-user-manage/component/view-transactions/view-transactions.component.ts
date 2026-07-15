import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as XLSX from 'xlsx';
import { ResellerService } from 'src/app/features/admin/reseller/service/reseller.service';
import { NotificationService } from 'src/app/features/http-services/notification.service';

@Component({
  selector: 'app-view-transactions',
  templateUrl: './view-transactions.component.html',
  styleUrls: ['./view-transactions.component.scss'],
})
export class ViewTransactionsComponent {
  dealerId: any;
  dealerName = '';
  spinnerLoading = false;
  exporting = false;
  items: any[] = [];
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  fromDate = '';
  toDate = '';
  transactionType = '';

  transactionTypes = [
    { value: '', label: 'All' },
    { value: '1', label: 'Credit' },
    { value: '2', label: 'Debit' },
  ];

  constructor(
    private resellerService: ResellerService,
    private notificationService: NotificationService,
    public bsModalRef: BsModalRef,
  ) {}

  ngOnInit() {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    this.toDate = this.formatDate(today);
    this.fromDate = this.formatDate(first);
    this.load();
  }

  formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  load() {
    if (!this.dealerId || !this.fromDate || !this.toDate) return;
    this.spinnerLoading = true;
    this.resellerService
      .getBillingTransactions({
        dealerId: this.dealerId,
        fromDate: this.fromDate,
        toDate: this.toDate,
        pageNumber: this.page,
        pageSize: this.pageSize,
        transactionType: this.transactionType || undefined,
      })
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

  onFilter() {
    this.page = 1;
    this.load();
  }

  onPageChange(next: number) {
    if (next < 1 || (this.totalPages && next > this.totalPages)) return;
    this.page = next;
    this.load();
  }

  exportToExcel() {
    if (!this.dealerId || !this.fromDate || !this.toDate) return;
    if (this.totalCount === 0 && this.items.length === 0) {
      this.notificationService.showError('No data available to export');
      return;
    }
    this.exporting = true;
    this.resellerService
      .getBillingTransactions({
        dealerId: this.dealerId,
        fromDate: this.fromDate,
        toDate: this.toDate,
        pageNumber: 1,
        pageSize: Math.max(this.totalCount, this.items.length, 1),
        transactionType: this.transactionType || undefined,
      })
      .subscribe((res: any) => {
        this.exporting = false;
        const body = res?.body ?? res;
        const rows = body?.data?.items || [];
        if (!rows.length) {
          this.notificationService.showError('No data available to export');
          return;
        }
        const data = rows.map((row: any, i: number) => ({
          'Sno.': i + 1,
          'Billing Date': row?.billingDate || '',
          'Type': row?.transactionType || '',
          'Devices': row?.deviceCount ?? '',
          'Amount': row?.totalAmount ?? '',
          'Balance After': row?.balanceAfter ?? '',
          'Description': row?.description || '',
          'Created': row?.creationTime
            ? new Date(row.creationTime).toLocaleString('en-GB')
            : '',
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        const name = this.dealerName ? this.dealerName.replace(/\s+/g, '_') : 'Dealer';
        XLSX.writeFile(wb, `${name}_Transactions_${this.fromDate}_to_${this.toDate}.xlsx`);
      });
  }
}
