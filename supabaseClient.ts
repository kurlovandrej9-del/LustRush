import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zvsliifqbvutmufmaxrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2c2xpaWZxYnZ1dG11Zm1heHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDI4NDQsImV4cCI6MjA3OTQxODg0NH0.QveP9tUAJj_IMx5-Jwubf2tKXf3naNyVl2QWFZ1HZCE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);