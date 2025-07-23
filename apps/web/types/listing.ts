
export interface ListingData {
  
    contactInfo: any;
    ownerId: number;
    careTaker: string;
    manager: string;
    id : number;
    images?: string[];
    location: string;
    city: string;
    townSector: string;
    adress : string; 
    MinPrice: string,
    MaxPrice: string;
    isLiveLocation: boolean;
    security: string;
    address: string;
    PGType: string;
    totalPG: string;
    image : string;
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
    luxury: string;
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
    listingShowNo: string;
    ManagerConact : string;
    listing?: ListingData[];
}


export interface ListingItem {
    address: string;
    Adress : string;
    isDraft: boolean;
    id: string;
    uniq: string;
    type: string;
    images: { images: string;};
    location: string;
    townSector: string;
    city: string;
    BHK: number | string;
    security: number;
    MinPrice: number;
    MaxPrice: number;
    isVisible: boolean;
    isVerified: boolean;
    palaceName: string;
    listingShowNo: string;
    isLiveLocation: boolean;
    adress : string;
    listingId : number;
    listingType : string;
    ownerId: number;
    paymentDone : boolean;
  }

export default ListingData;  