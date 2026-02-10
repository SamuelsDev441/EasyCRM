import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import openid from "express-openid-connect";
import prisma from "../db/prisma.js";

const router = express.Router();

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route for Home page
router.get("/", async (req, res) => {
  if (req.oidc?.isAuthenticated?.()) {
    const auth0Id = req.oidc?.user?.sub;
    if (auth0Id) {
      const user = await prisma.user.findUnique({ where: { auth0Id } });
      if (user?.role === "ADMIN") {
        return res.redirect("/admin");
      }
      return res.redirect("/employee");
    }
  }
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// Route for Employees page
router.get("/employees", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/employees.html"));
});

// Route for Reports page
router.get("/reports", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/reports.html"));
});

// Admin dashboard (requires login)
const { requiresAuth } = openid;

router.get("/admin", requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/admin.html"));
});

// Role chooser
router.get("/choose", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/choose.html"));
});

// Employee dashboard (requires login)
router.get("/employee", requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/employee.html"));
});

export default router;
