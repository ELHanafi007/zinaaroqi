import type { PropertyHydrated, ApartmentUnit } from "@/models/Property";
import type { PropertyDTO } from "@/types/property";

export function serializeProperty(doc: PropertyHydrated): PropertyDTO {
  const obj = doc.toObject({ getters: true });
  return {
    _id: obj._id.toString(),
    title: obj.title,
    category: obj.category,
    propertyType: obj.propertyType,
    legalStatus: obj.legalStatus,
    broughtBy: obj.broughtBy?.userId ? { userId: obj.broughtBy.userId, name: obj.broughtBy.name } : undefined,
    listingType: obj.listingType,
    description: obj.description,
    price: obj.price,
    rentalPeriod: obj.rentalPeriod,
    status: obj.status,
    visibility: obj.visibility,
    owner: obj.owner
      ? {
          name: obj.owner.name,
          phone: obj.owner.phone,
          email: obj.owner.email,
          notes: obj.owner.notes,
        }
      : undefined,
    location: obj.location
      ? {
          address: obj.location.address,
          city: obj.location.city,
          mapUrl: obj.location.mapUrl,
          district: obj.location.district,
          bloc: obj.location.bloc,
          number: obj.location.number,
        }
      : undefined,
    details: obj.details
      ? {
          rooms: obj.details.rooms,
          bathrooms: obj.details.bathrooms,
          hasKitchen: obj.details.hasKitchen,
          acInstalled: obj.details.acInstalled,
          kitchenCabinetsInstalled: obj.details.kitchenCabinetsInstalled,
          residencyType: obj.details.residencyType,
        }
      : undefined,
    tenant: obj.tenant
      ? {
          name: obj.tenant.name,
          idNumber: obj.tenant.idNumber,
          phone: obj.tenant.phone,
        }
      : undefined,
    units: (obj.units ?? []).map((u: ApartmentUnit) => ({
      isRented: u.isRented ?? Boolean(u.tenant),
      name: u.name,
      number: u.number,
      rooms: u.rooms,
      bathrooms: u.bathrooms,
      hasKitchen: u.hasKitchen,
      kitchenCabinetsInstalled: u.kitchenCabinetsInstalled,
      electricityNumber: u.electricityNumber,
      residencyType: u.residencyType,
      tenant: u.tenant
        ? {
            name: u.tenant.name,
            idNumber: u.tenant.idNumber,
            phone: u.tenant.phone,
          }
        : undefined,
    })),
    images: obj.images ?? [],
    tiktokUrl: obj.tiktokUrl || undefined,
    createdAt: new Date(obj.createdAt).toISOString(),
    updatedAt: new Date(obj.updatedAt).toISOString(),
  };
}
