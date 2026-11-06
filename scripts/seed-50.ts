import { config } from "dotenv";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { Property } from "../models/Property";
import { LAAYOUNE_NEIGHBORHOODS } from "../lib/laayoune-data";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
config({ path: fs.existsSync(envLocalPath) ? envLocalPath : path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Add it to .env.local first.");
  process.exit(1);
}

// Curated high quality real estate photography from Unsplash
const APARTMENT_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502005229762-ee1b2b80f089?w=1200&auto=format&fit=crop&q=80"
];

const VILLA_BUILD_IMAGES = [
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80"
];

const LAND_IMAGES = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524813686514-a57563d77d61?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1200&auto=format&fit=crop&q=80"
];

function randomFloat(min: number, max: number, decimals = 4): number {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const templates = [
  // APARTMENTS (Rent & Sale)
  {
    category: "apartment" as const,
    propertyType: "apartment" as const,
    listingType: "sale" as const,
    titleEn: "Modern High-Standing Apartment",
    titleAr: "شقة حديثة راقية بتشطيبات ممتازة",
    descEn: "Exceptional sunny apartment located on a calm avenue. Includes spacious Moroccan salon, modern fitted kitchen, master suite with private bath, and secure underground parking.",
    descAr: "شقة استثنائية مشمسة بموقع هادئ ومميز. تحتوي على صالون مغربي فسيح، مطبخ مجهز عصري، جناح رئيسي بحمام خاص، وموقف سيارات محروس.",
    priceRange: [480000, 950000],
    areaRange: [75, 140],
    roomsRange: [2, 4],
    bathroomsRange: [1, 2],
  },
  {
    category: "apartment" as const,
    propertyType: "apartment" as const,
    listingType: "rent" as const,
    rentalPeriod: "monthly" as const,
    titleEn: "Spacious Family Apartment for Rent",
    titleAr: "شقة عائلية فسيحة ومجهزة للكراء",
    descEn: "Well-appointed apartment ready for move-in. Located close to schools, supermarkets and public transport. Features built-in kitchen cabinets and air conditioning.",
    descAr: "شقة ممتازة ومريحة جاهزة للسكن العائلي. قريبة من المدارس والمحلات التجارية ووسائل النقل. مجهزة بخزائن مطبخ ومكيف هوائي.",
    priceRange: [2500, 5000],
    areaRange: [80, 120],
    roomsRange: [2, 3],
    bathroomsRange: [1, 2],
  },
  {
    category: "apartment" as const,
    propertyType: "duplex" as const,
    listingType: "sale" as const,
    titleEn: "Luxury Duplex with Private Terrace",
    titleAr: "دوبلكس فاخر مع تراس بانورامي خاص",
    descEn: "Stunning two-level duplex featuring high ceilings, contemporary open layout, private rooftop terrace with open views, and premium imported marble.",
    descAr: "دوبلكس رائع من طابقين يتميز بأسقف عالية، تصميم معاصر مفتوح، سطح وتراس خاص بإطلالة مفتوحة، ورخام فاخر.",
    priceRange: [1100000, 1750000],
    areaRange: [140, 220],
    roomsRange: [4, 5],
    bathroomsRange: [2, 3],
  },

  // VILLAS & BUILDS
  {
    category: "build" as const,
    propertyType: "villa" as const,
    listingType: "sale" as const,
    titleEn: "Contemporary Villa with Garden & Garage",
    titleAr: "فيلا معاصرة R+1 مع حديقة ومرآب",
    descEn: "Prestigious R+1 standalone villa with private garden, double salon, master suites with walk-in closet, and perimeter surveillance in quiet neighborhood.",
    descAr: "فيلا راقية R+1 مستقلة مع حديقة خاصة، صالونين، أجنحة نوم فخمة مع خزانة ملابس، ونظام حراسة في حي هادئ ومرموق.",
    priceRange: [1600000, 3200000],
    areaRange: [220, 380],
    roomsRange: [4, 6],
    bathroomsRange: [3, 4],
  },
  {
    category: "build" as const,
    propertyType: "floor" as const,
    listingType: "sale" as const,
    titleEn: "Investment Building R+2 with Commercial Ground Floor",
    titleAr: "عمارة استثمارية R+2 مع سفلي تجاري",
    descEn: "Excellent income-generating property consisting of ground-floor commercial shops plus 4 independent rental apartments on the upper floors. High yield potential.",
    descAr: "عقار استثماري ذو عائد ممتاز مكون من محلات تجارية بالطابق الأرضي و 4 شقق سكنية مستقلة بالطوابق العليا. موقع ذو رواج تجاري.",
    priceRange: [2200000, 4500000],
    areaRange: [300, 550],
    roomsRange: [6, 12],
    bathroomsRange: [4, 8],
  },
  {
    category: "build" as const,
    propertyType: "villa" as const,
    listingType: "rent" as const,
    rentalPeriod: "monthly" as const,
    titleEn: "Furnished Executive Villa for Rent",
    titleAr: "فيلا راقية مفروشة للكراء الشهري",
    descEn: "High-end villa available for executive lease or family living. Fully furnished with refined taste, equipped kitchen, and lush courtyard.",
    descAr: "فيلا فاخرة مؤثثة بالكامل للكراء الشهري، تناسب العائلات أو الأطر والشركات. تشطيبات فاخرة، مطبخ متكامل وفناء مشمس.",
    priceRange: [9000, 18000],
    areaRange: [240, 350],
    roomsRange: [4, 5],
    bathroomsRange: [3, 4],
  },

  // LANDS
  {
    category: "land" as const,
    listingType: "sale" as const,
    titleEn: "Residential Land Plot R+2",
    titleAr: "بقعة أرضية سكنية R+2 مميزة",
    descEn: "Prime titled residential plot in expanding neighborhood. Clean boundaries, certified property title (Mohafada), water and electricity connections available on street.",
    descAr: "بقعة أرضية سكنية محفظة (تيتر عقاري) في تجزئة حديثة وواعدة. شوارع مجهزة بالماء والكهرباء والإنارة. رخصة بناء R+2.",
    priceRange: [380000, 850000],
    areaRange: [100, 200],
    roomsRange: [0, 0],
    bathroomsRange: [0, 0],
  },
  {
    category: "land" as const,
    listingType: "sale" as const,
    titleEn: "Commercial Plot on Main Avenue R+3",
    titleAr: "بقعة تجارية وسكنية R+3 على شارع رئيسي",
    descEn: "High-traffic commercial land parcel directly facing wide boulevard. Ideal for retail stores, offices or residential development. Titre Foncier ready.",
    descAr: "أرض تجارية وسكنية استراتيجية على واجهة شارع عريض ذو حركية نشطة. مثالية لإنشاء مكاتب ومحلات تجارية أو عمارة سكنية. محفظة بالكامل.",
    priceRange: [900000, 2400000],
    areaRange: [160, 360],
    roomsRange: [0, 0],
    bathroomsRange: [0, 0],
  },
];

async function seed50() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected successfully.");

  const newProperties = [];

  for (let i = 1; i <= 50; i++) {
    const template = templates[(i - 1) % templates.length];
    const neighborhood = LAAYOUNE_NEIGHBORHOODS[(i - 1) % LAAYOUNE_NEIGHBORHOODS.length];

    // Jitter coordinates slightly around neighborhood center (approx 50m - 300m)
    const lat = randomFloat(neighborhood.center[0] - 0.0035, neighborhood.center[0] + 0.0035, 5);
    const lng = randomFloat(neighborhood.center[1] - 0.0035, neighborhood.center[1] + 0.0035, 5);

    // Pick photos
    let images: string[] = [];
    if (template.category === "apartment") {
      const img1 = randomChoice(APARTMENT_IMAGES);
      let img2 = randomChoice(APARTMENT_IMAGES);
      while (img2 === img1) img2 = randomChoice(APARTMENT_IMAGES);
      images = [img1, img2];
    } else if (template.category === "build") {
      const img1 = randomChoice(VILLA_BUILD_IMAGES);
      let img2 = randomChoice(VILLA_BUILD_IMAGES);
      while (img2 === img1) img2 = randomChoice(VILLA_BUILD_IMAGES);
      images = [img1, img2];
    } else {
      images = [randomChoice(LAND_IMAGES)];
    }

    const price = Math.round(
      randomFloat(template.priceRange[0], template.priceRange[1]) / (template.listingType === "rent" ? 100 : 10000)
    ) * (template.listingType === "rent" ? 100 : 10000);

    const area = Math.round(randomFloat(template.areaRange[0], template.areaRange[1]));
    const rooms = template.roomsRange[1] > 0 ? Math.round(randomFloat(template.roomsRange[0], template.roomsRange[1])) : undefined;
    const bathrooms = template.bathroomsRange[1] > 0 ? Math.round(randomFloat(template.bathroomsRange[0], template.bathroomsRange[1])) : undefined;

    const blocLetters = ["A", "B", "C", "D", "E", "F"];
    const bloc = randomChoice(blocLetters);
    const number = String(Math.floor(Math.random() * 250) + 1);

    // Alternate Arabic and French/English titles for natural bilingual marketplace feel
    const isAr = i % 2 === 0;
    const title = isAr
      ? `${template.titleAr} - ${neighborhood.nameAr}`
      : `${template.titleEn} - ${neighborhood.name}`;

    const description = isAr
      ? `${template.descAr}\nالموقع: ${neighborhood.nameAr}، بلوك ${bloc} رقم ${number}، العيون.\nللمزيد من المعلومات أو ترتيب زيارة يرجى التواصل معنا.`
      : `${template.descEn}\nEmplacement: ${neighborhood.name}, Bloc ${bloc} N° ${number}, Laâyoune.\nPour toute visite ou renseignement, veuillez contacter notre bureau.`;

    const propDoc: any = {
      title,
      category: template.category,
      listingType: template.listingType,
      rentalPeriod: template.rentalPeriod,
      status: "available",
      visibility: "public",
      price,
      description,
      location: {
        city: "Laâyoune",
        district: neighborhood.name,
        address: `Avenue principale, ${neighborhood.name}, Laâyoune`,
        bloc,
        number,
        mapUrl: `https://maps.google.com/?q=${lat},${lng}`,
      },
      images,
      owner: {
        name: "Bureau DreamX / Zin Aroqi",
        phone: "+21234981286",
      },
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(),
    };

    if (template.propertyType) {
      propDoc.propertyType = template.propertyType;
    }

    if (template.category !== "land") {
      propDoc.details = {
        area,
        rooms,
        bathrooms,
        hasKitchen: true,
        kitchenCabinetsInstalled: Math.random() > 0.3,
        acInstalled: Math.random() > 0.4,
        residencyType: "family",
      };
    } else {
      propDoc.details = {
        area,
      };
      propDoc.legalStatus = Math.random() > 0.25 ? "mohafada" : "non_mohafada";
    }

    newProperties.push(propDoc);
  }

  console.log(`Inserting ${newProperties.length} realistic properties...`);
  const result = await Property.insertMany(newProperties);
  console.log(`Successfully added ${result.length} properties to the database!`);

  const total = await Property.countDocuments();
  console.log(`Total properties currently in database: ${total}`);

  await mongoose.disconnect();
}

seed50().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
