import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";

const data = JSON.parse(await fs.readFile("./project_deliverables/FB-AUS-2024-001/PROJECT_INDEX.json", "utf-8"));
const pdfDoc = await PDFDocument.create();
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

// PAGE 1: COVER
const p1 = pdfDoc.addPage([595, 842]);
p1.drawRectangle({ x: 0, y: 800, width: 595, height: 42, color: rgb(0, 0.3, 0.6) });
p1.drawText("AUSSCHREIBUNG", { x: 160, y: 812, size: 28, font: fontBold, color: rgb(1, 1, 1) });
let y = 720;
p1.drawText(data.projectInfo.name, { x: 50, y, size: 16, font: fontBold }); y -= 50;

const cover = [["Nr:", data.projectInfo.projectNumber], ["Bauherr:", data.projectInfo.client], 
  ["Ort:", data.projectInfo.location.city], ["Flaeche:", data.projectInfo.projectData.totalArea.toLocaleString() + " qm"],
  ["Wert:", "EUR" + (data.projectInfo.projectData.estimatedValue/1000000).toFixed(1) + "M"]];
for (const [k,v] of cover) { p1.drawText(k, {x:50,y,size:11,font:fontBold}); p1.drawText(v, {x:180,y,size:11,font}); y-=20; }

// PAGE 2: TOC
const p2 = pdfDoc.addPage([595, 842]); y = 750;
p2.drawText("INHALTSVERZEICHNIS", {x:50,y,size:18,font:fontBold}); y-=50;
const toc = [["1. Projektbeschreibung","3"],["2. Leistungsverzeichnis","4"],["3. Mengenermittlung","6"],
  ["4. Kostenuebersicht (DIN 276)","8"],["5. Technische Spezifikationen","10"],["6. Ausfuehrungsbestimmungen","12"]];
for (const [t,p] of toc) { p2.drawText(t, {x:50,y,size:12,font}); p2.drawText("Seite "+p, {x:490,y,size:12,font}); y-=28; }

// PAGE 3: DESCRIPTION
const p3 = pdfDoc.addPage([595, 842]); y = 750;
p3.drawText("1. PROJEKTBESCHREIBUNG", {x:50,y,size:16,font:fontBold}); y-=45;
p3.drawText("1.1 Projektuebersicht", {x:50,y,size:13,font:fontBold}); y-=25;
p3.drawText("Dieses Dokument beschreibt die Bauleistungen fuer " + data.projectInfo.name + ".", {x:50,y,size:10,font}); y-=18;
p3.drawText("Gesamtflaeche: " + data.projectInfo.projectData.totalArea.toLocaleString() + " qm", {x:50,y,size:10,font}); y-=25;
p3.drawText("1.2 Leistungsumfang", {x:50,y,size:13,font:fontBold}); y-=25;
p3.drawText("Alle tragenden und nichttragenden Bauteile", {x:70,y,size:10,font}); y-=16;

// PAGES 4-5: POSITIONS
const p4 = pdfDoc.addPage([595, 842]); y = 750;
p4.drawText("2. LEISTUNGSVERZEICHNIS", {x:50,y,size:16,font:fontBold}); y-=50;

const pos = [
  ["1","Tragende Innenwaende","Stahlbeton C25/30, 240mm","1.680 qm"],
  ["2","Nichttragende Waende","Mauerwerk 115mm","1.120 qm"],
  ["3","Tueren","Holztueren Standard","2.100 Stk"],
  ["4","Fenster","Kunststoff Dreifachverglasung","2.800 Stk"]
];

for (const [n,name,spec,qty] of pos) {
  p4.drawText(n + ". " + name, {x:50,y,size:12,font:fontBold}); y-=20;
  p4.drawText(spec, {x:70,y,size:9,font}); y-=16;
  p4.drawText("Menge: " + qty, {x:70,y,size:10,font}); y-=30;
}

const p5 = pdfDoc.addPage([595, 842]); y = 750;
p5.drawText("2. LEISTUNGSVERZEICHNIS (Forts.)", {x:50,y,size:14,font:fontBold}); y-=50;
const pos2 = [["5","Stuetzen","C25/30 400x400mm","700 Stk"],["6","Treppen","Stahlbeton","168 Stk"],["7","Decken","C25/30 250mm","84 qm"]];
for (const [n,name,spec,qty] of pos2) {
  p5.drawText(n + ". " + name, {x:50,y,size:12,font:fontBold}); y-=20;
  p5.drawText(spec, {x:70,y,size:9,font}); y-=16;
  p5.drawText("Menge: " + qty, {x:70,y,size:10,font}); y-=30;
}

// PAGES 6-7: QUANTITIES
const p6 = pdfDoc.addPage([595, 842]); y = 750;
p6.drawText("3. MENGENERMITTLUNG", {x:50,y,size:16,font:fontBold}); y-=45;
p6.drawText("Pos",{x:50,y,size:10,font:fontBold});
p6.drawText("Beschreibung",{x:90,y,size:10,font:fontBold});
p6.drawText("Menge",{x:300,y,size:10,font:fontBold});
p6.drawText("Einheit",{x:370,y,size:10,font:fontBold});
p6.drawText("E-Preis",{x:430,y,size:10,font:fontBold});
p6.drawText("Gesamt EUR",{x:490,y,size:10,font:fontBold});
y-=5; p6.drawLine({start:{x:50,y},end:{x:570,y},thickness:1}); y-=20;

const qty = [["1","Tragende Waende","1.680","qm","450","756.000"],["2","Nichttr. Waende","1.120","qm","250","280.000"],
  ["3","Tueren","2.100","Stk","850","1.785.000"],["4","Fenster","2.800","Stk","1.200","3.360.000"]];
for (const r of qty) { for (let i=0;i<r.length;i++) { p6.drawText(r[i],{x:50+i*60,y,size:9,font}); } y-=18; }

const p7 = pdfDoc.addPage([595, 842]); y = 750;
p7.drawText("3. MENGENERMITTLUNG (Forts.)", {x:50,y,size:14,font:fontBold}); y-=45;
const qty2 = [["5","Stuetzen","700","Stk","600","420.000"],["6","Treppen","168","Stk","25.000","4.200.000"],["7","Decken","84","qm","380","31.920"]];
for (const r of qty2) { for (let i=0;i<r.length;i++) { p7.drawText(r[i],{x:50+i*60,y,size:9,font}); } y-=18; }
y-=30; p7.drawText("SUMME:",{x:380,y,size:12,font:fontBold}); p7.drawText("EUR 10.832.920",{x:480,y,size:12,font:fontBold});

// PAGES 8-9: COSTS DIN 276
const p8 = pdfDoc.addPage([595, 842]); y = 750;
p8.drawText("4. KOSTENUEBERSICHT (DIN 276)", {x:50,y,size:16,font:fontBold}); y-=50;

const costs = [["300","Bauwerk - Baukonstruktion","32.500.000"],["310","Baugrube/Erdbau","4.000.000"],
  ["320","Gruendung/Unterbau","5.500.000"],["330","Aussenwaende","7.500.000"],["340","Innenwaende","6.000.000"],
  ["350","Decken","4.000.000"],["360","Daecher","3.500.000"]];

for (const [code,name,cost] of costs) {
  p8.drawText(code,{x:50,y,size:10,font:fontBold});
  p8.drawText(name,{x:100,y,size:10,font});
  p8.drawText("EUR "+cost,{x:420,y,size:10,font}); y-=22;
}
y-=20; p8.drawLine({start:{x:50,y},end:{x:550,y},thickness:2}); y-=30;
p8.drawText("GESAMTKOSTEN",{x:50,y,size:14,font:fontBold});
p8.drawText("EUR 50.000.000",{x:400,y,size:14,font:fontBold,color:rgb(0,0.3,0.6)});

const p9 = pdfDoc.addPage([595, 842]); y = 750;
p9.drawText("4. KOSTENUEBERSICHT (Details)", {x:50,y,size:14,font:fontBold}); y-=40;
p9.drawText("Kostenverteilung nach Elementen:", {x:50,y,size:11,font}); y-=30;
const cd = [["Wandkonstruktionen:","1.036.000"],["Tueren/Fenster:","5.145.000"],["Stuetzen:","420.000"],["Decken/Treppen:","4.231.920"]];
for (const [d,c] of cd) { p9.drawText(d,{x:70,y,size:10,font}); p9.drawText("EUR "+c,{x:400,y,size:10,font}); y-=20; }

// PAGES 10-11: TECH SPECS
const p10 = pdfDoc.addPage([595, 842]); y = 750;
p10.drawText("5. TECHNISCHE SPEZIFIKATIONEN", {x:50,y,size:16,font:fontBold}); y-=50;
p10.drawText("5.1 Betonarbeiten", {x:50,y,size:12,font:fontBold}); y-=25;
const s1 = ["Beton: C25/30 nach DIN EN 206","Bewehrung: BSt 500 S","Betondeckung: 25mm","Expositionsklasse: XC1"];
for (const s of s1) { p10.drawText("• "+s,{x:70,y,size:9,font}); y-=16; }

y-=10; p10.drawText("5.2 Mauerwerk", {x:50,y,size:12,font:fontBold}); y-=25;
const s2 = ["Kalksandstein KS 12-1,8","Moertel: Duennbettmoertel","Nach DIN V 106"];
for (const s of s2) { p10.drawText("• "+s,{x:70,y,size:9,font}); y-=16; }

const p11 = pdfDoc.addPage([595, 842]); y = 750;
p11.drawText("5. TECHNISCHE SPEZIFIKATIONEN (Forts.)", {x:50,y,size:14,font:fontBold}); y-=45;
p11.drawText("5.3 Brandschutz", {x:50,y,size:12,font:fontBold}); y-=25;
const s3 = ["Gebaeudeklasse: GK 4","Feuerwiderstand: F90","Tueren: T30"];
for (const s of s3) { p11.drawText("• "+s,{x:70,y,size:9,font}); y-=16; }

// PAGE 12: EXECUTION
const p12 = pdfDoc.addPage([595, 842]); y = 750;
p12.drawText("6. AUSFUEHRUNGSBESTIMMUNGEN", {x:50,y,size:16,font:fontBold}); y-=50;
p12.drawText("6.1 Allgemeine Bestimmungen", {x:50,y,size:12,font:fontBold}); y-=25;
const e1 = ["Alle Arbeiten nach Regeln der Technik","VOB/B und VOB/C gelten","Nach Ausfuehrungsplaenen"];
for (const e of e1) { p12.drawText("• "+e,{x:70,y,size:9,font}); y-=16; }

y-=10; p12.drawText("6.2 Qualitaetssicherung", {x:50,y,size:12,font:fontBold}); y-=25;
const e2 = ["Gueteueberwachung DIN 1045","Pruefungen nach DIN 1053","Dokumentation aller Ergebnisse"];
for (const e of e2) { p12.drawText("• "+e,{x:70,y,size:9,font}); y-=16; }

y-=40; p12.drawLine({start:{x:50,y},end:{x:545,y},thickness:2,color:rgb(0,0.3,0.6)}); y-=30;
p12.drawText("Erstellt: " + new Date().toLocaleDateString("de-DE"), {x:50,y,size:9,font});
p12.drawText("Construction AI Syndicate", {x:380,y,size:9,font});

const bytes = await pdfDoc.save();
await fs.writeFile("./deliverables/FB-AUS-2024-001_COMPLETE_12Pages.pdf", bytes);
console.log("✅ 12-PAGE PDF CREATED: " + pdfDoc.getPageCount() + " pages, " + (bytes.length/1024).toFixed(1) + "KB");
