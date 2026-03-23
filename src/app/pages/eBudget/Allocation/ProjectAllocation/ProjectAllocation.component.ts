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
import { FormsModule } from '@angular/forms';
interface BudgetNode {
  name: string;
  amount?: number;
  alloc1?: number;
  alloc2?: number;
  alloc3?: number;
  children?: BudgetNode[];
  level: number;
}
@Component({
  selector: 'app-project-allocation',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './ProjectAllocation.component.html',
  styles: ``
})
export class ProjectAllocationComponent {
  department = '';

  data: BudgetNode[] = [
    {
      name: 'แผนงานที่ 1',
      level: 0,
      children: [
        {
          name: 'ผลผลิตที่ 1',
          level: 1,
          children: [
            {
              name: 'กิจกรรมหลักที่ 1',
              level: 2,
              children: [
                {
                  name: 'งบบุคลากร',
                  level: 3,
                  children: [
                    {
                      name: 'หมวดเงินเดือนและค่าจ้างประจำ',
                      level: 4,
                      children: [
                        this.createLeaf('เงินเดือน', 5),
                        this.createLeaf('ค่าจ้างประจำ', 5),
                        this.createLeaf('เงินประจำตำแหน่ง', 5),
                        this.createLeaf('ค่าตอบแทนรายเดือนสำหรับข้าราชการ', 5),
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  createLeaf(name: string, level: number): BudgetNode {
    return {
      name,
      level,
      alloc1: 0,
      alloc2: 0,
      alloc3: 0
    };
  }

  getFlattenData(): BudgetNode[] {
    const result: BudgetNode[] = [];

    const loop = (nodes: BudgetNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children) {
          loop(node.children);
        }
      });
    };

    loop(this.data);
    return result;
  }

  getLeafTotal(node: BudgetNode): number {
    return (node.alloc1 || 0) + (node.alloc2 || 0) + (node.alloc3 || 0);
  }

  calculate(node: BudgetNode): number {
    if (!node.children) {
      return this.getLeafTotal(node);
    }
    return node.children.reduce((sum, child) => sum + this.calculate(child), 0);
  }

}