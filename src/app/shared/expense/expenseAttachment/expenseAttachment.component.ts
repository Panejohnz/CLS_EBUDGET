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
        Number(this.model.selectedExpenseTypeId) &&
        !x.Pending_Delete &&
        Number(x.Active ?? 1) !== 0
    );
  }

  onFileChange(event: Event) {
    this.ensureAttachmentList();

    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    files.forEach((file: File) => {
      this.model.Budget_Request_Attach_File.push(
        this.createAttachmentItem(file)
      );
    });

    input.value = '';
  }

  openFile(fileItem: any) {
    if (fileItem?.file instanceof File) {
      const localUrl = URL.createObjectURL(fileItem.file);
      window.open(localUrl, '_blank');
      return;
    }

    const fileUrl = this.getFileUrl(fileItem);

    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  canOpenFile(fileItem: any): boolean {
    return !!fileItem?.file || !!this.getFileUrl(fileItem);
  }

  isExistingFile(fileItem: any): boolean {
    return !fileItem?.file && !!(
      fileItem?.IDA ||
      fileItem?.GEN_FILE ||
      fileItem?.PATH_FILE ||
      fileItem?.File_Url
    );
  }

  removeFile(index: number) {
    const file = this.files[index];
    if (!file) return;

    if (this.isExistingFile(file)) {
      file.Pending_Delete = true;
      file.Active = 0;
      return;
    }

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

    this.model.Budget_Request_Attach_File =
      this.model.Budget_Request_Attach_File.map((item: any) =>
        this.normalizeAttachmentItem(item)
      );
  }

  private createAttachmentItem(file: File): any {
    return this.normalizeAttachmentItem({
      Client_Attachment_Id: this.createClientAttachmentId(),
      Ref_Module: 'BUDGET_REQUEST',
      Ref_Level: 'EXPENSE',
      Request_Id: this.model?.Budget_Request?.Request_Id || 0,
      Fk_Expense_Id: this.model.selectedExpenseTypeId,
      Fk_Request_Detail_Item_Id: 0,
      Row_Guid: null,
      File_Name: file.name,
      File_Size: file.size,
      File_Type: file.type,
      NAME_FAKE: file.name,
      NAME_REAL: file.name,
      ATTACH: 1,
      Active: 1,
      Is_New: true,
      Pending_Delete: false,
      file
    });
  }

  private normalizeAttachmentItem(item: any): any {
    return {
      Client_Attachment_Id:
        item?.Client_Attachment_Id || this.createClientAttachmentId(),
      Ref_Module:
        item?.Ref_Module || 'BUDGET_REQUEST',
      Ref_Level:
        item?.Ref_Level || 'EXPENSE',
      Request_Id:
        item?.Request_Id || this.model?.Budget_Request?.Request_Id || 0,
      Fk_Expense_Id:
        item?.Fk_Expense_Id ?? this.model?.selectedExpenseTypeId ?? 0,
      Fk_Request_Detail_Item_Id:
        item?.Fk_Request_Detail_Item_Id || 0,
      Row_Guid:
        item?.Row_Guid || null,
      File_Name:
        item?.File_Name || item?.NAME_FAKE || item?.file?.name || '',
      File_Size:
        item?.File_Size || item?.file?.size || 0,
      File_Type:
        item?.File_Type || item?.file?.type || '',
      NAME_FAKE:
        item?.NAME_FAKE || item?.File_Name || item?.file?.name || '',
      NAME_REAL:
        item?.NAME_REAL || item?.GEN_FILE || '',
      GEN_FILE:
        item?.GEN_FILE || '',
      PATH_FILE:
        item?.PATH_FILE || '',
      File_Url:
        item?.File_Url || '',
      IDA:
        item?.IDA || 0,
      ATTACH:
        item?.ATTACH || 1,
      Active:
        item?.Active ?? 1,
      Is_New:
        item?.Is_New ?? !!item?.file,
      Pending_Delete:
        item?.Pending_Delete ?? false,
      file:
        item?.file || null
    };
  }

  private getFileUrl(fileItem: any): string {
    const directUrl =
      fileItem?.File_Url ||
      fileItem?.View_Url ||
      fileItem?.URL ||
      '';

    if (directUrl) {
      return directUrl;
    }

    const path =
      String(fileItem?.PATH_FILE || '').replace(/\\/g, '/').trim();

    const fileName =
      String(
        fileItem?.GEN_FILE ||
        fileItem?.NAME_REAL ||
        fileItem?.File_Name ||
        ''
      ).trim();

    if (!path) {
      return '';
    }

    if (!fileName || path.endsWith(fileName)) {
      return path;
    }

    return `${path.replace(/\/$/, '')}/${fileName}`;
  }

  private createClientAttachmentId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `attach_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
