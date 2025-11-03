import { spawn } from 'child_process';
import { elizaLogger } from '@elizaos/core';
import { WebhookServer } from '../src/webhookServer';

const WEBHOOK_PORT = process.env.TELEGRAM_WEBHOOK_PORT || '8443';

async function startNgrok(port: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const ngrok = spawn('ngrok', ['http', port, '--log=stdout']);
        let ngrokUrl = '';

        ngrok.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(output);

            // Look for the forwarding URL in ngrok output
            const match = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/);
            if (match) {
                ngrokUrl = match[0];
                elizaLogger.info(`Ngrok tunnel established at: ${ngrokUrl}`);
                resolve(ngrokUrl);
            }
        });

        ngrok.stderr.on('data', (data) => {
            elizaLogger.error(`Ngrok error: ${data}`);
        });

        ngrok.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Ngrok process exited with code ${code}`));
            }
        });
    });
}

async function main() {
    try {
        // Start the webhook server
        const webhookServer = new WebhookServer(parseInt(WEBHOOK_PORT));
        await webhookServer.start();
        elizaLogger.info(`Webhook server started on port ${WEBHOOK_PORT}`);

        // Start ngrok tunnel
        const ngrokUrl = await startNgrok(WEBHOOK_PORT);
        
        // Set the webhook URL in environment
        process.env.TELEGRAM_WEBHOOK_URL = ngrokUrl;
        elizaLogger.info(`Set TELEGRAM_WEBHOOK_URL to ${ngrokUrl}`);

        // Handle shutdown
        process.on('SIGINT', async () => {
            elizaLogger.info('Shutting down...');
            await webhookServer.stop();
            process.exit(0);
        });

    } catch (error) {
        elizaLogger.error('Failed to start webhook server:', error);
        process.exit(1);
    }
}

main(); 