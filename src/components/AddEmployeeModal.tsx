import React, { useState } from 'react';
import { X, Camera, Upload } from "lucide-react";
import type { AddEmployeeModalProps } from "../utils/AddEmployeeModalProps";
import { useImageUpload } from "../utils/UploadImageHook";

// Add Employee Modal Component
const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    walletAddress: '',
  });
  
  const {
    imageUrl,
    fileInputRef,
    handleImageUpload,
    handleUploadClick,
    handleRemoveImage,
    isUploading
  } = useImageUpload({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.walletAddress) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate wallet address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      alert('Please enter a valid Ethereum wallet address');
      return;
    }
    
    // Add employee
    onAdd({
      name: formData.name,
      walletAddress: formData.walletAddress,
      avatar: imageUrl,
      salary: 0.05
    });
    
    // Reset form
    setFormData({
      name: '',
      walletAddress: '',
    });
    handleRemoveImage();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
    <h2 className="text-xl font-semibold text-gray-900">Add New Employee</h2>
    <button
    onClick={onClose}
    className="text-gray-400 hover:text-gray-600 transition-colors"
    >
    <X className="w-6 h-6" />
    </button>
    </div>
    
    {/* Form */}
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
    {/* Profile Image Upload */}
    <div className="flex flex-col items-center space-y-4">
    <div className="relative">
    {imageUrl ? (
      <div className="relative">
      <img
      src={imageUrl}
      alt="Profile preview"
      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
      />
      <button
      type="button"
      onClick={handleRemoveImage}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
      >
      <X className="w-4 h-4" />
      </button>
      </div>
    ) : (
      <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
      <Camera className="w-8 h-8 text-gray-400" />
      </div>
    )}
    </div>
    
    <button
    type="button"
    onClick={handleUploadClick}
    disabled={isUploading}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
    <Upload className="w-4 h-4" />
    {isUploading ? 'Uploading...' : imageUrl ? 'Change Photo' : 'Upload Photo'}
    </button>
    
    <input
    ref={fileInputRef}
    type="file"
    onChange={handleImageUpload}
    accept="image/*"
    className="hidden"
    />
    </div>
    
    {/* Form Fields */}
    <div className="space-y-4">
    {/* Name */}
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
    Full Name *
    </label>
    <input
    type="text"
    name="name"
    value={formData.name}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="John Doe"
    required
    />
    </div>
    
    {/* Wallet Address */}
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
    Wallet Address *
    </label>
    <input
    type="text"
    name="walletAddress"
    value={formData.walletAddress}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="0x1234567890123456789012345678901234567890"
    required
    />
    <p className="text-xs text-gray-500 mt-1">
    Enter the employee's Ethereum wallet address for receiving payments
    </p>
    </div>
    </div>
    
    {/* Action Buttons */}
    <div className="flex gap-4 pt-4 border-t border-gray-200">
    <button
    type="button"
    onClick={onClose}
    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
    >
    Cancel
    </button>
    <button
    type="submit"
    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
    Add Employee
    </button>
    </div>
    </form>
    </div>
    </div>
  );
};

export default AddEmployeeModal;