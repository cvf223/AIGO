# 📊 CONSTRUCTION SYNDICATE MONITORING SETUP GUIDE
===============================================

## Overview

This guide covers the complete monitoring setup for the Construction Syndicate on the 896GB RAM production server. The monitoring stack includes:

- **Prometheus**: Time-series metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Node Exporter**: Host-level metrics
- **Custom Exporter**: Syndicate-specific metrics
- **Alert Manager**: Alert routing and notifications

## Quick Start

```bash
# Run the automated setup script
sudo ./setup-monitoring.sh

# Verify services are running
systemctl status prometheus
systemctl status grafana-server
systemctl status node_exporter
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Construction   │     │                  │     │                │
│   Syndicate     ├────►│   Prometheus     ├────►│    Grafana     │
│   Services      │     │   (Port 9090)    │     │  (Port 3000)   │
└─────────────────┘     └──────────────────┘     └────────────────┘
         │                       ▲                         │
         │                       │                         │
         ▼                       │                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│ Custom Metrics  │     │  Node Exporter   │     │  Alert Manager │
│   Exporter      │     │  (Port 9100)     │     │  (Port 9093)   │
│  (Port 9200)    │     └──────────────────┘     └────────────────┘
└─────────────────┘
```

## Metrics Collected

### System Metrics (via Node Exporter)
- **CPU**: Usage, load average, per-core statistics
- **Memory**: Total, used, available, NUMA node distribution
- **Disk**: Usage, I/O statistics, latency
- **Network**: Traffic, errors, dropped packets
- **Process**: Count, states, resource usage

### Syndicate-Specific Metrics
- **Agent Health**: Status, memory usage, error rates
- **Learning Systems**: Iteration time, rewards, convergence
- **LLM Performance**: Response time, token throughput, quantization savings
- **API Metrics**: Request rate, response time, error rate
- **Database**: Connection pool, query performance, replication lag
- **Three Pillars**: Credibility scores, reliability metrics, veracity decisions

## Key Dashboards

### 1. System Overview
- Total memory usage (896GB visualization)
- CPU usage across 32 cores/64 threads
- NUMA node memory distribution
- Disk I/O and network traffic

### 2. Agent Performance
- Agent health status pie chart
- Memory usage per agent
- Task completion rates
- Error rates and types

### 3. LLM & Learning
- LLM response time percentiles
- Quantization memory savings
- Learning system convergence
- Training iteration performance

### 4. API & Database
- API request rates by endpoint
- Response time heatmap
- Database connection pool usage
- Long-running query detection

## Alert Configuration

### Critical Alerts
```yaml
- Memory usage > 95% for 2 minutes
- Any agent down for 2 minutes
- Database connection pool > 90%
- API 5xx error rate > 5%
- LLM service unavailable
```

### Warning Alerts
```yaml
- Memory usage > 90% for 5 minutes
- CPU usage > 80% for 5 minutes
- Disk space < 20%
- API p95 response time > 2s
- Learning iteration time > 60s
```

## Customization

### Adding New Metrics

1. Edit the metrics exporter:
```javascript
// monitoring/syndicate-metrics-exporter.js
const newMetric = new Gauge({
    name: 'syndicate_custom_metric',
    help: 'Description of the metric',
    labelNames: ['label1', 'label2']
});
```

2. Update Prometheus configuration:
```yaml
# monitoring/prometheus.yml
- job_name: 'custom_job'
  static_configs:
    - targets: ['localhost:9200']
```

### Creating Custom Dashboards

1. Design dashboard in Grafana UI
2. Export as JSON
3. Save to `monitoring/grafana/dashboards/`
4. Restart Grafana to auto-import

## Troubleshooting

### Common Issues

1. **Prometheus not starting**
```bash
# Check logs
journalctl -u prometheus -n 50
# Validate configuration
promtool check config /etc/prometheus/prometheus.yml
```

2. **Grafana login issues**
```bash
# Reset admin password
grafana-cli admin reset-admin-password newpassword
```

3. **Missing metrics**
```bash
# Check exporter is running
curl http://localhost:9200/metrics
# Verify Prometheus scraping
curl http://localhost:9090/api/v1/targets
```

### Performance Tuning

1. **Prometheus storage**
```yaml
# Adjust retention for 896GB server
--storage.tsdb.retention.time=90d
--storage.tsdb.retention.size=200GB
```

2. **Query optimization**
```promql
# Use recording rules for expensive queries
groups:
  - name: syndicate_recordings
    interval: 30s
    rules:
      - record: instance:node_cpu:rate5m
        expr: rate(node_cpu_seconds_total[5m])
```

## Security Considerations

1. **Authentication**
   - Enable Grafana authentication
   - Use reverse proxy for Prometheus
   - Implement API key rotation

2. **Network Security**
   - Restrict ports to localhost only
   - Use TLS for external access
   - Implement IP whitelisting

3. **Data Privacy**
   - Avoid sensitive data in metrics
   - Use label sanitization
   - Implement metric access controls

## Maintenance

### Daily Tasks
- Check alert notifications
- Review error rate trends
- Monitor disk space for metrics storage

### Weekly Tasks
- Review dashboard accuracy
- Update alert thresholds if needed
- Check for metric cardinality issues

### Monthly Tasks
- Analyze long-term trends
- Optimize slow queries
- Update monitoring documentation

## Integration with CI/CD

```bash
# Add to deployment pipeline
curl -X POST http://localhost:9090/-/reload  # Reload Prometheus config
curl -X POST http://localhost:3000/api/admin/provisioning/dashboards/reload  # Reload Grafana dashboards
```

## Useful Queries

### Top memory-consuming agents
```promql
topk(5, syndicate_agent_memory_bytes)
```

### API error rate
```promql
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
```

### Learning system efficiency
```promql
syndicate_learning_reward / syndicate_learning_iteration_duration_seconds
```

### Database saturation
```promql
pg_stat_database_numbackends / pg_settings_max_connections
```

## Next Steps

1. **Set up alerting**
   - Configure Alert Manager
   - Set up notification channels (email, Slack, PagerDuty)

2. **Implement SLOs**
   - Define Service Level Objectives
   - Create SLO dashboards
   - Set up error budgets

3. **Add distributed tracing**
   - Integrate OpenTelemetry
   - Set up Jaeger or Tempo
   - Instrument critical paths

4. **Enhance security**
   - Enable TLS everywhere
   - Implement RBAC
   - Set up audit logging

---

For support or questions, refer to the official documentation:
- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Node Exporter](https://github.com/prometheus/node_exporter)
