import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Download, CheckCircle2, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import type { Employee } from '@/models/EmployeeModel';
import { parseEmployeeFile, generateCSVTemplate, ACCEPTED_EXTENSIONS, type CSVParseResult } from '@/utils/CsvEmployeeParser';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (employees: Omit<Employee, 'id' | 'dateAdded'>[]) => void;
}

enum ImportStep {
  Upload = 'upload',
  Preview = 'preview',
  Done = 'done',
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>(ImportStep.Upload);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<CSVParseResult>({ valid: [], errors: [] });

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const processFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setFileName(file.name);
      setResult({ valid: [], errors: [{ row: 0, message: 'File is too large. Maximum allowed size is 5 MB.' }] });
      setStep(ImportStep.Preview);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseEmployeeFile(e.target?.result as ArrayBuffer, file.name);
      setResult(parsed);
      setStep(ImportStep.Preview);
    };
    reader.onerror = () => {
      setResult({ valid: [], errors: [{ row: 0, message: 'Failed to read file.' }] });
      setStep(ImportStep.Preview);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleReset = useCallback(() => {
    setStep(ImportStep.Upload);
    setFileName('');
    setResult({ valid: [], errors: [] });
    setIsDragging(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleConfirm = useCallback(() => {
    onImport(result.valid);
    setStep(ImportStep.Done);
  }, [onImport, result.valid]);

  const handleDownloadTemplate = useCallback(() => {
    const blob = new Blob([generateCSVTemplate()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geniepay_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!isOpen) return null;

  const { valid, errors } = result;

  const stepLabel = {
    [ImportStep.Upload]: 'Upload file',
    [ImportStep.Preview]: 'Review',
    [ImportStep.Done]: 'Done',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-[#15141a] border border-gray-200 dark:border-[#2e2d38]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#1a1821] border-b border-gray-200 dark:border-[#2e2d38]">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Import Employees</h2>
            <p className="text-xs text-gray-500 dark:text-[#6f6b77] mt-0.5">{stepLabel[step]}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-[#6f6b77] hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* ── Step 1: Upload ── */}
          {step === ImportStep.Upload && (
            <>
              {/* Template download */}
              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1821] border border-gray-200 dark:border-[#2e2d38] hover:border-purple/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Download CSV Template</p>
                    <p className="text-xs text-gray-500 dark:text-[#6f6b77] mt-0.5 font-mono">name, email, walletAddress, role, department, payUsd</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-400 dark:text-[#6f6b77] group-hover:text-purple-400 group-hover:translate-y-0.5 transition-all" />
              </button>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
                className={[
                  'flex flex-col items-center justify-center gap-3 p-10 rounded-xl cursor-pointer transition-all',
                  isDragging
                    ? 'bg-purple/[0.07] border-2 border-dashed border-purple/60'
                    : 'bg-gray-50 dark:bg-[#1a1821] border-2 border-dashed border-gray-200 dark:border-[#2e2d38] hover:border-purple/30 hover:bg-purple/[0.03]',
                ].join(' ')}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isDragging ? 'bg-purple/20 border border-purple/30' : 'bg-gray-200 dark:bg-white/[0.04] border border-gray-300 dark:border-[#2e2d38]'}`}>
                  <Upload className={`w-5 h-5 transition-colors ${isDragging ? 'text-purple-400' : 'text-gray-400 dark:text-[#6f6b77]'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Drop your file here</p>
                  <p className="text-xs text-gray-500 dark:text-[#6f6b77] mt-1">or <span className="text-purple-400">click to browse</span></p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }}
                />
              </div>

              <p className="text-xs text-gray-400 dark:text-[#44414c] text-center">
                Supports <span className="text-gray-500 dark:text-[#6f6b77] font-mono">.csv, .xlsx, .xls</span>
                {' · '}Required: <span className="text-gray-500 dark:text-[#6f6b77] font-mono">name, walletAddress, role, payUsd</span>
              </p>
            </>
          )}

          {/* ── Step 2: Preview ── */}
          {step === ImportStep.Preview && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1a1821] border border-gray-200 dark:border-[#2e2d38]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#6f6b77]">Valid</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{valid.length}</p>
                  <p className="text-xs text-gray-500 dark:text-[#6f6b77] mt-1">Ready to import</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1a1821] border border-gray-200 dark:border-[#2e2d38]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`w-4 h-4 ${errors.length ? 'text-red-400' : 'text-gray-300 dark:text-[#44414c]'}`} />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#6f6b77]">Skipped</span>
                  </div>
                  <p className={`text-2xl font-bold ${errors.length ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{errors.length}</p>
                  <p className="text-xs text-gray-500 dark:text-[#6f6b77] mt-1">Will be skipped</p>
                </div>
              </div>

              {/* File name */}
              {fileName && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1c1b22] border border-gray-200 dark:border-[#2e2d38]">
                  <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-[#6f6b77] shrink-0" />
                  <span className="text-xs text-gray-700 dark:text-[#c4bfce] font-mono truncate">{fileName}</span>
                </div>
              )}

              {/* Valid employees */}
              {valid.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#6f6b77] mb-2">Employees to import</p>
                  <div className="rounded-xl border border-gray-200 dark:border-[#2e2d38] overflow-hidden divide-y divide-gray-100 dark:divide-[#2e2d38]/60">
                    {valid.slice(0, 5).map((emp, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#1a1821]">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
                          <p className="text-xs text-gray-500 dark:text-[#6f6b77]">{emp.role}{emp.department ? ` · ${emp.department}` : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-[#8b6cf7]">{emp.walletAddress.slice(0, 6)}…{emp.walletAddress.slice(-4)}</p>
                          <p className="text-xs text-gray-500 dark:text-[#6f6b77] mt-0.5">${emp.payUsd.toLocaleString()}/mo</p>
                        </div>
                      </div>
                    ))}
                    {valid.length > 5 && (
                      <div className="px-4 py-2.5 text-center text-xs text-gray-500 dark:text-[#6f6b77] bg-gray-50 dark:bg-[#1a1821]">
                        +{valid.length - 5} more employees
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#6f6b77] mb-2">Errors (skipped)</p>
                  <div className="space-y-2">
                    {errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/[0.06] border border-red-500/15">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 dark:text-red-300">
                          {err.row === 0 ? 'File error' : `Row ${err.row}`}: {err.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {valid.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-[#6f6b77] text-center py-2">No valid employees found. Fix the errors and try again.</p>
              )}
            </>
          )}

          {/* ── Step 3: Done ── */}
          {step === ImportStep.Done && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-cyan/[0.10] border border-cyan/20">
                <CheckCircle2 className="w-7 h-7 text-cyan" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-900 dark:text-white">Import Complete</p>
                <p className="text-sm text-gray-500 dark:text-[#6f6b77] mt-1">
                  {valid.length} employee{valid.length !== 1 ? 's' : ''} added to payroll
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-[#1a1821] border-t border-gray-200 dark:border-[#2e2d38]">
          {step === ImportStep.Upload && (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-[#6f6b77] hover:text-gray-900 dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.07] border border-gray-200 dark:border-[#2e2d38] transition-all"
            >
              Cancel
            </button>
          )}
          {step === ImportStep.Preview && (
            <>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-[#6f6b77] hover:text-gray-900 dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.07] border border-gray-200 dark:border-[#2e2d38] transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={valid.length === 0}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple hover:bg-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Import {valid.length} Employee{valid.length !== 1 ? 's' : ''}
              </button>
            </>
          )}
          {step === ImportStep.Done && (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple hover:bg-purple/90 transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
