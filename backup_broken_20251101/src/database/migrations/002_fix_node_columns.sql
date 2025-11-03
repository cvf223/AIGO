-- 002_fix_node_columns.sql
-- Fix column naming inconsistencies for node tables
-- Ensures all node tables use 'node_id' instead of 'id'

-- This migration handles the case where existing tables might use 'id' instead of 'node_id'
-- It safely renames columns if they exist

DO $$ 
DECLARE
    table_record RECORD;
    has_id_column BOOLEAN;
    has_node_id_column BOOLEAN;
BEGIN
    -- Find all tables that might need node_id fix
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name LIKE '%node%'
    LOOP
        -- Check if table has 'id' column
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_record.table_name 
            AND column_name = 'id'
        ) INTO has_id_column;
        
        -- Check if table has 'node_id' column
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_record.table_name 
            AND column_name = 'node_id'
        ) INTO has_node_id_column;
        
        -- If has 'id' but not 'node_id', rename it
        IF has_id_column AND NOT has_node_id_column THEN
            EXECUTE format('ALTER TABLE %I RENAME COLUMN id TO node_id', table_record.table_name);
            RAISE NOTICE 'Renamed id to node_id in table: %', table_record.table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Node column fixes completed';
END $$;

-- Ensure memory_nodes uses node_id (already created in 001, but be safe)
-- This is idempotent - won't fail if already correct

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_memory_nodes_node_id ON memory_nodes(node_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_source_target ON memory_relationships(source_node_id, target_node_id);

-- Add GIN indexes for JSONB columns for faster queries
CREATE INDEX IF NOT EXISTS idx_memory_nodes_properties_gin ON memory_nodes USING GIN (properties);
CREATE INDEX IF NOT EXISTS idx_agents_capabilities_gin ON agents USING GIN (capabilities);
CREATE INDEX IF NOT EXISTS idx_agents_state_gin ON agents USING GIN (state);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_memory_nodes_type_importance ON memory_nodes(node_type, importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_type_weight ON memory_relationships(relationship_type, weight DESC);

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Column naming and indexing fixes completed successfully';
END $$;

