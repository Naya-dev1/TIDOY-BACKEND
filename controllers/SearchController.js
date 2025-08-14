const Property = require("../models/Property2");

exports.searchProperties = async (req, res) => {
  try {
    const {
      city,
      area,
      minPrice,
      maxPrice,
      rooms,
      bathrooms,
      amenities,
      propertyType,
      ratingMin,
      sortBy,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // City / Area (case-insensitive)
    if (city) query.city = { $regex: city, $options: "i" };
    if (area) query.area = { $regex: area, $options: "i" };

    // Price filter (NaN-proof)
    if (
      (minPrice !== undefined && minPrice !== "") ||
      (maxPrice !== undefined && maxPrice !== "")
    ) {
      query.pricePerNight = {};
      if (!isNaN(Number(minPrice)) && minPrice !== "") {
        query.pricePerNight.$gte = Number(minPrice);
      }
      if (!isNaN(Number(maxPrice)) && maxPrice !== "") {
        query.pricePerNight.$lte = Number(maxPrice);
      }
      if (Object.keys(query.pricePerNight).length === 0) {
        delete query.pricePerNight;
      }
    }

    // Rooms filter
    if (!isNaN(Number(rooms)) && rooms !== "") {
      query.rooms = { $gte: Number(rooms) };
    }

    // Bathrooms filter
    if (!isNaN(Number(bathrooms)) && bathrooms !== "") {
      query.bathrooms = { $gte: Number(bathrooms) };
    }

    // Property type (case-insensitive)
    if (propertyType) {
      query.propertyType = { $regex: propertyType, $options: "i" };
    }

    // Amenities filter (case-insensitive)
    if (amenities) {
      const amenityArray = Array.isArray(amenities)
        ? amenities
        : amenities.split(",").map((a) => a.trim());

      query.$and = amenityArray.map((am) => ({
        amenities: { $elemMatch: { $regex: am, $options: "i" } },
      }));
    }

    // Rating filter (use score field from schema)
    if (!isNaN(Number(ratingMin)) && ratingMin !== "") {
      query.score = { $gte: Number(ratingMin) };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);

    // Fetch results
    let properties = await Property.find(query).skip(skip).limit(Number(limit));

    // Sorting
    if (sortBy) {
      if (sortBy === "priceAsc") {
        properties.sort((a, b) => a.pricePerNight - b.pricePerNight);
      }
      if (sortBy === "priceDesc") {
        properties.sort((a, b) => b.pricePerNight - a.pricePerNight);
      }
      if (sortBy === "rating") {
        properties.sort((a, b) => (b.score || 0) - (a.score || 0));
      }
      if (sortBy === "newest") {
        properties.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: properties,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
