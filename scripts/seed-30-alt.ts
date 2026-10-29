import { config } from "dotenv";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { Property } from "../models/Property";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
config({ path: fs.existsSync(envLocalPath) ? envLocalPath : path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI. Add it to .env.local first.");

async function seed30() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB.");
  
  console.log("Deleting all existing listings...");
  const deleteResult = await Property.deleteMany({});
  console.log(`Deleted ${deleteResult.deletedCount} listings.`);
  
  // Quick version - just create a few first
  const props = [
    {
      title: "Modern Villa with Pool - Al Wahda",
      category: "build",
      propertyType: "villa",
      listingType: "sale",
      status: "available",
      visibility: "public",
      price: 2450000,
      description: "Stunning modern villa with private swimming pool.",
      location: { city: "Laâyoune", district: "Al Wahda", address: "Villa District" },
      details: { rooms: 5, bathrooms: 4, area: 320, hasKitchen: true, kitchenCabinetsInstalled: true },
      images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200"],
    },
  ];
  for (let i = 0; i < 30; i++) {
    props.push({
      ...props[0],
      title: `Property ${i+2} - ${['Villa', 'Apartment', 'Land'][i%3]} ${i+1}`,
      category: ['build', 'apartment', 'land'][i%3] as any,
      ...(i % 3 === 2 ? {} : { propertyType: i % 3 === 0 ? 'villa' : 'apartment' }),
      price: (i+1)*100000 + 500000,
      description: `Beautiful property number ${i+1} with great features.`,
    });
  }
  // Fix land
  for (let i = 0; i < props.length; i++) {
    if (props[i].category === 'land') {
      props[i].listingType = 'sale';
    }
  }
  
  await Property.insertMany(props);
  console.log(`Successfully added ${props.length} properties.`);
  
  await mongoose.disconnect();
  console.log("Done!");
}

seed30().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
