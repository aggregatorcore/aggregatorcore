/**
 * Seed 3 sample lenders if lenders table is empty.
 * Run: node scripts/seed-lenders.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const supabase = require('../src/config/supabase');

const SAMPLE_LENDERS = [
  {
    name: 'QuickCash Bank',
    is_active: true,
    min_income: 25000,
    min_loan: 10000,
    max_loan: 500000,
    supported_cities: ['Mumbai', 'Delhi', 'Bangalore'],
    employment_supported: ['salaried'],
    affiliate_url: 'https://example.com/quickcash',
  },
  {
    name: 'FlexiLoans',
    is_active: true,
    min_income: 30000,
    min_loan: 50000,
    max_loan: 1000000,
    supported_cities: ['Delhi', 'Chennai', 'Hyderabad'],
    employment_supported: ['salaried', 'self_employed'],
    affiliate_url: 'https://example.com/flexiloans',
  },
  {
    name: 'Universal Finance',
    is_active: true,
    min_income: 20000,
    min_loan: 5000,
    max_loan: 200000,
    supported_cities: null,
    employment_supported: null,
    affiliate_url: 'https://example.com/universal',
  },
];

async function run() {
  const { count, error: countError } = await supabase
    .from('lenders')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error checking lenders:', countError.message);
    console.error('Supabase URL:', process.env.SUPABASE_URL || '(not set)');
    process.exit(1);
  }

  if (count > 0) {
    console.log(`lenders table has ${count} row(s), skipping seed`);
    return;
  }

  const { data: inserted, error: insertError } = await supabase
    .from('lenders')
    .insert(SAMPLE_LENDERS)
    .select();

  if (insertError) {
    console.error('Error inserting lenders:', insertError.message);
    console.error('Supabase URL:', process.env.SUPABASE_URL || '(not set)');
    process.exit(1);
  }

  console.log('Seeded', inserted?.length || 3, 'lenders');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
