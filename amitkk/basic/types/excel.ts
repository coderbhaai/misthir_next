export interface ExcelProps {
    _id: string;
    model: string;
    type: string;
    batch_no: string;
    status: string;
    total_rows?: number;
    success_count?: number;
    failed_count?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface MetaTempProps {
    _id: string;
    excelUpload_id: string | ExcelProps;
    status: string;
    message: string;

    url?: string;
    title?: string;
    description?: string;
    focus_keyword?: string;
    createdAt: Date;
    updatedAt: Date;

}