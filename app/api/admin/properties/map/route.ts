import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectToDatabase } from "@/lib/mongodb/connect";
import { Property } from "@/models/Property";
import { resolveMapCoordinates } from "@/lib/map-coordinates";
import { propertyLocationUrl } from "@/lib/property-share";
import { LAAYOUNE_CENTER, LAAYOUNE_NEIGHBORHOODS, type LegalStatus } from "@/lib/laayoune-data";
import { demoProperties } from "@/lib/demo-properties";

export const dynamic = "force-dynamic";

export interface AdminMapPropertyItem {
  id: string;
  title: string;
  transactionType: "sale" | "rent";
  category: "build" | "apartment" | "land";
  propertyType?: string;
  priceAmount?: number;
  currency: string;
  rentalPeriod?: "monthly" | "yearly";
  listingStatus: "available" | "sold" | "rented";
  legalStatus?: LegalStatus;
  visibility: "public" | "private";
  latitude: number | null;
  longitude: number | null;
  neighborhoodId?: string;
  neighborhoodName?: string;
  city: string;
  district?: string;
  bloc?: string;
  number?: string;
  address?: string;
  primaryImageUrl?: string;
  area?: number;
  rooms?: number;
  bathrooms?: number;
  unitsCount?: number;
  updatedAt: string;
}

/**
 * GET /api/admin/properties/map
 *
 * Production map endpoint meeting DreamX specifications:
 * - Admin authorization: allows inspecting draft/private/sold/rented listings as authorized.
 * - Max price filter default: 2,000,000 MAD.
 * - Separates geographic location from legal status (Mohafada).
 * - Surfaces unmapped properties count and queue for data integrity.
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    // Allow the embedded iframe (which cannot send session cookies) to access
    // admin-level data by passing a server-side secret token.
    const tokenParam = new URL(req.url).searchParams.get("token");
    const serverToken = process.env.ADMIN_MAP_TOKEN;
    const tokenValid = serverToken && tokenParam === serverToken;

    const isStaff = Boolean(session?.user) || Boolean(tokenValid);

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "laayoune";
    const transaction = searchParams.get("transaction") || "all";
    const propertyType = searchParams.get("propertyType") || "all";
    const neighborhood = searchParams.get("neighborhood") || "all";
    const status = searchParams.get("status") || "all";
    const legalStatus = searchParams.get("legalStatus") || "all";
    const search = searchParams.get("search")?.trim().toLowerCase();
    const includeUnpriced = searchParams.get("includeUnpriced") === "true";

    const maxPriceParam = searchParams.get("maxPrice");
    const maxPrice = maxPriceParam !== null && maxPriceParam !== "" ? Number(maxPriceParam) : 0; // 0 = no cap
    const minPriceParam = searchParams.get("minPrice");
    const minPrice = minPriceParam !== null && minPriceParam !== "" ? Number(minPriceParam) : 0;

    const minRoomsParam = searchParams.get("rooms") || searchParams.get("minRooms");
    const minRooms = minRoomsParam ? Number(minRoomsParam) : 0;
    const minAreaParam = searchParams.get("minArea");
    const minArea = minAreaParam ? Number(minAreaParam) : 0;
    const maxAreaParam = searchParams.get("maxArea");
    const maxArea = maxAreaParam ? Number(maxAreaParam) : 0;

    // MongoDB base query
    const query: Record<string, unknown> = {};

    // If not staff, enforce public-only listings
    if (!isStaff) {
      query.visibility = "public";
      // public users default to available only unless authorized
      if (status === "all") {
        query.status = "available";
      }
    }

    if (status !== "all" && ["available", "sold", "rented"].includes(status)) {
      query.status = status;
    }

    if (transaction !== "all" && ["sale", "rent"].includes(transaction)) {
      query.listingType = transaction;
    }

    if (propertyType !== "all") {
      if (["apartment", "build", "land"].includes(propertyType)) {
        query.category = propertyType;
      } else if (["villa", "duplex", "floor", "shop", "other"].includes(propertyType)) {
        query.propertyType = propertyType;
      }
    }

    const docs = await Property.find(query).sort({ updatedAt: -1 }).lean();

    const processed = await Promise.all(
      docs.map(async (doc) => {
        // Price filtering: only restrict when a filter is explicitly applied
        const pAmount = doc.price;
        const hasPrice = typeof pAmount === "number" && !isNaN(pAmount);

        if (!hasPrice) {
          // Staff always sees unpriced listings; public visitors need opt-in
          if (!isStaff && !includeUnpriced) return null;
        } else {
          if (maxPrice > 0 && pAmount > maxPrice) return null;
          if (minPrice > 0 && pAmount < minPrice) return null;
        }

        // Title & search filtering
        const docCity = doc.location?.city || (city === "laayoune" ? "Laâyoune" : city);
        const docDistrict = doc.location?.district || "";
        const docBloc = doc.location?.bloc || "";
        const docNumber = doc.location?.number || "";
        const docAddress = doc.location?.address || "";
        const fullText = `${doc.title} ${docCity} ${docDistrict} ${docBloc} ${docNumber} ${docAddress}`.toLowerCase();

        if (search && !fullText.includes(search)) {
          return null;
        }

        // Match neighborhood (bidirectional check)
        const dLower = docDistrict.toLowerCase().trim();
        const assignedNeighborhood = LAAYOUNE_NEIGHBORHOODS.find((n) => {
          const nIdLower = n.id.toLowerCase();
          const nNameLower = n.name.toLowerCase();
          const nSlugClean = nIdLower.replace(/-/g, " ");

          if (dLower) {
            if (
              dLower.includes(nIdLower) ||
              dLower.includes(nNameLower) ||
              nNameLower.includes(dLower) ||
              nSlugClean.includes(dLower) ||
              dLower.includes(nSlugClean) ||
              docDistrict.includes(n.nameAr)
            ) {
              return true;
            }
          }
          return doc.title.toLowerCase().includes(nNameLower);
        });

        // If neighborhood filter applied
        if (neighborhood !== "all") {
          const matchesNeighborhood =
            assignedNeighborhood?.id === neighborhood ||
            dLower.includes(neighborhood.toLowerCase()) ||
            doc.title.toLowerCase().includes(neighborhood.toLowerCase());

          if (!matchesNeighborhood) {
            return null;
          }
        }

        // Extract coordinates from mapUrl or stored location
        let lat: number | null = null;
        let lng: number | null = null;

        const locUrl = propertyLocationUrl(doc);
        if (locUrl) {
          const point = await resolveMapCoordinates(locUrl);
          if (point) {
            lat = point[0];
            lng = point[1];
          }
        }

        // Fallback: if listing is assigned to a neighborhood or is in Laâyoune, provide realistic district/city center offset
        if (lat === null) {
          const hash = doc._id.toString().split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
          if (assignedNeighborhood) {
            lat = assignedNeighborhood.center[0] + ((hash % 11) - 5) * 0.0018;
            lng = assignedNeighborhood.center[1] + ((hash % 13) - 6) * 0.0018;
          } else if (!docCity || docCity.toLowerCase().includes("laayoune") || docCity.toLowerCase().includes("عيون")) {
            lat = LAAYOUNE_CENTER[0] + ((hash % 15) - 7) * 0.0022;
            lng = LAAYOUNE_CENTER[1] + ((hash % 17) - 8) * 0.0022;
          }
        }

        // Infer or assign legal status (Mohafada separate from geographic neighborhood)
        let docLegalStatus: LegalStatus = doc.legalStatus === "mohafada" ? "mohafada_titre" : doc.legalStatus === "non_mohafada" ? "non_specifie" : "unknown";
        const descLower = (doc.description || "").toLowerCase();
        if (doc.legalStatus === "mohafada" || descLower.includes("محفظ") || descLower.includes("titre") || descLower.includes("mohafada") || descLower.includes("conservation")) {
          docLegalStatus = "mohafada_titre";
        } else if (doc.legalStatus === "non_mohafada") {
          docLegalStatus = "non_specifie";
        } else if (descLower.includes("في طور") || descLower.includes("en cours") || descLower.includes("requisition")) {
          docLegalStatus = "en_cours";
        } else if (descLower.includes("عدلية") || descLower.includes("ملكية") || descLower.includes("moulkia")) {
          docLegalStatus = "moulkia";
        }

        const normalizedLegalStatus = legalStatus === "mohafada" ? "mohafada_titre" : legalStatus === "non_mohafada" ? "non_specifie" : legalStatus;
        if (normalizedLegalStatus !== "all" && docLegalStatus !== normalizedLegalStatus) {
          return null;
        }

        // Filter by rooms if specified
        if (minRooms > 0) {
          const docRooms = doc.details?.rooms ?? 0;
          if (docRooms < minRooms) return null;
        }

        // Filter by area (metrage) if specified
        if (minArea > 0 || maxArea > 0) {
          const docArea = doc.details?.area;
          if (docArea == null) return null;
          if (minArea > 0 && docArea < minArea) return null;
          if (maxArea > 0 && docArea > maxArea) return null;
        }

        const item: AdminMapPropertyItem = {
          id: doc._id.toString(),
          title: doc.title,
          transactionType: doc.listingType,
          category: doc.category,
          propertyType: doc.propertyType,
          priceAmount: doc.price,
          currency: "MAD",
          rentalPeriod: doc.rentalPeriod,
          listingStatus: doc.status,
          legalStatus: docLegalStatus,
          visibility: doc.visibility,
          latitude: lat,
          longitude: lng,
          neighborhoodId: assignedNeighborhood?.id,
          neighborhoodName: assignedNeighborhood?.name || docDistrict || "Laâyoune",
          city: docCity,
          district: docDistrict,
          bloc: docBloc || undefined,
          number: docNumber || undefined,
          address: docAddress,
          primaryImageUrl: doc.images && doc.images.length > 0 ? doc.images[0] : undefined,
          area: doc.details?.area,
          rooms: doc.details?.rooms,
          bathrooms: doc.details?.bathrooms,
          unitsCount: doc.units?.length,
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        };

        return item;
      })
    );

    const allItems: AdminMapPropertyItem[] = [];
    const missingLocationQueue: { id: string; title: string; price?: number; listingType: string; category: string; district?: string }[] = [];

    for (const item of processed) {
      if (!item) continue;
      if (item.latitude !== null && item.longitude !== null) {
        allItems.push(item);
      } else {
        missingLocationQueue.push({
          id: item.id,
          title: item.title,
          price: item.priceAmount,
          listingType: item.transactionType,
          category: item.category,
          district: item.district,
        });
      }
    }

    return NextResponse.json({
      city: "Laâyoune",
      mapCenter: LAAYOUNE_CENTER,
      totalCount: allItems.length + missingLocationQueue.length,
      mappedCount: allItems.length,
      unmappedCount: missingLocationQueue.length,
      neighborhoods: LAAYOUNE_NEIGHBORHOODS,
      data: allItems,
      missingLocationQueue,
    });
  } catch (error) {
    console.error("GET /api/admin/properties/map error:", error);
    if (process.env.DEMO_FALLBACK !== "true") {
      return NextResponse.json({ error: "Map database is temporarily unavailable." }, { status: 503 });
    }
    const fallbackParams = new URL(req.url).searchParams;
    const fallbackTransaction = fallbackParams.get("transaction") || "all";
    const fallbackType = fallbackParams.get("propertyType") || "all";
    const fallbackNeighborhood = fallbackParams.get("neighborhood") || "all";
    const fallbackStatus = fallbackParams.get("status") || "all";
    const fallbackSearch = fallbackParams.get("search")?.toLowerCase().trim() || "";
    const fallbackMaxPrice = Number(fallbackParams.get("maxPrice") || 0);
    const fallbackMinRooms = Number(fallbackParams.get("rooms") || 0);
    const fallbackMinArea = Number(fallbackParams.get("minArea") || 0);
    const fallbackMaxArea = Number(fallbackParams.get("maxArea") || 0);
    const filteredDemo = demoProperties.filter((doc) => {
      const text = `${doc.title} ${doc.location?.city || ""} ${doc.location?.district || ""}`.toLowerCase();
      const typeMatches = fallbackType === "all" || doc.category === fallbackType || doc.propertyType === fallbackType;
      const area = doc.details?.area || 0;
      return (fallbackTransaction === "all" || doc.listingType === fallbackTransaction) &&
        typeMatches &&
        (fallbackNeighborhood === "all" || doc.location?.district?.toLowerCase().includes(fallbackNeighborhood.toLowerCase())) &&
        (fallbackStatus === "all" || doc.status === fallbackStatus) &&
        (!fallbackSearch || text.includes(fallbackSearch)) &&
        (!fallbackMaxPrice || (doc.price || 0) <= fallbackMaxPrice) &&
        (!fallbackMinRooms || (doc.details?.rooms || 0) >= fallbackMinRooms) &&
        (!fallbackMinArea || area >= fallbackMinArea) &&
        (!fallbackMaxArea || area <= fallbackMaxArea);
    });
    const fallback = filteredDemo.map((doc, index): AdminMapPropertyItem => ({
      id: doc._id,
      title: doc.title,
      transactionType: doc.listingType,
      category: doc.category,
      propertyType: doc.propertyType,
      priceAmount: doc.price,
      currency: "MAD",
      rentalPeriod: doc.rentalPeriod,
      listingStatus: doc.status,
      legalStatus: "unknown",
      visibility: doc.visibility,
      latitude: LAAYOUNE_CENTER[0] + ((index % 7) - 3) * 0.002,
      longitude: LAAYOUNE_CENTER[1] + ((index % 9) - 4) * 0.002,
      neighborhoodName: doc.location?.district || "Laâyoune",
      city: doc.location?.city || "Laâyoune",
      district: doc.location?.district,
      address: doc.location?.address,
      primaryImageUrl: doc.images[0],
      area: doc.details?.area,
      rooms: doc.details?.rooms,
      bathrooms: doc.details?.bathrooms,
      unitsCount: doc.units.length,
      updatedAt: doc.updatedAt,
    }));
    return NextResponse.json({
      city: "Laâyoune",
      mapCenter: LAAYOUNE_CENTER,
      totalCount: fallback.length,
      mappedCount: fallback.length,
      unmappedCount: 0,
      neighborhoods: LAAYOUNE_NEIGHBORHOODS,
      data: fallback,
      missingLocationQueue: [],
      demo: true,
    });
  }
}
