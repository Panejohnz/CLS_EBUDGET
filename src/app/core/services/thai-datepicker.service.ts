import { Injectable } from '@angular/core';
import { FlatpickrDirective } from 'angularx-flatpickr';

@Injectable({ providedIn: 'root' })
export class ThaiDatepickerService {
  private readonly thaiCalendarAttached = new WeakSet<any>();

  readonly flatpickrLocale = {
    weekdays: {
      shorthand: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
      longhand: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
    },
    months: {
      shorthand: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
      longhand: [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
      ],
    },
    firstDayOfWeek: 1,
    rangeSeparator: ' ถึง ',
    scrollTitle: 'เลื่อนเพื่อเพิ่มหรือลด',
    toggleTitle: 'คลิกเพื่อเปลี่ยน',
    time_24hr: true,
    ordinal: () => '',
  };

  /** แสดงวันที่แบบ วว/ดด/ปปปป (พ.ศ.) ใน input */
  formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543;

    return `${day}/${month}/${year}`;
  };

  /** แสดงวันที่จากค่าหลังบ้าน — ใช้ใน table / view (ไม่สลับ วัน/เดือน) */
  formatDisplay(value: unknown, fallback = '-'): string {
    const date = this.toDate(value);
    if (!date) {
      return fallback;
    }
    return this.formatDate(date);
  }

  toDate(value: unknown): Date | null {
    if (value == null || value === '') {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const str = String(value).trim();

    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      const parsed = new Date(year, month, day);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (str.includes('/')) {
      const parsed = this.parseDate(str);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }

  parseDate(datestr: string): Date {
    if (!datestr) {
      return new Date();
    }

    const parts = datestr.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year >= 2400) {
        year -= 543;
      }
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    const isoMatch = datestr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }

  getFlatpickrOptions(): Record<string, any> {
    return {
      locale: this.flatpickrLocale,
      clickOpens: true,
      allowInput: true,
      parseDate: (datestr: string) => this.parseDate(datestr),
    };
  }

  open(picker: FlatpickrDirective): void {
    picker?.instance?.open();
    this.updateThaiBuddhistYearDisplayLater(picker?.instance);
  }

  attachThaiBuddhistCalendar(eventOrInstance: any): void {
    const instance = eventOrInstance?.instance || eventOrInstance;
    this.updateThaiBuddhistYearDisplay(instance);
    this.updateThaiBuddhistYearDisplayLater(instance);

    if (this.thaiCalendarAttached.has(instance)) {
      return;
    }
    this.thaiCalendarAttached.add(instance);

    const yearInput = instance.currentYearElement as HTMLInputElement | undefined;
    if (!yearInput) {
      return;
    }

    yearInput.addEventListener('input', () => {
      const beYear = parseInt(yearInput.value, 10);
      if (Number.isNaN(beYear)) {
        return;
      }

      const ceYear = beYear >= 2400 ? beYear - 543 : beYear;
      if (ceYear !== instance.currentYear) {
        instance.changeYear(ceYear);
      }
    });

    yearInput.addEventListener('blur', () => {
      this.updateThaiBuddhistYearDisplay(instance);
    });
  }

  updateThaiBuddhistYearDisplay(eventOrInstance: any): void {
    const instance = eventOrInstance?.instance || eventOrInstance;
    if (!instance) {
      return;
    }

    const yearInput = instance.currentYearElement as HTMLInputElement | undefined;
    if (!yearInput) {
      return;
    }

    yearInput.value = String(instance.currentYear + 543);
  }

  updateThaiBuddhistYearDisplayLater(eventOrInstance: any): void {
    const instance = eventOrInstance?.instance || eventOrInstance;

    if (!instance) {
      return;
    }

    setTimeout(() => this.updateThaiBuddhistYearDisplay(instance));
  }
}
