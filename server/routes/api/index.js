import express from "express";
import meRouter from "./me.js";
import employeesRouter from "./employees.js";
import onboardingRouter from "./onboarding.js";
import invoicesRouter from "./invoices.js";
import payrollRouter from "./payroll.js";

const router = express.Router();

router.use("/me", meRouter);
router.use("/employees", employeesRouter);
router.use("/onboarding", onboardingRouter);
router.use("/invoices", invoicesRouter);
router.use("/payroll", payrollRouter);

export default router;
