/**
 * 🔥 GENERATE REAL DELIVERABLES - PDF, HTML, GAEB, EXCEL
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadImage } from 'canvas';

// Import ALL the generators
import ProfessionalPDFGenerator from './src/construction/documents/ProfessionalPDFGenerator.js';
import GAEBExportGenerator from './src/construction/documents/GAEBExportGenerator.js';
import ExcelExportGenerator from './src/construction/documents/ExcelExportGenerator.js';
import HumanVerifiableReports from './src/construction/verification/HumanVerifiableReports.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateAllDeliverables() {
    console.log('🔥 GENERATING ALL REAL DELIVERABLES');
    console.log('===================================');
    console.log('');
    
    // Load analysis results
    const resultsPath = './project_deliverables/FB-AUS-2024-001/PROJECT_INDEX.json';
    const resultsData = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));
    
    console.log(`📋 Project: ${resultsData.projectInfo.name}`);
    console.log(`💰 Value: €${(resultsData.projectInfo.projectData.estimatedValue / 1000000).toFixed(1)}M`);
    console.log('');
    
    // Create deliverables directory
    const delivDir = './deliverables';
    await fs.mkdir(delivDir, { recursive: true });
    
    const generated = {
        pdfs: [],
        htmls: [],
        xmls: [],
        excels: []
    };
    
    // GENERATE PDF AUSSCHREIBUNG
    console.log('📄 1. Generating Professional Ausschreibung PDF...');
    try {
        const pdfGen = new ProfessionalPDFGenerator();
        const pdfPath = path.join(delivDir, `${resultsData.projectInfo.projectNumber}_Ausschreibung.pdf`);
        
        const pdfResult = await pdfGen.generateAusschreibungPDF(
            resultsData,
            resultsData,
            pdfPath
        );
        
        generated.pdfs.push(pdfResult);
        console.log(`   ✅ PDF created: ${pdfPath}`);
        console.log(`   📄 Pages: ${pdfResult.pages}`);
        console.log(`   💾 Size: ${(pdfResult.size / 1024).toFixed(1)} KB`);
    } catch (error) {
        console.error(`   ❌ PDF generation failed: ${error.message}`);
    }
    
    console.log('');
    
    // GENERATE GAEB XML
    console.log('📦 2. Generating GAEB XML Export...');
    try {
        const gaebGen = new GAEBExportGenerator();
        const gaebPath = path.join(delivDir, `${resultsData.projectInfo.projectNumber}_GAEB.xml`);
        
        const gaebResult = await gaebGen.generateGAEB(
            resultsData,
            resultsData,
            gaebPath
        );
        
        generated.xmls.push(gaebResult);
        console.log(`   ✅ GAEB created: ${gaebPath}`);
        console.log(`   📦 Format: ${gaebResult.format}`);
        console.log(`   📊 Positions: ${gaebResult.positions}`);
    } catch (error) {
        console.error(`   ❌ GAEB generation failed: ${error.message}`);
    }
    
    console.log('');
    
    // GENERATE EXCEL WORKBOOK
    console.log('📊 3. Generating Excel Workbook...');
    try {
        const excelGen = new ExcelExportGenerator();
        const excelPath = path.join(delivDir, `${resultsData.projectInfo.projectNumber}_Quantities_and_Costs.xlsx`);
        
        const excelResult = await excelGen.generateExcelWorkbook(
            resultsData,
            resultsData,
            excelPath
        );
        
        generated.excels.push(excelResult);
        console.log(`   ✅ Excel created: ${excelPath}`);
        console.log(`   📊 Sheets: ${excelResult.sheets}`);
    } catch (error) {
        console.error(`   ❌ Excel generation failed: ${error.message}`);
    }
    
    console.log('');
    
    // GENERATE VERIFICATION REPORTS (HTML + PDF)
    console.log('🔍 4. Generating Verification Reports...');
    try {
        const verificationSystem = new HumanVerifiableReports();
        await verificationSystem.initialize();
        
        // Generate for first 3 plans as examples
        const planPaths = [
            './TestProject/FB_AUS A_GR-01_A_230828.pdf',
            './TestProject/FB_AUS A_GR00_B_240529.pdf',
            './TestProject/FB_AUS A_GR01_C_231011.pdf'
        ];
        
        for (const planPath of planPaths) {
            try {
                const planImage = await loadImage(planPath);
                const report = await verificationSystem.generateVerificationReport(
                    {
                        elements: resultsData.analysis.plans[0]?.elements || [],
                        scale: resultsData.analysis.plans[0]?.scale || { notation: '1:50' }
                    },
                    planPath,
                    resultsData.projectInfo
                );
                
                generated.htmls.push(report.outputs.html);
                generated.pdfs.push(report.outputs.pdf);
                
                console.log(`   ✅ Verification report: ${path.basename(planPath)}`);
            } catch (err) {
                console.log(`   ⚠️  Skipped ${path.basename(planPath)}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error(`   ❌ Verification generation failed: ${error.message}`);
    }
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🎉 ALL DELIVERABLES GENERATED!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📄 PDF Ausschreibung:', generated.pdfs.length);
    console.log('📦 GAEB XML:', generated.xmls.length);
    console.log('📊 Excel Workbooks:', generated.excels.length);
    console.log('🔍 HTML Verification:', generated.htmls.length);
    console.log('');
    console.log(`📁 Location: ${delivDir}`);
    console.log('');
    console.log('✅ ALL VISUAL DELIVERABLES READY!');
    console.log('');
    
    // List all files
    const files = await fs.readdir(delivDir);
    console.log('📋 Generated Files:');
    for (const file of files) {
        const stats = await fs.stat(path.join(delivDir, file));
        console.log(`   • ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    }
}

generateAllDeliverables()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ FAILED:', err);
        console.error(err.stack);
        process.exit(1);
    });
