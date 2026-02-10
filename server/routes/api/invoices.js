import express from "express";
import prisma from "../../db/prisma.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  const { status, search } = req.query;
  const where = {};
  if (status) where.status = String(status);
  if (search) {
    where.OR = [
      { customerName: { contains: String(search), mode: "insensitive" } },
      { customerEmail: { contains: String(search), mode: "insensitive" } }
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });
  res.json(invoices);
});

router.post("/", requireAdmin, async (req, res) => {
  const {
    customerName,
    customerEmail,
    amountCents,
    status,
    issuedDate,
    dueDate,
    paidDate
  } = req.body || {};

  if (!customerName || !Number.isFinite(amountCents)) {
    return res.status(400).json({ error: "customerName and amountCents are required" });
  }

  const invoice = await prisma.invoice.create({
    data: {
      customerName,
      customerEmail: customerEmail || null,
      amountCents,
      status: status || undefined,
      issuedDate: issuedDate ? new Date(issuedDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      paidDate: paidDate ? new Date(paidDate) : null
    }
  });
  res.status(201).json(invoice);
});

router.get("/:id", async (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id }
  });
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  res.json(invoice);
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const data = {};
  const fields = [
    "customerName",
    "customerEmail",
    "amountCents",
    "status",
    "issuedDate",
    "dueDate",
    "paidDate"
  ];
  for (const field of fields) {
    if (field in (req.body || {})) {
      if (field.endsWith("Date")) {
        data[field] = req.body[field] ? new Date(req.body[field]) : null;
      } else {
        data[field] = req.body[field];
      }
    }
  }

  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data
  });
  res.json(invoice);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.invoice.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
