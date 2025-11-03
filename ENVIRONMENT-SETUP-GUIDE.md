# 🛠️ Environment Setup Guide for Background Task System

This guide outlines the steps needed to set up your environment for the Ultimate Arbitrage Syndicate's background task system.

## 📋 Required Environment Variables

The background task system requires specific environment variables to function properly. We've identified the key variables needed from your main `.env` file:

### ✅ Already Configured Variables

These variables are already properly configured in your environment:

- **Blockchain RPC Endpoints**: All Alchemy, Infura, and QuickNode endpoints for Arbitrum, Base, and Polygon
- **Database Configuration**: PostgreSQL connection details
- **Wallet Configuration**: Private keys and addresses
- **Telegram Notifications**: Bot token and group ID
- **API Keys**: Moralis API key

### 🚨 Missing or Empty Variables

These variables need to be configured:

1. **Moralis Webhook URL**: 
   - Required for receiving real-time blockchain events
   - For local testing, use ngrok: `npm run test-webhook`
   - Set `MORALIS_WEBHOOK_URL` to the ngrok URL + `/webhook`

2. **Flashbots Relay Signing Key**:
   - Required for MEV protection
   - Generate a new private key or use an existing one
   - Set `FLASHBOTS_RELAY_SIGNING_KEY` to the private key

## 🔧 Setting Up Moralis Streams

To set up Moralis streams for real-time blockchain monitoring:

1. **Create a Moralis Account**:
   - Go to [moralis.io](https://moralis.io) and sign up if you haven't already
   - Your API key is already configured: `MORALIS_API_KEY`

2. **Create Streams**:
   - Log in to your Moralis dashboard
   - Navigate to "Streams" section
   - Create a new stream for each network (Arbitrum, Base, Polygon)
   - Set the webhook URL to your `MORALIS_WEBHOOK_URL`
   - Configure the stream to monitor swap events:
     - Select "Swaps" as the event type
     - Add addresses for major DEXs (or use "All addresses")
     - Enable "Include contract logs"
     - Enable "Include transaction details"

3. **Test the Streams**:
   - Run `npm run test-moralis-integration` to verify the connection
   - Check logs for successful event reception

## 📁 Directory Setup

Create the necessary directories for the background task system:

```bash
mkdir -p ./data/tasks ./data/tasks/discoveries ./data/tasks/states
```

Or use the provided script:

```bash
npm run setup-data-dirs
```

## 🔐 Wallet Configuration

The system is already configured with your wallet:

- **Private Key**: `0xa4e69019fdda37babdb875d8752bc00bc9cc24ddda51816a3c5449c69ec0b3c2`
- **Address**: `0x35F25CC8D5de12e9902449A124E2345734Ff95Fc`

Make sure this wallet has sufficient funds for gas fees on all supported networks.

## 🏊 Database Configuration

The system uses your PostgreSQL database directly for all pool data:

- **Database**: `arbitrum_flash_specialist`
- **User**: `postgres`
- **Password**: `postgres`

Ensure your database contains the following tables:
- `pools`: Contains all pool information including addresses, tokens, and DEX names
- `tokens`: Contains token information

The system queries the database directly for all pool operations, ensuring data is always up-to-date.

## 🚀 Running the System

Once everything is configured:

1. **Start the System**:
   ```bash
   npm run start-ultimate
   ```

2. **Monitor the Logs**:
   - Check the logs for successful initialization
   - Verify that all components are working correctly
   - Look for background tasks running and discoveries being recorded

3. **Test with Simulated Events**:
   ```bash
   npm run test-background
   ```

## 🔍 Troubleshooting

If you encounter issues:

1. **Check Webhook Connection**:
   - Verify that your webhook URL is accessible from the internet
   - Check that Moralis can reach your webhook endpoint

2. **Verify RPC Connections**:
   ```bash
   npm run test-rpc
   ```

3. **Check Database Connection**:
   - Ensure PostgreSQL is running
   - Verify that the database exists and is accessible
   - Check that the `pools` table contains the expected data
   - Run a sample query: `SELECT COUNT(*) FROM pools WHERE chain_id = 42161`

4. **Inspect Logs**:
   - Check `./logs/background-tasks.log` for errors
   - Look for connection issues or configuration problems

## 📊 Monitoring

Once the system is running:

1. **Watch for Discoveries**:
   - Check `./data/tasks/discoveries/` for new files
   - Review the discoveries for valuable insights

2. **Monitor Performance**:
   - Run `npm run test-atomic-switch` to benchmark task switching
   - Verify that the switch time is close to the target (1.4ms)

3. **Check Task States**:
   - Examine `./data/tasks/states/` for saved task states
   - Verify that tasks are being saved and resumed correctly 