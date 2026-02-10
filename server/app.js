import express from "express";
import openid from "express-openid-connect";
import pagesRouter from "./routes/pages.js";
import apiRouter from "./routes/api/index.js";
import { attachUser, requireAuth } from "./middleware/auth.js";

const app = express();

const { auth } = openid;


const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  routes: {
    login: "/login",
    logout: "/logout",
    callback: "/callback"
  }
};


// Middleware
app.use(express.json());
app.use(express.static("public")); // optional: static assets like CSS/JS/images
app.use(auth(config));
app.get("/start-login", (req, res) => {
  const connection = req.query.connection ? String(req.query.connection) : undefined;
  const returnTo = req.query.returnTo ? String(req.query.returnTo) : "/admin";
  const options = { returnTo };
  if (connection) {
    options.authorizationParams = { connection };
  }
  res.oidc.login(options);
});
// Mount routes
app.use("/", pagesRouter);        // HTML pages
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", requireAuth, attachUser, apiRouter); // JSON API

export default app;
