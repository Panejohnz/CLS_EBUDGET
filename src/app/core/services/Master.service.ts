import { Injectable } from '@angular/core';

export interface CurrencyInputResult {
  formatted: string;
  raw: string;
  numeric: number;
}

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  /** อนุญาตเฉพาะตัวเลข (ไม่มีทศนิยม) */
  allowOnlyNumber(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Ctrl'];
    if (allowed.includes(event.key)) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  /** อนุญาตเฉพาะตัวเลขและจุดทศนิยม (ทศนิยมได้ครั้งเดียว) */
  allowNumericOnly(event: KeyboardEvent): void {
    const key = event.key;

    if (
      key === 'Backspace' ||
      key === 'Delete' ||
      key === 'Tab' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Home' ||
      key === 'End'
    ) {
      return;
    }

    if (/^[0-9]$/.test(key)) {
      return;
    }

    const input = event.target as HTMLInputElement;

    if (key === '.' && !input.value.replace(/,/g, '').includes('.')) {
      return;
    }

    event.preventDefault();
  }

  formatNumber(value: any, decimalPlaces = 2): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const number = Number(value.toString().replace(/,/g, ''));

    if (isNaN(number)) {
      return '';
    }

    return number.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  }

  formatCurrencyInput(value: string, decimalPlaces = 2): CurrencyInputResult {
    let raw = String(value || '').replace(/,/g, '');
    raw = raw.replace(/[^0-9.]/g, '');

    const dotIndex = raw.indexOf('.');

    if (dotIndex !== -1) {
      const integerPart = raw.slice(0, dotIndex);
      const decimalPart = raw.slice(dotIndex + 1).replace(/\./g, '').slice(0, decimalPlaces);
      raw = `${integerPart}.${decimalPart}`;
    }

    let integerPart = raw;
    let decimalPart: string | undefined;

    if (raw.includes('.')) {
      [integerPart, decimalPart] = raw.split('.');
    }

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const formatted =
      decimalPart !== undefined
        ? `${integerPart}.${decimalPart}`
        : integerPart;

    const numeric = raw === '' || raw === '.' ? 0 : parseFloat(raw) || 0;

    return {
      formatted,
      raw,
      numeric
    };
  }

  formatCurrency(
    event: Event,
    onChange: (result: CurrencyInputResult) => void,
    decimalPlaces = 2
  ): void {
    const input = event.target as HTMLInputElement;
    const result = this.formatCurrencyInput(input.value, decimalPlaces);
    input.value = result.formatted;
    onChange(result);
  }
}
