const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { userExtractor, authorize } = require("../utils/middleware");

const router = express.Router();

router.get(
  "/organizer-stats",
  userExtractor,
  authorize(["Organisateur", "administrateur"]),
  dashboardController.getOrganizerStats
);
router.get(
  "/admin-stats",
  userExtractor,
  authorize(["administrateur"]),
  dashboardController.getAdminStats
);
router.get(
  "/admin-report",
  userExtractor,
  authorize(["administrateur"]),
  dashboardController.generateAdminReport
);

module.exports = router;
