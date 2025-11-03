#!/bin/bash

# 🚀 LOAD TEST RUNNER
# Elite Construction AI Syndicate
# Runs comprehensive load tests including 10k WebSocket connections

echo "🚀 ELITE CONSTRUCTION AI SYNDICATE - LOAD TESTING"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Artillery is installed
if ! command -v artillery &> /dev/null; then
    echo -e "${RED}❌ Artillery is not installed${NC}"
    echo "Installing Artillery..."
    npm install -g artillery@latest
fi

# Create reports directory
mkdir -p reports
mkdir -p test-plans

# Function to check if server is running
check_server() {
    echo "Checking if servers are running..."
    
    # Check main API server
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ API Server is running${NC}"
    else
        echo -e "${RED}❌ API Server is not running on port 3001${NC}"
        echo "Please start the server with: pm2 start ecosystem.config.js"
        exit 1
    fi
    
    # Check WebSocket
    if timeout 2 bash -c 'cat < /dev/null > /dev/tcp/localhost/3001'; then
        echo -e "${GREEN}✅ WebSocket server is accessible${NC}"
    else
        echo -e "${RED}❌ WebSocket server is not accessible${NC}"
        exit 1
    fi
}

# Function to prepare test users
prepare_test_users() {
    echo ""
    echo "Preparing test users..."
    
    # Create test users via API
    for i in {1..10}; do
        curl -s -X POST http://localhost:3001/api/auth/register \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"loadtest${i}\",\"email\":\"loadtest${i}@test.com\",\"password\":\"LoadTest123!\"}" \
            > /dev/null
    done
    
    echo -e "${GREEN}✅ Test users created${NC}"
}

# Function to run basic load test
run_basic_test() {
    echo ""
    echo "======================================"
    echo "🔧 RUNNING BASIC LOAD TEST"
    echo "======================================"
    echo "Target: Mixed HTTP/WebSocket traffic"
    echo "Duration: ~20 minutes"
    echo ""
    
    artillery run artillery-config.yml
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Basic load test completed${NC}"
    else
        echo -e "${RED}❌ Basic load test failed${NC}"
    fi
}

# Function to run 10k WebSocket test
run_10k_test() {
    echo ""
    echo "======================================"
    echo "🚀 RUNNING 10K WEBSOCKET TEST"
    echo "======================================"
    echo "Target: 10,000 concurrent connections"
    echo "Duration: ~10 minutes"
    echo ""
    echo -e "${YELLOW}⚠️  This test requires significant resources${NC}"
    echo "Recommended: 16GB+ RAM, good network"
    echo ""
    read -p "Continue with 10k test? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Increase system limits
        echo "Adjusting system limits..."
        ulimit -n 20000  # File descriptors
        
        artillery run 10k-websocket-test.yml
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 10k WebSocket test completed${NC}"
        else
            echo -e "${RED}❌ 10k WebSocket test failed${NC}"
        fi
    fi
}

# Function to generate summary report
generate_summary() {
    echo ""
    echo "======================================"
    echo "📊 GENERATING SUMMARY REPORT"
    echo "======================================"
    
    # Check if reports exist
    if [ -f "reports/load-test-results.json" ] || [ -f "reports/10k-final-report.json" ]; then
        node -e "
        const fs = require('fs');
        const reports = [];
        
        try {
            if (fs.existsSync('reports/load-test-results.json')) {
                reports.push(JSON.parse(fs.readFileSync('reports/load-test-results.json')));
            }
            if (fs.existsSync('reports/10k-final-report.json')) {
                reports.push(JSON.parse(fs.readFileSync('reports/10k-final-report.json')));
            }
            
            console.log('\\n📊 LOAD TEST SUMMARY:');
            console.log('====================');
            
            reports.forEach(report => {
                console.log('\\n' + report.testName || 'Load Test');
                console.log('-'.repeat(40));
                
                if (report.results) {
                    const r = report.results;
                    console.log('Connections: ' + (r.connections?.peak || 'N/A'));
                    console.log('Success Rate: ' + (r.connections?.successRate || 'N/A') + '%');
                    console.log('Messages/sec: ' + (r.messages?.perSecond || 'N/A'));
                    console.log('Errors: ' + (r.errors || 0));
                }
                
                if (report.passed !== undefined) {
                    console.log('Status: ' + (report.passed ? '✅ PASSED' : '❌ FAILED'));
                }
            });
            
            // Save combined report
            const summary = {
                timestamp: new Date().toISOString(),
                tests: reports,
                environment: {
                    node: process.version,
                    platform: process.platform,
                    arch: process.arch
                }
            };
            
            fs.writeFileSync('reports/load-test-summary.json', JSON.stringify(summary, null, 2));
            console.log('\\n✅ Summary saved to reports/load-test-summary.json');
            
        } catch (error) {
            console.error('Failed to generate summary:', error.message);
        }
        "
        
        # Open HTML report if available
        if [ -f "reports/load-test-report.html" ]; then
            echo ""
            echo -e "${GREEN}📊 HTML report available at: reports/load-test-report.html${NC}"
            
            # Try to open in browser (macOS)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                open reports/load-test-report.html
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  No reports found${NC}"
    fi
}

# Function to clean up
cleanup() {
    echo ""
    echo "Cleaning up..."
    rm -rf test-plans/*.svg
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main execution
main() {
    check_server
    prepare_test_users
    
    echo ""
    echo "Select test to run:"
    echo "1) Basic Load Test (HTTP + WebSocket)"
    echo "2) 10k WebSocket Connection Test"
    echo "3) Run All Tests"
    echo "4) Generate Summary Report Only"
    echo ""
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            run_basic_test
            generate_summary
            ;;
        2)
            run_10k_test
            generate_summary
            ;;
        3)
            run_basic_test
            run_10k_test
            generate_summary
            ;;
        4)
            generate_summary
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    cleanup
    
    echo ""
    echo "======================================"
    echo "✅ LOAD TESTING COMPLETED"
    echo "======================================"
}

# Run main function
main
