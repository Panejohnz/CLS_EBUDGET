import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, FormControl, FormControlName, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { GridJsModel } from '../../../tables/gridjs/gridjs.model';
import { DecimalPipe } from '@angular/common';
import { get } from 'lodash';
import Swal from 'sweetalert2';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';


type AllocField = 'alloc1' | 'alloc2' | 'alloc3';
interface BudgetNode {
  name: string;
  level: number;
  expanded?: boolean;
  children?: BudgetNode[];

  budget: number;   // คำของบ (fix)
  alloc1: number;
  alloc2: number;
  alloc3: number;
}
@Component({
  selector: 'app-examine',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './examine.component.html',
})
export class ExamineComponent {
  department = '';
  columns: { field: AllocField; label: string }[] = [
    { field: 'alloc1', label: 'จัดสรรครั้งที่ 1' },
    { field: 'alloc2', label: 'จัดสรรครั้งที่ 2' },
    { field: 'alloc3', label: 'จัดสรรครั้งที่ 3' }
  ];
  item: any = {
    alloc1: 0,
    alloc2: 0,
    alloc3: 0
  }
  // departments: any[] = []

  // data: BudgetNode[] = [
  //   this.createNode('แผนงานที่ 1', 0, [
  //     this.createNode('ผลผลิตที่ 1', 1, [
  //       this.createNode('กิจกรรมหลักที่ 1', 2, [
  //         this.createNode('หมวดเงินเดือน', 3, [
  //           this.createLeaf('เงินเดือน', 4),
  //           this.createLeaf('ค่าจ้างประจำ', 4),
  //           this.createLeaf('เงินประจำตำแหน่ง', 4),
  //           this.createLeaf('ค่าตอบแทนรายเดือนสำหรับข้าราชการ', 4)
  //         ])
  //       ])
  //     ])
  //   ])
  // ];
  // department = '';
  departments = ['กองแผนงาน', 'กองคลัง', 'กอง IT'];

  data: BudgetNode[] = [];
  flattenData: BudgetNode[] = [];

  ngOnInit() {
    this.initData();
    this.buildFlatten();
  }

  // ---------------------------
  // 🔥 สร้างข้อมูลตัวอย่าง
  // ---------------------------
  initData() {
    this.data = [
      this.createNode('แผนงานที่ 1', 0, 400000, [
        this.createNode('ผลผลิตที่ 1', 1, 400000, [
          this.createNode('กิจกรรมหลักที่ 1', 2, 400000, [
            this.createNode('งบบุคลากร', 3, 400000, [
              this.createNode('หมวดเงินเดือน', 4, 400000, [
                this.createLeaf('เงินเดือน', 5, 100000),
                this.createLeaf('ค่าจ้างประจำ', 5, 100000),
                this.createLeaf('เงินประจำตำแหน่ง', 5, 100000),
                this.createLeaf('ค่าตอบแทนรายเดือน', 5, 100000)
              ])
            ])
          ])
        ])
      ])
    ];
  }

  // ---------------------------
  // 🔥 create node
  // ---------------------------
  createNode(name: string, level: number, budget: number, children?: BudgetNode[]): BudgetNode {
    return {
      name,
      level,
      expanded: true,
      budget,
      alloc1: 0,
      alloc2: 0,
      alloc3: 0,
      children
    };
  }

  createLeaf(name: string, level: number, budget: number): BudgetNode {
    return {
      name,
      level,
      budget,
      alloc1: 0,
      alloc2: 0,
      alloc3: 0
    };
  }

  // ---------------------------
  // 🔥 check leaf
  // ---------------------------
  isLeaf(node: BudgetNode): boolean {
    return !node.children || node.children.length === 0;
  }

  // ---------------------------
  // 🔥 flatten tree
  // ---------------------------
  buildFlatten() {
    const result: BudgetNode[] = [];

    const loop = (nodes: BudgetNode[]) => {
      for (let node of nodes) {
        result.push(node);

        if (node.children && node.expanded) {
          loop(node.children);
        }
      }
    };

    loop(this.data);
    this.flattenData = result;
  }

  // ---------------------------
  // 🔥 toggle expand
  // ---------------------------
  toggle(node: BudgetNode) {
    node.expanded = !node.expanded;
    this.buildFlatten();
  }

  // ---------------------------
  // 🔥 sum แนวตั้ง
  // ---------------------------
  calculate(node: BudgetNode, field: AllocField): number {
    if (this.isLeaf(node)) {
      return node[field] || 0;
    }

    return node.children!.reduce(
      (sum, child) => sum + this.calculate(child, field),
      0
    );
  }

}