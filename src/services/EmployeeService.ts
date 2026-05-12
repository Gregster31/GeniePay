import { supabase } from '@/lib/supabase';
import type { Employee } from '@/models/EmployeeModel';

interface EmployeeRow {
  id: string;
  owner_id: string;
  name: string;
  wallet_address: string;
  role: string;
  pay_usd: number;
  email: string | null;
  department: string | null;
  created_at: string;
}

const toEmployee = (row: EmployeeRow): Employee => ({
  id: row.id,
  name: row.name,
  walletAddress: row.wallet_address,
  role: row.role,
  payUsd: row.pay_usd,
  email: row.email ?? undefined,
  department: row.department ?? undefined,
  dateAdded: new Date(row.created_at),
});

export const signInWithWallet = async (
  address: string,
  signMessage: (args: { message: string }) => Promise<string>,
): Promise<void> => {
  const email = `${address.toLowerCase()}@geniepay.wallet`;
  const sig = await signMessage({
    message: 'GeniePay Authentication\n\nSign to verify wallet ownership. No gas required.',
  });
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sig));
  const password = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (!signInError) return;

  // 'invalid_credentials' means no account exists yet — any other error is a real failure
  if ((signInError as { code?: string }).code !== 'invalid_credentials') {
    throw new Error(signInError.message);
  }

  // First time this wallet connects — create the account
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw new Error(signUpError.message);

  // Guard: if no session came back (e.g. email confirmation is enabled in Supabase dashboard),
  // throw explicitly so the stale session from a previous wallet can never bleed through.
  if (!signUpData.session) {
    throw new Error('Wallet account created but requires email confirmation — disable it in Supabase Auth settings.');
  }
};

export const signOutWallet = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as EmployeeRow[]).map(toEmployee);
};

export const insertEmployee = async (
  employee: Omit<Employee, 'id' | 'dateAdded'>,
): Promise<Employee> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('employees')
    .insert({
      owner_id:       user.id,
      name:           employee.name,
      wallet_address: employee.walletAddress,
      role:           employee.role,
      pay_usd:        employee.payUsd,
      email:          employee.email ?? null,
      department:     employee.department ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toEmployee(data as EmployeeRow);
};

export const updateEmployee = async (
  id: string,
  updates: Omit<Employee, 'id' | 'dateAdded'>,
): Promise<Employee> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('employees')
    .update({
      name:           updates.name,
      wallet_address: updates.walletAddress,
      role:           updates.role,
      pay_usd:        updates.payUsd,
      email:          updates.email ?? null,
      department:     updates.department ?? null,
    })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toEmployee(data as EmployeeRow);
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('employees').delete().eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
};