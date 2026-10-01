import { ScopeInterface } from './scope.interface';
import { PersonInterface } from './person.interface';

export interface TransactionInterface {
    trx_uuid: string;
    scp_uuid: string;
    scp?: ScopeInterface;
    usr_uuidcreator: string;
    trx_type: string;
    trx_datetime: string | Date;
    trx_amount: number;
    trx_currency: string;
    crd_uuid?: string | null;
    target_crduuid?: string | null;
    trx_concept: string;
    prs_uuid?: string | null;
    prs?: PersonInterface;
    trx_notes?: string | null;
    trx_createdat?: string;
    trx_updatedat?: string;
}

export interface TransactionResults {
    success: boolean;
    data: TransactionInterface[];
    message?: string;
}
