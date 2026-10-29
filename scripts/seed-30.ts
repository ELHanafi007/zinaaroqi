import { config } from "dotenv";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { Property } from "../models/Property";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
config({ path: fs.existsSync(envLocalPath) ? envLocalPath : path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Add it to .env.local first.");
  process.exit(1);
}

const cities = ["Laâyoune", "Casablanca", "Rabat", "Marrakech", "Agadir", "Tangier", "Fez", "Dakhla"];
const districts = ["Al Wahda", "Al Qods", "Hay Al Massira", "Hay Moulay Rachid", "Centre Ville", "Hay Salam", "Ain Diab", "Gauthier"];
const laayouneNeighborhoods = [
  "Al Wahda", "Al Qods", "Hay Al Massira", "Hay Moulay Rachid", "Centre Ville",
  "Hay Salam", "Essalam", "El Marsa", "Al Wifaq", "Al Amal",
  "Hay El Khatouat", "Hay El Wahda", "Hay El Farah", "Hay Al Qods", "Hay Chabab",
];

const properties = [
  // 1
  {
    title: "Modern Villa with Pool - Al Wahda",
    category: "build",
    propertyType: "villa",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 2450000,
    description: "Stunning modern villa with private swimming pool, spacious garden, and premium finishes. 5 bedrooms, 4 bathrooms.",
    location: { city: "Laâyoune", district: "Al Wahda", address: "Villa District" },
    details: { rooms: 5, bathrooms: 4, area: 320, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200"],
  },
  // 2
  {
    title: "Luxury Apartment Downtown",
    category: "apartment",
    propertyType: "apartment",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 890000,
    description: "Elegant apartment in prime downtown location with city views, parking, and 24/7 security.",
    location: { city: "Casablanca", district: "Gauthier", address: "Boulevard Anfa" },
    details: { rooms: 3, bathrooms: 2, area: 95, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"],
  },
  // 3
  {
    title: "Spacious Land for Development",
    category: "land",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 1650000,
    description: "Prime development land with road access, utilities nearby. Ideal for residential project.",
    location: { city: "Rabat", district: "Hay Salam", address: "Lotissement Zone" },
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200"],
  },
  // 4
  {
    title: "Cozy Studio for Rent",
    category: "apartment",
    propertyType: "apartment",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 4500,
    description: "Fully furnished studio apartment perfect for young professionals. All amenities included.",
    location: { city: "Marrakech", district: "Centre Ville", address: "Medina Road" },
    details: { rooms: 1, bathrooms: 1, area: 35, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200"],
  },
  // 5
  {
    title: "Family Villa with Garden",
    category: "build",
    propertyType: "villa",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 15000,
    description: "Beautiful family villa with large garden, BBQ area, and children's play space.",
    location: { city: "Agadir", district: "Hay Salam", address: "Residential Area" },
    details: { rooms: 4, bathrooms: 3, area: 250, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200"],
  },
  // 6
  {
    title: "Penthouse with Ocean View",
    category: "apartment",
    propertyType: "apartment",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 3200000,
    description: "Luxurious penthouse with panoramic ocean views, private terrace, jacuzzi, and premium finishes.",
    location: { city: "Tangier", district: "Ain Diab", address: "Coastal Avenue" },
    details: { rooms: 4, bathrooms: 4, area: 180, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200"],
  },
  // 7
  {
    title: "Commercial Shop for Rent",
    category: "apartment",
    propertyType: "shop",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 12000,
    description: "High-traffic commercial shop perfect for retail business. Large display windows and storage.",
    location: { city: "Casablanca", district: "Centre Ville", address: "Main Street" },
    details: { rooms: 2, bathrooms: 1, area: 65, hasKitchen: false },
    images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"],
  },
  // 8
  {
    title: "Agricultural Land - Large Plot",
    category: "land",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 950000,
    description: "Fertile agricultural land with water access. Perfect for farming or cultivation.",
    location: { city: "Fez", district: "Hay Salam", address: "Rural Area" },
    images: ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200"],
  },
  // 9
  {
    title: "Duplex Apartment - Modern Design",
    category: "apartment",
    propertyType: "duplex",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 1200000,
    description: "Contemporary duplex with open floor plan, high ceilings, and private rooftop access.",
    location: { city: "Rabat", district: "Gauthier", address: "Uptown" },
    details: { rooms: 4, bathrooms: 3, area: 140, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200"],
  },
  // 10
  {
    title: "Two Bedroom Apartment for Rent",
    category: "apartment",
    propertyType: "apartment",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 6500,
    description: "Bright and airy two-bedroom apartment with balcony, parking, and modern amenities.",
    location: { city: "Laâyoune", district: "Hay Moulay Rachid", address: "Boulevard Smara" },
    details: { rooms: 2, bathrooms: 1, area: 75, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200"],
  },
  // 11
  {
    title: "Investment Building - 8 Units",
    category: "build",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 4500000,
    description: "Excellent investment opportunity - fully rented building with 8 apartments generating steady income.",
    location: { city: "Casablanca", district: "Ain Diab", address: "Business District" },
    units: [
      { name: "Unit 1", number: "101", rooms: 2, bathrooms: 1, isRented: true },
      { name: "Unit 2", number: "102", rooms: 2, bathrooms: 1, isRented: true },
      { name: "Unit 3", number: "201", rooms: 3, bathrooms: 2, isRented: true },
    ],
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"],
  },
  // 12
  {
    title: "Beachfront Villa",
    category: "build",
    propertyType: "villa",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 5800000,
    description: "Exclusive beachfront villa with private beach access, infinity pool, and stunning ocean views.",
    location: { city: "Dakhla", district: "Centre Ville", address: "Beach Road" },
    details: { rooms: 6, bathrooms: 5, area: 450, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"],
  },
  // 13
  {
    title: "Office Space for Rent",
    category: "apartment",
    propertyType: "shop",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 8500,
    description: "Modern office space in prime business district. Fully equipped with AC, parking, and internet.",
    location: { city: "Rabat", district: "Centre Ville", address: "Government District" },
    details: { rooms: 3, bathrooms: 2, area: 95, hasKitchen: true },
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200"],
  },
  // 14
  {
    title: "Residential Plot with Title",
    category: "land",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 720000,
    description: "Clean residential plot with all documents in order. Ready to build.",
    location: { city: "Marrakech", district: "Hay Salam", address: "New District" },
    images: ["https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200"],
  },
  // 15
  {
    title: "Furnished Apartment - City Center",
    category: "apartment",
    propertyType: "apartment",
    listingType: "rent",
    rentalPeriod: "yearly",
    status: "available",
    visibility: "public",
    price: 75000,
    description: "Fully furnished and equipped apartment in city center. Perfect for expatriates or families.",
    location: { city: "Casablanca", district: "Gauthier", address: "Central Location" },
    details: { rooms: 3, bathrooms: 2, area: 110, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"],
  },
  // 16
  {
    title: "Traditional Moroccan Villa",
    category: "build",
    propertyType: "villa",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 1950000,
    description: "Authentic Moroccan villa with traditional architecture, courtyard, and beautiful zellige tiles.",
    location: { city: "Fez", district: "Centre Ville", address: "Medina Edge" },
    details: { rooms: 5, bathrooms: 3, area: 200, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"],
  },
  // 17
  {
    title: "Ground Floor Apartment with Garden",
    category: "apartment",
    propertyType: "apartment",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 780000,
    description: "Ground floor apartment with private garden, perfect for families with children or pets.",
    location: { city: "Agadir", district: "Hay Al Massira", address: "Residential Complex" },
    details: { rooms: 3, bathrooms: 2, area: 90, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1515263487990-61b07816b324?w=1200"],
  },
  // 18
  {
    title: "Warehouse for Industrial Use",
    category: "build",
    propertyType: "shop",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 25000,
    description: "Large warehouse space suitable for storage, logistics, or light industrial use. Easy truck access.",
    location: { city: "Tangier", district: "Al Matar", address: "Industrial Zone" },
    details: { area: 500, rooms: 1 },
    images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200"],
  },
  // 19
  {
    title: "Luxury Duplex with Rooftop",
    category: "apartment",
    propertyType: "duplex",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 12000,
    description: "Stunning duplex with private rooftop terrace, BBQ area, and panoramic city views.",
    location: { city: "Marrakech", district: "Gauthier", address: "Modern District" },
    details: { rooms: 3, bathrooms: 3, area: 130, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200"],
  },
  // 20
  {
    title: "Corner Plot - Commercial Zone",
    category: "land",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 2100000,
    description: "Prime corner plot in commercial zone with high visibility. Perfect for retail development.",
    location: { city: "Casablanca", district: "Centre Ville", address: "Main Intersection" },
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"],
  },
  // 21
  {
    title: "One Bedroom Apartment - Young Professionals",
    category: "apartment",
    propertyType: "apartment",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 5500,
    description: "Modern one-bedroom apartment with great location, public transport nearby, and all utilities.",
    location: { city: "Rabat", district: "Hay Moulay Rachid", address: "University Area" },
    details: { rooms: 1, bathrooms: 1, area: 55, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200"],
  },
  // 22
  {
    title: "Mountain View Villa",
    category: "build",
    propertyType: "villa",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 2750000,
    description: "Beautiful villa with stunning mountain views, infinity pool, and luxurious outdoor living space.",
    location: { city: "Agadir", district: "Al Wahda", address: "Hilltop Area" },
    details: { rooms: 5, bathrooms: 4, area: 340, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200"],
  },
  // 23
  {
    title: "Serviced Apartment for Rent",
    category: "apartment",
    propertyType: "apartment",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 8500,
    description: "Fully serviced apartment with housekeeping, gym access, and concierge service included.",
    location: { city: "Casablanca", district: "Gauthier", address: "Luxury District" },
    details: { rooms: 2, bathrooms: 2, area: 85, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200"],
  },
  // 24
  {
    title: "Buildable Land - Residential Zone",
    category: "land",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 580000,
    description: "Perfect residential plot for building your dream home. All utilities available.",
    location: { city: "Fez", district: "Hay Salam", address: "New Subdivision" },
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200"],
  },
  // 25
  {
    title: "Studio Apartment with Balcony",
    category: "apartment",
    propertyType: "apartment",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 620000,
    description: "Modern studio with private balcony, great investment opportunity or first home.",
    location: { city: "Tangier", district: "Centre Ville", address: "Downtown" },
    details: { rooms: 1, bathrooms: 1, area: 45, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"],
  },
  // 26
  {
    title: "Luxury Townhouse",
    category: "build",
    propertyType: "villa",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 2150000,
    description: "Elegant townhouse with private courtyard, garage for 2 cars, and modern amenities.",
    location: { city: "Marrakech", district: "Al Wahda", address: "Gated Community" },
    details: { rooms: 4, bathrooms: 3, area: 220, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"],
  },
  // 27
  {
    title: "Retail Space in Mall",
    category: "apartment",
    propertyType: "shop",
    listingType: "rent",
    rentalPeriod: "yearly",
    status: "available",
    visibility: "public",
    price: 150000,
    description: "Prime retail space in popular shopping mall with high foot traffic and great visibility.",
    location: { city: "Casablanca", district: "Centre Ville", address: "Shopping District" },
    details: { rooms: 1, bathrooms: 1, area: 40, hasKitchen: false },
    images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"],
  },
  // 28
  {
    title: "Three Bedroom Family Apartment",
    category: "apartment",
    propertyType: "apartment",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 950000,
    description: "Spacious family apartment with large living area, balcony, and parking. Great location.",
    location: { city: "Rabat", district: "Al Qods", address: "Family District" },
    details: { rooms: 3, bathrooms: 2, area: 110, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200"],
  },
  // 29
  {
    title: "Investment Plot - Mixed Use",
    category: "land",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 2800000,
    description: "Large mixed-use plot with development potential. Prime location for commercial/residential project.",
    location: { city: "Tangier", district: "Centre Ville", address: "Development Zone" },
    images: ["https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200"],
  },
  // 30
  {
    title: "Modern Loft Apartment",
    category: "apartment",
    propertyType: "apartment",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 7200,
    description: "Stylish loft apartment with high ceilings, industrial design, and open concept living.",
    location: { city: "Marrakech", district: "Centre Ville", address: "Art District" },
    details: { rooms: 2, bathrooms: 1, area: 80, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: ["https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200"],
  },
];

// Demo inventory is intentionally localized to Laâyoune and spread across
// recognizable neighborhoods so the browse and map experiences feel local.
const laayouneProperties = properties.map((property, index) => ({
  ...property,
  location: {
    ...property.location,
    city: "Laâyoune",
    district: laayouneNeighborhoods[index % laayouneNeighborhoods.length],
    address: `Avenue ${index + 1}, ${laayouneNeighborhoods[index % laayouneNeighborhoods.length]}`,
  },
}));

async function seed30() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB.");
  
  console.log("Deleting all existing listings...");
  const deleteResult = await Property.deleteMany({});
  console.log(`Deleted ${deleteResult.deletedCount} listings.`);
  
  console.log("Adding 30 new properties...");
  await Property.insertMany(laayouneProperties);
  console.log(`Successfully added ${laayouneProperties.length} Laâyoune properties.`);
  
  await mongoose.disconnect();
  console.log("Done!");
}

seed30().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
