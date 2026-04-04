import express from "express";
import {
    getAdminStats,
    getAllUsers,
    getAllTickets,
    getAllLostFound,
    getZoneDensity
} from "../controllers/adminController.js";
import authenticateClient from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply auth middleware for safety (could also check for isAdmin role)
router.get("/stats", authenticateClient, getAdminStats);
router.get("/users", authenticateClient, getAllUsers);
router.get("/tickets", authenticateClient, getAllTickets);
router.get("/lostfound", authenticateClient, getAllLostFound);
router.get("/density", authenticateClient, getZoneDensity);

export default router;
