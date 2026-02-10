import openid from "express-openid-connect";
import prisma from "../db/prisma.js";

const { requiresAuth } = openid;
export const requireAuth = requiresAuth();

export async function attachUser(req, res, next) {
  const oidcUser = req.oidc?.user;
  if (!oidcUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const auth0Id = oidcUser.sub;
  const email = oidcUser.email || null;
  const name = oidcUser.name || oidcUser.nickname || null;

  let user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) {
    const count = await prisma.user.count();
    user = await prisma.user.create({
      data: {
        auth0Id,
        email,
        name,
        role: count === 0 ? "ADMIN" : "EMPLOYEE",
        lastLoginAt: new Date()
      }
    });
  } else {
    user = await prisma.user.update({
      where: { auth0Id },
      data: {
        email,
        name,
        lastLoginAt: new Date()
      }
    });
  }

  req.dbUser = user;
  req.isAdmin = user.role === "ADMIN";
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.dbUser?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}
