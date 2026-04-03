import Client from "../models/client.js";
import Ticket from "../models/ticket.js";
import LostFound from "../models/LostFound.js";
import ZoneTracker from "../models/zoneTracker.js";
import Alert from "../models/alert.js";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";

// Admin email whitelist
const ADMIN_EMAILS = ["amitmanmode01@gmail.com"];

// Middleware-style check
export const isAdmin = (req) => {
    const email = req.user?.email;
    return ADMIN_EMAILS.includes(email) || req.user?.userType === "Admin";
};

export const getAdminStats = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const totalUsers = await Client.count();
        const totalTickets = await Ticket.count();
        const totalLostItems = await LostFound.count();
        const activeAlerts = await Alert.count({ where: { is_active: true } });

        // Sum total tickets booked (no_of_tickets field)
        const totalCapacity = await Ticket.sum('no_of_tickets') || 0;

        // Revenue estimation
        const revenue = totalCapacity * 200;

        // User type breakdown
        const userTypeBreakdown = await Client.findAll({
            attributes: [
                'userType',
                [sequelize.fn('COUNT', sequelize.col('client_id')), 'count']
            ],
            group: ['userType'],
            raw: true
        });

        // Tickets per day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const ticketsPerDay = await Ticket.findAll({
            attributes: [
                'date',
                [sequelize.fn('COUNT', sequelize.col('ticket_id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('no_of_tickets')), 'totalDevotees']
            ],
            where: {
                created_at: { [Op.gte]: sevenDaysAgo }
            },
            group: ['date'],
            order: [['date', 'ASC']],
            raw: true
        });

        // Category breakdown (tickets)
        const categoryBreakdown = await Ticket.findAll({
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('ticket_id')), 'count']
            ],
            group: ['category'],
            raw: true
        });

        // Recent registrations (last 7 days)
        const recentUsers = await Client.count({
            where: { created_at: { [Op.gte]: sevenDaysAgo } }
        });

        res.json({
            totalUsers,
            totalTickets,
            totalCapacity,
            totalLostItems,
            activeAlerts,
            recentUsers,
            revenue: `₹${(revenue / 100000).toFixed(1)}L`,
            userTypeBreakdown,
            ticketsPerDay,
            categoryBreakdown
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Error fetching admin stats" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const users = await Client.findAll({
            attributes: ['client_id', 'name', 'email', 'phone', 'userType', 'profile_image', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        console.error("Admin Users Error:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
};

export const getAllTickets = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const tickets = await Ticket.findAll({
            include: [{
                model: Client,
                attributes: ['name', 'email']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        console.error("Admin Tickets Error:", error);
        res.status(500).json({ message: "Error fetching tickets" });
    }
};

export const getAllLostFound = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const items = await LostFound.findAll({
            order: [['uploadedAt', 'DESC']]
        });
        res.json(items);
    } catch (error) {
        console.error("Admin LostFound Error:", error);
        res.status(500).json({ message: "Error fetching lost/found items", error: error.message });
    }
};

export const getZoneDensity = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const latestData = await ZoneTracker.findAll({
            attributes: [
                ['current_zone_id', 'zone_id'],
                [sequelize.fn('COUNT', sequelize.col('client_id')), 'count']
            ],
            where: {
                current_zone_id: { [Op.not]: null }
            },
            group: ['current_zone_id'],
            raw: true
        });
        res.json(latestData);
    } catch (error) {
        console.error("Admin ZoneDensity Error:", error);
        res.status(500).json({ message: "Error fetching zone density", error: error.message });
    }
};

// ==================== ALERT CRUD ====================

export const createAlert = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const { title, message, severity } = req.body;
        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }

        const alert = await Alert.create({
            title,
            message,
            severity: severity || "info",
            is_active: true,
            created_by: req.user.client_id
        });

        res.status(201).json(alert);
    } catch (error) {
        console.error("Create Alert Error:", error);
        res.status(500).json({ message: "Error creating alert", error: error.message });
    }
};

export const getAllAlerts = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const alerts = await Alert.findAll({
            include: [{
                model: Client,
                attributes: ['name', 'email']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(alerts);
    } catch (error) {
        console.error("Get Alerts Error:", error);
        res.status(500).json({ message: "Error fetching alerts" });
    }
};

export const toggleAlert = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const { id } = req.params;
        const alert = await Alert.findByPk(id);
        if (!alert) return res.status(404).json({ message: "Alert not found" });

        alert.is_active = !alert.is_active;
        await alert.save();

        res.json(alert);
    } catch (error) {
        console.error("Toggle Alert Error:", error);
        res.status(500).json({ message: "Error toggling alert" });
    }
};

export const deleteAlert = async (req, res) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

        const { id } = req.params;
        const alert = await Alert.findByPk(id);
        if (!alert) return res.status(404).json({ message: "Alert not found" });

        await alert.destroy();
        res.json({ message: "Alert deleted successfully" });
    } catch (error) {
        console.error("Delete Alert Error:", error);
        res.status(500).json({ message: "Error deleting alert" });
    }
};

// Public endpoint - returns active alerts for all users
export const getActiveAlerts = async (req, res) => {
    try {
        const alerts = await Alert.findAll({
            where: { is_active: true },
            attributes: ['alert_id', 'title', 'message', 'severity', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10
        });
        res.json(alerts);
    } catch (error) {
        console.error("Active Alerts Error:", error);
        res.status(500).json({ message: "Error fetching active alerts" });
    }
};

// Check if current user is admin
export const checkAdmin = async (req, res) => {
    try {
        res.json({ isAdmin: isAdmin(req) });
    } catch (error) {
        res.status(500).json({ isAdmin: false });
    }
};
