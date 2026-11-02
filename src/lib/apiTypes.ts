import {listingDisplayPrice,parsePriceAdjustment} from './priceAdjustment';
import type {Listing} from './types';
export interface ApiProfile {id:string;name:string;emoji:string;bio:string;city:string;postalCode:string;email:string|null;emailVerified:boolean;emailNotifications:boolean;pushNotifications:boolean;onboardingCompleted:boolean;coverMediaId:string|null;}
export interface ApiListing {id:string;number:string;sellerId:string;categoryId:Listing['categoryId'];modelId:string;title:string;priceCents:number;listedPriceCents?:number;currency:'EUR';specs:Partial<Listing>;privateSpecs?:Partial<Listing>|null;city:string;postalCode:string;status:'public'|'reserved'|'inactive'|'sold';version:number;createdAt:string;updatedAt:string;soldAt:string|null;sellerName:string;sellerEmoji:string;sellerJoinedAt:string;}
export function listingFromApi(row:ApiListing):Listing {
  const priceAdjustment=parsePriceAdjustment(row.specs?.priceAdjustment);
  const listedPrice=(row.listedPriceCents??row.priceCents)/100;
  const visibility=row.status==='public'||row.status==='sold'?undefined:row.status;
  const price=row.listedPriceCents!=null?row.priceCents/100:listingDisplayPrice({price:listedPrice,listedPrice,priceAdjustment,createdAt:row.createdAt,soldAt:row.soldAt??undefined,visibility,updatedAt:row.updatedAt});
  return {...row.specs,...row.privateSpecs,id:row.id,number:row.number,sellerId:row.sellerId,version:row.version,categoryId:row.categoryId,modelId:row.modelId,title:row.title,price,listedPrice,priceAdjustment,updatedAt:row.updatedAt,city:row.city,postalCode:row.postalCode,radiusKm:0,createdAt:row.createdAt,sellerName:row.sellerName,sellerEmoji:row.sellerEmoji,sellerJoinedAt:row.sellerJoinedAt,soldAt:row.soldAt??undefined,visibility} as Listing;
}
export function listingToApi(listing:Listing) {
  const keys=['chip','year','colorId','size','memory','storage','condition','originalBox','shippingScope','connectivity','simLock','keyboardLayout','keyboardLayoutDetails','includedAccessories','batteryMaxCapacityPercent','batteryCycleCount','appleWarrantyUntil','serialNumber','street','locality','priceAdjustment','photoIds','photoUrls'] as const;
  return {categoryId:listing.categoryId,modelId:listing.modelId,priceCents:Math.round((listing.listedPrice??listing.price)*100),city:listing.city,postalCode:listing.postalCode,specs:Object.fromEntries(keys.filter(key=>listing[key]!==undefined).map(key=>[key,listing[key]]))};
}
