// scripts/setup-env.js
// Merges env values into .env.local, preserving existing keys.
// Run with: node scripts/setup-env.js
//
// Modes:
//   --reset-auth   Regenerate ADMIN_PASSWORD hash and JWT_SECRET (replaces those keys)
//   (default)      Only write/update Supabase keys; leave auth keys untouched

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_PATH = path.join(__dirname, '..', '.env.local');

// ── Supabase values to write (trim any accidental leading/trailing whitespace)
const SUPABASE_VALUES = {
  NEXT_PUBLIC_SUPABASE_URL:  'https://stntvaxmdlimvlkzjuwl.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bnR2YXhtZGxpbXZsa3pqdXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDU2NDcsImV4cCI6MjA5ODMyMTY0N30.lUXxhYnSXJ2TM5SVOFAlmfMavWnu_o43xp9WqU6CSGg',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bnR2YXhtZGxpbXZsa3pqdXdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc0NTY0NywiZXhwIjoyMDk4MzIxNjQ3fQ.N_AwmoI6V3ej34fVfXBsYFMjMXaz_Tcb1jF6yKEk8gY',
};

// ── Parse existing .env.local into a key→value map (preserves raw values)
function parseEnv(content) {
  const map = new Map();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    map.set(key, val);
  }
  return map;
}

// ── Serialize map back to .env.local lines (preserves order, appends new keys)
function serializeEnv(map) {
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
}

// ── Mask a string for safe logging (show first 8 + last 4 chars)
function mask(str) {
  if (!str || str.length < 16) return '***';
  return `${str.slice(0, 8)}...${str.slice(-4)}`;
}

async function main() {
  const resetAuth = process.argv.includes('--reset-auth');

  // Load existing .env.local if it exists
  let existing = '';
  if (fs.existsSync(ENV_PATH)) {
    existing = fs.readFileSync(ENV_PATH, 'utf8');
    console.log('Found existing .env.local — merging.\n');
  } else {
    console.log('No .env.local found — creating from scratch.\n');
  }

  const env = parseEnv(existing);

  // ── Auth keys: only touch if --reset-auth or not yet set
  //
  // FILL IN YOUR VALUES HERE BEFORE RUNNING:
  //   ADMIN_EMAIL   — the email address you will use to log into /admin
  //   ADMIN_PLAIN   — the plaintext password (only used here to generate the hash;
  //                   never stored or logged; only the bcrypt hash is written to .env.local)
  //
  // Example (replace with your own values):
  //   const ADMIN_EMAIL_VALUE = 'you@yourdomain.com';
  //   const ADMIN_PASSWORD_PLAIN = 'your-strong-password-here';
  //
  // Then run: node scripts/setup-env.js --reset-auth
  const ADMIN_EMAIL_VALUE   = process.env.SETUP_ADMIN_EMAIL    || '';
  const ADMIN_PASSWORD_PLAIN = process.env.SETUP_ADMIN_PASSWORD || '';

  if (resetAuth || !env.has('ADMIN_EMAIL')) {
    if (!ADMIN_EMAIL_VALUE) {
      console.error('Set SETUP_ADMIN_EMAIL before running with --reset-auth. Example:');
      console.error('  SETUP_ADMIN_EMAIL=you@example.com SETUP_ADMIN_PASSWORD=yourpassword node scripts/setup-env.js --reset-auth');
      process.exit(1);
    }
    env.set('ADMIN_EMAIL', ADMIN_EMAIL_VALUE);
  }

  if (resetAuth || !env.has('ADMIN_PASSWORD')) {
    if (!ADMIN_PASSWORD_PLAIN) {
      console.error('Set SETUP_ADMIN_PASSWORD before running with --reset-auth. Example:');
      console.error('  SETUP_ADMIN_EMAIL=you@example.com SETUP_ADMIN_PASSWORD=yourpassword node scripts/setup-env.js --reset-auth');
      process.exit(1);
    }
    console.log('Generating bcrypt hash...');
    const hash = await bcrypt.hash(ADMIN_PASSWORD_PLAIN, 12);
    const verify = await bcrypt.compare(ADMIN_PASSWORD_PLAIN, hash);
    if (!verify) { console.error('Hash self-verify failed — aborting.'); process.exit(1); }
    console.log('Hash self-verified ✓\n');
    // Escape $ so dotenv parsers don't treat bcrypt segments as variable names
    env.set('ADMIN_PASSWORD', hash.replace(/\$/g, '\\$'));
  } else {
    console.log('ADMIN_PASSWORD already set — skipping (use --reset-auth to regenerate).');
  }

  if (resetAuth || !env.has('JWT_SECRET')) {
    env.set('JWT_SECRET', crypto.randomBytes(32).toString('hex'));
  } else {
    console.log('JWT_SECRET already set — skipping (use --reset-auth to regenerate).');
  }

  // ── Supabase keys: always write (these are the values being set now)
  for (const [key, val] of Object.entries(SUPABASE_VALUES)) {
    env.set(key, val.trim());
  }

  // ── Write
  fs.writeFileSync(ENV_PATH, serializeEnv(env), 'utf8');

  // ── Confirm — mask sensitive values in output
  console.log('\n.env.local written. Confirming all 6 keys:\n');
  const confirm = parseEnv(fs.readFileSync(ENV_PATH, 'utf8'));

  const checks = [
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'JWT_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  let allPresent = true;
  for (const key of checks) {
    const val = confirm.get(key) ?? '';
    const ok = val.length > 0 && val !== 'placeholder';
    allPresent = allPresent && ok;
    const display = key.includes('SUPABASE') || key === 'JWT_SECRET'
      ? mask(val)
      : key === 'ADMIN_PASSWORD' ? `${val.slice(0, 7)}...` : val;
    console.log(`  ${ok ? '✓' : '✗'} ${key} = ${display}`);
  }

  console.log(allPresent ? '\nAll 6 keys set correctly.' : '\nSome keys are missing or still placeholder!');
}

main().catch(err => { console.error(err); process.exit(1); });
