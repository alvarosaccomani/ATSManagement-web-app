export interface PersonInterface {
    prs_uuid: string;
    scp_uuid: string;
    usr_uuidlinked?: string | null;
    prs_name: string;
    prs_type: string;
    prs_phone?: string | null;
    prs_email?: string | null;
    prs_taxid?: string | null;
    prs_commissionrate?: number | null;
    prs_active: boolean;
    prs_createdat?: string;
    prs_updatedat?: string;
}

export interface PersonResults {
    success: boolean;
    data: PersonInterface[];
    message?: string;
}
