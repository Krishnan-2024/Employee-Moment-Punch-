const router = require("express").Router();
const { sql, pool } = require("../db");

/**
 * Employee Punch IN / OUT
 * Supports RFID / Barcode / Manual entry
 */
router.post("/punch", async (req, res) => {
  try {
    let { empId, unit } = req.body;

    // Normalize
    empId = String(empId || "").trim();
    unit = String(unit || "").trim();

    // Validation
    if (!empId || isNaN(empId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Employee ID is required"
      });
    }

    if (!unit) {
      return res.status(400).json({
        success: false,
        message: "Unit is required"
      });
    }

    const conn = await pool;

    await conn.request()
      .input("EmpID", sql.Int, parseInt(empId))
      .input("Unit", sql.NVarChar(20), unit)
      .execute("SP_AttendancePunch");

    res.json({
      success: true,
      message: "Punch recorded successfully",
      empId,
      unit,
      timestamp: new Date()
    });

  } catch (error) {
    console.error("Punch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while punching attendance"
    });
  }
});

/**
 * Live Attendance Dashboard (Today)
 */
router.get("/live", async (req, res) => {
  try {
    const conn = await pool;

    const data = await conn.request().query(`
      SELECT *
      FROM VW_LiveAttendanceToday
      ORDER BY InTime DESC
    `);

    res.json({
      success: true,
      count: data.recordset.length,
      data: data.recordset
    });

  } catch (error) {
    console.error("Live dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch live attendance"
    });
  }
});

/**
 * Headcount Summary (Dashboard Cards)
 */
router.get("/headcount", async (req, res) => {
  try {
    const conn = await pool;

    const result = await conn.request().query(`
      SELECT
        COUNT(*) AS TotalToday,
        SUM(CASE WHEN OutTime IS NULL THEN 1 ELSE 0 END) AS Inside,
        SUM(CASE WHEN OutTime IS NOT NULL THEN 1 ELSE 0 END) AS Outside
      FROM AttendanceRegister
      WHERE PunchDate = CAST(GETDATE() AS DATE)
    `);

    res.json({
      success: true,
      summary: result.recordset[0]
    });

  } catch (error) {
    console.error("Headcount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch headcount"
    });
  }
});

module.exports = router;
