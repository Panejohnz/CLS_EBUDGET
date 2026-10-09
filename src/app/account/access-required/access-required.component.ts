import { Component } from '@angular/core';

@Component({
  selector: 'app-access-required',
  templateUrl: './access-required.component.html',
  styleUrls: ['./access-required.component.scss']
})
export class AccessRequiredComponent {
  goToLogin(): void {
    window.location.href = 'https://bfast.pacc.go.th/cls_erp_management_front/';
  }
}
