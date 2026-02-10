import express from "express";
import { listEmployees, showEmployee } from "../controllers/employeesController.js";

const router = express.Router();

router.get("/", listEmployees);        // /api/employees?name=...
router.get("/:id", showEmployee);      // /api/employees/1

export default router;
