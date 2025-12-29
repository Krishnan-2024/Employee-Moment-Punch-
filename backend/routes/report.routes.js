
const router = require("express").Router();
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");
const { pool } = require("../db");

router.get("/excel", async (req,res)=>{
  const conn = await pool;
  const data = await conn.request().query("SELECT * FROM AttendanceRegister");
  const ws = XLSX.utils.json_to_sheet(data.recordset);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, "attendance.xlsx");
  res.download("attendance.xlsx");
});

router.get("/pdf", async (req,res)=>{
  const doc = new PDFDocument();
  res.setHeader("Content-Type","application/pdf");
  doc.pipe(res);
  doc.text("Attendance Report");
  doc.end();
});

module.exports = router;
