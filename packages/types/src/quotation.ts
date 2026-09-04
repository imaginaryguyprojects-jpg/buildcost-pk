export interface PaymentMilestone {
  title: string;
  percentage: number;
  amount: number;
  triggerEvent: string;
}

export interface Quotation {
  id: string;
  projectId: string;
  quotationNumber: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  date: string;
  validUntil: string;
  subtotal: number;
  markupPercent: number;
  markupAmount: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentTerms: PaymentMilestone[];
  termsAndConditions: string[];
  notes?: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  createdAt: string;
}
