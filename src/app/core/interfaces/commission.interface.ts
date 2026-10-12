import { TransactionInterface } from "./transaction.interface";

export interface SellerCommissionSummary {
    usr_uuid: string;
    total_sales: number;
    total_commission: number;
    sales_count: number;
    sales: TransactionInterface[];
}

export interface SellerCommissionResults {
    success: boolean;
    data: SellerCommissionSummary;
    message?: string;
}
