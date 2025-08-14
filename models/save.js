const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    location: {
      type: {
        type: String,
        enum: ["Point"], // GeoJSON type
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      area: String,
      city: String,
    },
    propertyType: String,
    maxGuests: Number,

    rooms: {
      type: Number,
      default: 1,
    },
    beds: {
      type: Number,
      default: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },

    currency: String,

    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenity",
      },
    ],

    rating: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],

    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],

    images: String,
  },
  { timestamps: true }
);

// propertySchema.index({ location: "2dSphere" });

// module.exports =
//   mongoose.models.Property || mongoose.model("Save", saveSchema);

//  const AmenitySchema = new mongoose.Schema({
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//   });
  