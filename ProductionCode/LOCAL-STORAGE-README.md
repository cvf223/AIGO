# ElizaOS Local Storage System

## Overview

This implementation completely replaces Supabase with a local file-based storage system. All memories, rooms, and user data are stored locally in JSON files rather than in a remote database. This eliminates dependency on external services and improves reliability.

## Key Benefits

- **No external dependencies**: System works entirely offline
- **Full data ownership**: All data stays on your local machine
- **Improved reliability**: No more connection or quota errors
- **Simple maintenance**: Easy backup and management
- **Compatible**: Works with existing agent system without modifying core functionality

## File Structure

The local storage system uses the following directory structure:

```
agent/data/
  ├── memory-storage/       # Primary storage for memory objects
  │   └── [UUID].json       # Each memory stored as a separate JSON file
  └── memory-backups/       # Directory for backups
      └── backup_[TIMESTAMP]/  # Timestamped backup directories
```

## Getting Started

To use the local storage system:

1. Run `./start-with-local-storage.sh` to start agents with local storage
2. Use `./check-status.sh` to verify everything is running properly
3. Use `./manage-memories.sh` for memory management tasks

## Script Descriptions

- **start-with-local-storage.sh**: Main script to start all components with local storage
- **check-status.sh**: Shows current system status (processes, memory files, logs)
- **manage-memories.sh**: Utility for managing memory files (list, backup, clear)
- **basic-local-agent.js**: Simple test script to verify local storage functionality
- **disable-supabase-completely.js**: Script that modified the codebase to use local storage

## Implementation Details

The implementation consists of several key components:

1. **Local database adapter**: Implements all database operations using the local filesystem
2. **Memory loader**: Handles memory creation, validation, and retrieval
3. **Database initialization override**: Routes all database requests to local storage
4. **Memory management utilities**: Tools for backing up and managing memory files

## Memory Management

To manage memory files:

```bash
# List all memory files
./manage-memories.sh list

# Backup all memories
./manage-memories.sh backup

# Clear all memories (with automatic backup)
./manage-memories.sh clear

# Show memories for a specific room
./manage-memories.sh room <room-id>
```

## Troubleshooting

If you encounter issues:

1. Check logs in the `logs/` directory
2. Ensure proper permissions on the `agent/data` directory
3. Verify that no conflicting processes are running

## Restoring from Backup

To restore from a backup:

1. Run `./manage-memories.sh backup` to create a current backup
2. Clear the current memories with `./manage-memories.sh clear`
3. Copy files from the backup directory to `agent/data/memory-storage/` 