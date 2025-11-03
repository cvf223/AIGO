// Script to pre-create the shared mastermind room

import { createClient } from '@supabase/supabase-js';
import { v5 as uuidv5 } from 'uuid';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Set up dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// First, run the environment fix script to ensure variables are set
import envFix from './fix-supabase-env.js';

// Constants
const MASTERMIND_ROOM_ID = 'e26eab29-b12b-031c-8b44-08418dfd222a';

// Get Supabase connection details from environment or the fix script
const supabaseUrl = envFix.SUPABASE_URL || process.env.SUPABASE_URL || process.env.SUPABASE_SERVICE_URL;
const supabaseKey = envFix.SUPABASE_SERVICE_API_KEY || process.env.SUPABASE_SERVICE_API_KEY || process.env.SUPABASE_ANON_KEY;

// Add detailed logging for troubleshooting
console.log(`Using Supabase URL: ${supabaseUrl}`);
console.log(`Using Supabase key (first 10 chars): ${supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined'}`);

// Verify that we have the required variables
if (!supabaseUrl) {
  console.error('ERROR: SUPABASE_URL or SUPABASE_SERVICE_URL is required but not set');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('ERROR: SUPABASE_SERVICE_API_KEY or SUPABASE_ANON_KEY is required but not set');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function createSharedRoom() {
  console.log(`Creating shared mastermind room with ID: ${MASTERMIND_ROOM_ID}`);

  try {
    // First check if the room already exists
    const { data: existingRoom, error: checkError } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', MASTERMIND_ROOM_ID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if room exists:', checkError);
    }

    if (existingRoom) {
      console.log('Shared mastermind room already exists.');
      return true;
    }

    // Create the room - use snake_case column names to match database schema
    const { error: createError } = await supabase
      .from('rooms')
      .insert([
        {
          id: MASTERMIND_ROOM_ID,
          settings: { isShared: true }
          // Do not include name or created_at columns which might not exist
        }
      ]);

    if (createError) {
      console.error('Error creating shared mastermind room:', createError);
      return false;
    } else {
      console.log('Successfully created shared mastermind room.');
      
      // Ensure participants table is initialized for this room if needed
      const { error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', MASTERMIND_ROOM_ID) // Use snake_case (room_id not roomId)
        .limit(1);
      
      if (participantsError) {
        console.warn('Warning: Could not verify participants table. This might be okay if the table exists but is empty.');
        console.warn('Participants query error:', participantsError);
      }
      
      return true;
    }
  } catch (error) {
    console.error('Unexpected error creating shared room:', error);
    return false;
  }
}

// Execute the function
createSharedRoom()
  .then(success => {
    console.log('Room creation script completed.');
    // Exit with appropriate status code
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Failed to run room creation script:', err);
    process.exit(1);
  }); 