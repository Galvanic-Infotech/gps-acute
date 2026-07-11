import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NotificationService } from 'src/app/features/http-services/notification.service';
import { ResellerService } from 'src/app/features/admin/reseller/service/reseller.service';

@Component({
  selector: 'app-billing-config',
  templateUrl: './billing-config.component.html',
  styleUrls: ['./billing-config.component.scss']
})
export class BillingConfigComponent {
  billingForm!: FormGroup;
  dealerId: any;
  dealerName = '';
  isEditMode = false;
  spinnerLoading = false;
  @Output() saved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private resellerService: ResellerService,
    private notificationService: NotificationService,
    public bsModalRef: BsModalRef,
  ) {}

  ngOnInit() {
    this.billingForm = this.fb.group({
      creditLimit: [0, [Validators.required]],
      currentOutstanding: [0, [Validators.required]],
      taxRate: [18, [Validators.required]],
      yearInDays: [365, [Validators.required]],
      yearlyAmount: [0, [Validators.required]],
    });
    this.loadBillingConfig();
  }

  loadBillingConfig() {
    if (!this.dealerId) return;
    this.spinnerLoading = true;
    this.resellerService.getBillingConfig(this.dealerId).subscribe((res: any) => {
      this.spinnerLoading = false;
      const data = res?.body?.data ?? res?.body?.Data ?? res?.data;
      if (data) {
        this.isEditMode = true;
        this.billingForm.patchValue({
          creditLimit: data.creditLimit ?? 0,
          currentOutstanding: data.currentOutstanding ?? 0,
          taxRate: data.taxRate ?? 18,
          yearInDays: data.yearInDays ?? 365,
          yearlyAmount: data.yearlyAmount ?? 0,
        });
      }
    });
  }

  submit(formValue: any) {
    if (this.billingForm.invalid) {
      this.billingForm.markAllAsTouched();
      return;
    }

    const fields = {
      creditLimit: Number(formValue.creditLimit),
      currentOutstanding: Number(formValue.currentOutstanding),
      taxRate: Number(formValue.taxRate),
      yearInDays: Number(formValue.yearInDays),
      yearlyAmount: Number(formValue.yearlyAmount),
    };

    const request$ = this.isEditMode
      ? this.resellerService.updateBillingConfig(this.dealerId, fields)
      : this.resellerService.createBillingConfig({ dealerId: Number(this.dealerId), ...fields });

    request$.subscribe((res: any) => {
      if (res?.body?.result === true || res?.body?.Result || res?.status === 200 || res?.ok) {
        this.notificationService.showSuccess(
          this.isEditMode ? 'Billing config updated successfully' : 'Billing config created successfully'
        );
        this.saved.emit();
        this.bsModalRef.hide();
      } else {
        this.notificationService.showError(
          res?.error?.Error?.Message || res?.error?.message || 'Something went wrong'
        );
      }
    });
  }

  cancel(event: any) {
    event.preventDefault();
    this.bsModalRef.hide();
  }
}
