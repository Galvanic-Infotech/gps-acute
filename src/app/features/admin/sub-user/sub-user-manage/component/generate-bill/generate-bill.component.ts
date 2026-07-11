import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/features/http-services/notification.service';
import { ResellerService } from 'src/app/features/admin/reseller/service/reseller.service';

@Component({
  selector: 'app-generate-bill',
  templateUrl: './generate-bill.component.html',
  styleUrls: ['./generate-bill.component.scss']
})
export class GenerateBillComponent {
  billForm!: FormGroup;
  dealerId: any;
  routePath = 'admin/subuser/customer-sub-user';
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private resellerService: ResellerService,
    private notificationService: NotificationService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.dealerId = this.activeRoute.snapshot.paramMap.get('dealerId');
    this.billForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    });
  }

  submit(formValue: any) {
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = {
      dealerId: Number(this.dealerId),
      fromDate: formValue.fromDate,
      toDate: formValue.toDate,
    };
    this.resellerService.runBillingSummary(payload).subscribe((res: any) => {
      this.submitting = false;
      if (res?.body?.result === true || res?.status === 200) {
        this.notificationService.showSuccess(res?.body?.data || 'Bill generated');
        this.router.navigateByUrl(this.routePath);
      } else {
        this.notificationService.showError(
          res?.error?.Error?.Message || res?.error?.message || 'Failed to generate bill'
        );
      }
    });
  }

  cancel(event: any) {
    event.preventDefault();
    this.router.navigateByUrl(this.routePath);
  }
}
