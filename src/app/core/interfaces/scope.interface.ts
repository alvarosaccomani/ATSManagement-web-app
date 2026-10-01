export interface ScopeInterface {
    scp_uuid: string;
    scp_name: string;
    scp_description?: string | null;
    scp_isshared: boolean;
    scp_color?: string | null;
    scp_icon?: string | null;
    usr_uuidowner: string;
    scp_active: boolean;
    scp_createdat?: string;
    scp_updatedat?: string;
}

export interface ScopeResults {
    success: boolean;
    data: ScopeInterface[];
    message?: string;
}
