const required = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  throw new Error(
    `Missing required Railway variables: ${missing.join(', ')}. Configure them in the Railway service before deploying.`,
  );
}

for (const name of ['DATABASE_URL', 'SUPABASE_URL']) {
  try {
    new URL(process.env[name]);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
}

console.log('Railway environment validated.');
