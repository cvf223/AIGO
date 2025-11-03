# Database Migrations

This directory contains database migrations for the AI Flash Loan Arbitrage Syndicate.

## Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback to a specific version
npm run migrate:rollback 002

# Create a new migration
npm run migrate:create "migration name"
```

## Migration Files

- `001_initial_complete_schema.sql` - Initial database schema with all core tables
- `002_memory_system_tables.sql` - Additional tables for advanced memory system persistence
- `003_complete_kg_tables.sql` - Knowledge Graph tables (if not included in initial migration)

## Important Tables for Memory System

### Knowledge Graph Tables
- `kg_nodes` - Core knowledge nodes with embeddings
- `kg_relationships` - Relationships between nodes
- `kg_entanglements` - Quantum-inspired entanglements
- `kg_qualifiers` - Hyper-relational qualifiers

### Memory Persistence Tables
- `memory_system_state` - Component state persistence
- `sedm_verifications` - SEDM verification history
- `kg_nodes_archive` - Archived knowledge nodes
- `system_state` - General system state backup
- `agent_action_history` - Agent decision tracking

### Supporting Tables
- `trajectories` - Successful execution paths
- `agent_activations` - Agent activation patterns
- `kg_node_events` - Event tracking for temporal analysis

## Persistence Architecture

The memory system uses a multi-layer persistence approach:

1. **EliteMemoryPersistenceEngine** - Core persistence engine
2. **ComprehensivePersistenceLayer** - Orchestrates all memory components
3. **Component-level persistence** - Each component has getState/setState methods
4. **Database backup** - All states are backed up to PostgreSQL

## Backup Schedule

- **Hourly backups** - Automatic every hour
- **Breakthrough backups** - Triggered on >15% performance improvement
- **Shutdown backups** - Automatic on graceful shutdown
- **Component-specific backups** - Each component can trigger its own backup
