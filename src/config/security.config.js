export const securityConfig = {
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
