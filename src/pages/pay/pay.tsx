import React, { useState, useEffect, useCallback } from 'react';
import { 
  Send, 
  CheckCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { formatEther, isAddress } from 'viem';
import { config } from '@/utils/Environment';
import { mockEmployees, mockTransactions } from '../../data/MockData';
import { usePaymentWithRefetch } from '../../hooks/UsePaymentWithRefetch';
import type { Transaction } from '../../types/TransactionModel';

const Pay: React.FC = () => {
  // Use the enhanced payment hook
  const {
    balance,
    balanceLoading,
    sendPayment,
    txHash,
    isProcessing,
    isConfirmed,
    refetchBalance
  } = usePaymentWithRefetch();

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [customAddress, setCustomAddress] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [note, setNote] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState('0.002'); // Mock gas estimate
  
  // Transaction history state
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI state
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Available tokens (mock - in real app would be dynamic)
  const availableTokens = [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 }
  ];

  // Get current balance with proper formatting
  const getCurrentBalance = useCallback(() => {
    if (balanceLoading) return 0;
    if (!balance) return 0;
    return parseFloat(formatEther(balance.value));
  }, [balance, balanceLoading]);

  // Get recipient address
  const getRecipientAddress = () => {
    if (useCustomAddress) return customAddress;
    const employee = mockEmployees.find(emp => emp.id.toString() === selectedEmployee);
    return employee?.walletAddress || '';
  };

  // Get recipient name
  const getRecipientName = () => {
    if (useCustomAddress) return 'External Wallet';
    const employee = mockEmployees.find(emp => emp.id.toString() === selectedEmployee);
    return employee?.name || 'Unknown';
  };

  // Validate form
  const isFormValid = () => {
    const recipientAddress = getRecipientAddress();
    const amountNum = parseFloat(amount);
    
    return (
      recipientAddress &&
      isAddress(recipientAddress) &&
      amountNum > 0 &&
      amountNum <= getCurrentBalance()
    );
  };

  // Handle send payment with automatic wallet update
  const handleSendPayment = async () => {
    const recipientAddress = getRecipientAddress();
    
    if (!recipientAddress || !isAddress(recipientAddress)) {
      alert('Invalid recipient address');
      return;
    }

    if (parseFloat(amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (parseFloat(amount) > getCurrentBalance()) {
      alert('Insufficient balance');
      return;
    }

    setShowConfirmation(false);

    await sendPayment({
      recipientAddress,
      amount,
      onSuccess: (hash) => {
        console.log('Payment successful:', hash);
        // Balance will auto-refetch due to the hook
      },
      onError: (error) => {
        console.error('Payment failed:', error);
        alert(`Payment failed: ${error.message}`);
      }
    });
  };

  // Handle successful transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      // Create new transaction record
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        recipientName: getRecipientName(),
        recipientAddress: getRecipientAddress(),
        amount: parseFloat(amount),
        token: selectedToken,
        date: new Date(),
        status: 'Success',
        txHash: txHash,
        note: note || undefined
      };
      
      // Update transaction history
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Show success alert
      setShowSuccessAlert(true);
      
      // Reset form
      setSelectedEmployee('');
      setCustomAddress('');
      setAmount('');
      setNote('');
      setUseCustomAddress(false);
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowSuccessAlert(false), 5000);
      
      // Force balance refresh after a short delay
      setTimeout(() => {
        refetchBalance();
      }, 1000);
    }
  }, [isConfirmed, txHash, amount, note, selectedToken, refetchBalance]);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => 
      tx.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipientAddress.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? b.date.getTime() - a.date.getTime()
          : a.date.getTime() - b.date.getTime();
      } else {
        return sortOrder === 'desc' 
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
    });

  // Copy hash to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Get explorer URL
  const getExplorerUrl = (txHash: string) => {
    return config.isProduction 
      ? `https://etherscan.io/tx/${txHash}`
      : `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Send Payment</h1>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">
              Payment sent successfully! Your wallet balance has been updated.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Payment Details</h2>

            {/* Balance Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Balance:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {balanceLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      `${getCurrentBalance().toFixed(4)} ETH`
                    )}
                  </span>
                  <button
                    onClick={refetchBalance}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Refresh balance"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recipient Selection */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="radio"
                    checked={!useCustomAddress}
                    onChange={() => setUseCustomAddress(false)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Select Employee</span>
                </label>
                
                {!useCustomAddress && (
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose an employee...</option>
                    {mockEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.department}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="radio"
                    checked={useCustomAddress}
                    onChange={() => setUseCustomAddress(true)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Custom Address</span>
                </label>
                
                {useCustomAddress && (
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.001"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableTokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for this payment..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={!isFormValid() || isProcessing}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !isFormValid() || isProcessing
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{tx.recipientName}</p>
                      <p className="text-sm text-gray-500">
                        {tx.date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{tx.amount} {tx.token}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tx.status === 'Success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Payment</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-medium">{getRecipientName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{amount} {selectedToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Gas:</span>
                <span className="font-medium">{estimatedGas} ETH</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{(parseFloat(amount) + parseFloat(estimatedGas)).toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPayment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pay;