// agent/src/AgentFileManager.js
// Top 1% expert-level unified file/media manager for agent collaboration
// Handles images, videos, GIFs, PDFs, Excel/CSV, charts, and more
// Provides collaborative features (sharing, commenting, versioning)

import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AgentFileManager {
  constructor(agentId, browserService) { // 💡 Inject BrowserService
    this.agentId = agentId;
    this.browserService = browserService;
    this.baseDir = path.join(__dirname, '../data/media', agentId);
    if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true });
  }

  // General
  listFiles(type, filter) { 
    try {
      const files = this.db.prepare('SELECT * FROM files WHERE type = ? AND data LIKE ?').all(type, `%${filter || ''}%`);
      return files.map(file => ({ ...file, data: JSON.parse(file.data) }));
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
  
  getFileMeta(fileId) { 
    try {
      const file = this.db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);
      return file ? { ...file, data: JSON.parse(file.data) } : null;
    } catch (error) {
      console.error('Error getting file meta:', error);
      return null;
    }
  }
  
  deleteFile(fileId) { 
    try {
      const result = this.db.prepare('DELETE FROM files WHERE id = ?').run(fileId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Images
  saveImage(buffer, meta) { 
    try {
      const fileId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const filePath = path.join(this.baseDir, `${fileId}.png`);
      fs.writeFileSync(filePath, buffer);
      
      const stmt = this.db.prepare('INSERT INTO files (id, type, path, data) VALUES (?, ?, ?, ?)');
      stmt.run(fileId, 'image', filePath, JSON.stringify(meta));
      return fileId;
    } catch (error) {
      console.error('Error saving image:', error);
      return null;
    }
  }
  
  readImage(fileId) { 
    try {
      const file = this.getFileMeta(fileId);
      if (file && fs.existsSync(file.path)) {
        return fs.readFileSync(file.path);
      }
      return null;
    } catch (error) {
      console.error('Error reading image:', error);
      return null;
    }
  }
  
  transformImage(fileId, operations) { 
    console.log(`Image transformation not implemented for ${fileId}, operations:`, operations);
    return false;
  }

  // Videos
  saveVideo(buffer, meta) { 
    try {
      const fileId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const filePath = path.join(this.baseDir, `${fileId}.mp4`);
      fs.writeFileSync(filePath, buffer);
      
      const stmt = this.db.prepare('INSERT INTO files (id, type, path, data) VALUES (?, ?, ?, ?)');
      stmt.run(fileId, 'video', filePath, JSON.stringify(meta));
      return fileId;
    } catch (error) {
      console.error('Error saving video:', error);
      return null;
    }
  }
  
  readVideo(fileId) { 
    try {
      const file = this.getFileMeta(fileId);
      if (file && fs.existsSync(file.path)) {
        return fs.readFileSync(file.path);
      }
      return null;
    } catch (error) {
      console.error('Error reading video:', error);
      return null;
    }
  }
  
  extractFrames(fileId, options) { 
    console.log(`Frame extraction not implemented for ${fileId}, options:`, options);
    return [];
  }

  // GIFs
  saveGif(buffer, meta) { 
    try {
      const fileId = `gif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const filePath = path.join(this.baseDir, `${fileId}.gif`);
      fs.writeFileSync(filePath, buffer);
      
      const stmt = this.db.prepare('INSERT INTO files (id, type, path, data) VALUES (?, ?, ?, ?)');
      stmt.run(fileId, 'gif', filePath, JSON.stringify(meta));
      return fileId;
    } catch (error) {
      console.error('Error saving GIF:', error);
      return null;
    }
  }
  
  readGif(fileId) { 
    try {
      const file = this.getFileMeta(fileId);
      if (file && fs.existsSync(file.path)) {
        return fs.readFileSync(file.path);
      }
      return null;
    } catch (error) {
      console.error('Error reading GIF:', error);
      return null;
    }
  }

  // PDFs
  async createPdf(htmlContent, meta = {}) {
      if (!this.browserService) throw new Error("BrowserService is not available for PDF creation.");
      
      const fileName = `doc_${Date.now()}.pdf`;
      const filePath = path.join(this.baseDir, fileName);

      let page = null;
      try {
          page = await this.browserService.browser.newPage();
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
          await page.pdf({ path: filePath, format: 'A4' });
          
          console.log(`[FileManager] PDF created: ${filePath}`);
          return { filePath, meta: { ...meta, fileName } };
      } catch (error) {
          console.error(`❌ Failed to create PDF:`, error);
          return null;
      } finally {
          if (page) await page.close();
      }
  }
  readPdf(fileId) { 
    try {
      const file = this.getFileMeta(fileId);
      if (file && fs.existsSync(file.path)) {
        return fs.readFileSync(file.path);
      }
      return null;
    } catch (error) {
      console.error('Error reading PDF:', error);
      return null;
    }
  }
  
  appendToPdf(fileId, content) { 
    console.log(`PDF append not implemented for ${fileId}, content length:`, content.length);
    return false;
  }

  // Excel/CSV
  createExcel(sheets, meta) { /* TODO: Create Excel file */ }
  readExcel(fileId) { /* TODO: Read Excel file */ }
  updateExcel(fileId, operations) { /* TODO: Update Excel file (add rows, formulas, etc.) */ }
  createCsv(data, meta) { /* TODO: Create CSV file */ }
  readCsv(fileId) { /* TODO: Read CSV file */ }

  // Charts
  async createChart(chartJsConfig, meta = {}) {
      if (!this.browserService) throw new Error("BrowserService is not available for chart creation.");

      const fileName = `chart_${Date.now()}.png`;
      const filePath = path.join(this.baseDir, fileName);

      const htmlContent = `
          <html>
              <head>
                  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
              </head>
              <body>
                  <div style="width: 800px; height: 600px;">
                      <canvas id="myChart"></canvas>
                  </div>
                  <script>
                      const ctx = document.getElementById('myChart').getContext('2d');
                      new Chart(ctx, ${JSON.stringify(chartJsConfig)});
                  </script>
              </body>
          </html>
      `;

      let page = null;
      try {
          page = await this.browserService.browser.newPage();
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
          // Wait for the chart to render
          await page.waitForTimeout(1000); 
          const chartElement = await page.$('canvas');
          await chartElement.screenshot({ path: filePath });

          console.log(`[FileManager] Chart created: ${filePath}`);
          return { filePath, meta: { ...meta, fileName } };
      } catch (error) {
          console.error(`❌ Failed to create chart:`, error);
          return null;
      } finally {
          if (page) await page.close();
      }
  }
  readChart(fileId) { /* TODO: Read chart image */ }

  // Collaboration
  shareFileWithAgent(fileId, targetAgentId) { /* TODO: Share file with another agent */ }
  commentOnFile(fileId, comment, agentId) { /* TODO: Add comment to file metadata */ }
  getFileComments(fileId) { /* TODO: Retrieve comments for a file */ }
  getFileVersions(fileId) { /* TODO: Retrieve version history */ }

  /**
   * Generate an image using the specified provider/model.
   * Supported providers: 'openai', 'stability', 'replicate', 'midjourney'
   * @param {string} prompt - The image generation prompt
   * @param {object} options - { provider: 'openai'|'stability'|'replicate'|'midjourney', ... }
   * @returns {Promise<{filePath: string, meta: object}>}
   */
  async generateImage(prompt, options = {}) {
    const provider = options.provider || 'openai';
    switch (provider) {
      case 'openai':
        return await this._generateWithOpenAI(prompt, options);
      case 'stability':
        return await this._generateWithStability(prompt, options);
      case 'replicate':
        return await this._generateWithReplicate(prompt, options);
      case 'midjourney':
        return await this._generateWithMidjourney(prompt, options);
      default:
        throw new Error(`Unknown image generation provider: ${provider}`);
    }
  }

  // --- Provider-specific implementations ---

  /**
   * Generate image with OpenAI DALL·E
   * Calls OpenAI API, downloads image, saves to disk, returns file path and meta
   * @param {string} prompt
   * @param {object} options
   * @returns {Promise<{filePath: string, meta: object}>}
   */
  async _generateWithOpenAI(prompt, options) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set in environment');
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      // 1. Call OpenAI DALL·E API
      const response = await openai.images.generate({
        prompt,
        n: 1,
        size: options.size || '1024x1024',
        response_format: 'url',
        user: this.agentId,
      });
      const imageUrl = response.data[0]?.url;
      if (!imageUrl) throw new Error('No image URL returned from OpenAI');
      // 2. Download image
      const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const ext = imageResp.headers['content-type'] === 'image/png' ? 'png' : 'jpg';
      const fileName = `dalle_${Date.now()}.${ext}`;
      const filePath = path.join(this.baseDir, fileName);
      fs.writeFileSync(filePath, imageResp.data);
      // 3. Save meta
      const meta = {
        provider: 'openai',
        prompt,
        fileName,
        filePath,
        createdAt: new Date().toISOString(),
        size: options.size || '1024x1024',
        apiResponse: response.data[0],
      };
      // Optionally, save meta as JSON
      fs.writeFileSync(filePath + '.meta.json', JSON.stringify(meta, null, 2));
      // 4. Return
      return { filePath, meta };
    } catch (err) {
      console.error('[AgentFileManager] OpenAI image generation failed:', err);
      throw err;
    }
  }

  /**
   * Generate image with Stability AI (Stable Diffusion)
   * TODO: Implement API call, save image, return file path and meta
   */
  async _generateWithStability(prompt, options) {
    // TODO: Use Stability API
    throw new Error('Stability AI image generation not yet implemented');
  }

  /**
   * Generate image with Replicate (various models)
   * TODO: Implement API call, save image, return file path and meta
   */
  async _generateWithReplicate(prompt, options) {
    // TODO: Use Replicate API
    throw new Error('Replicate image generation not yet implemented');
  }

  /**
   * Generate image with Midjourney (Discord-based, requires bot integration)
   * TODO: Implement Discord bot interaction, save image, return file path and meta
   */
  async _generateWithMidjourney(prompt, options) {
    // TODO: Use Midjourney via Discord bot (or 3rd party API if available)
    throw new Error('Midjourney image generation not yet implemented');
  }
} 