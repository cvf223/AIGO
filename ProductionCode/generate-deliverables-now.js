import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { create } from "xmlbuilder2";
import ExcelJS from "exceljs";
import fs from "fs/promises";

console.log("🔥 GENERATING ALL DELIVERABLES");

const data = JSON.parse(await fs.readFile("./project_deliverables/FB-AUS-2024-001/PROJECT_INDEX.json", "utf-8"));

await fs.mkdir("./deliverables", { recursive: true });

// PDF
const pdfDoc = await PDFDocument.create();
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const page = pdfDoc.addPage([595, 842]);
page.drawText("AUSSCHREIBUNG - " + data.projectInfo.name, { x: 50, y: 750, size: 18, font });
page.drawText("Plans: " + data.analysis.totalPlans, { x: 50, y: 700, size: 12, font });
page.drawText("Elements: " + data.analysis.totalElements, { x: 50, y: 680, size: 12, font });

const pdfBytes = await pdfDoc.save();
await fs.writeFile("./deliverables/Ausschreibung.pdf", pdfBytes);
console.log("✅ PDF created");

// HTML
const html = "<html><body><h1>Verification Report</h1><p>Plans: " + data.analysis.totalPlans + "</p><p>Elements: " + data.analysis.totalElements + "</p></body></html>";
await fs.writeFile("./deliverables/Verification.html", html);
console.log("✅ HTML created");

// Excel
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet("Summary");
sheet.addRow(["Project", data.projectInfo.name]);
sheet.addRow(["Plans", data.analysis.totalPlans]);
sheet.addRow(["Elements", data.analysis.totalElements]);
await workbook.xlsx.writeFile("./deliverables/Quantities.xlsx");
console.log("✅ Excel created");

console.log("\\n🎉 DONE! Check deliverables/ directory");
