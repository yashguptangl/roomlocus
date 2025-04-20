export interface Lead {
    id: string;
    adress: string;
    customerName: string;
    customerPhone: string;
    accessDate: string;
    logs: LeadLog[];
  }
  
  export interface LeadLog {
    id: string;
    adress: string;
    customerName: string;
    customerPhone: string;
    accessDate: string;
  }
