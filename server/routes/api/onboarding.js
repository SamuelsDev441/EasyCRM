import express from "express";
import prisma from "../../db/prisma.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { employeeId, status } = req.query;
  const where = {};
  if (employeeId) where.employeeId = String(employeeId);
  if (status) where.status = String(status);

  if (!req.isAdmin) {
    if (!req.dbUser?.email) {
      return res.status(403).json({ error: "Employee access requires an email" });
    }
    const employee = await prisma.employee.findFirst({
      where: { email: req.dbUser.email }
    });
    if (!employee) {
      return res.json([]);
    }
    where.employeeId = employee.id;
  }

  const items = await prisma.onboardingItem.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });
  res.json(items);
});

router.post("/", requireAdmin, async (req, res) => {
  const { employeeId, title, status, dueDate, notes } = req.body || {};
  if (!employeeId || !title) {
    return res.status(400).json({ error: "employeeId and title are required" });
  }

  const item = await prisma.onboardingItem.create({
    data: {
      employeeId,
      title,
      status: status || undefined,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes || null
    }
  });
  res.status(201).json(item);
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const data = {};
  const fields = ["title", "status", "dueDate", "notes"];
  for (const field of fields) {
    if (field in (req.body || {})) {
      if (field === "dueDate") {
        data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
      } else {
        data[field] = req.body[field];
      }
    }
  }

  const item = await prisma.onboardingItem.update({
    where: { id: req.params.id },
    data
  });
  res.json(item);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.onboardingItem.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
