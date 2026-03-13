import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
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

  // ⚠️ Hooks ABOVE the early return — never conditionally
  const processFile = useCallback((file: File) => {
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

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const { valid, errors } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(26, 27, 34, 0.97)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(124, 58, 237, 0.2)' }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">Import Employees via CSV</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {step === ImportStep.Upload && 'Upload a CSV to bulk-add employees'}
              {step === ImportStep.Preview && (fileName ? `Reviewing: ${fileName}` : 'Review errors below')}
              {step === ImportStep.Done && `${valid.length} employees imported successfully`}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* ── Step 1: Upload ── */}
          {step === ImportStep.Upload && (
            <>
              {/* Template download */}
              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group"
                style={{
                  backgroundColor: 'rgba(124, 58, 237, 0.08)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-purple-300">Download CSV Template</p>
                    <p className="text-xs text-gray-500">name, email, walletAddress, role, department, payUsd</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-purple-400 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
                className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${isDragging ? 'rgba(124, 58, 237, 0.8)' : 'rgba(124, 58, 237, 0.3)'}`,
                  backgroundColor: isDragging ? 'rgba(124, 58, 237, 0.08)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <Upload className="w-8 h-8 text-purple-400" />
                <div className="text-center">
                  <p className="text-white font-medium">Drop your CSV here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                </div>
                <input ref={fileInputRef} type="file" accept={ACCEPTED_EXTENSIONS} className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; }}
                />
              </div>

              <p className="text-xs text-gray-500 text-center">
                Supports <span className="text-gray-400 font-mono">.csv, .xlsx, .xls</span>
                {' · '}Required: <span className="text-gray-400 font-mono">name, walletAddress, role, payUsd</span>
              </p>
            </>
          )}

          {/* ── Step 2: Preview ── */}
          {step === ImportStep.Preview && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Valid Rows</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{valid.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready to import</p>
                </div>
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: errors.length ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${errors.length ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className={`w-4 h-4 ${errors.length ? 'text-red-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${errors.length ? 'text-red-400' : 'text-gray-500'}`}>Skipped Rows</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{errors.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Will be skipped</p>
                </div>
              </div>

              {/* Valid employees preview */}
              {valid.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Employees to import</p>
                  <div className="rounded-lg overflow-hidden divide-y divide-purple-900/30" style={{ border: '1px solid rgba(124,58,237,0.15)' }}>
                    {valid.slice(0, 5).map((emp, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <div>
                          <p className="text-sm font-medium text-white">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.role}{emp.department ? ` · ${emp.department}` : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-purple-300 font-mono">{emp.walletAddress.slice(0, 6)}...{emp.walletAddress.slice(-4)}</p>
                          <p className="text-xs text-gray-400">${emp.payUsd.toLocaleString()}/mo</p>
                        </div>
                      </div>
                    ))}
                    {valid.length > 5 && (
                      <div className="px-4 py-2 text-center text-xs text-gray-500" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        +{valid.length - 5} more employees
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Errors (skipped)</p>
                  <div className="space-y-2">
                    {errors.map((err: { row: number; message: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg"
                        style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">
                          {err.row === 0 ? 'File error' : `Row ${err.row}`}: {err.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No valid rows */}
              {valid.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No valid employees found. Fix the errors and try again.</p>
                </div>
              )}
            </>
          )}

          {/* ── Step 3: Done ── */}
          {step === ImportStep.Done && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">Import Complete</p>
                <p className="text-gray-400 text-sm mt-1">
                  {valid.length} employee{valid.length !== 1 ? 's' : ''} added to your payroll
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(124,58,237,0.2)' }}>
          {step === ImportStep.Upload && (
            <button onClick={handleClose} className="px-5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              Cancel
            </button>
          )}
          {step === ImportStep.Preview && (
            <>
              <button onClick={handleReset} className="px-5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                ← Back
              </button>
              <button onClick={handleConfirm} disabled={valid.length === 0}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#7c3aed' }}>
                Import {valid.length} Employee{valid.length !== 1 ? 's' : ''}
              </button>
            </>
          )}
          {step === ImportStep.Done && (
            <button onClick={handleClose} className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#7c3aed' }}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};