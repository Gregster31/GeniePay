import React, { useState, useRef, useEffect } from 'react'
import { FileText, Check, AlertCircle } from 'lucide-react'

interface TermsOfServiceModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
  isLoading: boolean
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  isLoading
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false)
    }
  }, [isOpen])

  // Handle scroll to detect if user reached bottom
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px tolerance

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - Cannot be clicked to close */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Terms of Service
              </h2>
              <p className="text-sm text-gray-600">
                Version 1.0.0 • Last updated 2025-01-01
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        {!hasScrolledToBottom && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Please scroll to the bottom to continue</span>
            </div>
          </div>
        )}

        {/* Terms Content */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              GeniePay Terms of Service Agreement
            </h3>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">1. Acceptance of Terms</h4>
              <p className="text-gray-700 leading-relaxed">
                By connecting your wallet and using GeniePay, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please disconnect your wallet immediately.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">2. Service Description</h4>
              <p className="text-gray-700 leading-relaxed">
                GeniePay is a decentralized payroll platform that enables businesses to pay employees and 
                contractors using cryptocurrency. Our service facilitates blockchain transactions but does 
                not control or hold your funds.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">3. Wallet Connection and Security</h4>
              <p className="text-gray-700 leading-relaxed">
                You are solely responsible for maintaining the security of your wallet and private keys. 
                GeniePay never has access to your private keys or funds. All transactions are executed 
                directly through your connected wallet.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">4. No Account Required</h4>
              <p className="text-gray-700 leading-relaxed">
                GeniePay operates without traditional user accounts. Your wallet address serves as your 
                identifier. We store minimal data: only your wallet address and acceptance of these terms.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">5. Compliance and Legal Responsibilities</h4>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for compliance with all applicable laws and regulations in your 
                jurisdiction regarding cryptocurrency transactions, tax reporting, and employment law. 
                GeniePay provides tools but not legal advice.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">6. Limitation of Liability</h4>
              <p className="text-gray-700 leading-relaxed">
                GeniePay is provided "as is" without warranties. We are not liable for any losses 
                resulting from blockchain network issues, transaction failures, regulatory changes, 
                or user errors. Maximum liability is limited to $100 USD.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">7. Data Privacy</h4>
              <p className="text-gray-700 leading-relaxed">
                We collect minimal data: your wallet address and terms acceptance. We do not sell or 
                share this information with third parties. Transaction data is public on the blockchain.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">8. Service Availability</h4>
              <p className="text-gray-700 leading-relaxed">
                While we strive for 24/7 availability, GeniePay may experience downtime for maintenance 
                or due to technical issues. We are not liable for losses due to service interruptions.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">9. Modifications</h4>
              <p className="text-gray-700 leading-relaxed">
                We may update these terms periodically. Continued use after changes constitutes acceptance. 
                Material changes will require re-acceptance through your wallet signature.
              </p>
            </section>

            <section className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">10. Contact Information</h4>
              <p className="text-gray-700 leading-relaxed">
                For questions about these terms, contact us at legal@geniepay.com. 
                These terms are governed by the laws of [Your Jurisdiction].
              </p>
            </section>

            {/* Bottom marker for scroll detection */}
            <div className="h-1" id="terms-bottom" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onDecline}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium 
                     transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={isLoading || !hasScrolledToBottom}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium 
                     transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : hasScrolledToBottom ? (
              <>
                <Check className="w-4 h-4" />
                Accept & Continue
              </>
            ) : (
              'Accept & Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}