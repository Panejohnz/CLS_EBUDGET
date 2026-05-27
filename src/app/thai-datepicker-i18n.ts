import { Injectable } from '@angular/core';

import {
  NgbDatepickerI18n
} from '@ng-bootstrap/ng-bootstrap';

const I18N_VALUES = {
  weekdays: ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'],
  months: [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.'
  ]
};

@Injectable()
export class ThaiDatepickerI18n
  extends NgbDatepickerI18n {

  getWeekdayLabel(
    weekday: number
  ): string {

    return I18N_VALUES.weekdays[weekday - 1];
  }

  getMonthShortName(
    month: number
  ): string {

    return I18N_VALUES.months[month - 1];
  }

  getMonthFullName(
    month: number
  ): string {

    return I18N_VALUES.months[month - 1];
  }

  getDayAriaLabel(
    date: any
  ): string {

    return `${date.day}-${date.month}-${date.year}`;
  }
}