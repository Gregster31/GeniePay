import { vi } from 'vitest';

// Provide a default VITE_SUPABASE_ANON_KEY so signInWithWallet doesn't throw
// on .slice() when the env var is absent in the test environment.
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key-12345678');
