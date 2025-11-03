#!/usr/bin/env node

/**
 * 🔒 SECURITY AUDIT SCRIPT - COMPREHENSIVE VULNERABILITY SCANNER
 * ===========================================================
 * 
 * Scans the entire codebase for security vulnerabilities and
 * provides fixes for production deployment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityAuditor {
    constructor() {
        this.issues = {
            critical: [],
            high: [],
            medium: [],
            low: []
        };
        
        this.fixes = [];
        
        // Patterns to detect security issues
        this.securityPatterns = {
            hardcodedCredentials: {
                patterns: [
                    /password\s*[:=]\s*["'][^"']+["']/gi,
                    /secret\s*[:=]\s*["'][^"']+["']/gi,
                    /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,
                    /token\s*[:=]\s*["'][^"']+["']/gi,
                    /private[_-]?key\s*[:=]\s*["'][^"']+["']/gi
                ],
                severity: 'critical',
                fix: 'Use environment variables'
            },
            sqlInjection: {
                patterns: [
                    /query\s*\([`"'].*\$\{.*\}.*[`"']\)/gi,
                    /query\s*\(.*\+.*\)/gi,
                    /raw\s*\([`"'].*\$\{.*\}.*[`"']\)/gi
                ],
                severity: 'critical',
                fix: 'Use parameterized queries'
            },
            xssVulnerability: {
                patterns: [
                    /innerHTML\s*=\s*[^;]+user|input|data|req\./gi,
                    /dangerouslySetInnerHTML/gi,
                    /eval\s*\(/gi,
                    /new\s+Function\s*\(/gi
                ],
                severity: 'high',
                fix: 'Sanitize user input and avoid eval'
            },
            insecureRandomness: {
                patterns: [
                    /Math\.random\(\)\s*\*.*key|token|password|secret/gi,
                    /Date\.now\(\).*key|token|password|secret/gi
                ],
                severity: 'high',
                fix: 'Use crypto.randomBytes for security tokens'
            },
            missingAuthentication: {
                patterns: [
                    /app\.(get|post|put|delete)\s*\(['"]\/(api|admin).*\s*,\s*(?!.*auth|security|validate)/gi
                ],
                severity: 'high',
                fix: 'Add authentication middleware'
            },
            weakEncryption: {
                patterns: [
                    /createHash\s*\(\s*['"]md5['"]\s*\)/gi,
                    /createHash\s*\(\s*['"]sha1['"]\s*\)/gi,
                    /algorithm\s*:\s*['"]des['"]/gi
                ],
                severity: 'medium',
                fix: 'Use SHA-256 or stronger algorithms'
            },
            httpInProduction: {
                patterns: [
                    /http:\/\/(?!localhost|127\.0\.0\.1)/gi,
                    /ws:\/\/(?!localhost|127\.0\.0\.1)/gi
                ],
                severity: 'medium',
                fix: 'Use HTTPS/WSS in production'
            },
            debugLogging: {
                patterns: [
                    /console\.(log|debug|trace).*password|secret|token|key/gi
                ],
                severity: 'medium',
                fix: 'Remove sensitive data from logs'
            },
            corsWildcard: {
                patterns: [
                    /cors\s*\(\s*\{\s*origin\s*:\s*['"]\*['"]/gi,
                    /Access-Control-Allow-Origin['"]\s*:\s*['"]\*['"]/gi
                ],
                severity: 'medium',
                fix: 'Specify allowed origins explicitly'
            },
            missingCSRF: {
                patterns: [
                    /app\.(post|put|delete).*(?!.*csrf)/gi
                ],
                severity: 'medium',
                fix: 'Implement CSRF protection'
            }
        };
        
        // Files to scan
        this.filesToScan = [
            'src/**/*.js',
            'web-gui-construction/**/*.{js,jsx}',
            '*.js',
            'legendary-arbitrage-syndicate/**/*.js'
        ];
        
        // Files to ignore
        this.ignorePatterns = [
            'node_modules',
            'dist',
            'build',
            '.next',
            'coverage',
            'test',
            '*.test.js',
            '*.spec.js'
        ];
    }
    
    /**
     * 🚀 RUN SECURITY AUDIT
     */
    async runAudit() {
        console.log('🔒 Starting Security Audit...\n');
        
        // Step 1: Scan for hardcoded credentials
        await this.scanFiles();
        
        // Step 2: Check dependencies
        await this.checkDependencies();
        
        // Step 3: Check file permissions
        await this.checkFilePermissions();
        
        // Step 4: Check environment configuration
        await this.checkEnvironmentConfig();
        
        // Step 5: Generate report
        this.generateReport();
        
        // Step 6: Apply fixes
        await this.applyFixes();
    }
    
    /**
     * 📂 SCAN FILES
     */
    async scanFiles() {
        console.log('📂 Scanning files for security issues...');
        
        const files = await this.getFilesToScan();
        
        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                await this.scanFileContent(file, content);
            } catch (error) {
                console.warn(`   ⚠️ Could not scan ${file}: ${error.message}`);
            }
        }
        
        console.log(`   ✅ Scanned ${files.length} files\n`);
    }
    
    /**
     * 🔍 SCAN FILE CONTENT
     */
    async scanFileContent(filePath, content) {
        const lines = content.split('\n');
        
        for (const [issueType, config] of Object.entries(this.securityPatterns)) {
            for (const pattern of config.patterns) {
                const matches = content.matchAll(pattern);
                
                for (const match of matches) {
                    const lineNumber = this.getLineNumber(content, match.index);
                    const issue = {
                        type: issueType,
                        file: filePath,
                        line: lineNumber,
                        code: lines[lineNumber - 1]?.trim(),
                        match: match[0],
                        fix: config.fix
                    };
                    
                    this.issues[config.severity].push(issue);
                }
            }
        }
    }
    
    /**
     * 📦 CHECK DEPENDENCIES
     */
    async checkDependencies() {
        console.log('📦 Checking dependencies for vulnerabilities...');
        
        try {
            // Run npm audit
            const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
            const audit = JSON.parse(auditResult);
            
            if (audit.vulnerabilities) {
                const vulns = Object.values(audit.vulnerabilities);
                
                for (const vuln of vulns) {
                    const issue = {
                        type: 'vulnerableDependency',
                        package: vuln.name,
                        severity: vuln.severity,
                        via: vuln.via,
                        fix: `Update ${vuln.name} to ${vuln.fixAvailable?.version || 'latest'}`
                    };
                    
                    const severity = this.mapNpmSeverity(vuln.severity);
                    this.issues[severity].push(issue);
                }
            }
            
            console.log(`   ✅ Dependency audit complete\n`);
            
        } catch (error) {
            // npm audit returns non-zero exit code when vulnerabilities found
            if (error.stdout) {
                try {
                    const audit = JSON.parse(error.stdout);
                    if (audit.metadata?.vulnerabilities) {
                        const vulns = audit.metadata.vulnerabilities;
                        console.log(`   ⚠️ Found ${vulns.total} vulnerabilities`);
                        console.log(`      Critical: ${vulns.critical}`);
                        console.log(`      High: ${vulns.high}`);
                        console.log(`      Moderate: ${vulns.moderate}`);
                        console.log(`      Low: ${vulns.low}\n`);
                    }
                } catch {}
            }
        }
    }
    
    /**
     * 🔐 CHECK FILE PERMISSIONS
     */
    async checkFilePermissions() {
        console.log('🔐 Checking file permissions...');
        
        const sensitiveFiles = [
            '.env',
            '.env.production',
            'private.key',
            'cert.pem',
            'id_rsa'
        ];
        
        for (const file of sensitiveFiles) {
            try {
                const stats = await fs.stat(file);
                const mode = (stats.mode & parseInt('777', 8)).toString(8);
                
                if (mode !== '600' && mode !== '400') {
                    this.issues.high.push({
                        type: 'filePermissions',
                        file: file,
                        currentMode: mode,
                        recommendedMode: '600',
                        fix: `chmod 600 ${file}`
                    });
                }
            } catch (error) {
                // File doesn't exist
            }
        }
        
        console.log('   ✅ File permissions checked\n');
    }
    
    /**
     * 🌍 CHECK ENVIRONMENT CONFIG
     */
    async checkEnvironmentConfig() {
        console.log('🌍 Checking environment configuration...');
        
        // Check for .env.example
        try {
            await fs.access('.env.example');
        } catch {
            this.issues.medium.push({
                type: 'missingEnvExample',
                fix: 'Create .env.example with dummy values'
            });
        }
        
        // Check if .env is in .gitignore
        try {
            const gitignore = await fs.readFile('.gitignore', 'utf8');
            if (!gitignore.includes('.env')) {
                this.issues.critical.push({
                    type: 'envNotIgnored',
                    fix: 'Add .env to .gitignore'
                });
            }
        } catch {
            this.issues.high.push({
                type: 'missingGitignore',
                fix: 'Create .gitignore file'
            });
        }
        
        console.log('   ✅ Environment configuration checked\n');
    }
    
    /**
     * 📊 GENERATE REPORT
     */
    generateReport() {
        console.log('📊 Security Audit Report\n');
        console.log('=' .repeat(50));
        
        const totalIssues = Object.values(this.issues).reduce((sum, arr) => sum + arr.length, 0);
        
        console.log(`Total Issues Found: ${totalIssues}\n`);
        
        // Critical Issues
        if (this.issues.critical.length > 0) {
            console.log(`🚨 CRITICAL (${this.issues.critical.length})`);
            this.issues.critical.forEach(issue => {
                console.log(`   - ${issue.type} in ${issue.file || 'system'}`);
                if (issue.line) console.log(`     Line ${issue.line}: ${issue.code}`);
                console.log(`     Fix: ${issue.fix}`);
            });
            console.log();
        }
        
        // High Issues
        if (this.issues.high.length > 0) {
            console.log(`⚠️  HIGH (${this.issues.high.length})`);
            this.issues.high.forEach(issue => {
                console.log(`   - ${issue.type} in ${issue.file || 'system'}`);
                if (issue.fix) console.log(`     Fix: ${issue.fix}`);
            });
            console.log();
        }
        
        // Medium Issues
        if (this.issues.medium.length > 0) {
            console.log(`⚡ MEDIUM (${this.issues.medium.length})`);
            this.issues.medium.forEach(issue => {
                console.log(`   - ${issue.type} in ${issue.file || 'system'}`);
            });
            console.log();
        }
        
        // Low Issues
        if (this.issues.low.length > 0) {
            console.log(`💡 LOW (${this.issues.low.length})`);
            console.log(`   ${this.issues.low.length} low priority issues found`);
            console.log();
        }
        
        console.log('=' .repeat(50));
    }
    
    /**
     * 🔧 APPLY FIXES
     */
    async applyFixes() {
        console.log('\n🔧 Applying Security Fixes...\n');
        
        // Create security templates
        await this.createSecurityTemplates();
        
        // Update package.json with security scripts
        await this.updatePackageJson();
        
        // Create security middleware
        await this.createSecurityMiddleware();
        
        console.log('✅ Security fixes applied\n');
    }
    
    /**
     * 📝 CREATE SECURITY TEMPLATES
     */
    async createSecurityTemplates() {
        // Create .env.example
        const envExample = `# API Configuration
API_PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-change-this
ENCRYPTION_KEY=your-encryption-key-change-this

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# CORS
CORS_ORIGINS=http://localhost:3002

# Rate Limiting
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60

# API Keys (generate new ones)
ADMIN_API_KEY=generate-a-secure-api-key
`;
        
        await fs.writeFile('.env.example', envExample);
        console.log('   ✅ Created .env.example');
        
        // Create security config
        const securityConfig = `export const securityConfig = {
    // Authentication
    jwtExpiry: '24h',
    refreshTokenExpiry: '7d',
    sessionTimeout: 3600000, // 1 hour
    
    // Password Policy
    passwordMinLength: 12,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    
    // Rate Limiting
    loginAttempts: 5,
    loginLockoutDuration: 900000, // 15 minutes
    
    // Security Headers
    enableHSTS: true,
    hstsMaxAge: 31536000,
    enableCSP: true,
    
    // CORS
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3002'],
    
    // File Upload
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['pdf', 'png', 'jpg', 'jpeg'],
    
    // Audit
    enableAuditLog: true,
    auditLogRetention: 90 // days
};
`;
        
        await fs.writeFile('src/config/security.config.js', securityConfig);
        console.log('   ✅ Created security configuration');
    }
    
    /**
     * 📦 UPDATE PACKAGE.JSON
     */
    async updatePackageJson() {
        try {
            const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
            
            // Add security scripts
            packageJson.scripts = packageJson.scripts || {};
            packageJson.scripts['security:audit'] = 'node run-security-audit.js';
            packageJson.scripts['security:check'] = 'npm audit';
            packageJson.scripts['security:fix'] = 'npm audit fix';
            
            await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
            console.log('   ✅ Updated package.json with security scripts');
            
        } catch (error) {
            console.warn('   ⚠️ Could not update package.json');
        }
    }
    
    /**
     * 🛡️ CREATE SECURITY MIDDLEWARE
     */
    async createSecurityMiddleware() {
        const middleware = `import { getAPISecurityService } from './src/security/APISecurityService.js';

export const setupSecurity = async (app) => {
    const security = getAPISecurityService();
    await security.initialize();
    
    // Security headers
    app.use(security.securityHeaders());
    
    // Rate limiting
    app.use(security.rateLimit());
    
    // Request validation
    app.use(security.validateRequest());
    
    // Authentication for protected routes
    app.use('/api/*', security.authenticate());
    
    // CORS
    if (process.env.NODE_ENV === 'production') {
        const cors = await import('cors');
        app.use(cors.default(security.corsConfig()));
    }
    
    console.log('🔒 Security middleware configured');
};
`;
        
        await fs.writeFile('security-middleware.js', middleware);
        console.log('   ✅ Created security middleware');
    }
    
    /**
     * 🔧 HELPER METHODS
     */
    
    async getFilesToScan() {
        const files = [];
        
        const scanDir = async (dir) => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    if (!this.shouldIgnore(entry.name)) {
                        await scanDir(fullPath);
                    }
                } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
                    files.push(fullPath);
                }
            }
        };
        
        await scanDir('.');
        return files;
    }
    
    shouldIgnore(name) {
        return this.ignorePatterns.some(pattern => name.includes(pattern));
    }
    
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }
    
    mapNpmSeverity(npmSeverity) {
        const mapping = {
            'critical': 'critical',
            'high': 'high',
            'moderate': 'medium',
            'low': 'low'
        };
        return mapping[npmSeverity] || 'low';
    }
}

// Run the audit
const auditor = new SecurityAuditor();
auditor.runAudit().catch(console.error);
