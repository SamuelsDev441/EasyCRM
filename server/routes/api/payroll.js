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

  const records = await prisma.payRecord.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });
  res.json(records);
});

router.post("/", requireAdmin, async (req, res) => {
  const {
    employeeId,
    periodStart,
    periodEnd,
    grossPayCents,
    deductionsCents,
    netPayCents,
    status
  } = req.body || {};

  if (!employeeId || !periodStart || !periodEnd || !Number.isFinite(grossPayCents) || !Number.isFinite(netPayCents)) {
    return res.status(400).json({ error: "employeeId, periodStart, periodEnd, grossPayCents, netPayCents are required" });
  }

  const record = await prisma.payRecord.create({
    data: {
      employeeId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      grossPayCents,
      deductionsCents: Number.isFinite(deductionsCents) ? deductionsCents : 0,
      netPayCents,
      status: status || undefined
    }
  });
  res.status(201).json(record);
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const data = {};
  const fields = [
    "periodStart",
    "periodEnd",
    "grossPayCents",
    "deductionsCents",
    "netPayCents",
    "status"
  ];
  for (const field of fields) {
    if (field in (req.body || {})) {
      if (field === "periodStart" || field === "periodEnd") {
        data[field] = req.body[field] ? new Date(req.body[field]) : null;
      } else {
        data[field] = req.body[field];
      }
    }
  }

  const record = await prisma.payRecord.update({
    where: { id: req.params.id },
    data
  });
  res.json(record);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.payRecord.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
