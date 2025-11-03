#!/usr/bin/env node

/**
 * 📚 API DOCUMENTATION GENERATOR
 * ==============================
 * 
 * Generates additional API documentation formats
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 📖 GENERATE MARKDOWN DOCUMENTATION
 */
async function generateMarkdownDocs() {
    console.log('📖 Generating Markdown documentation...');
    
    const openApiPath = path.join(__dirname, '../docs/openapi.yaml');
    const openApiDoc = YAML.load(openApiPath);
    
    let markdown = `# ${openApiDoc.info.title}\n\n`;
    markdown += `Version: ${openApiDoc.info.version}\n\n`;
    markdown += `${openApiDoc.info.description}\n\n`;
    
    // Servers
    markdown += '## Servers\n\n';
    openApiDoc.servers.forEach(server => {
        markdown += `- **${server.description}**: ${server.url}\n`;
    });
    markdown += '\n';
    
    // Authentication
    markdown += '## Authentication\n\n';
    markdown += 'This API uses JWT Bearer authentication. Obtain a token via `/api/auth/login`.\n\n';
    markdown += '```\nAuthorization: Bearer YOUR_JWT_TOKEN\n```\n\n';
    
    // Endpoints by tag
    markdown += '## Endpoints\n\n';
    
    const endpointsByTag = {};
    
    for (const [path, methods] of Object.entries(openApiDoc.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
            if (typeof operation !== 'object') continue;
            
            const tag = operation.tags?.[0] || 'Other';
            if (!endpointsByTag[tag]) {
                endpointsByTag[tag] = [];
            }
            
            endpointsByTag[tag].push({
                path,
                method: method.toUpperCase(),
                operation
            });
        }
    }
    
    for (const [tag, endpoints] of Object.entries(endpointsByTag)) {
        markdown += `### ${tag}\n\n`;
        
        endpoints.forEach(({ path, method, operation }) => {
            markdown += `#### ${operation.summary || `${method} ${path}`}\n\n`;
            markdown += `\`${method} ${path}\`\n\n`;
            
            if (operation.description) {
                markdown += `${operation.description}\n\n`;
            }
            
            // Parameters
            if (operation.parameters?.length > 0) {
                markdown += '**Parameters:**\n\n';
                markdown += '| Name | In | Type | Required | Description |\n';
                markdown += '|------|-----|------|----------|-------------|\n';
                
                operation.parameters.forEach(param => {
                    markdown += `| ${param.name} | ${param.in} | ${param.schema?.type || 'string'} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |\n`;
                });
                markdown += '\n';
            }
            
            // Request body
            if (operation.requestBody) {
                markdown += '**Request Body:**\n\n';
                const content = operation.requestBody.content?.['application/json'];
                if (content?.schema) {
                    markdown += '```json\n';
                    markdown += JSON.stringify(generateExample(content.schema, openApiDoc), null, 2);
                    markdown += '\n```\n\n';
                }
            }
            
            // Responses
            markdown += '**Responses:**\n\n';
            for (const [code, response] of Object.entries(operation.responses)) {
                markdown += `- **${code}**: ${response.description}\n`;
            }
            markdown += '\n---\n\n';
        });
    }
    
    // Save markdown
    const mdPath = path.join(__dirname, '../docs/API_DOCUMENTATION.md');
    await fs.writeFile(mdPath, markdown);
    
    console.log(`✅ Markdown documentation saved to: docs/API_DOCUMENTATION.md`);
}

/**
 * 🎲 GENERATE EXAMPLE
 */
function generateExample(schema, doc) {
    if (schema.example !== undefined) {
        return schema.example;
    }
    
    if (schema.$ref) {
        const refPath = schema.$ref.split('/').slice(1);
        let refSchema = doc;
        for (const part of refPath) {
            refSchema = refSchema[part];
        }
        return generateExample(refSchema, doc);
    }
    
    switch (schema.type) {
        case 'object':
            const obj = {};
            if (schema.properties) {
                for (const [key, prop] of Object.entries(schema.properties)) {
                    if (schema.required?.includes(key) || !schema.required) {
                        obj[key] = generateExample(prop, doc);
                    }
                }
            }
            return obj;
            
        case 'array':
            return [generateExample(schema.items, doc)];
            
        case 'string':
            if (schema.enum) return schema.enum[0];
            if (schema.format === 'email') return 'user@example.com';
            if (schema.format === 'date-time') return new Date().toISOString();
            if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
            if (schema.pattern) return 'string';
            return schema.example || 'string';
            
        case 'integer':
            return schema.example || schema.minimum || 1;
            
        case 'number':
            return schema.example || schema.minimum || 1.0;
            
        case 'boolean':
            return schema.example !== undefined ? schema.example : true;
            
        default:
            return null;
    }
}

/**
 * 📝 GENERATE INSOMNIA COLLECTION
 */
async function generateInsomniaCollection() {
    console.log('📝 Generating Insomnia collection...');
    
    const openApiPath = path.join(__dirname, '../docs/openapi.yaml');
    const openApiDoc = YAML.load(openApiPath);
    
    const collection = {
        _type: 'export',
        __export_format: 4,
        __export_date: new Date().toISOString(),
        __export_source: 'insomnia.desktop.app:v2023.5.8',
        resources: []
    };
    
    // Workspace
    const workspace = {
        _id: 'wrk_' + Date.now(),
        parentId: null,
        modified: Date.now(),
        created: Date.now(),
        name: openApiDoc.info.title,
        description: openApiDoc.info.description,
        _type: 'workspace'
    };
    collection.resources.push(workspace);
    
    // Base environment
    const environment = {
        _id: 'env_' + Date.now(),
        parentId: workspace._id,
        modified: Date.now(),
        created: Date.now(),
        name: 'Base Environment',
        data: {
            base_url: openApiDoc.servers[0].url,
            access_token: ''
        },
        _type: 'environment'
    };
    collection.resources.push(environment);
    
    // Add requests
    let requestId = 1;
    for (const [path, methods] of Object.entries(openApiDoc.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
            if (typeof operation !== 'object') continue;
            
            const request = {
                _id: 'req_' + requestId++,
                parentId: workspace._id,
                modified: Date.now(),
                created: Date.now(),
                url: '{{ _.base_url }}' + path,
                name: operation.summary || `${method.toUpperCase()} ${path}`,
                description: operation.description || '',
                method: method.toUpperCase(),
                body: {},
                parameters: [],
                headers: [],
                authentication: {},
                metaSortKey: requestId,
                _type: 'request'
            };
            
            // Add authentication if required
            if (operation.security) {
                request.authentication = {
                    type: 'bearer',
                    token: '{{ _.access_token }}'
                };
            }
            
            // Add request body
            if (operation.requestBody?.content?.['application/json']) {
                request.headers.push({
                    name: 'Content-Type',
                    value: 'application/json'
                });
                
                request.body = {
                    mimeType: 'application/json',
                    text: JSON.stringify(
                        generateExample(
                            operation.requestBody.content['application/json'].schema,
                            openApiDoc
                        ),
                        null,
                        2
                    )
                };
            }
            
            collection.resources.push(request);
        }
    }
    
    // Save collection
    const insomniaPath = path.join(__dirname, '../docs/insomnia-collection.json');
    await fs.writeFile(insomniaPath, JSON.stringify(collection, null, 2));
    
    console.log(`✅ Insomnia collection saved to: docs/insomnia-collection.json`);
}

/**
 * 📊 GENERATE API METRICS
 */
async function generateAPIMetrics() {
    console.log('📊 Generating API metrics...');
    
    const openApiPath = path.join(__dirname, '../docs/openapi.yaml');
    const openApiDoc = YAML.load(openApiPath);
    
    const metrics = {
        totalEndpoints: 0,
        endpointsByMethod: {},
        endpointsByTag: {},
        authRequired: 0,
        parametersCount: 0,
        schemasCount: Object.keys(openApiDoc.components?.schemas || {}).length
    };
    
    for (const [path, methods] of Object.entries(openApiDoc.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
            if (typeof operation !== 'object') continue;
            
            metrics.totalEndpoints++;
            
            // By method
            metrics.endpointsByMethod[method] = (metrics.endpointsByMethod[method] || 0) + 1;
            
            // By tag
            const tag = operation.tags?.[0] || 'Other';
            metrics.endpointsByTag[tag] = (metrics.endpointsByTag[tag] || 0) + 1;
            
            // Auth required
            if (operation.security) {
                metrics.authRequired++;
            }
            
            // Parameters
            metrics.parametersCount += (operation.parameters?.length || 0);
        }
    }
    
    console.log('\n📊 API METRICS:');
    console.log('================');
    console.log(`Total Endpoints: ${metrics.totalEndpoints}`);
    console.log(`Schemas Defined: ${metrics.schemasCount}`);
    console.log(`Auth Required: ${metrics.authRequired}/${metrics.totalEndpoints} (${Math.round(metrics.authRequired/metrics.totalEndpoints*100)}%)`);
    console.log(`Total Parameters: ${metrics.parametersCount}`);
    console.log('\nEndpoints by Method:');
    Object.entries(metrics.endpointsByMethod).forEach(([method, count]) => {
        console.log(`  ${method.toUpperCase()}: ${count}`);
    });
    console.log('\nEndpoints by Tag:');
    Object.entries(metrics.endpointsByTag).forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count}`);
    });
    
    // Save metrics
    const metricsPath = path.join(__dirname, '../docs/api-metrics.json');
    await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2));
    
    console.log(`\n✅ Metrics saved to: docs/api-metrics.json`);
}

/**
 * 🚀 MAIN
 */
async function main() {
    console.log('🚀 Elite Construction AI Syndicate - API Documentation Generator');
    console.log('='.repeat(60));
    
    try {
        await generateMarkdownDocs();
        await generateInsomniaCollection();
        await generateAPIMetrics();
        
        console.log('\n✅ All documentation generated successfully!');
        console.log('\nAvailable formats:');
        console.log('  - OpenAPI 3.0: docs/openapi.yaml');
        console.log('  - Markdown: docs/API_DOCUMENTATION.md');
        console.log('  - Insomnia: docs/insomnia-collection.json');
        console.log('  - Swagger UI: http://localhost:3004/api-docs');
        
    } catch (error) {
        console.error('❌ Documentation generation failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
