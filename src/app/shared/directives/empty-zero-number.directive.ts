import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: 'input[mask][ngModel]'
})
export class EmptyZeroNumberDirective implements AfterViewInit {

  constructor(private elementRef: ElementRef<HTMLInputElement>) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const input = this.elementRef.nativeElement;
      const value = String(input.value || '').replace(/,/g, '').trim();

      if (value === '0' || value === '0.0' || value === '0.00') {
        input.value = '';
      }
    });
  }

}
