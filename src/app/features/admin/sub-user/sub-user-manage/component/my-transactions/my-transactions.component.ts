import { Component } from '@angular/core';
import { ResellerService } from 'src/app/features/admin/reseller/service/reseller.service';

@Component({
  selector: 'app-my-transactions',
  templateUrl: './my-transactions.component.html',
  styleUrls: ['./my-transactions.component.scss'],
})
export class MyTransactionsComponent {
  spinnerLoading = false;
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

  constructor(private resellerService: ResellerService) {}

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
    if (!this.fromDate || !this.toDate) return;
    this.spinnerLoading = true;
    this.resellerService
      .getLoggedInUserTransactions({
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
}
