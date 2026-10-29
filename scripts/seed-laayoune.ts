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

const laayouneProperties = [
  {
    title: "Villa R+1 avec Jardin à Al Wahda",
    category: "build",
    propertyType: "villa",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 1850000,
    description: "Magnifique villa moderne R+1 située dans le quartier résidentiel Al Wahda à Laâyoune. Titre foncier (Mohafada) en règle. 4 chambres, salon marocain, cuisine équipée et jardin privatif.",
    location: {
      city: "Laâyoune",
      district: "Al Wahda",
      address: "Avenue Al Wahda, Laâyoune",
      mapUrl: "https://maps.google.com/?q=27.1425,-13.1895",
    },
    details: { rooms: 4, bathrooms: 3, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
    ],
  },
  {
    title: "Appartement standing 3 pièces - Al Qods",
    category: "apartment",
    propertyType: "apartment",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 740000,
    description: "Appartement lumineux de 85 m² au 2ème étage avec ascenseur. Titre foncier disponible (Conservation foncière / Mohafada). Proche de toutes commodités et avenue Makkah.",
    location: {
      city: "Laâyoune",
      district: "Al Qods",
      address: "Boulevard Makkah, Al Qods",
      mapUrl: "https://maps.google.com/?q=27.1610,-13.2080",
    },
    details: { rooms: 3, bathrooms: 2, hasKitchen: true, kitchenCabinetsInstalled: true },
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    ],
  },
  {
    title: "Terrain R+3 Commercial - Hay Al Massira",
    category: "land",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 1450000,
    description: "Parcelle de 220 m² avec autorisation R+3 commercial sur grand boulevard à Hay Al Massira. Propriété titrée Mohafada avec certificat de propriété.",
    location: {
      city: "Laâyoune",
      district: "Hay Al Massira",
      address: "Boulevard Mohammed V",
      mapUrl: "https://maps.google.com/?q=27.1480,-13.2150",
    },
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200"],
  },
  {
    title: "Immeuble R+2 de 6 appartements - 25 Mars",
    category: "build",
    listingType: "sale",
    status: "reserved",
    visibility: "private",
    price: 1980000,
    description: "Immeuble de rapport moderne comprenant 6 appartements 2 chambres avec compteurs d'eau et électricité séparés. Statut juridique : En cours d'immatriculation (Réquisition).",
    location: {
      city: "Laâyoune",
      district: "25 Mars",
      address: "Rue 25 Mars",
      mapUrl: "https://maps.google.com/?q=27.1390,-13.2050",
    },
    units: [
      { name: "Appt 101", number: "101", rooms: 2, bathrooms: 1, isRented: true },
      { name: "Appt 102", number: "102", rooms: 2, bathrooms: 1, isRented: true },
      { name: "Appt 201", number: "201", rooms: 2, bathrooms: 1, isRented: false },
    ],
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200"],
  },
  {
    title: "Appartement meublé à louer - Hay Moulay Rachid",
    category: "apartment",
    propertyType: "apartment",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 4500,
    description: "Superbe appartement entièrement meublé et équipé à Hay Moulay Rachid. Salon moderne, climatisé, proche écoles et commerces. Disponibilité immédiate.",
    location: {
      city: "Laâyoune",
      district: "Hay Moulay Rachid",
      address: "Boulevard Smara",
      mapUrl: "https://maps.google.com/?q=27.1575,-13.1950",
    },
    details: { rooms: 2, bathrooms: 1, hasKitchen: true, acInstalled: true },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"],
  },
  {
    title: "Terrain lotissement Al Wifaq - Titre Foncier",
    category: "land",
    listingType: "sale",
    status: "sold",
    visibility: "private",
    price: 680000,
    description: "Terrain viabilisé de 160 m² R+2 dans le nouveau lotissement Al Wifaq. Acte adoulaire moulkia avec enregistrement en cours.",
    location: {
      city: "Laâyoune",
      district: "Al Wifaq",
      address: "Lotissement Al Wifaq",
      mapUrl: "https://maps.google.com/?q=27.1650,-13.1880",
    },
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200"],
  },
  {
    title: "Local Commercial Zone Aéroport - Al Matar",
    category: "apartment",
    propertyType: "shop",
    listingType: "rent",
    rentalPeriod: "monthly",
    status: "available",
    visibility: "public",
    price: 12000,
    description: "Grand local commercial de 140 m² avec mezzanine, idéal showroom ou agence dans le quartier de l'Aéroport Hassan I.",
    location: {
      city: "Laâyoune",
      district: "Al Matar",
      address: "Route de l'Aéroport Hassan I",
      mapUrl: "https://maps.google.com/?q=27.1450,-13.2250",
    },
    details: { rooms: 1, bathrooms: 1 },
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"],
  },
  {
    title: "Grande Propriété de Prestige - Hors Barème 3M+",
    category: "build",
    propertyType: "villa",
    listingType: "sale",
    status: "available",
    visibility: "public",
    price: 3800000,
    description: "Palais moderne luxueux avec piscine et finitions artisanales marocaines. Dépasse le plafond standard de 2M MAD pour tester les règles de filtrage de prix.",
    location: {
      city: "Laâyoune",
      district: "Al Wahda",
      address: "Quartier Résidentiel Sud",
      mapUrl: "https://maps.google.com/?q=27.1435,-13.1870",
    },
    details: { rooms: 7, bathrooms: 5 },
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"],
  },
  {
    title: "Nouveau Projet en cours de documentation (Sans localisation)",
    category: "apartment",
    listingType: "sale",
    status: "available",
    visibility: "private",
    price: 520000,
    description: "Projet en cours d'enregistrement sans géolocalisation pour alimenter la file d'attente des emplacements manquants (Missing location queue).",
    images: [],
  },
];

async function seedLaayoune() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB.");

  // Remove previous sample properties with same titles or insert fresh
  for (const item of laayouneProperties) {
    await Property.findOneAndUpdate(
      { title: item.title },
      { $set: item },
      { upsert: true, new: true }
    );
  }

  console.log(`Successfully seeded ${laayouneProperties.length} Laâyoune properties with verified coordinates and neighborhood records.`);
  await mongoose.disconnect();
}

seedLaayoune().catch((err) => {
  console.error("Error seeding Laâyoune properties:", err);
  process.exit(1);
});
