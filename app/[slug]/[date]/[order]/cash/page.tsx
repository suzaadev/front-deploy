'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Copy, ArrowLeft } from 'lucide-react';
import { api } from '@/app/lib/api';
import { PaymentRequest } from '@/app/types';

export default function CashPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const { slug, date, order } = params;

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  async function fetchPaymentDetails() {
    try {
      const response = await api.get(`/payments/${slug}/${date}/${order}`);
      setPayment(response.data.data);
      
      // Check if already claimed
      if (response.data.data.status === 'PENDING_CONFIRMATION') {
        setClaimed(true);
      }
    } catch (err) {
      console.error('Error fetching payment:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsPaid() {
    try {
      setClaiming(true);
      // TODO: Call API to mark as paid
      // await api.post(`/payments/${payment?.id}/mark-paid`);
      
      // For now, just show success
      setClaimed(true);
      alert('Payment marked as paid! Merchant will confirm soon.');
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert('Failed to mark as paid. Please try again.');
    } finally {
      setClaiming(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="min-h-screen gradient-mesh py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-dark mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="card mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💵</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Cash Payment</h1>
            <p className="text-muted">Pay via bank transfer, cash, or check</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-4">Payment Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted">Amount</span>
              <span className="font-bold text-xl">${payment.amountFiat} {payment.currencyFiat}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted">Merchant</span>
              <span className="font-semibold">{payment.merchant?.businessName}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted">Order ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{payment.linkId}</span>
                <button
                  onClick={() => copyToClipboard(payment.linkId)}
                  className="text-primary hover:text-primary/80"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {payment.description && (
              <div className="pt-3 border-t border-border">
                <span className="text-muted block mb-1">Description</span>
                <span className="text-dark">{payment.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-4">Payment Instructions</h2>
          
          <div className="space-y-4 text-sm">
            <div className="bg-background rounded-xl p-4">
              <h3 className="font-semibold mb-2">Option 1: Bank Transfer</h3>
              <p className="text-muted">
                Contact {payment.merchant?.businessName} for bank account details.
                Include Order ID: <span className="font-mono">{payment.linkId}</span>
              </p>
            </div>

            <div className="bg-background rounded-xl p-4">
              <h3 className="font-semibold mb-2">Option 2: Cash in Person</h3>
              <p className="text-muted">
                Visit {payment.merchant?.businessName} and pay in person.
                Mention Order ID: <span className="font-mono">{payment.linkId}</span>
              </p>
            </div>

            <div className="bg-background rounded-xl p-4">
              <h3 className="font-semibold mb-2">Option 3: Check</h3>
              <p className="text-muted">
                Mail check to {payment.merchant?.businessName} with Order ID noted.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="card">
          {claimed ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Payment Claimed</h3>
              <p className="text-muted mb-4">
                Waiting for merchant confirmation...
              </p>
              <p className="text-sm text-muted">
                You'll be notified once the merchant confirms your payment.
              </p>
            </div>
          ) : (
            <>
              <p className="text-center text-muted mb-4">
                After you've completed the payment, click below:
              </p>
              <button
                onClick={handleMarkAsPaid}
                disabled={claiming}
                className="btn-primary w-full text-lg"
              >
                {claiming ? 'Processing...' : 'I Have Paid'}
              </button>
              <p className="text-xs text-center text-muted mt-3">
                The merchant will verify and confirm your payment
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-[var(--suzaa-border)] bg-white/90 px-6 py-4 text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--suzaa-muted)]">
          Powered by <span className="font-semibold text-[var(--suzaa-navy)]">SUZAA</span>
        </div>
      </div>
    </div>
  );
}
