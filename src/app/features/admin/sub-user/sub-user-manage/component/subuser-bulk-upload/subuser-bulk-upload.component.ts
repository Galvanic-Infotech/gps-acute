import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { NotificationService } from 'src/app/features/http-services/notification.service';
import { Router } from '@angular/router';
import { SubUserService } from '../../services/sub-user.service';
import { RefreshCustomerService } from 'src/app/features/shared/services/refresh-customer.service';

interface BulkRow {
  loginId: string;
  userName: string;
  password: string;
  mobileNo: string;
  email: string;
  userType: number;
  address: string;
  isActive: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  errorMessage: string;
}

@Component({
  selector: 'app-subuser-bulk-upload',
  templateUrl: './subuser-bulk-upload.component.html',
  styleUrls: ['./subuser-bulk-upload.component.scss']
})
export class SubuserBulkUploadComponent {
  spinnerLoading = false;
  selectedFile: File | null = null;
  selectedFileName = '';
  columns: any[] = [];
  bulkUserData: BulkRow[] = [];
  page = 1;
  count = 0;
  tableSize = 10;
  isUploading = false;
  processedCount = 0;

  readonly sampleColumns: string[] = [
    'loginId',
    'userName',
    'password',
    'mobileNo',
    'email',
    'userType',
    'address',
    'isActive',
  ];

  constructor(
    private subUserService: SubUserService,
    private notificationService: NotificationService,
    private router: Router,
    private refreshCustomerService: RefreshCustomerService,
  ) {}

  ngOnInit() {
    this.columns = [
      { key: 'loginId', title: 'Login Id' },
      { key: 'userName', title: 'Name' },
      { key: 'mobileNo', title: 'Mobile No' },
      { key: 'email', title: 'Email' },
      { key: 'userType', title: 'User Type' },
      { key: 'isActive', title: 'Active' },
      { key: 'status', title: 'Status' },
      { key: 'errorMessage', title: 'Error' },
    ];
  }

  downloadExcel() {
    // ponytail: client-side sample (no backend endpoint for user bulk). Swap to API download if one gets added.
    const sample = [
      { loginId: 'user1', userName: 'User One', password: 'Abc@123', mobileNo: '9999999999', email: 'user1@example.com', userType: 2, address: '', isActive: 1 },
      { loginId: 'user2', userName: 'User Two', password: 'Abc@123', mobileNo: '8888888888', email: '', userType: 2, address: '', isActive: 1 },
    ];
    const ws = XLSX.utils.json_to_sheet(sample, { header: this.sampleColumns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'user_upload_sample.xlsx');
    this.notificationService.showSuccess('Sample file downloaded successfully');
  }

  selectFile(event: any): void {
    event.preventDefault();
    const fileInput = document.getElementById('userExcelFileInput');
    if (fileInput) fileInput.click();
  }

  uploadExcel(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput?.files?.length) return;
    this.selectedFile = fileInput.files[0];
    this.selectedFileName = fileInput.files[0].name;
    this.previewSelectedFile();
  }

  private previewSelectedFile() {
    if (!this.selectedFile) return;
    this.bulkUserData = [];
    this.count = 0;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = this.parseSheetRows(ws);
        if (!rows.length) {
          this.notificationService.showError('No data found in uploaded file');
          return;
        }
        this.bulkUserData = rows;
        this.count = rows.length;
        this.page = 1;
      } catch {
        this.notificationService.showError('Unable to read uploaded file');
      }
    };
    reader.onerror = () => this.notificationService.showError('Unable to read uploaded file');
    reader.readAsArrayBuffer(this.selectedFile);
  }

  async getBulkUserList() {
    if (!this.bulkUserData.length) {
      this.notificationService.showError('No rows to upload');
      return;
    }
    this.isUploading = true;
    this.processedCount = 0;
    const now = Math.floor(Date.now() / 1000);

    // ponytail: sequential loop, one addUser API call per row (no batch API). Add throttled parallelism if bulk sizes get large.
    for (const row of this.bulkUserData) {
      const payload = {
        id: 0,
        loginId: row.loginId,
        fkParentId: 0,
        fkCustomerId: 0,
        userName: row.userName || row.loginId,
        email: row.email,
        password: row.password || 'Abc@123',
        mobileNo: row.mobileNo,
        userType: row.userType,
        address: row.address,
        userCategory: null,
        timezone: 'Asia/Calcutta',
        creationTime: now,
        lastUpdateOn: now,
        isActive: row.isActive,
      };
      try {
        const res: any = await this.subUserService.addUser(payload).toPromise();
        if (res?.body?.result === true) {
          row.status = 'SUCCESS';
          row.errorMessage = '';
        } else {
          row.status = 'FAILED';
          row.errorMessage = res?.body?.message || res?.error?.message || 'Failed';
        }
      } catch (e: any) {
        row.status = 'FAILED';
        row.errorMessage = e?.error?.message || e?.message || 'Error';
      }
      this.processedCount++;
    }

    this.isUploading = false;
    const okCount = this.bulkUserData.filter(r => r.status === 'SUCCESS').length;
    const failed = this.bulkUserData.length - okCount;
    if (failed === 0) {
      this.notificationService.showSuccess(`All ${okCount} users created successfully`);
    } else {
      this.notificationService.showError(`${failed} failed, ${okCount} succeeded`);
    }
    if (okCount) this.refreshCustomerService.announceCustomerAdded();
  }

  refreshPage() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.bulkUserData = [];
    this.count = 0;
    this.processedCount = 0;
    const fileInput = document.getElementById('userExcelFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onTableDataChange(event: any) {
    this.page = event;
  }

  private parseSheetRows(worksheet: XLSX.WorkSheet): BulkRow[] {
    const matrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    if (!matrix?.length) return [];

    const normalize = (v: any) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = this.sampleColumns.map(normalize);

    let headerRowIndex = -1;
    let headerIndexes: number[] = [];
    let maxMatches = 0;
    const scanLimit = Math.min(matrix.length, 10);

    for (let r = 0; r < scanLimit; r++) {
      const row = matrix[r] || [];
      const norm = row.map((h: any) => normalize(h));
      const idx = target.map(t => norm.indexOf(t));
      const matches = idx.filter(i => i >= 0).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        headerRowIndex = r;
        headerIndexes = idx;
      }
    }
    if (headerRowIndex === -1 || maxMatches < 2) return [];

    const out: BulkRow[] = [];
    for (let r = headerRowIndex + 1; r < matrix.length; r++) {
      const src = matrix[r] || [];
      const get = (i: number) => (headerIndexes[i] >= 0 ? src[headerIndexes[i]] : '');
      const loginId = String(get(0) ?? '').trim();
      const mobileNo = String(get(3) ?? '').trim();
      if (!loginId || !/^[0-9]{10}$/.test(mobileNo)) continue;

      out.push({
        loginId,
        userName: String(get(1) ?? '').trim() || loginId,
        password: String(get(2) ?? '').trim() || 'Abc@123',
        mobileNo,
        email: String(get(4) ?? '').trim(),
        userType: Number(get(5) || 2) || 2,
        address: String(get(6) ?? '').trim(),
        isActive: Number(get(7) ?? 1),
        status: 'PENDING',
        errorMessage: '',
      });
    }
    return out;
  }
}
