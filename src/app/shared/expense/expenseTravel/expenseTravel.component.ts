import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-travel',
  templateUrl: './expenseTravel.component.html',
  styles: ``
})
export class ExpenseTravelComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  sections: any[] = [];

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

  }

  closeModal() {

    this.model.dismiss();

  }

  bindData() {

    const rows =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId
      );

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.sections = [
        {
          sectionId: 1,

          description: '',

          details: [
            this.newDetail(1)
          ]
        }
      ];

      return;

    }

    const grouped: any = {};

    rows.forEach((row: any) => {

      const key =
        Number(row.Fk_Request_Detail_Id) || 1;

      // สร้าง section
      if (!grouped[key]) {

        grouped[key] = {

          sectionId: key,

          description:
            row.Expense_Detail || '',

          details: []

        };

      }

      // push detail
      grouped[key].details.push({

        requestItemId:
          row.Request_Item_Id || 0,

        sectionId:
          key,

        pairId:
          row.Fk_Expense_Detail_Id || 0,

        level:
          row.Level_Name || '',

        times:
          row.Times || 0,

        perdiemPerson:
          row.People_Type_A || 0,

        perdiemDay:
          row.Day || 0,

        perdiemRate:
          row.Rate || 0,

        perdiemTotal:
          row.Budget_Amount || 0,

        hotelPerson:
          row.People_Type_B || 0,

        hotelNight:
          row.Month || 0,

        hotelRate:
          row.Price || 0,

        hotelTotal:
          row.Salary_Amount || 0,

        planePerson:
          row.People_Type_C || 0,

        planeTrip:
          row.Hour || 0,

        planeRate:
          row.Per_Month || 0,

        planeTotal:
          row.Per_Year || 0,

        taxiPerson:
          row.Quantity || 0,

        taxiTrip:
          row.Month_Id || 0,

        taxiRate:
          row.Total || 0,

        taxiTotal:
          Number(row.Unit_Name) || 0,

        grandTotal:
          row.Rate_Amount || 0

      });

    });

    // sort section
    this.sections =

      Object.values(grouped)

        .sort(
          (a: any, b: any) =>
            a.sectionId - b.sectionId
        );

  }

  addSection() {

    const maxId = this.sections.length > 0
      ? Math.max(
        ...this.sections.map(
          (x: any) => Number(x.sectionId) || 0
        )
      )
      : 0;

    const nextSectionId =
      maxId + 1;

    this.sections.push({

      sectionId: nextSectionId,

      description: '',

      details: [
        this.newDetail(nextSectionId)
      ]

    });

  }

  remove(i: number) {

    this.sections.splice(i, 1);

    this.updateDetailItems();

  }

  addDetail(section: any) {

    section.details.push(
      this.newDetail(section.sectionId)
    );

  }

  removeDetail(section: any, i: number) {

    section.details.splice(i, 1);

    this.updateDetailItems();

  }

  newDetail(sectionId: any = 0) {

    return {

      requestItemId: 0,

      sectionId: sectionId,

      pairId: 0,

      level: '',

      times: 0,

      perdiemPerson: 0,
      perdiemDay: 0,
      perdiemRate: 0,
      perdiemTotal: 0,

      hotelPerson: 0,
      hotelNight: 0,
      hotelRate: 0,
      hotelTotal: 0,

      planePerson: 0,
      planeTrip: 0,
      planeRate: 0,
      planeTotal: 0,

      taxiPerson: 0,
      taxiTrip: 0,
      taxiRate: 0,
      taxiTotal: 0,

      grandTotal: 0

    };

  }

  calculate(d: any) {

    d.perdiemTotal =

      (Number(d.perdiemPerson) || 0) *

      (Number(d.perdiemDay) || 0) *

      (Number(d.perdiemRate) || 0);

    d.hotelTotal =

      (Number(d.hotelPerson) || 0) *

      (Number(d.hotelNight) || 0) *

      (Number(d.hotelRate) || 0);

    d.planeTotal =

      (Number(d.planePerson) || 0) *

      (Number(d.planeTrip) || 0) *

      (Number(d.planeRate) || 0);

    d.taxiTotal =

      (Number(d.taxiPerson) || 0) *

      (Number(d.taxiTrip) || 0) *

      (Number(d.taxiRate) || 0);

    d.grandTotal =

      d.perdiemTotal +

      d.hotelTotal +

      d.planeTotal +

      d.taxiTotal;

    this.updateDetailItems();

  }

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    this.sections.forEach((section: any) => {

      section.details.forEach((d: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            d.requestItemId,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          Fk_Request_Detail_Id:
            d.sectionId,
          Fk_Expense_Detail_Id:
            d.pairId,

          Expense_Detail:
            section.description,

          Level_Name:
            d.level,

          Times:
            d.times,

          People_Type_A:
            d.perdiemPerson,

          Day:
            d.perdiemDay,

          Rate:
            d.perdiemRate,

          Budget_Amount:
            d.perdiemTotal,

          People_Type_B:
            d.hotelPerson,

          Month:
            d.hotelNight,

          Price:
            d.hotelRate,

          Salary_Amount:
            d.hotelTotal,

          People_Type_C:
            d.planePerson,

          Hour:
            d.planeTrip,

          Per_Month:
            d.planeRate,

          Per_Year:
            d.planeTotal,

          Quantity:
            d.taxiPerson,

          Month_Id:
            d.taxiTrip,

          Total:
            d.taxiRate,

          Unit_Name:
            d.taxiTotal,

          Rate_Amount:
            d.grandTotal

        });

      });

    });

  }

}
