/**
 * Attendance Pro Server
 * Serves Frontend + API
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// ================= Middleware =================
app.use(express.json());

/**
 * 🔥 DISABLE BROWSER CACHE (VERY IMPORTANT)
 * This fixes dashboard not updating issue
 */
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// ================= Serve Frontend =================
app.use(express.static(path.join(__dirname, "../frontend")));

// ================= API Routes =================
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/reports", require("./routes/report.routes"));

// ================= Default Route =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ================= Start Server =================
app.listen(PORT, () => {
  console.log("======================================");
  console.log(" Attendance Pro running successfully ");
  console.log(` URL : http://localhost:${PORT}`);
  console.log("======================================");
});
