// pagination.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PaginationService {
    pageSize: any = 8;
    page: any = 1;
    direction: any = 'asc';
    startIndex: number = 1;
    endIndex: number = 9;

    // Pagination
    changePage(alldata: any[]) {
        const rows = alldata || [];
        const total = rows.length;
        const pageSizeNumber = Number(this.pageSize) || 1;

        if (!total) {
            this.page = 1;
            this.startIndex = 0;
            this.endIndex = 0;
            return [];
        }

        const maxPage = Math.max(1, Math.ceil(total / pageSizeNumber));
        const safePage = Math.min(Math.max(1, Number(this.page) || 1), maxPage);
        this.page = safePage;
        this.startIndex = (safePage - 1) * pageSizeNumber + 1;
        this.endIndex = Math.min(safePage * pageSizeNumber, total);

        return rows.slice(this.startIndex - 1, this.endIndex);
    }

    // Sort Data
    onSort(column: any, dataList: any[]) {
        if (this.direction == 'asc') {
            this.direction = 'desc';
        } else {
            this.direction = 'asc';
        }
        const sortedArray = [...dataList]; // Create a new array
        sortedArray.sort((a, b) => {
            const res = this.compare(a[column], b[column]);
            return this.direction === 'asc' ? res : -res;
        });
        return dataList = sortedArray;
    }
    compare(v1: string | number, v2: string | number) {
        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    }


}
