import {
    Component,
    ElementRef,
    ViewChild,
    HostListener,
    EventEmitter,
    Output,
    Input,
    OnInit,
    OnChanges,
    SimpleChanges,
    ChangeDetectorRef,
    AfterViewChecked
} from '@angular/core';

@Component({
    selector: 'app-thai-date-picker',
    templateUrl: './thai-date-picker.component.html',
    styleUrls: ['./thai-date-picker.component.scss']
})
export class ThaiDatePickerComponent implements OnInit, OnChanges, AfterViewChecked {

    @ViewChild('calendarRef') calendarRef!: ElementRef;
    @ViewChild('inputRef') inputRef!: ElementRef;
    @ViewChild('popupRef') popupRef!: ElementRef;

    @Input() value: string | Date | any = '';
    @Input() showTime: boolean = false;
    /** ช่องเล็ก ฟอนต์เล็ก (ใช้ในตาราง BillItem / welfare modal) */
    @Input() compact: boolean = false;

    @Output() dateChange = new EventEmitter<Date | null>();
    @Output() valueChange = new EventEmitter<string>();

    selectedDate: Date | null = null;
    inputValue = '';
    previousInputValue = '';
    showCalendar = false;
    popupStyle: any = {};

    // Time variables
    selectedHour = 0;
    selectedMinute = 0;
    hours = Array.from({ length: 24 }, (_, i) => i);
    minutes = Array.from({ length: 60 }, (_, i) => i);

    constructor(private cdr: ChangeDetectorRef) { }
    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    viewMode: 'days' | 'months' | 'years' = 'days';

    yearGridStart = Math.floor(new Date().getFullYear() / 12) * 12;

    dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

    thaiMonthsShort = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    @HostListener('document:mousedown', ['$event'])
    clickOutside(event: MouseEvent) {
        if (!this.calendarRef.nativeElement.contains(event.target)) {
            this.showCalendar = false;
        }
    }

    ngAfterViewChecked() {
        if (this.showCalendar) {
            setTimeout(() => this.updatePopupPosition(), 0);
        }
    }

    @HostListener('window:scroll')
    onScroll() {
        if (this.showCalendar) {
            this.updatePopupPosition();
        }
    }

    @HostListener('window:resize')
    onResize() {
        if (this.showCalendar) {
            this.updatePopupPosition();
        }
    }

    updatePopupPosition() {
        if (this.showCalendar && this.inputRef && this.inputRef.nativeElement) {
            const inputEl = this.inputRef.nativeElement;
            const rect = inputEl.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollX = window.scrollX || window.pageXOffset;

            // คำนวณตำแหน่งโดยคำนึงถึง scroll
            let top = rect.bottom + 8 + scrollY;
            let left = rect.left + scrollX;

            // ตรวจสอบว่าตำแหน่งจะเกินหน้าจอหรือไม่
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const popupHeight = 450; // ความสูงประมาณของ calendar popup
            const popupWidth = 320; // ความกว้างของ calendar popup

            // ถ้าจะเกินด้านล่าง ให้แสดงด้านบนแทน
            if (rect.bottom + popupHeight > viewportHeight + scrollY && rect.top > popupHeight) {
                top = rect.top - popupHeight - 8 + scrollY;
            }

            // ถ้าจะเกินด้านขวา ให้ปรับตำแหน่ง
            if (left + popupWidth > viewportWidth + scrollX) {
                left = viewportWidth + scrollX - popupWidth - 8;
            }

            // ถ้าจะเกินด้านซ้าย
            if (left < scrollX) {
                left = scrollX + 8;
            }

            this.popupStyle = {
                position: 'fixed',
                top: (top - scrollY) + 'px', // ลบ scroll offset เพราะใช้ fixed
                left: (left - scrollX) + 'px',
                zIndex: 10000,
                maxHeight: '90vh',
                overflowY: 'auto'
            };
            this.cdr.detectChanges();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;
        const key = event.key;

        // จัดการ Backspace / Delete กรณีที่ format แล้ว (มี '/')
        if ((key === 'Backspace' || key === 'Delete') && this.inputValue?.includes('/')) {
            const selectionStart = input.selectionStart || 0;
            const selectionEnd = input.selectionEnd || 0;
            const hasSelection = selectionEnd - selectionStart > 0;

            // ถ้าไม่ได้ select หรือ select ทั้งหมด ให้ลบทั้งหมด
            if (!hasSelection || selectionEnd - selectionStart === this.inputValue.length) {
                event.preventDefault();
                this.clearInput();
                setTimeout(() => input.focus(), 0);
                return;
            }
            // ถ้ามี selection บางส่วน ให้ปล่อยให้ลบตามปกติ (ไม่ return)
        }

        // อนุญาตปุ่มควบคุมพื้นฐาน
        const controlKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End'
        ];
        if (controlKeys.includes(key)) return;

        // อนุญาต Ctrl/Cmd + A/C/V/X
        if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(key.toLowerCase())) {
            return;
        }

        // อนุญาตตัวเลข
        if (/^[0-9]$/.test(key)) return;

        // อนุญาต / และ - (จะถูกแปลงเป็น / ใน onInput)
        if (key === '/' || key === '-') return;

        // ตัวอื่น (ตัวอักษร ฯลฯ) ไม่อนุญาต
        event.preventDefault();
    }

    onInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let raw = input.value || '';

        // ตรวจสอบการลบ
        const previousDigits = (this.previousInputValue.match(/\d/g) || []).length;
        const currentDigits = (raw.match(/\d/g) || []).length;
        const isDeleting = currentDigits < previousDigits && this.previousInputValue.length > 0;

        // ถ้ามีการลบและ format แล้ว แต่ยังพิมพ์ไม่ครบ ให้ลบ / ออก
        if (isDeleting && raw.includes('/')) {
            const digitsOnly = raw.replace(/\D/g, '');
            if (digitsOnly.length < 8) {
                raw = digitsOnly;
            }
        }

        raw = raw.replace(/-/g, '/');

        if (!this.showTime) {
            raw = raw.replace(/[^\d\/]/g, '');
            const formatted = this.autoFormatDate(raw);
            const cursorPos = input.selectionStart || 0;
            const digitsBeforeCursor = (raw.substring(0, cursorPos).match(/\d/g) || []).length;

            this.inputValue = formatted;
            this.previousInputValue = formatted;

            this.cdr.detectChanges();
            setTimeout(() => this.setCursorPosition(input, formatted, digitsBeforeCursor, cursorPos, raw.length), 0);
        } else {
            raw = raw.replace(/[^\d\/\s:]/g, '');
            this.inputValue = raw;
            this.previousInputValue = raw;
        }

        const digitsOnly = (this.inputValue.match(/\d/g) || []).length;
        if (digitsOnly >= 8 || (this.inputValue.includes('/') && this.inputValue.split('/').length >= 3)) {
            this.validateAndParseDate(this.inputValue, false);
        }

        this.valueChange.emit(this.inputValue);
    }

    private setCursorPosition(
        input: HTMLInputElement,
        formatted: string,
        digitsBeforeCursor: number,
        cursorPos: number,
        rawLength: number
    ) {
        if (!input?.setSelectionRange) return;

        if (formatted.replace(/\D/g, '').length < 8 && !formatted.includes('/')) {
            input.setSelectionRange(formatted.length, formatted.length);
            return;
        }

        let digitCount = 0;
        let newPos = formatted.length;

        for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {
                digitCount++;
                if (digitCount >= digitsBeforeCursor) {
                    newPos = cursorPos >= rawLength ? formatted.length : i + 1;
                    break;
                }
            }
        }

        input.setSelectionRange(newPos, newPos);
    }

    private autoFormatDate(value: string): string {
        if (!value?.trim()) {
            return '';
        }

        const cleaned = value.replace(/[^\d\/]/g, '');
        const allDigits = cleaned.replace(/\D/g, '');

        if (!allDigits) {
            return '';
        }

        // ถ้ามี / อยู่แล้ว ให้จัดการตาม parts
        if (cleaned.includes('/')) {
            const parts = cleaned.split('/');
            let day = (parts[0] || '').replace(/\D/g, '');
            let month = (parts[1] || '').replace(/\D/g, '');
            let year = parts.slice(2).join('').replace(/\D/g, '');

            // ถ้ามีตัวเลขเกิน ให้จัดใหม่จาก allDigits
            const totalDigits = allDigits.length;
            if (totalDigits > (day.length + month.length + year.length)) {
                if (totalDigits >= 2) day = allDigits.substring(0, 2);
                if (totalDigits >= 4) month = allDigits.substring(2, 4);
                if (totalDigits >= 8) {
                    year = allDigits.substring(4, 8);
                } else if (totalDigits > 4) {
                    year = allDigits.substring(4);
                }
            }

            day = day.substring(0, 2);
            month = month.substring(0, 2);
            year = year.substring(0, 4);

            if (year && year.length >= 4) {
                return `${day}/${month}/${year}`;
            } else if (month && month.length >= 2) {
                return `${day}/${month}/`;
            } else if (day) {
                return day;
            }
            return '';
        }

        // ถ้ายังไม่ครบ 8 ตัว ให้แสดงตัวเลขตามที่พิมพ์
        if (allDigits.length < 8) {
            return allDigits;
        }

        // ถ้าครบ 8 ตัวแล้ว ให้ format เป็น dd/mm/yyyy
        return `${allDigits.substring(0, 2)}/${allDigits.substring(2, 4)}/${allDigits.substring(4, 8)}`;
    }

    onBlur() {
        if (this.inputValue) {
            this.validateAndParseDate(this.inputValue, true);
        }
    }

    private validateAndParseDate(dateString: string, updateInput: boolean = false) {
        if (!dateString || dateString.trim() === '') {
            if (updateInput) {
                this.inputValue = '';
                this.selectedDate = null;
                this.valueChange.emit('');
                this.dateChange.emit(null);
            }
            return;
        }

        const datePart = dateString.split(' ')[0];
        const parts = datePart.split('/').filter(p => p.length > 0);
        const totalDigits = (datePart.match(/\d/g) || []).length;

        // ถ้ายังพิมพ์ไม่เสร็จ ไม่ต้อง validate
        if (totalDigits < 8 && !(parts.length >= 3 && parts[2]?.length >= 4)) {
            return;
        }

        if (parts.length >= 3 && parts[0].length >= 1 && parts[1].length >= 1 && parts[2].length >= 4) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = parseInt(parts[2], 10);

            if (isNaN(day) || isNaN(month) || isNaN(year)) {
                return;
            }

            // แปลงปี พ.ศ. เป็น ค.ศ.
            if (year > 2500) {
                year -= 543;
            } else if (year < 100) {
                year += 2500 - 543;
            }

            const date = new Date(year, month, day);
            if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                if (this.showTime) {
                    const timeMatch = dateString.match(/\s*(\d{1,2}):(\d{2})/);
                    if (timeMatch) {
                        date.setHours(parseInt(timeMatch[1], 10));
                        date.setMinutes(parseInt(timeMatch[2], 10));
                        this.selectedHour = date.getHours();
                        this.selectedMinute = date.getMinutes();
                    }
                }

                this.selectedDate = date;
                this.currentYear = year;
                this.currentMonth = month;

                if (updateInput) {
                    this.inputValue = this.formatDate(date);
                    this.emitValues(date);
                } else {
                    this.dateChange.emit(date);
                }
            }
        }
    }


    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedText = event.clipboardData?.getData('text') || '';
        let cleaned = pastedText.trim().replace(/[^\d\/\-\s:]/g, '').replace(/-/g, '/');

        if (cleaned) {
            this.inputValue = cleaned;
            setTimeout(() => {
                const input = this.inputRef?.nativeElement;
                if (input) {
                    input.value = cleaned;
                    this.onInput({ target: input } as any);
                }
            }, 0);
        }
    }

    private clearInput() {
        this.inputValue = '';
        this.previousInputValue = '';
        this.selectedDate = null;
        this.valueChange.emit('');
        this.dateChange.emit(null);
        this.cdr.detectChanges();
    }

    emitValues(date: Date | null) {
        if (!date) {
            this.dateChange.emit(null);
            this.valueChange.emit('');
            return;
        }
        const formatted = this.formatDate(date);
        this.inputValue = formatted;
        this.valueChange.emit(formatted);
        this.dateChange.emit(date);
    }

    formatDate(date: Date): string {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear() + 543;
        let str = `${d}/${m}/${y}`;

        if (this.showTime) {
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            str += ` ${hh}:${mm}`;
        }
        return str;
    }

    // Calendar Logic
    getDaysInMonth(m: number, y: number) {
        return new Date(y, m + 1, 0).getDate();
    }

    getFirstDayOfMonth(m: number, y: number) {
        return new Date(y, m, 1).getDay();
    }

    get emptyCells() {
        return Array.from({ length: this.getFirstDayOfMonth(this.currentMonth, this.currentYear) });
    }

    get daysInMonthArray() {
        const total = this.getDaysInMonth(this.currentMonth, this.currentYear);
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    get yearGrid() {
        return Array.from({ length: 12 }, (_, i) => this.yearGridStart + i);
    }

    handleDateClick(day: number) {
        const d = new Date(this.currentYear, this.currentMonth, day);
        d.setHours(this.selectedHour);
        d.setMinutes(this.selectedMinute);

        this.selectedDate = d;
        this.emitValues(d);

        if (!this.showTime) {
            this.showCalendar = false;
        }
        this.viewMode = 'days';
    }

    handleTimeChange() {
        if (this.selectedDate) {
            const d = new Date(this.selectedDate);
            d.setHours(this.selectedHour);
            d.setMinutes(this.selectedMinute);
            this.selectedDate = d;
            this.emitValues(d);
        }
    }

    handleMonthClick(m: number) {
        this.currentMonth = m;
        this.viewMode = 'days';
    }

    handleYearClick(y: number) {
        this.currentYear = y;
        this.viewMode = 'months';
    }

    handlePrevMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else this.currentMonth--;
    }

    handleNextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else this.currentMonth++;
    }

    handlePrevYear() {
        if (this.viewMode === 'years') this.yearGridStart -= 12;
        else this.currentYear--;
    }

    handleNextYear() {
        if (this.viewMode === 'years') this.yearGridStart += 12;
        else this.currentYear++;
    }

    toggleView() {
        if (this.viewMode === 'days') this.viewMode = 'months';
        else if (this.viewMode === 'months') {
            this.viewMode = 'years';
            this.yearGridStart = Math.floor(this.currentYear / 12) * 12;
        } else this.viewMode = 'days';
    }

    setToday() {
        const today = new Date();
        this.selectedDate = today;
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();
        this.selectedHour = today.getHours();
        this.selectedMinute = today.getMinutes();
        this.emitValues(today);
    }

    clearDate() {
        this.selectedDate = null;
        this.inputValue = '';
        this.previousInputValue = '';
        this.selectedHour = 0;
        this.selectedMinute = 0;
        this.valueChange.emit('');
        this.dateChange.emit(null);
    }

    isSelectedDay(day: number): boolean {
        return !!(
            this.selectedDate &&
            this.selectedDate.getDate() === day &&
            this.selectedDate.getMonth() === this.currentMonth &&
            this.selectedDate.getFullYear() === this.currentYear
        );
    }

    isToday(day: number): boolean {
        const t = new Date();
        return (
            t.getDate() === day &&
            t.getMonth() === this.currentMonth &&
            t.getFullYear() === this.currentYear
        );
    }

    getHeaderLabel(): string {
        if (this.viewMode === 'days') {
            return `${this.thaiMonthsShort[this.currentMonth]} ${this.currentYear + 543}`;
        } else if (this.viewMode === 'months') {
            return `${this.currentYear + 543}`;
        } else {
            return `${this.yearGridStart + 543} - ${this.yearGridStart + 11 + 543}`;
        }
    }

    ngOnInit() {
        if (this.value) {
            this.setValueFromString(this.value);
            this.cdr.detectChanges();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes['value']) return;

        const newVal = changes['value'].currentValue;

        if (changes['value'].firstChange) {
            this.setValueFromString(newVal);
            return;
        }

        const currentInput = this.inputValue || '';
        const isEmpty = newVal == null || newVal === '';
        if (isEmpty) {
            if (currentInput !== '') {
                this.setValueFromString(newVal);
            }
            return;
        }

        if (newVal instanceof Date || (typeof newVal === 'string' && newVal.includes('/'))) {
            const newValStr = newVal instanceof Date ? this.formatDate(newVal) : String(newVal);
            if (newValStr !== currentInput) {
                this.setValueFromString(newVal);
            }
        } else if (newVal && !currentInput) {
            this.setValueFromString(newVal);
        }
    }

    private setValueFromString(value: any) {
        if (!value) {
            this.selectedDate = null;
            this.inputValue = '';
            this.previousInputValue = '';
            return;
        }

        let date: Date | null = null;

        if (value instanceof Date) {
            date = value;
        } else {
            let valueStr = String(value);
            if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
                valueStr = valueStr.slice(1, -1);
            }

            // ตรวจสอบและแปลง .NET JSON date format: /Date(timestamp)/
            if (valueStr.startsWith('/Date(') || valueStr.includes('/Date(')) {
                const dateMatch = /\/Date\((\-?\d+)(?:[+-]\d{4})?\)\//.exec(valueStr);
                if (dateMatch && dateMatch[1]) {
                    let timestamp = parseInt(dateMatch[1], 10);
                    // ถ้า timestamp เป็นวินาที ให้แปลงเป็นมิลลิวินาที
                    if (Math.abs(timestamp) < 1e12) {
                        timestamp *= 1000;
                    }
                    if (!isNaN(timestamp) && timestamp !== 0) {
                        date = new Date(timestamp);
                        if (isNaN(date.getTime())) {
                            date = null;
                        }
                    }
                }
            }

            // รูปแบบ ISO ค.ศ. จาก API/SQL: yyyy-MM-dd หรือ yyyy-MM-dd HH:mm:ss...
            if (!date) {
                const isoDateMatch = valueStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s|T|$)/);
                if (isoDateMatch) {
                    const y = parseInt(isoDateMatch[1], 10);
                    const m = parseInt(isoDateMatch[2], 10) - 1;
                    const day = parseInt(isoDateMatch[3], 10);
                    if (y >= 1900 && y <= 2100 && m >= 0 && m <= 11 && day >= 1 && day <= 31) {
                        date = new Date(y, m, day);
                        if (date.getFullYear() === y && date.getMonth() === m && date.getDate() === day) {
                            // ใช้ได้
                        } else {
                            date = null;
                        }
                    }
                }
            }

            // ถ้ายังแปลงไม่ได้ ให้ลอง parse แบบ ปกติ (วว/ดด/ปปปป)
            if (!date) {
                const thaiDatePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/;
                const thaiMatch = valueStr.match(thaiDatePattern);

                if (thaiMatch) {
                    const day = parseInt(thaiMatch[1], 10);
                    const month = parseInt(thaiMatch[2], 10) - 1;
                    let year = parseInt(thaiMatch[3], 10);

                    if (year > 2500) {
                        year -= 543;
                    }

                    let h = 0, m = 0;
                    if (thaiMatch[4] && this.showTime) {
                        h = parseInt(thaiMatch[4], 10);
                        m = parseInt(thaiMatch[5] || '0', 10);
                    }

                    date = new Date(year, month, day, h, m);

                    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
                        date = null;
                    }
                } else {
                    const d = new Date(valueStr);
                    if (!isNaN(d.getTime())) {
                        const parsedYear = d.getFullYear();
                        if (parsedYear > 2500) {
                            const parts = valueStr.split(' ');
                            const datePart = parts[0].split('/');
                            if (datePart.length === 3) {
                                const day = parseInt(datePart[0], 10);
                                const month = parseInt(datePart[1], 10) - 1;
                                let year = parseInt(datePart[2], 10);
                                if (year > 2500) year -= 543;
                                date = new Date(year, month, day);
                            } else {
                                date = d;
                            }
                        } else {
                            date = d;
                        }
                    }
                }
            }
        }

        if (date && !isNaN(date.getTime())) {
            this.selectedDate = date;
            this.currentYear = date.getFullYear();
            this.currentMonth = date.getMonth();
            this.selectedHour = date.getHours();
            this.selectedMinute = date.getMinutes();
            this.inputValue = this.formatDate(date);
            this.previousInputValue = this.inputValue;
        } else {
            this.inputValue = String(value);
            this.previousInputValue = this.inputValue;
        }
    }
}