import { Injectable } from '@angular/core';

import {
  NgbDateParserFormatter,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class ThaiDateFormatter
  extends NgbDateParserFormatter {

  parse(value: string): NgbDateStruct | null {

    if (!value) return null;

    const parts = value.split('/');

    if (parts.length !== 3) return null;

    return {
      day: +parts[0],
      month: +parts[1],
      year: +parts[2] - 543
    };
  }

  format(date: NgbDateStruct | null): string {

    if (!date) return '';

    const day =
      String(date.day).padStart(2, '0');

    const month =
      String(date.month).padStart(2, '0');

    const year =
      date.year + 543;

    return `${day}/${month}/${year}`;
  }
}