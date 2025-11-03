/**
 * 📚 SWAGGER UI SERVER
 * ====================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Interactive API Documentation
 * Serves OpenAPI/Swagger documentation with live testing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SwaggerUIServer {
    constructor(config = {}) {
        this.config = {
            port: config.port || process.env.SWAGGER_PORT || 3004,
            host: config.host || '0.0.0.0',
            apiUrl: config.apiUrl || process.env.API_URL || 'http://localhost:3001',
            title: config.title || 'Elite Construction AI Syndicate API',
            ...config
        };
        
        this.app = null;
        this.server = null;
        this.swaggerDocument = null;
    }
    
    /**
     * 🚀 INITIALIZE
     */
    async initialize() {
        console.log('📚 Initializing Swagger UI Server...');
        
        // Load OpenAPI document
        await this.loadOpenAPIDocument();
        
        // Create Express app
        this.app = express();
        
        // Configure middleware
        this.setupMiddleware();
        
        // Setup routes
        this.setupRoutes();
        
        console.log('✅ Swagger UI Server initialized');
    }
    
    /**
     * 📄 LOAD OPENAPI DOCUMENT
     */
    async loadOpenAPIDocument() {
        try {
            const openApiPath = path.join(__dirname, '../../docs/openapi.yaml');
            
            // Check if file exists
            await fs.access(openApiPath);
            
            // Load YAML document
            this.swaggerDocument = YAML.load(openApiPath);
            
            // Update server URL based on environment
            if (process.env.NODE_ENV === 'production') {
                this.swaggerDocument.servers[0].url = this.config.apiUrl;
            }
            
            console.log('✅ OpenAPI document loaded');
            
        } catch (error) {
            console.error('Failed to load OpenAPI document:', error);
            
            // Create minimal fallback document
            this.swaggerDocument = {
                openapi: '3.0.3',
                info: {
                    title: this.config.title,
                    version: '1.0.0',
                    description: 'API documentation will be available once openapi.yaml is generated'
                },
                servers: [
                    { url: this.config.apiUrl }
                ],
                paths: {}
            };
        }
    }
    
    /**
     * 🔧 SETUP MIDDLEWARE
     */
    setupMiddleware() {
        // Security headers
        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });
        
        // Custom CSS for branding
        const customCss = `
            .swagger-ui .topbar { 
                background-color: #0a0e27; 
                border-bottom: 3px solid #4ade80;
            }
            .swagger-ui .topbar .download-url-wrapper { display: none; }
            .swagger-ui .info .title { color: #4ade80; }
            .swagger-ui .btn.authorize { 
                background-color: #4ade80; 
                color: #0a0e27;
                border: none;
            }
            .swagger-ui .btn.authorize:hover { 
                background-color: #22c55e; 
            }
            .swagger-ui .opblock.opblock-post .opblock-summary-method { 
                background: #3b82f6; 
            }
            .swagger-ui .opblock.opblock-get .opblock-summary-method { 
                background: #10b981; 
            }
            .swagger-ui .opblock.opblock-put .opblock-summary-method { 
                background: #f59e0b; 
            }
            .swagger-ui .opblock.opblock-delete .opblock-summary-method { 
                background: #ef4444; 
            }
            .swagger-ui select, .swagger-ui input[type=text] {
                background: #1e293b;
                color: #e2e8f0;
                border: 1px solid #475569;
            }
        `;
        
        // Swagger UI options
        const swaggerOptions = {
            explorer: true,
            customCss,
            customSiteTitle: this.config.title,
            customfavIcon: '/favicon.ico',
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                deepLinking: true,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                validatorUrl: null,
                supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
                onComplete: () => {
                    console.log('Swagger UI loaded');
                }
            }
        };
        
        // Setup Swagger UI
        this.app.use(
            '/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(this.swaggerDocument, swaggerOptions)
        );
    }
    
    /**
     * 🛣️ SETUP ROUTES
     */
    setupRoutes() {
        // Redirect root to API docs
        this.app.get('/', (req, res) => {
            res.redirect('/api-docs');
        });
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'swagger-ui',
                timestamp: Date.now()
            });
        });
        
        // Download OpenAPI spec
        this.app.get('/openapi.yaml', (req, res) => {
            res.setHeader('Content-Type', 'text/yaml');
            res.setHeader('Content-Disposition', 'attachment; filename="openapi.yaml"');
            res.send(YAML.stringify(this.swaggerDocument, 10));
        });
        
        this.app.get('/openapi.json', (req, res) => {
            res.json(this.swaggerDocument);
        });
        
        // Postman collection generator
        this.app.get('/postman-collection', async (req, res) => {
            try {
                const collection = await this.generatePostmanCollection();
                res.json(collection);
            } catch (error) {
                res.status(500).json({ error: 'Failed to generate Postman collection' });
            }
        });
    }
    
    /**
     * 📮 GENERATE POSTMAN COLLECTION
     */
    async generatePostmanCollection() {
        const collection = {
            info: {
                name: this.swaggerDocument.info.title,
                description: this.swaggerDocument.info.description,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            },
            item: [],
            auth: {
                type: 'bearer',
                bearer: [
                    {
                        key: 'token',
                        value: '{{access_token}}',
                        type: 'string'
                    }
                ]
            },
            variable: [
                {
                    key: 'base_url',
                    value: this.swaggerDocument.servers[0].url
                }
            ]
        };
        
        // Group endpoints by tags
        const tagGroups = {};
        
        for (const [path, methods] of Object.entries(this.swaggerDocument.paths)) {
            for (const [method, operation] of Object.entries(methods)) {
                if (typeof operation !== 'object') continue;
                
                const tag = operation.tags?.[0] || 'Other';
                
                if (!tagGroups[tag]) {
                    tagGroups[tag] = {
                        name: tag,
                        item: []
                    };
                }
                
                // Create Postman request
                const request = {
                    name: operation.summary || `${method.toUpperCase()} ${path}`,
                    request: {
                        method: method.toUpperCase(),
                        header: [],
                        url: {
                            raw: `{{base_url}}${path}`,
                            host: ['{{base_url}}'],
                            path: path.split('/').filter(p => p)
                        }
                    }
                };
                
                // Add request body if present
                if (operation.requestBody?.content?.['application/json']?.schema) {
                    request.request.body = {
                        mode: 'raw',
                        raw: JSON.stringify(
                            this.generateExampleFromSchema(
                                operation.requestBody.content['application/json'].schema
                            ),
                            null,
                            2
                        ),
                        options: {
                            raw: {
                                language: 'json'
                            }
                        }
                    };
                    
                    request.request.header.push({
                        key: 'Content-Type',
                        value: 'application/json'
                    });
                }
                
                // Add auth if required
                if (operation.security) {
                    request.request.auth = {
                        type: 'bearer',
                        bearer: [
                            {
                                key: 'token',
                                value: '{{access_token}}'
                            }
                        ]
                    };
                }
                
                tagGroups[tag].item.push(request);
            }
        }
        
        collection.item = Object.values(tagGroups);
        
        return collection;
    }
    
    /**
     * 🎲 GENERATE EXAMPLE FROM SCHEMA
     */
    generateExampleFromSchema(schema) {
        if (schema.example !== undefined) {
            return schema.example;
        }
        
        if (schema.$ref) {
            const refPath = schema.$ref.split('/').slice(1);
            let refSchema = this.swaggerDocument;
            for (const part of refPath) {
                refSchema = refSchema[part];
            }
            return this.generateExampleFromSchema(refSchema);
        }
        
        switch (schema.type) {
            case 'object':
                const obj = {};
                if (schema.properties) {
                    for (const [key, prop] of Object.entries(schema.properties)) {
                        obj[key] = this.generateExampleFromSchema(prop);
                    }
                }
                return obj;
                
            case 'array':
                return [this.generateExampleFromSchema(schema.items)];
                
            case 'string':
                if (schema.enum) return schema.enum[0];
                if (schema.format === 'email') return 'user@example.com';
                if (schema.format === 'date-time') return new Date().toISOString();
                if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
                return 'string';
                
            case 'integer':
                return schema.minimum || 1;
                
            case 'number':
                return schema.minimum || 1.0;
                
            case 'boolean':
                return true;
                
            default:
                return null;
        }
    }
    
    /**
     * 🚀 START SERVER
     */
    async start() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.config.port, this.config.host, (error) => {
                if (error) {
                    console.error('Failed to start Swagger UI server:', error);
                    reject(error);
                } else {
                    console.log(`📚 Swagger UI running at http://${this.config.host}:${this.config.port}/api-docs`);
                    console.log(`📥 Download OpenAPI spec at http://${this.config.host}:${this.config.port}/openapi.yaml`);
                    resolve(this.config.port);
                }
            });
        });
    }
    
    /**
     * 🛑 STOP SERVER
     */
    async stop() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log('📚 Swagger UI server stopped');
                    resolve();
                });
            });
        }
    }
}

/**
 * 🚀 STANDALONE EXECUTION
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new SwaggerUIServer();
    
    server.initialize()
        .then(() => server.start())
        .catch(console.error);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n📚 Shutting down Swagger UI server...');
        await server.stop();
        process.exit(0);
    });
}

export default SwaggerUIServer;
