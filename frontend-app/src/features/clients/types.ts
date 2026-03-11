export type ClientType = 'person' | 'company';

export interface TaxIdentifier {
    key: string;
    value: string;
}

export interface Client {
    id: string;
    workspaceId: string;
    linkedUserId?: string;
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    notes?: string;
    country?: string;
    type: ClientType;
    taxIdentifiers: TaxIdentifier[];
    address?: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDto {
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    notes?: string;
    linkedUserId?: string;
    country?: string;
    type?: ClientType;
    taxIdentifiers?: TaxIdentifier[];
    address?: Record<string, string>;
}

export type UpdateClientDto = Partial<CreateClientDto>;