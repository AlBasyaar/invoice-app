'use client';

import { InvoiceEditor } from '@/components/invoice-editor';
import { useParams } from 'next/navigation';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  return <InvoiceEditor invoiceId={invoiceId} />;
}
