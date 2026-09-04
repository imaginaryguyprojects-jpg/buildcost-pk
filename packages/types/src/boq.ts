export interface BOQItem {
  id: string;
  boqId: string;
  itemNumber: string;
  category: string;
  description: string;
  specification?: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  wastagePercent: number;
  labourRate: number;
  labourAmount: number;
  totalAmount: number;
  notes?: string;
  sortOrder: number;
}

export interface BOQ {
  id: string;
  projectId: string;
  title: string;
  version: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  contingencyPercent: number;
  contingencyAmount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  items: BOQItem[];
  createdAt: string;
  updatedAt: string;
}
