import React, { useState, useEffect } from 'react';
import { 
  Send, 
  User, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  ExternalLink,
  Loader2,
  ChevronDown,
  Copy,
  Check,
  Calendar,
  Hash,
} from 'lucide-react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther, isAddress } from 'viem';
import { config } from '../../utils/Environment';
import { mockEmployees, mockTransactions } from '../../Data/MockData';
import type { Transaction } from '../../models/TransactionModel';

const PayPage: React.FC = () => {
  // Wallet and transaction hooks
  const { address } = useAccount();
  const { data: balanceData, isError, isLoading } = useBalance({
    address: address,
    chainId: config.chainId,
  });
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess, isError: txError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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

  // Get current balance
  const getCurrentBalance = () => {
    if (isLoading) return 0;
    if (isError || !balanceData) return 0;
    return parseFloat(formatEther(balanceData.value));
  };

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

  // Handle send payment
  const handleSendPayment = async () => {
    if (!isFormValid()) return;

    try {
      const recipientAddress = getRecipientAddress();
      await sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseEther(amount),
      });
      setShowConfirmation(false);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && txHash) {
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
      
      setTransactions(prev => [newTransaction, ...prev]);
      setShowSuccessAlert(true);
      
      // Reset form
      setSelectedEmployee('');
      setCustomAddress('');
      setAmount('');
      setNote('');
      setUseCustomAddress(false);
      
      setTimeout(() => setShowSuccessAlert(false), 5000);
    }
  }, [isSuccess, txHash]);

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

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return <CheckCircle className="w-4 h-4" />;
      case 'Failed': return <XCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quick Pay</h1>
        <p className="text-gray-600">Send instant crypto payments to employees and external wallets</p>
      </div>

      {/* Environment indicator */}
      {!config.isProduction && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">🧪 Test Mode - Using Sepolia Testnet</span>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Payment sent successfully!</span>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {(isSending || isConfirming) && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              {isSending && 'Sending transaction...'}
              {isConfirming && 'Confirming transaction...'}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Payment Form - Primary Focus */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Payment</h2>
              <p className="text-sm text-gray-600">Send crypto to employees or external wallets</p>
            </div>
          </div>

            <form className="space-y-6">
              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        checked={!useCustomAddress}
                        onChange={() => setUseCustomAddress(false)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Select Employee</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        checked={useCustomAddress}
                        onChange={() => setUseCustomAddress(true)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Custom Address</span>
                    </label>
                  </div>

                  {!useCustomAddress ? (
                    <div className="relative">
                      <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">Select an employee...</option>
                        {mockEmployees.map((employee) => (
                          <option key={employee.id} value={employee.id.toString()}>
                            {employee.name} ({employee.department})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="0x1234567890123456789012345678901234567890"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                        customAddress && !isAddress(customAddress) 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                    />
                  )}

                  {/* Show selected wallet address */}
                  {getRecipientAddress() && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Recipient Address:</p>
                      <p className="font-mono text-sm text-gray-900">{getRecipientAddress()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount and Token */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="0.5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      amount && parseFloat(amount) > getCurrentBalance() 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {amount && parseFloat(amount) > getCurrentBalance() && (
                    <p className="text-xs text-red-600 mt-1">Insufficient balance</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token *
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableTokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  placeholder="Payment description..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Balance and Gas Info */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available Balance:</span>
                  <span className="font-medium text-gray-900">
                    {getCurrentBalance().toFixed(4)} {selectedToken}
                    {!config.isProduction && <span className="text-xs text-amber-600 ml-1">(Sepolia)</span>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Gas Fee:</span>
                  <span className="font-medium text-gray-900">~{estimatedGas} ETH</span>
                </div>
                {amount && (
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Total Required:</span>
                    <span className="font-bold text-gray-900">
                      {(parseFloat(amount) + parseFloat(estimatedGas)).toFixed(4)} ETH
                    </span>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                disabled={!isFormValid() || isSending || isConfirming}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isFormValid() && !isSending && !isConfirming
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSending || isConfirming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Confirm & Send'}
              </button>
            </form>
          </div>
        </div>

      {/* Recent Payments Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as 'date' | 'amount');
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{tx.recipientName}</div>
                            <div className="text-xs text-gray-500 font-mono">
                              {tx.recipientAddress.slice(0, 6)}...{tx.recipientAddress.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{tx.amount} {tx.token}</div>
                        {tx.note && <div className="text-xs text-gray-500">{tx.note}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {tx.date.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tx.date.toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(tx.txHash)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy transaction hash"
                          >
                            {copiedHash === tx.txHash ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={getExplorerUrl(tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View on explorer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <span className="text-xs text-gray-500 font-mono">
                            {tx.txHash.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>No payments found</p>
                      <p className="text-sm">Payments will appear here after you send them</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Payment</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">To:</span>
                  <span className="text-sm font-medium text-gray-900">{getRecipientName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-xs font-mono text-gray-900">
                    {getRecipientAddress().slice(0, 10)}...{getRecipientAddress().slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">{amount} {selectedToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gas Fee:</span>
                  <span className="text-sm text-gray-900">~{estimatedGas} ETH</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-gray-600">Total Cost:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {(parseFloat(amount) + parseFloat(estimatedGas)).toFixed(4)} ETH
                  </span>
                </div>
              </div>

              {note && (
                <div>
                  <span className="text-sm text-gray-600">Note:</span>
                  <p className="text-sm text-gray-900 mt-1">{note}</p>
                </div>
              )}
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
                disabled={isSending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSending ? 'Sending...' : 'Send Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayPage;