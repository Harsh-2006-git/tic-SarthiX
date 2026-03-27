import jwt from "jsonwebtoken";
import Client from "../models/client.js";
import { v4 as uuidv4 } from "uuid";

const authenticateClient = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    // 1. Try local JWT verification
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (localErr) {
      // If local verification fails, try decoding as Firebase token
      const decoded = jwt.decode(token);

      // Check if it looks like a Firebase token
      if (decoded && (decoded.iss?.includes("securetoken.google.com") || decoded.aud === "divya-yatra-devsprint")) {
        // Find or create user in our database based on email or phone from Firebase
        const email = decoded.email;
        const phone = decoded.phone_number || "";

        let client = await Client.findOne({
          where: email ? { email } : { phone }
        });

        if (!client) {
          // Instead of creating, we just set the info we have from Firebase
          req.user = {
            firebaseOnly: true,
            email: email,
            name: decoded.name,
          };
          return next();
        }

        req.user = {
          client_id: client.client_id,
          phone: client.phone,
          email: client.email,
          userType: client.userType,
          unique_code: client.unique_code,
        };
        return next();
      }
      throw localErr;
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token or unauthorized" });
  }
};

export default authenticateClient;
