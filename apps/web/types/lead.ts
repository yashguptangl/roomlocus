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
    location: string;
    landmark: string;
    propertyType: string;
    customerName: string;
    customerPhone: string;
    accessDate: string;
    ownerDeleted: boolean;
    userDeleted: boolean;
  }
