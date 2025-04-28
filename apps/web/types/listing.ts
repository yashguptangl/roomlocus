
export interface ListingData {
    contactInfo: any;
    ownerId: number;
    id : number;
    images?: string[];
    location: string;
    city: string;
    townSector: string;
    adress : string; 
    MinPrice: string,
    MaxPrice: string;
    security: string;
    PGType: string;
    totalPG: string;
    bedCount : number;
    foodAvailable : boolean;
    maintenance: string;
    noticePeriod: string;
    RoomAvailable: string;
    totalRoom: string;
    roomType: string;
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
    palaceName: string;
    BedCount : number;
    acType: string;
    noofGuests: string;
    totalFloor : string;
    Adress: string;
    landmark: string;
    parking: string[]
    preferTenants: string[];
    flatInside: string[];
    flatOutside: string[];
    roomInside: string[];
    roomOutside: string[];
    PGInside: string[];
    PGOutside: string[];
    isVerified: boolean;
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