'use client';

import { useEffect, useState } from 'react';
import { Invoice, InvoiceListItem } from '@/lib/invoice-types';
import { getInvoiceListItems, loadInvoices } from '@/lib/invoice-context';

export function useInvoices() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      const items = getInvoiceListItems();
      setInvoices(items);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return { invoices, loading, setInvoices };
}

export function useInvoice(id?: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      const invoices = loadInvoices();
      const found = invoices.find((i) => i.id === id);
      setInvoice(found || null);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [id]);

  return { invoice, loading, setInvoice };
}
