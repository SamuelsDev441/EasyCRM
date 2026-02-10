import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    user: req.dbUser,
    oidc: {
      sub: req.oidc?.user?.sub,
      email: req.oidc?.user?.email,
      name: req.oidc?.user?.name
    }
  });
});

export default router;
