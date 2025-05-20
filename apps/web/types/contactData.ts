export default interface contactInfo {
    logs: any;
    id: number;
    ownerId: number;
    userId: number;
    listingId: number;
    customerName: string;
    customerPhone: string;
    ownerPhone: string;
    adress: string;
    accessDate: Date;
    expiryDate: Date;
    propertyType: string;
    isExpired: boolean;
    userDeleted: boolean;
    ownerDeleted: boolean;
}