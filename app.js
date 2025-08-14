const express = require("express");
const mongoose = require("mongoose");
// cors
const cors = require("cors");
require("dotenv").config();

// const mockApiRoutes = require("./routes/mockApi");
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/properties", propertyRoutes);
// app.use("/mock", mockApiRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");

    app.listen(port, () => {
      console.log(`Server is running on PORT ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

start();

// MONGO_URI=mongodb+srv://htechsolutionz:sZzvlMWyNriSwlQ7@cluster0.pkcldjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// mongodb+srv://airbnbAdmin:<db_password>@cluster0.qva5wwz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
