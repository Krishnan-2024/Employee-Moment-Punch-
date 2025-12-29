const router = require("express").Router();
const { sql, pool } = require("../db");

router.post("/punch", async (req, res) => {
  try {
    const empId = String(req.body.empId || "").trim();
    const unit  = String(req.body.unit || "UNIT 1");

    if (!empId) {
      return res.json({ success: false });
    }

    const conn = await pool;

    await conn.request()
      .input("EmpID", sql.NVarChar(20), empId)
      .input("Unit", sql.NVarChar(20), unit)
      .execute("SP_AttendancePunch");

    res.json({ success: true });

  } catch (err) {
    console.error("Punch error:", err);
    res.status(500).json({ success: false });
  }
});

router.get("/live", async (req, res) => {
  const conn = await pool;
  const r = await conn.request().query(`
    SELECT EmpID, Unit, InTime, OutTime,
           CASE WHEN OutTime IS NULL THEN 'IN' ELSE 'OUT' END Status
    FROM AttendanceRegister
    WHERE PunchDate = CAST(GETDATE() AS DATE)
    ORDER BY InTime DESC
  `);
  res.json({ success: true, data: r.recordset });
});

router.get("/headcount", async (req, res) => {
  const conn = await pool;
  const r = await conn.request().query(`
    SELECT
      COUNT(*) Total,
      SUM(CASE WHEN OutTime IS NULL THEN 1 ELSE 0 END) Inside,
      SUM(CASE WHEN OutTime IS NOT NULL THEN 1 ELSE 0 END) Outside
    FROM AttendanceRegister
    WHERE PunchDate = CAST(GETDATE() AS DATE)
  `);
  res.json({ success: true, data: r.recordset[0] });
});

module.exports = router;
