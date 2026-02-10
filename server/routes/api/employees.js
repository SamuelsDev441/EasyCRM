import express from "express";
import prisma from "../../db/prisma.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { search, status, department } = req.query;
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { email: { contains: String(search), mode: "insensitive" } }
    ];
  }
  if (status) {
    where.status = String(status);
  }
  if (department) {
    where.department = String(department);
  }

  if (!req.isAdmin) {
    if (!req.dbUser?.email) {
      return res.status(403).json({ error: "Employee access requires an email" });
    }
    const employee = await prisma.employee.findFirst({
      where: { email: req.dbUser.email }
    });
    return res.json(employee ? [employee] : []);
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });
  res.json(employees);
});

router.post("/", requireAdmin, async (req, res) => {
  const {
    name,
    email,
    title,
    department,
    status,
    salaryCents,
    hourlyRateCents
  } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const employee = await prisma.employee.create({
    data: {
      name,
      email: email || null,
      title: title || null,
      department: department || null,
      status: status || undefined,
      salaryCents: Number.isFinite(salaryCents) ? salaryCents : null,
      hourlyRateCents: Number.isFinite(hourlyRateCents) ? hourlyRateCents : null
    }
  });
  res.status(201).json(employee);
});

router.get("/:id", async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.params.id }
  });
  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }
  res.json(employee);
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const data = {};
  const fields = [
    "name",
    "email",
    "title",
    "department",
    "status",
    "salaryCents",
    "hourlyRateCents"
  ];

  for (const field of fields) {
    if (field in (req.body || {})) {
      if (field.endsWith("Cents")) {
        data[field] = Number.isFinite(req.body[field]) ? req.body[field] : null;
      } else {
        data[field] = req.body[field];
      }
    }
  }

  const employee = await prisma.employee.update({
    where: { id: req.params.id },
    data
  });
  res.json(employee);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.employee.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
