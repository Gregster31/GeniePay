/**
 * AddEmployeeModal Component
 * ---------------------------
 * A modal form for adding a new employee with name, wallet address,
 * and optional profile picture. Supports input validation and image upload.
 *
 * Props (AddEmployeeModalProps):
 * - isOpen: boolean — controls the visibility of the modal
 * - onClose: () => void — callback when the modal is dismissed
 * - onAddEmployee: (employee: { name: string; walletAddress: string; avatar: string | null }) => void
 *   — callback to add the new employee after validation
 *
 * Features:
 * - Input validation for name and Ethereum wallet address
 * - Uses `useImageUpload` custom hook to manage image selection and upload
 * - Displays errors and disables submit during image upload
 * - Avatar preview with upload/remove options
 * - Responsive and styled with TailwindCSS
 */

import React, { useState, useEffect } from 'react';
import { X, Upload, User, Loader2 } from 'lucide-react';
import { useImageUpload } from '../utils/UploadImageHook';
import type { AddEmployeeModalProps } from '../utils/AddEmployeeModalProps';

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    walletAddress: '',
    avatar: null as string | null,
  });

  const [errors, setErrors] = useState({
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

  useEffect(() => {
    setFormData(prev => ({ ...prev, avatar: imageUrl }));
  }, [imageUrl]);

  const validateForm = () => {
    const newErrors = { name: '', walletAddress: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
      isValid = false;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Invalid wallet address format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddEmployee(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', walletAddress: '', avatar: null });
    setErrors({ name: '', walletAddress: '' });
    handleRemoveImage();
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Employee
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter employee name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address *
            </label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => handleInputChange('walletAddress', e.target.value)}
              className={`input-field ${errors.walletAddress ? 'border-red-500' : ''}`}
              placeholder="0x..."
            />
            {errors.walletAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.walletAddress}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                ) : imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  type="button"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 inline mr-1" />
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </button>
                {imageUrl && !isUploading && (
                  <button 
                    type="button"
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                    onClick={handleRemoveImage}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: JPG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 btn-primary"
            disabled={isUploading}
          >
            Add Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;