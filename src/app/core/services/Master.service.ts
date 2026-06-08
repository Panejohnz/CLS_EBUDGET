import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  /** อนุญาตเฉพาะตัวเลขและปุ่มควบคุมพื้นฐาน (ใช้กับ keydown บน input) */
  allowOnlyNumber(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Ctrl'];
    if (allowed.includes(event.key)) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
