import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Employee } from '@/models/EmployeeModel';
import { isValidEthAddress } from '@/utils/EthUtils';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id' | 'dateAdded'>) => void;
  onEdit?: (id: string, updates: Omit<Employee, 'id' | 'dateAdded'>) => void;
  employeeToEdit?: Employee | null;
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

interface InputFieldProps {
  label: string;
  name: keyof FormData;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  step?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  error,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  ...props
}) => (
  <div>
    <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#6f6b77] mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5 normal-case tracking-normal">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={[
        'w-full px-3.5 py-2.5 rounded-lg bg-[#1c1b22] text-white text-sm',
        'placeholder-[#44414c] outline-none transition-all',
        name === 'walletAddress' ? 'font-mono' : '',
        error
          ? 'border border-red-500/50 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/15'
          : 'border border-[#2e2d38] focus:border-purple/40 focus:ring-1 focus:ring-purple/10',
      ].join(' ')}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  employeeToEdit,
}) => {
  const isEditMode = Boolean(employeeToEdit && onEdit);

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (isEditMode && employeeToEdit) {
      setForm({
        name: employeeToEdit.name,
        email: employeeToEdit.email ?? '',
        walletAddress: employeeToEdit.walletAddress,
        role: employeeToEdit.role,
        department: employeeToEdit.department ?? '',
        payUsd: String(employeeToEdit.payUsd),
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [employeeToEdit, isEditMode, isOpen]);

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
    const payload: Omit<Employee, 'id' | 'dateAdded'> = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      walletAddress: form.walletAddress.trim(),
      role: form.role.trim(),
      department: form.department.trim() || undefined,
      payUsd: parseFloat(form.payUsd),
    };
    if (isEditMode && employeeToEdit) {
      onEdit!(employeeToEdit.id, payload);
    } else {
      onAdd(payload);
    }
    handleClose();
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-[#15141a] border border-[#2e2d38]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1a1821] border-b border-[#2e2d38]">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {isEditMode ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <p className="text-xs text-[#6f6b77] mt-0.5">
              {isEditMode ? 'Update employee details' : 'Add a new team member to payroll'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6f6b77] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Full Name" name="name" value={form.name} error={errors.name} onChange={handleChange} required placeholder="Genie Pay" />
            <InputField label="Email" name="email" value={form.email} error={errors.email} onChange={handleChange} type="email" placeholder="genie@pay.ca" />
          </div>

          <InputField label="Wallet Address" name="walletAddress" value={form.walletAddress} error={errors.walletAddress} onChange={handleChange} required placeholder="0x…" />

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Role" name="role" value={form.role} error={errors.role} onChange={handleChange} required placeholder="Developer" />
            <InputField label="Department" name="department" value={form.department} error={errors.department} onChange={handleChange} placeholder="Engineering" />
          </div>

          <InputField label="Monthly Pay (USD)" name="payUsd" value={form.payUsd} error={errors.payUsd} onChange={handleChange} type="number" required placeholder="5,000" min="0" step="0.01" />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-[#6f6b77] hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-[#2e2d38] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple hover:bg-purple/90 transition-all"
            >
              {isEditMode ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
