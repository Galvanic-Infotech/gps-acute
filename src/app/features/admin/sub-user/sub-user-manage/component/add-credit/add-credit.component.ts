import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/features/http-services/notification.service';
import { ResellerService } from 'src/app/features/admin/reseller/service/reseller.service';

@Component({
  selector: 'app-add-credit',
  templateUrl: './add-credit.component.html',
  styleUrls: ['./add-credit.component.scss']
})
export class AddCreditComponent {
  creditForm!: FormGroup;
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
    this.creditForm = this.fb.group({
      amount: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  submit(formValue: any) {
    if (this.creditForm.invalid) {
      this.creditForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = {
      dealerId: Number(this.dealerId),
      amount: Number(formValue.amount),
      description: formValue.description,
    };
    this.resellerService.addBillingCredit(payload).subscribe((res: any) => {
      this.submitting = false;
      if (res?.body?.result === true || res?.status === 200) {
        this.notificationService.showSuccess(res?.body?.data || 'Credit added successfully');
        this.router.navigateByUrl(this.routePath);
      } else {
        this.notificationService.showError(
          res?.error?.Error?.Message || res?.error?.message || 'Failed to add credit'
        );
      }
    });
  }

  cancel(event: any) {
    event.preventDefault();
    this.router.navigateByUrl(this.routePath);
  }
}
