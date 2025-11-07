export interface PaymentRequest {
  id: string;
  linkId: string;
  merchantId: string;
  orderDate: string;
  orderNumber: number;
  amountFiat: string;
  currencyFiat: string;
  description?: string;
  expiryMinutes: number;
  expiresAt: string;
  createdBy: string;
  status: 'PENDING' | 'PENDING_CONFIRMATION' | 'SETTLED' | 'EXPIRED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  merchant?: {
    businessName: string;
    slug: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
