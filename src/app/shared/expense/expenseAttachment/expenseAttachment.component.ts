import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-attachment',
  templateUrl: './expenseAttachment.component.html',
  styles: `
    .attachment-list {
      max-height: 120px;
      overflow: auto;
    }
  `
})
export class ExpenseAttachmentComponent {
  @Input() model: any;

  private currentExpenseTypeId: any = null;

  ngOnInit() {
    this.ensureAttachmentList();
  }

  ngDoCheck() {
    if (!this.model) return;

    if (this.currentExpenseTypeId !== this.model.selectedExpenseTypeId) {
      this.currentExpenseTypeId = this.model.selectedExpenseTypeId;
      this.ensureAttachmentList();
    }
  }

  get files(): any[] {
    if (!this.model?.Budget_Request_Attach_File) return [];

    return this.model.Budget_Request_Attach_File.filter(
      (x: any) =>
        Number(x.Fk_Expense_Id) ===
        Number(this.model.selectedExpenseTypeId)
    );
  }

  onFileChange(event: Event) {
    this.ensureAttachmentList();

    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    files.forEach((file: File) => {
      this.model.Budget_Request_Attach_File.push({
        Fk_Expense_Id: this.model.selectedExpenseTypeId,
        File_Name: file.name,
        File_Size: file.size,
        File_Type: file.type,
        ATTACH: 1,
        file
      });
    });

    input.value = '';
  }

  removeFile(index: number) {
    const file = this.files[index];
    if (!file) return;

    const realIndex = this.model.Budget_Request_Attach_File.indexOf(file);
    if (realIndex >= 0) {
      this.model.Budget_Request_Attach_File.splice(realIndex, 1);
    }
  }

  private ensureAttachmentList() {
    if (!this.model) return;

    if (!Array.isArray(this.model.Budget_Request_Attach_File)) {
      this.model.Budget_Request_Attach_File = [];
    }
  }
}
