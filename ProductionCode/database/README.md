# 🗄️ AI Flash Loan Arbitrage Syndicate - Database Documentation

## Overview

This directory contains the complete database schema and migration system for the AI Flash Loan Arbitrage Syndicate. The schema is production-ready and supports all the sophisticated features of the system including quantum states, agent memory, arbitrage tracking, and more.

## Quick Start

### 1. Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ for migration tools
- Database user with CREATE privileges

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE arbitrage_syndicate;

# Create user (if needed)
CREATE USER syndicate_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE arbitrage_syndicate TO syndicate_user;
```

### 3. Set Environment Variables

```bash
# Add to your .env file
DATABASE_URL=postgresql://syndicate_user:your_secure_password@localhost:5432/arbitrage_syndicate
```

### 4. Run Migrations

```bash
# Navigate to database directory
cd database/migrations

# Check migration status
node migration-system.js status

# Run all migrations
node migration-system.js migrate

# Validate schema
node migration-system.js validate
```

## Database Schema Overview

### Core Tables

#### 🤖 Agent Management
- `syndicate_agents` - Main agent registry
- `agent_memory` - Agent memory storage with vector support
- `agent_complexity_states` - Cognitive cliff protection tracking
- `llm_agent_complexity_state` - LLM-specific agent state

#### 💰 Arbitrage & Trading
- `arbitrage_opportunities` - Detected arbitrage opportunities
- `arbitrage_executions` - Execution tracking and results
- `pool_prices` - Historical pool pricing data
- `current_pool_prices` - Latest pool prices only

#### 🧠 Learning & Evolution
- `alphagnome_state_persistence` - Evolutionary algorithm state
- `alphagnome_learning` - Learning knowledge base
- `battlefield_evaluations` - Genetic competition results
- `mutation_knowledge` - Successful mutation patterns

#### 🌌 Quantum & World Model
- `syndicate_quantum_state` - Quantum system metrics
- `world_model_predictions` - AI predictions and accuracy
- `quantum_graph_state` - Quantum graph neural network data

#### 🔬 Formal Verification
- `formal_theorems` - Mathematical proofs discovered
- `autoformalized_theorems` - Auto-generated formal specifications

#### 🎯 Competitor Analysis
- `competitor_bots` - Tracked competitor addresses
- `competitor_transactions` - Analyzed competitor strategies

#### 📊 Monitoring & Metrics
- `elite_system_metrics` - System performance tracking
- `syndicate_metrics` - Overall syndicate performance
- `gas_price_operations` - Gas optimization tracking

### Key Features

#### 🔍 Advanced Indexing
- Composite indexes for complex queries
- GIN indexes for JSONB search
- Trigram indexes for text search

#### 🎯 Performance Optimizations
- Partitioning ready for time-series data
- Materialized views for common queries
- Function-based performance calculations

#### 🛡️ Data Integrity
- Foreign key constraints
- Check constraints for valid values
- Unique constraints to prevent duplicates

#### 📈 Automatic Features
- Updated timestamps via triggers
- UUID generation for unique IDs
- Automatic memory cleanup functions

## Migration System

### Creating New Migrations

```bash
# Create a new migration file
node migration-system.js create "add new feature table"

# This creates: database/migrations/versions/002_add_new_feature_table.sql
```

### Migration File Format

```sql
-- UP
-- Your schema changes here
CREATE TABLE new_feature (...);

-- DOWN  
-- Rollback statements
DROP TABLE new_feature;
```

### Rolling Back

```bash
# Rollback to specific version
node migration-system.js rollback 001

# This will undo all migrations after version 001
```

## Maintenance

### Regular Tasks

1. **Vacuum and Analyze**
   ```sql
   VACUUM ANALYZE arbitrage_opportunities;
   VACUUM ANALYZE arbitrage_executions;
   VACUUM ANALYZE agent_memory;
   ```

2. **Clean Expired Data**
   ```sql
   SELECT clean_expired_memories();
   ```

3. **Monitor Table Sizes**
   ```sql
   SELECT 
       schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

### Performance Monitoring

1. **Check Slow Queries**
   ```sql
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. **Index Usage**
   ```sql
   SELECT 
       schemaname,
       tablename,
       indexname,
       idx_scan,
       idx_tup_read,
       idx_tup_fetch
   FROM pg_stat_user_indexes
   ORDER BY idx_scan;
   ```

## Backup Strategy

### Automated Backups

```bash
# Add to crontab for daily backups
0 2 * * * pg_dump arbitrage_syndicate | gzip > /backups/syndicate_$(date +\%Y\%m\%d).sql.gz
```

### Manual Backup

```bash
# Full backup with compression
pg_dump -Fc arbitrage_syndicate > syndicate_backup.dump

# Restore from backup
pg_restore -d arbitrage_syndicate syndicate_backup.dump
```

## Security Best Practices

1. **Use Connection Pooling**
   - Max connections: 100
   - Pool size: 20
   - Idle timeout: 30 seconds

2. **Row-Level Security (Optional)**
   ```sql
   ALTER TABLE syndicate_agents ENABLE ROW LEVEL SECURITY;
   ```

3. **Audit Logging**
   - All modifications logged to `system_events`
   - Transaction audit trail in `transaction_audit`

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check `migration_history` table for errors
   - Verify database permissions
   - Check for lock conflicts

2. **Performance Issues**
   - Run `EXPLAIN ANALYZE` on slow queries
   - Check for missing indexes
   - Monitor connection pool saturation

3. **Data Integrity**
   - Use foreign key constraints
   - Implement application-level validation
   - Regular consistency checks

## Schema Diagram

```
┌─────────────────┐     ┌──────────────────────┐
│ syndicate_agents│────<│arbitrage_opportunities│
└────────┬────────┘     └───────────┬──────────┘
         │                          │
         │              ┌───────────┴──────────┐
         │              │arbitrage_executions   │
         │              └───────────────────────┘
         │
    ┌────┴─────┐        ┌─────────────────┐
    │agent_memory│       │ pool_prices      │
    └──────────┘        └─────────────────┘
```

## Contact & Support

For database-related issues:
1. Check the logs in `system_events` table
2. Review migration history
3. Validate schema integrity

Remember: Always backup before major changes!
