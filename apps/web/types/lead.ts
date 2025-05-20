export interface Lead {
    id: string;
    adress: string;
    customerName: string;
    customerPhone: string;
    accessDate: string;
    logs: LeadLog[];
  }
  
  export interface LeadLog {
    id: number;
    adress: string;
    customerName: string;
    customerPhone: string;
    accessDate: string;
    ownerDeleted: boolean;
    userDeleted: boolean;
  }
