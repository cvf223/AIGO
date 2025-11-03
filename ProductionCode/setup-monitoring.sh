#!/bin/bash

# 📊 MONITORING SETUP SCRIPT - CONSTRUCTION SYNDICATE
# ==================================================
# Sets up Prometheus, Grafana, and exporters for production monitoring

set -e

echo "🚀 Setting up monitoring stack for Construction Syndicate..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root (use sudo)"
    exit 1
fi

# Create monitoring user
echo "👤 Creating monitoring user..."
useradd --no-create-home --shell /bin/false prometheus || true
useradd --no-create-home --shell /bin/false node_exporter || true

# Create directories
echo "📁 Creating directories..."
mkdir -p /etc/prometheus
mkdir -p /var/lib/prometheus
mkdir -p /etc/grafana/dashboards
mkdir -p /etc/grafana/provisioning/dashboards
mkdir -p /etc/grafana/provisioning/datasources

# Download and install Prometheus
PROMETHEUS_VERSION="2.45.0"
echo "📥 Downloading Prometheus ${PROMETHEUS_VERSION}..."
cd /tmp
wget -q https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz
tar xf prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz
cd prometheus-${PROMETHEUS_VERSION}.linux-amd64

# Install Prometheus binaries
cp prometheus /usr/local/bin/
cp promtool /usr/local/bin/
chown prometheus:prometheus /usr/local/bin/prometheus
chown prometheus:prometheus /usr/local/bin/promtool

# Copy console files
cp -r consoles /etc/prometheus
cp -r console_libraries /etc/prometheus
chown -R prometheus:prometheus /etc/prometheus

# Download and install Node Exporter
NODE_EXPORTER_VERSION="1.6.0"
echo "📥 Downloading Node Exporter ${NODE_EXPORTER_VERSION}..."
cd /tmp
wget -q https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
tar xf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
cp node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/
chown node_exporter:node_exporter /usr/local/bin/node_exporter

# Install Grafana
echo "📥 Installing Grafana..."
apt-get install -y software-properties-common
add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
apt-get update
apt-get install -y grafana

# Copy Prometheus configuration
echo "📝 Configuring Prometheus..."
cp /home/*/Multi-Agent-AI-Framework/monitoring/prometheus.yml /etc/prometheus/
cp -r /home/*/Multi-Agent-AI-Framework/monitoring/rules /etc/prometheus/
chown -R prometheus:prometheus /etc/prometheus
chown -R prometheus:prometheus /var/lib/prometheus

# Copy Grafana dashboards
echo "📊 Configuring Grafana dashboards..."
cp /home/*/Multi-Agent-AI-Framework/monitoring/grafana/dashboards/*.json /etc/grafana/dashboards/

# Create Grafana provisioning configuration
cat > /etc/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
EOF

cat > /etc/grafana/provisioning/dashboards/default.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /etc/grafana/dashboards
EOF

# Create systemd service for Prometheus
cat > /etc/systemd/system/prometheus.service << EOF
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries \
    --web.enable-lifecycle \
    --storage.tsdb.retention.time=30d \
    --storage.tsdb.retention.size=100GB

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for Node Exporter
cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter \
    --collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($|/) \
    --collector.netclass.ignored-devices=^(veth.*) \
    --collector.netdev.device-exclude=^(veth.*) \
    --collector.cpu.info \
    --collector.meminfo_numa

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create monitoring service for syndicate
cat > /etc/systemd/system/syndicate-metrics.service << EOF
[Unit]
Description=Syndicate Metrics Exporter
After=network.target

[Service]
Type=simple
User=epicbattlegods
WorkingDirectory=/home/epicbattlegods/Desktop/Multi-Agent-AI-Framework
ExecStart=/usr/bin/node monitoring/syndicate-metrics-exporter.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=METRICS_PORT=9200

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start services
echo "🚀 Starting monitoring services..."
systemctl daemon-reload
systemctl enable prometheus node_exporter grafana-server syndicate-metrics
systemctl start prometheus node_exporter grafana-server

# Configure firewall if ufw is installed
if command -v ufw &> /dev/null; then
    echo "🔒 Configuring firewall..."
    ufw allow 9090/tcp comment 'Prometheus'
    ufw allow 9100/tcp comment 'Node Exporter'
    ufw allow 3000/tcp comment 'Grafana'
    ufw allow 9200/tcp comment 'Syndicate Metrics'
fi

# Print access information
echo ""
echo "✅ Monitoring stack installed successfully!"
echo ""
echo "📊 Access URLs:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3000"
echo "   Default Grafana credentials: admin/admin"
echo ""
echo "🔍 Useful commands:"
echo "   systemctl status prometheus"
echo "   systemctl status node_exporter"
echo "   systemctl status grafana-server"
echo "   journalctl -u prometheus -f"
echo ""
echo "📝 Next steps:"
echo "1. Access Grafana and change the default password"
echo "2. Import the Construction Syndicate dashboard"
echo "3. Configure alerting in Prometheus/Grafana"
echo "4. Set up alert notifications (email, Slack, etc.)"
