import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Employee } from '@/models/EmployeeModel';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id' | 'dateAdded'>) => void;
}

interface FormData {
  name: string;
  email: string;
  walletAddress: string;
  role: string;
  department: string;
  payUsd: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  walletAddress: '',
  role: '',
  department: '',
  payUsd: '',
};

const isValidEthAddress = (address: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(address);

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    } else if (!isValidEthAddress(form.walletAddress)) {
      newErrors.walletAddress = 'Invalid Ethereum address';
    }
    if (!form.role.trim()) newErrors.role = 'Role is required';
    if (!form.payUsd || parseFloat(form.payUsd) <= 0) {
      newErrors.payUsd = 'Pay must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onAdd({
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      walletAddress: form.walletAddress.trim(),
      role: form.role.trim(),
      department: form.department.trim() || undefined,
      payUsd: parseFloat(form.payUsd),
    });

    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  const InputField = ({
    label,
    name,
    type = 'text',
    required = false,
    placeholder,
    ...props
  }: {
    label: string;
    name: keyof FormData;
    type?: string;
    required?: boolean;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          name === 'walletAddress' ? 'font-mono text-sm' : ''
        }`}
        style={{ borderColor: errors[name] ? '#ef4444' : 'rgba(124, 58, 237, 0.3)' }}
        {...props}
      />
      {errors[name] && <p className="mt-1 text-sm text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'rgba(26, 27, 34, 0.95)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'rgba(124, 58, 237, 0.2)' }}
        >
          <h2 className="text-2xl font-bold text-white">Add New Employee</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <InputField label="Name" name="name" required placeholder="Genie Pay" />
          <InputField label="Email" name="email" type="email" placeholder="genie.pay@genie.com" />
          <InputField label="Wallet Address" name="walletAddress" required placeholder="0x..." />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Role" name="role" required placeholder="Developer" />
            <InputField label="Department" name="department" placeholder="Engineering" />
          </div>

          <InputField
            label="Monthly Pay (USD)"
            name="payUsd"
            type="number"
            required
            placeholder="100"
            min="0"
            step="0.01"
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#7c3aed', color: 'white' }}
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};