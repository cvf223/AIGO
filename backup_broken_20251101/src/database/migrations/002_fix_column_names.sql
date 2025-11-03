-- 🔧 MIGRATION 002: Fix Column Name Consistency
-- ===============================================

-- Ensure kg_nodes uses node_id (not id) for consistency
-- If upgrading from old schema, this renames the column

DO $$ 
BEGIN
    -- Check if column 'id' exists and 'node_id' doesn't
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'kg_nodes' AND column_name = 'id'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'kg_nodes' AND column_name = 'node_id'
    ) THEN
        -- Rename id to node_id
        ALTER TABLE kg_nodes RENAME COLUMN id TO node_id;
        RAISE NOTICE 'Renamed kg_nodes.id to kg_nodes.node_id';
    END IF;
    
    -- Similar fix for kg_edges if needed
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'kg_edges' AND column_name = 'id'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'kg_edges' AND column_name = 'edge_id'
    ) THEN
        ALTER TABLE kg_edges RENAME COLUMN id TO edge_id;
        RAISE NOTICE 'Renamed kg_edges.id to kg_edges.edge_id';
    END IF;
END $$;

-- Record migration
INSERT INTO schema_migrations (version, name) VALUES (2, 'fix_column_names')
ON CONFLICT (version) DO NOTHING;

SELECT 'Migration 002 completed' as status;

