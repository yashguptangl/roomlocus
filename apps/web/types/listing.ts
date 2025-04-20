
export interface ListingData {
    contactInfo: any;
    ownerId: number;
    id : number;
    images?: string[];
    location: string;
    city: string;
    townSector: string;
    MinPrice: string,
    MaxPrice: string;
    security: string;
    maintenance: string;
    noticePeriod: string;
    furnishingType: string;
    accomoType: string;
    genderPrefer: string;
    petAllowed: boolean;
    powerBackup: string;
    waterSupply: string;
    flatType: string;
    totalFlat: number;
    Offer: string;
    BHK: string;
    Type: string;
    Adress: string;
    landmark: string;
    parking: string[]
    preferTenants: string[];
    flatInside: string[];
    flatOutside: string[];
    listing?: ListingData[];
}


export interface ListingItem {
    isDraft: boolean;
    id: string;
    uniq: string;
    type: string;
    images: { images: string;};
    location: string;
    townSector: string;
    city: string;
    BHK: number;
    security: number;
    MinPrice: number;
    MaxPrice: number;
    isVisible: boolean;
    isVerified: boolean;
    listingShowNo: string;
    adress : string;
    listingId : number;
    listingType : string;
    ownerId: number;
    paymentDone : boolean;
  }

export default ListingData;  