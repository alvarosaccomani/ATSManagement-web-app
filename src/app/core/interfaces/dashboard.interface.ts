export interface ScopeBalanceSummary {
  scp_uuid: string;
  scp_name: string;
  scp_color?: string | null;
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface DashboardSummary {
  usr_uuid: string;
  scp_uuid?: string | null;
  total_income: number;
  total_expense: number;
  net_balance: number;
  transaction_count: number;
  recent_transactions: any[];
  scopes_summary: ScopeBalanceSummary[];
}

export interface DashboardResults {
  success: boolean;
  data: DashboardSummary;
  message?: string;
}
