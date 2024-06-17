export interface CustomerDataType {
    property1: string;
    property2: string;
}

export interface CustomersType {
    id: number;
    customer_data: CustomerDataType;
    currency: string;
    rid: string;
    phone: string;
    email: string;
    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
    source: string;
    team_id: string;
}
