export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'draft' | 'booked';
  issuedDate: string;
  dueDate: string;
  lateFee: number;
  notes: string;
  from: CompanyInfo;
  to: CompanyInfo;
  items: InvoiceItem[];
  bankDetails: {
    bank: string;
    accountNumber: string;
  };
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issuedDate: string;
  total: number;
  status: 'draft' | 'booked';
}
