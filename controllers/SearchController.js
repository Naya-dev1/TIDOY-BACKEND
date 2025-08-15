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
      sortBy,
    } = req.query;

    let filterConditions = [];

    // City or Area search (case-insensitive)
    if (location) {
      filterConditions.push({
        $or: [
          { city: { $regex: location, $options: "i" } },
          { area: { $regex: location, $options: "i" } },
        ],
      });
    }

    // Property Type
    if (propertyType && propertyType.toLowerCase() !== "any") {
      filterConditions.push({
        propertyType: { $regex: new RegExp(propertyType, "i") },
      });
    }

    // Price Range
    if (minPrice || maxPrice) {
      let priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      filterConditions.push({ pricePerNight: priceFilter });
    }

    // Amenities
    if (amenities && amenities.toLowerCase() !== "any") {
      const amenitiesArray = amenities.split(",").map((a) => a.trim());
      filterConditions.push({
        $or: amenitiesArray.map((a) => ({
          amenities: { $regex: new RegExp(a, "i") }, // case-insensitive
        })),
      });
    }

    // Bedrooms
    if (bedrooms) {
      filterConditions.push({ rooms: Number(bedrooms) });
    }

    // Bathrooms
    if (bathrooms) {
      filterConditions.push({ bathrooms: Number(bathrooms) });
    }

    // Final query (OR-based)
    let query = filterConditions.length > 0 ? { $or: filterConditions } : {};

    // Sorting options
    let sortOption = {};
    if (sortBy) {
      if (sortBy === "highestPrice") {
        sortOption.pricePerNight = -1;
      } else if (sortBy === "lowestPrice") {
        sortOption.pricePerNight = 1;
      } else if (sortBy === "mostPopular") {
        sortOption.score = -1;
      } else if (sortBy === "bestSelling") {
        sortOption.reviewCount = -1;
      }
    }

    // Query DB with filters + sorting
    let properties = await Property.find(query).sort(sortOption);

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
