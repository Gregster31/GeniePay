import { supabase } from '@/lib/supabase';
import type { Receipt, ReceiptRecipient } from '@/models/ReceiptModel';

interface ReceiptRow {
  id: string;
  owner_id: string;
  type: string;
  tx_hash: string;
  network: string;
  currency: string;
  total_usd: number;
  total_crypto: number;
  gas_fee: string | null;
  from_address: string;
  recipients: ReceiptRecipient[];
  created_at: string;
}

const toReceipt = (row: ReceiptRow): Receipt => ({
  id: row.id,
  type: row.type as Receipt['type'],
  txHash: row.tx_hash,
  network: row.network,
  currency: row.currency,
  totalUsd: row.total_usd,
  totalCrypto: row.total_crypto,
  gasFee: row.gas_fee ?? undefined,
  from: row.from_address,
  recipients: row.recipients,
  createdAt: new Date(row.created_at),
});

export const fetchReceipts = async (): Promise<Receipt[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ReceiptRow[]).map(toReceipt);
};

export const saveReceipt = async (
  receipt: Omit<Receipt, 'id' | 'createdAt'>,
): Promise<Receipt> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('receipts')
    .insert({
      owner_id:     user.id,
      type:         receipt.type,
      tx_hash:      receipt.txHash,
      network:      receipt.network,
      currency:     receipt.currency,
      total_usd:    receipt.totalUsd,
      total_crypto: receipt.totalCrypto,
      gas_fee:      receipt.gasFee ?? null,
      from_address: receipt.from,
      recipients:   receipt.recipients,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toReceipt(data as ReceiptRow);
};

export const deleteReceipt = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('receipts').delete().eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
};