import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv';

dotenv.config();

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SUPABASE_SERVICE_KEY;

if(!supabase_url || !supabase_service_key){ 
  throw new Error('Configure corretamente o arquivo .env')
}

export const supabase = createClient(
  supabase_url,
  supabase_service_key,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)