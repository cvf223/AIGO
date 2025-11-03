# 📧 GMAIL API SETUP FOR NEWSLETTER ANALYSIS

## 🎯 Overview

This guide will help you set up Gmail API access to analyze 400+ DeFi newsletters automatically for competitive intelligence and market insights.

## 📋 Prerequisites

- Google Cloud Platform account
- Gmail account with newsletters subscribed
- Node.js environment

## 🔧 Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
```bash
# Go to: https://console.cloud.google.com/
# 1. Click "Select a project" → "New Project"
# 2. Name: "AI-Flash-Arbitrage-Gmail"
# 3. Click "Create"
```

### 1.2 Enable Gmail API
```bash
# In your project:
# 1. Go to "APIs & Services" → "Library"
# 2. Search "Gmail API"
# 3. Click "Enable"
```

### 1.3 Create Service Account
```bash
# 1. Go to "APIs & Services" → "Credentials"
# 2. Click "Create Credentials" → "Service Account"
# 3. Name: "gmail-newsletter-analyzer"
# 4. Description: "Service account for DeFi newsletter analysis"
# 5. Click "Create and Continue"
```

### 1.4 Grant Permissions
```bash
# 1. Role: "Project" → "Editor" (for full access)
# 2. Click "Continue" → "Done"
```

### 1.5 Generate Key
```bash
# 1. Click on your service account email
# 2. Go to "Keys" tab
# 3. Click "Add Key" → "Create new key"
# 4. Select "JSON"
# 5. Download the file (save as 'gmail-service-account.json')
```

## 🔐 Step 2: OAuth2 Setup (For User Account Access)

### 2.1 Create OAuth2 Credentials
```bash
# 1. Go to "APIs & Services" → "Credentials"
# 2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
# 3. Application type: "Desktop application"
# 4. Name: "DeFi Newsletter Analyzer"
# 5. Click "Create"
```

### 2.2 Download OAuth2 Credentials
```bash
# 1. Click the download icon next to your OAuth2 client
# 2. Save as 'gmail-oauth2-credentials.json'
```

## 🔑 Step 3: Environment Configuration

### 3.1 Create .env variables
```bash
# Add to your .env file:

# Gmail API Configuration
GOOGLE_APPLICATION_CREDENTIALS=./config/gmail-service-account.json
GMAIL_OAUTH2_CREDENTIALS=./config/gmail-oauth2-credentials.json
GMAIL_USER_EMAIL=your-gmail@gmail.com

# Gmail API Scopes
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.modify

# Newsletter Analysis Configuration
NEWSLETTER_ANALYSIS_ENABLED=true
NEWSLETTER_CHECK_INTERVAL=3600000  # 1 hour in milliseconds
NEWSLETTER_MAX_EMAILS_PER_BATCH=50
NEWSLETTER_RETENTION_DAYS=30

# Newsletter Categories to Monitor
NEWSLETTER_CATEGORIES=defi,crypto,mev,arbitrage,yield-farming,dao,nft,blockchain,trading,market-analysis
```

### 3.2 Create config directory
```bash
mkdir -p config
mv gmail-service-account.json config/
mv gmail-oauth2-credentials.json config/
```

## 📦 Step 4: Install Dependencies

```bash
npm install googleapis google-auth-library
```

## 🚀 Step 5: Gmail Integration Code

### 5.1 Basic Gmail Service
```typescript
// src/core/GmailService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';

export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;
  
  constructor() {
    this.initializeAuth();
  }
  
  private async initializeAuth() {
    // Load OAuth2 credentials
    const credentialsPath = path.join(process.cwd(), process.env.GMAIL_OAUTH2_CREDENTIALS!);
    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));
    
    this.oauth2Client = new OAuth2Client(
      credentials.installed.client_id,
      credentials.installed.client_secret,
      credentials.installed.redirect_uris[0]
    );
    
    // Load or generate access token
    await this.loadOrGenerateToken();
    
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }
  
  private async loadOrGenerateToken() {
    const tokenPath = './config/gmail-token.json';
    
    try {
      const token = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
      this.oauth2Client.setCredentials(token);
      
      // Check if token is expired
      const tokenInfo = await this.oauth2Client.getTokenInfo(token.access_token);
      console.log('✅ Gmail token loaded successfully');
    } catch (error) {
      console.log('🔑 Generating new Gmail access token...');
      await this.generateNewToken();
    }
  }
  
  private async generateNewToken() {
    const scopes = process.env.GMAIL_SCOPES?.split(',') || [
      'https://www.googleapis.com/auth/gmail.readonly'
    ];
    
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    
    console.log('🌐 Open this URL in your browser:');
    console.log(authUrl);
    console.log('\n📋 After authorization, copy the code and run:');
    console.log('node -e "require(\'./src/core/GmailService\').setAuthCode(\'YOUR_AUTH_CODE\')"');
    
    // This would be handled by a separate script or manual process
  }
  
  async setAuthCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    
    // Save tokens for future use
    await fs.writeFile('./config/gmail-token.json', JSON.stringify(tokens, null, 2));
    console.log('✅ Gmail authentication complete!');
  }
}
```

## 🔧 Step 6: Authentication Script

### 6.1 Create authentication helper
```typescript
// scripts/setup-gmail-auth.ts
import { GmailService } from '../src/core/GmailService';
import readline from 'readline';

async function setupGmailAuth() {
  console.log('🔐 Setting up Gmail authentication...');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const gmailService = new GmailService();
  
  // This will print the auth URL
  console.log('📋 After visiting the URL and getting the code, enter it here:');
  
  rl.question('Enter authorization code: ', async (code) => {
    try {
      await gmailService.setAuthCode(code);
      console.log('✅ Gmail setup complete!');
    } catch (error) {
      console.error('❌ Error setting up Gmail:', error);
    }
    rl.close();
  });
}

setupGmailAuth();
```

## 🏃‍♂️ Step 7: Quick Setup Commands

### 7.1 Run authentication
```bash
# 1. Run the auth setup
npx ts-node scripts/setup-gmail-auth.ts

# 2. Follow the URL and enter the code when prompted
```

### 7.2 Test connection
```bash
# Create test script
cat > test-gmail.js << 'EOF'
const { GmailService } = require('./src/core/GmailService');

async function testGmail() {
  try {
    const gmail = new GmailService();
    const messages = await gmail.listMessages({ maxResults: 5 });
    console.log('✅ Gmail connection successful!');
    console.log(`📧 Found ${messages.length} recent emails`);
  } catch (error) {
    console.error('❌ Gmail connection failed:', error);
  }
}

testGmail();
EOF

node test-gmail.js
```

## 🔍 Step 8: Newsletter Filter Setup

### 8.1 Create Gmail filters for newsletter organization
```bash
# In Gmail web interface:
# 1. Go to Settings → Filters and Blocked Addresses
# 2. Create filters for common newsletter patterns:

# DeFi Newsletters Filter:
# From: *@substack.com OR *@newsletter.bankless.io OR *@defipulse.com
# Label: "DeFi-Newsletters"
# Skip Inbox: No
# Mark as Important: Yes

# MEV/Arbitrage Filter:
# Subject: (MEV OR arbitrage OR "flash loan" OR "yield farming")
# Label: "MEV-Intelligence"
# Mark as Important: Yes

# Market Analysis Filter:
# From: (*messari* OR *coindesk* OR *theblock* OR *decrypt*)
# Label: "Market-Analysis"
```

## 🤖 Step 9: Integration with Newsletter Analyzer

### 9.1 Update MEVNewsletterAnalyzer to use Gmail
```typescript
// In src/core/MEVNewsletterAnalyzer.ts
import { GmailService } from './GmailService';

export class MEVNewsletterAnalyzer {
  private gmailService: GmailService;
  
  constructor() {
    this.gmailService = new GmailService();
  }
  
  async fetchNewsletters(): Promise<any[]> {
    // Implementation using Gmail API instead of mock data
    const query = 'label:DeFi-Newsletters OR label:MEV-Intelligence newer_than:1d';
    return await this.gmailService.searchEmails(query);
  }
}
```

## 🔒 Security Best Practices

### 9.1 Secure credential storage
```bash
# Add to .gitignore
echo "config/gmail-*.json" >> .gitignore
echo "config/gmail-token.json" >> .gitignore

# Use environment variables in production
export GOOGLE_APPLICATION_CREDENTIALS_BASE64=$(base64 -i config/gmail-service-account.json)
```

### 9.2 Token refresh handling
```typescript
// Add to GmailService
private async refreshTokenIfNeeded() {
  try {
    await this.oauth2Client.getAccessToken();
  } catch (error) {
    console.log('🔄 Refreshing Gmail token...');
    await this.oauth2Client.refreshAccessToken();
  }
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **"insufficient_scope" error**
   ```bash
   # Delete token and re-authenticate with broader scopes
   rm config/gmail-token.json
   npx ts-node scripts/setup-gmail-auth.ts
   ```

2. **"invalid_grant" error**
   ```bash
   # Token expired, re-authenticate
   npx ts-node scripts/setup-gmail-auth.ts
   ```

3. **Rate limiting**
   ```bash
   # Add delays between requests
   await new Promise(resolve => setTimeout(resolve, 100));
   ```

## ✅ Verification Checklist

- [ ] Google Cloud project created
- [ ] Gmail API enabled
- [ ] OAuth2 credentials downloaded
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Authentication completed
- [ ] Test connection successful
- [ ] Gmail filters configured
- [ ] Security measures implemented

## 📞 Next Steps

After completing this setup:

1. **Test the newsletter fetching**: Run a small test to ensure emails are being retrieved
2. **Configure newsletter categories**: Set up specific labels for different types of DeFi content
3. **Integrate with analysis pipeline**: Connect to the MEVNewsletterAnalyzer system
4. **Set up monitoring**: Ensure the system can handle high email volumes

Your Gmail API is now ready for automated newsletter analysis! 🎉 