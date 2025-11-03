-- Fix missing task_id column in agent_activations table
-- This resolves the error: column a1.task_id does not exist

ALTER TABLE agent_activations 
ADD COLUMN IF NOT EXISTS task_id VARCHAR(255);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_activations_task_id 
ON agent_activations(task_id);

-- Add comment for documentation
COMMENT ON COLUMN agent_activations.task_id IS 'Task identifier for agent activation context';
