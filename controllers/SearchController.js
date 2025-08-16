// controllers/SearchController.js
const Property = require("../models/Property2");

exports.searchProperties = async (req, res) => {
  try {
    const {
      location,
      propertyType,
      minPrice,
      maxPrice,
      amenities,
      bedrooms,
      bathrooms,
      score, // ✅ NEW: grab score (rating) from query
      sortBy, // ✅ sorting type (modal filter)
      category, // ✅ NEW: for parent container quick filters (popular, best price, recommended)
    } = req.query;

    let andConditions = []; // ✅ CHANGED: We'll use $and for strict filters

    // ✅ CASE-PROOF: Lowercase string filters so casing doesn't break matches
    // location = location?.toString().trim();
    // propertyType = propertyType?.toString().trim();
    // amenities = amenities?.toString().trim();
    // score = score?.toString().trim();

    // City or Area search (case-insensitive)
    if (location) {
      andConditions.push({
        $or: [
          { city: { $regex: location, $options: "i" } },
          { area: { $regex: location, $options: "i" } },
        ],
      });
    }

    // Property Type
    if (propertyType && propertyType.toLowerCase() !== "any") {
      andConditions.push({
        propertyType: { $regex: new RegExp(propertyType, "i") },
      });
    }

    // Price Range
    if (minPrice || maxPrice) {
      let priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      andConditions.push({ pricePerNight: priceFilter });
    }

    // Amenities
    if (amenities && amenities.toLowerCase() !== "any") {
      const amenitiesArray = amenities.split(",").map((a) => a.trim());
      andConditions.push({
        $or: amenitiesArray.map((a) => ({
          amenities: { $regex: new RegExp(a, "i") }, // case-insensitive
        })),
      });
    }

    // Bedrooms
    if (bedrooms) {
      andConditions.push({ rooms: Number(bedrooms) });
    }

    // Bathrooms
    if (bathrooms) {
      andConditions.push({ bathrooms: Number(bathrooms) });
    }

    // ✅ NEW: Score (rating)
    if (score) {
      const numericScore = Number(score);
      andConditions.push({
        score: { $gte: numericScore, $lt: numericScore + 1 }, // e.g., 2.0 - 2.9
      });
    }

    // Final query (OR-based if multiple filters exist)
    let query = andConditions.length > 0 ? { $and: andConditions } : {};

    // Sorting options

    // ✅ Quick Sort (parent container tabs)
    // "popular" → sort by score desc
    // "bestPrice" → sort by pricePerNight asc
    // "recommended" → sort by reviewCount desc

    // ✅ Sorting options
    // ✅ Sorting options
    let sortOption = {};

    // Lowercase values so case doesn't break sorting
    const sortByLower = sortBy?.toLowerCase();
    const categoryLower = category?.toLowerCase();

    // ✅ Parent container filters (category)
    if (categoryLower) {
      if (categoryLower === "popular") {
        sortOption.score = -1;
      } else if (categoryLower === "bestprice") {
        sortOption.pricePerNight = 1; // Balanced: good score + low price
        sortOption.score = -1;
      } else if (categoryLower === "recommended") {
        sortOption.score = -1;
        sortOption.reviewCount = -1;
        sortOption.pricePerNight = 1;
      }
    }

    // ✅ Modal sort filters (sortBy)
    if (sortByLower) {
      if (sortByLower === "highestprice") {
        sortOption = { ...sortOption, pricePerNight: -1 };
      } else if (sortByLower === "lowestprice") {
        sortOption = { ...sortOption, pricePerNight: 1 };
      } else if (sortByLower === "mostpopular") {
        sortOption = { ...sortOption, score: -1 };
      } else if (sortByLower === "bestselling") {
        sortOption = { ...sortOption, reviewCount: -1 };
      }
    }

    // Query DB with filters + sorting
    let properties = await Property.find(query).sort(sortOption);

    // 🔍 Debug: check price types and order
    // console.log("Sorting by:", sortOption);
    // properties.forEach((p, i) => {
    //   console.log(
    //     `${i + 1}. ${p.title} - pricePerNight:`,
    //     p.pricePerNight,
    //     "(",
    //     typeof p.pricePerNight,
    //     ")"
    //   );
    // });

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
