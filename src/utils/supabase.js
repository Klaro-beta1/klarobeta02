const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseDatabase {
  constructor() {
    this.supabase = supabase;
    console.log('✅ Connected to Supabase database');
  }

  async run(query, params = []) {
    return { lastID: null };
  }

  async get(table, select = '*', filters = {}) {
    const { data, error } = await this.supabase
      .from(table)
      .select(select)
      .match(filters)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async all(table, select = '*', filters = {}) {
    const { data, error } = await this.supabase
      .from(table)
      .select(select)
      .match(filters);

    if (error) throw error;
    return data || [];
  }

  async insert(table, data) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  middleware() {
    return (req, res, next) => {
      req.db = this;
      req.supabase = this.supabase;
      next();
    };
  }
}

module.exports = SupabaseDatabase;
