import { Component, Input } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-attachment',
  providers: [
    EbudgetService
  ],
  templateUrl: './expenseAttachment.component.html',
  styles: `
    .attachment-list {
      max-height: 120px;
      overflow: auto;
    }
  `
})
export class ExpenseAttachmentComponent {
  constructor(
    public servicebud: EbudgetService,
  ) { }
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
    const localFile = this.getLocalFile(fileItem);

    if (localFile) {
      this.openLocalFile(localFile);
      return;
    }

    if (fileItem?.IDA) {
      const model = {
        FUNC_CODE:
          'FUNC-View_PDF',
        Request_Id: fileItem.IDA

      };
      this.servicebud
        .GatewayGetData(model)
        .subscribe((response: any) => {

          var byteArray = new Uint8Array(response.file.FileContents);
          const blob = new Blob([byteArray], { type: response.fileType });
          const url = window.URL.createObjectURL(blob);
          const win = window.open(url, '_blank');

          if (win) {
            win.focus();
          } else {
            this.downloadBlob(url, fileItem.File_Name || fileItem.NAME_FAKE || 'attachment');
          }

        }

        );

      return;
    }

    const fileUrl = this.getFileUrl(fileItem);

    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  canOpenFile(fileItem: any): boolean {
    return !!this.getLocalFile(fileItem) || !!fileItem?.IDA || !!this.getFileUrl(fileItem);
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
      this.deleteExistingFile(file);
      return;
    }

    this.removeFromAttachmentList(file);
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
        item?.Client_Attachment_Id ||
        item?.CLIENT_ATTACHMENT_ID ||
        this.createClientAttachmentId(),
      Ref_Module:
        item?.Ref_Module || item?.REF_MODULE || 'BUDGET_REQUEST',
      Ref_Level:
        item?.Ref_Level || item?.REF_LEVEL || 'EXPENSE',
      Request_Id:
        item?.Request_Id ||
        item?.FK_REQUEST_ID ||
        item?.Fk_Request_Id ||
        this.model?.Budget_Request?.Request_Id ||
        0,
      Fk_Expense_Id:
        item?.Fk_Expense_Id ??
        item?.FK_EXPENSE_ID ??
        item?.Expense_Id ??
        this.model?.selectedExpenseTypeId ??
        0,
      Fk_Request_Detail_Item_Id:
        item?.Fk_Request_Detail_Item_Id ||
        item?.FK_REQUEST_DETAIL_ITEM_ID ||
        0,
      Row_Guid:
        item?.Row_Guid || item?.ROW_GUID || null,
      File_Name:
        item?.File_Name ||
        item?.FILE_NAME ||
        item?.NAME_FAKE ||
        item?.file?.name ||
        '',
      File_Size:
        item?.File_Size || item?.FILE_SIZE || item?.file?.size || 0,
      File_Type:
        item?.File_Type || item?.FILE_TYPE || item?.file?.type || '',
      NAME_FAKE:
        item?.NAME_FAKE ||
        item?.Name_Fake ||
        item?.File_Name ||
        item?.FILE_NAME ||
        item?.file?.name ||
        '',
      NAME_REAL:
        item?.NAME_REAL || item?.Name_Real || item?.GEN_FILE || '',
      GEN_FILE:
        item?.GEN_FILE || item?.Gen_File || item?.NAME_REAL || '',
      PATH_FILE:
        item?.PATH_FILE || item?.Path_File || '',
      File_Url:
        item?.File_Url ||
        item?.FILE_URL ||
        item?.View_Url ||
        item?.VIEW_URL ||
        item?.URL ||
        '',
      IDA:
        item?.IDA || item?.Ida || 0,
      ATTACH:
        item?.ATTACH || 1,
      Active:
        item?.Active ?? item?.ACTIVE ?? 1,
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

  private deleteExistingFile(file: any) {
    if (!file?.IDA) {
      this.markFileDeleted(file);
      return;
    }

    const model = {
      FUNC_CODE: 'FUNC-Delete_Budget_Request_File',
      IDA: file.IDA,
      Request_Id: file.Request_Id || this.model?.Budget_Request?.Request_Id || 0,
      Fk_Expense_Id: file.Fk_Expense_Id || this.model?.selectedExpenseTypeId || 0
    };

    this.servicebud.GatewayGetData(model).subscribe({
      next: () => {
        this.removeFromAttachmentList(file);
      },
      error: () => {
        basicAlert('warning', 'ลบไฟล์ไม่สำเร็จ', '');
      }
    });
  }

  private markFileDeleted(file: any) {
    file.Pending_Delete = true;
    file.Active = 0;
  }

  private removeFromAttachmentList(file: any) {
    const realIndex = this.model.Budget_Request_Attach_File.indexOf(file);

    if (realIndex >= 0) {
      this.model.Budget_Request_Attach_File.splice(realIndex, 1);
    }
  }

  private getLocalFile(fileItem: any): File | null {
    const file = fileItem?.file;

    if (typeof File !== 'undefined' && file instanceof File) {
      return file;
    }

    return null;
  }

  private openLocalFile(file: File) {
    const url = URL.createObjectURL(file);
    const win = window.open(url, '_blank');

    if (win) {
      win.focus();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }

    this.downloadBlob(url, file.name);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  private downloadBlob(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = fileName;
    link.click();
  }

  private createClientAttachmentId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `attach_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
