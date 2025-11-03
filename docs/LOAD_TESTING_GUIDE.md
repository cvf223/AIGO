# 🚀 LOAD TESTING GUIDE
## Elite Construction AI Syndicate - 10k Connection Testing

### Prerequisites

1. **Install Artillery**:
   ```bash
   npm install -g artillery@latest
   ```

2. **Start the servers**:
   ```bash
   pm2 start ecosystem.config.js --only construction-syndicate,construction-gui-api
   ```

3. **Verify servers are running**:
   ```bash
   curl http://localhost:3001/health
   ```

### Running Load Tests

#### Option 1: Interactive Script
```bash
cd tests/load
./run-load-tests.sh
```

Select from menu:
1. Basic Load Test (HTTP + WebSocket)
2. 10k WebSocket Connection Test
3. Run All Tests
4. Generate Summary Report

#### Option 2: Direct Artillery Commands

**Basic Load Test**:
```bash
cd tests/load
artillery run artillery-config.yml
```

**10k WebSocket Test**:
```bash
cd tests/load
artillery run 10k-websocket-test.yml
```

### System Preparation for 10k Test

1. **Increase file descriptor limits**:
   ```bash
   ulimit -n 20000
   ```

2. **For production server** (Ubuntu/Debian):
   ```bash
   # Edit /etc/security/limits.conf
   * soft nofile 65536
   * hard nofile 65536
   
   # Edit /etc/sysctl.conf
   net.ipv4.ip_local_port_range = 1024 65535
   net.core.somaxconn = 10000
   net.ipv4.tcp_max_syn_backlog = 10000
   
   # Apply changes
   sudo sysctl -p
   ```

3. **Monitor during test**:
   ```bash
   # Terminal 1: Watch connections
   watch -n 1 'netstat -an | grep :3001 | wc -l'
   
   # Terminal 2: Monitor resources
   htop
   
   # Terminal 3: Watch logs
   pm2 logs construction-gui-api
   ```

### Expected Results

**Basic Load Test**:
- Duration: ~20 minutes
- Virtual Users: Up to 200/sec
- Success Rate: > 98%
- p95 Response Time: < 500ms
- p99 Response Time: < 1000ms

**10k WebSocket Test**:
- Duration: ~10 minutes
- Peak Connections: 10,000
- Connection Success Rate: > 98%
- Connection Time: < 5 seconds
- Memory Usage: ~8-12GB
- CPU Usage: 40-60%

### Reading Test Reports

1. **HTML Report** (auto-opens on macOS):
   - `reports/load-test-report.html`
   - Visual graphs of response times, throughput, errors

2. **JSON Results**:
   - `reports/load-test-results.json`
   - `reports/10k-websocket-results.json`
   - Detailed metrics and percentiles

3. **Final Summary**:
   - `reports/load-test-summary.json`
   - Combined results from all tests

### Troubleshooting

**"Too many open files" error**:
```bash
# Temporary fix
ulimit -n 20000

# Permanent fix (add to ~/.bashrc)
echo "ulimit -n 20000" >> ~/.bashrc
```

**High memory usage**:
- Reduce `arrivalRate` in test configs
- Increase `NODE_OPTIONS=--max-old-space-size=8192`

**Connection timeouts**:
- Check server logs: `pm2 logs`
- Verify firewall isn't blocking connections
- Increase timeout values in test configs

**Server crashes during test**:
- Check PM2 memory limits in ecosystem.config.js
- Monitor with: `pm2 monit`
- Increase server resources or reduce load

### Performance Tuning

**For better 10k performance**:

1. **Nginx optimization** (if using):
   ```nginx
   worker_connections 10000;
   keepalive_timeout 65;
   keepalive_requests 100;
   ```

2. **Node.js tuning**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=16384 --max-http-header-size=16384"
   ```

3. **Database connection pool**:
   - Already optimized for 500 connections
   - Monitor with: `SELECT count(*) FROM pg_stat_activity;`

### Production Load Testing

⚠️ **WARNING**: Only run load tests against staging/test environments!

For production-like testing:
1. Use a staging server with same specs
2. Test during off-peak hours
3. Start with lower loads and ramp up
4. Monitor all system metrics
5. Have rollback plan ready

### Success Criteria

✅ **Test Passes If**:
- 10k connections achieved
- < 2% error rate
- No server crashes
- Memory usage < 50% of available
- CPU usage < 80% sustained

### Next Steps After Testing

1. **Analyze results**:
   - Identify bottlenecks
   - Check error patterns
   - Review resource usage

2. **Optimize if needed**:
   - Tune connection pools
   - Adjust WebSocket heartbeat intervals
   - Implement connection throttling

3. **Document findings**:
   - Peak capacity reached
   - Resource usage at peak
   - Recommended production limits

4. **Set up monitoring**:
   - Connection count alerts
   - Memory usage thresholds
   - Error rate monitoring

---

🎯 **Goal**: Verify the system can handle 10,000 concurrent WebSocket connections while maintaining < 2% error rate and sub-second response times.
