import type { PropertyDTO, Category, ListingType } from "@/types/property";

const neighborhoods = [
  "Al Wahda", "Al Qods", "Hay Al Massira", "Hay Moulay Rachid", "Centre Ville",
  "Hay Salam", "Essalam", "El Marsa", "Al Wifaq", "Al Amal",
  "Hay El Khatouat", "Hay El Wahda", "Hay El Farah", "Hay Al Qods", "Hay Chabab",
];
const images = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
];

export const demoProperties: PropertyDTO[] = Array.from({ length: 30 }, (_, index) => {
  const category: Category = index % 5 === 0 ? "land" : index % 3 === 0 ? "build" : "apartment";
  const listingType: ListingType = category === "land" || index % 2 === 0 ? "sale" : "rent";
  const city = "Laâyoune";
  return {
    _id: `demo-property-${index + 1}`,
    title: `${category === "land" ? "Development Plot" : category === "build" ? "Modern Building" : "Premium Apartment"} ${index + 1} — ${city}`,
    category,
    propertyType: category === "build" ? "villa" : category === "apartment" ? (index % 4 === 0 ? "duplex" : "apartment") : undefined,
    listingType,
    description: `Demo property prepared for the MVP presentation in ${city}. View details, location, and availability.`,
    price: listingType === "rent" ? 4500 + index * 350 : 550000 + index * 125000,
    rentalPeriod: listingType === "rent" ? "monthly" : undefined,
    status: "available",
    visibility: "public",
    location: { city, district: neighborhoods[index % neighborhoods.length], address: `Avenue ${index + 1}, ${neighborhoods[index % neighborhoods.length]}` },
    details: category === "land" ? { area: 300 + index * 40 } : { area: 65 + index * 8, rooms: 1 + (index % 4), bathrooms: 1 + (index % 3), hasKitchen: true },
    units: [],
    images: [images[index % images.length]],
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
  };
});
