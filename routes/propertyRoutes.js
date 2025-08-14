const express = require("express");
const router = express.Router();

const { searchProperties } = require("../controllers/SearchController");

router.get("/", searchProperties);

module.exports = router;
