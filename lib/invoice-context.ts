import { Invoice, InvoiceListItem } from './invoice-types';

const STORAGE_KEY = 'invoices_db';
const INVOICE_COUNTER_KEY = 'invoice_counter';

function getNextInvoiceNumber(): string {
  const counter = parseInt(localStorage.getItem(INVOICE_COUNTER_KEY) || '0', 10);
  const nextCounter = counter + 1;
  localStorage.setItem(INVOICE_COUNTER_KEY, String(nextCounter));
  const year = new Date().getFullYear();
  return `${year}-${nextCounter}`;
}

export function loadInvoices(): Invoice[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = loadInvoices();
  const existingIndex = invoices.findIndex((i) => i.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.push(invoice);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function deleteInvoice(id: string): void {
  const invoices = loadInvoices();
  const filtered = invoices.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getInvoiceById(id: string): Invoice | null {
  const invoices = loadInvoices();
  return invoices.find((i) => i.id === id) || null;
}

export function getInvoiceListItems(): InvoiceListItem[] {
  const invoices = loadInvoices();
  return invoices.map((invoice) => {
    const total = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.to.name,
      issuedDate: invoice.issuedDate,
      total,
      status: invoice.status,
    };
  });
}

export function createNewInvoice(): Invoice {
  return {
    id: Math.random().toString(36).substr(2, 9),
    invoiceNumber: `${new Date().getFullYear()}-0`,
    status: 'draft',
    issuedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lateFee: 1,
    notes: '',
    from: {
      name: 'CV Zen`cool',
      address: 'Jl. Gang Bona 3 No. 103, Jakarta Timur, Cakung 13940',
      email: 'aczencool@gmail.com',
      phone: '085285564117',
      website: 'https://zencool-conditioning.vercel.app/',
    },
    to: {
      name: 'Client Name',
      address: 'Client Address',
      email: 'client@example.com',
      phone: '',
      website: '',
    },
    items: [],
    bankDetails: {
      bank: 'Bank BCA',
      accountNumber: '0123456789',
    },
  };
}
