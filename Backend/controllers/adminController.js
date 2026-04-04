import Client from "../models/client.js";
import Ticket from "../models/ticket.js";
import LostFound from "../models/LostFound.js";
import ZoneTracker from "../models/zoneTracker.js";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";

export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await Client.count();
        const totalTickets = await Ticket.count();
        const totalLostItems = await LostFound.count();

        // Sum total tickets booked (no_of_tickets field)
        const totalCapacity = await Ticket.sum('no_of_tickets') || 0;

        // Revenue estimation (Dummy calculation: VIP tickets vs General)
        // Since we don't have a price field in the model, let's assume flat rates
        const revenue = totalCapacity * 200; // Average ₹200 per ticket

        res.json({
            totalUsers,
            totalTickets,
            totalCapacity,
            totalLostItems,
            revenue: `₹${(revenue / 100000).toFixed(1)}L`
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Error fetching admin stats" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
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
