import { getAPISecurityService } from './src/security/APISecurityService.js';

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
