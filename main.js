import "dotenv/config";
import app from "./server/app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CRM running on http://localhost:${PORT}`);
});
