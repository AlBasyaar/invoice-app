'use client';

import { Invoice } from '@/lib/invoice-types';
import { Edit2 } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const total = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6 sm:p-8 text-foreground print:p-0 print:border-0 print:rounded-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 pb-8 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <img
            src="https://res.cloudinary.com/dr5pehdsw/image/upload/v1769828376/Logo_Zencool_pmyw1u.jpg"
            alt={`${invoice.from.name} logo`}
            className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg"
          />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">{invoice.from.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{invoice.from.address}</p>
          </div>
        </div>
        <div className="w-full sm:w-auto text-left sm:text-right mt-4 sm:mt-0">
          <h2 className="text-xl sm:text-3xl font-bold text-primary mb-2 break-words">
            Invoice {invoice.invoiceNumber}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Issued at: {formatDate(invoice.issuedDate)}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Due at: {formatDate(invoice.dueDate)}</p>
          {invoice.lateFee > 0 && (
            <p className="text-xs sm:text-sm text-muted-foreground">Late fee: {invoice.lateFee}%</p>
          )}
        </div>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">FROM</h3>
          <div className="text-sm space-y-1">
            <p className="font-semibold text-foreground">{invoice.from.name}</p>
            <p className="text-muted-foreground">{invoice.from.address}</p>
            <p className="text-muted-foreground">{invoice.from.email}</p>
            {invoice.from.phone && (
              <p className="text-muted-foreground">{invoice.from.phone}</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">TO</h3>
          <div className="text-sm space-y-1">
            <p className="font-semibold text-foreground">{invoice.to.name}</p>
            <p className="text-muted-foreground">{invoice.to.address}</p>
            <p className="text-muted-foreground">{invoice.to.email}</p>
            {invoice.to.phone && (
              <p className="text-muted-foreground">{invoice.to.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">ITEMS</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-foreground font-semibold">Item</th>
              <th className="text-center py-2 text-foreground font-semibold">Quantity</th>
              <th className="text-center py-2 text-foreground font-semibold">Unit</th>
              <th className="text-right py-2 text-foreground font-semibold">Price</th>
              <th className="text-right py-2 text-foreground font-semibold">Sum</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted-foreground">
                  No items added
                </td>
              </tr>
            ) : (
              invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-3 text-foreground">{item.description}</td>
                  <td className="text-center py-3 text-foreground">{item.quantity}</td>
                  <td className="text-center py-3 text-foreground">1</td>
                  <td className="text-right py-3 text-foreground">
                    {item.unitPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="text-right py-3 text-foreground font-semibold">
                    {(item.quantity * item.unitPrice).toLocaleString('id-ID')} —
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {total.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between py-3 text-base font-bold">
            <span>Total</span>
            <span className="text-primary">{total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-4 pt-8 border-t border-border">
        {invoice.notes && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">NOTES</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">BANK DETAILS</h3>
            <p className="text-sm text-foreground">{invoice.bankDetails.bank}</p>
            <p className="text-sm text-foreground">{invoice.bankDetails.accountNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">CONTACT</h3>
            {invoice.from.website && (
              <p className="text-sm text-blue-500 hover:underline">{invoice.from.website}</p>
            )}
            {invoice.from.email && (
              <p className="text-sm text-foreground">{invoice.from.email}</p>
            )}
            {invoice.from.phone && (
              <p className="text-sm text-foreground">{invoice.from.phone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
