'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInvoiceListItems, deleteInvoice, getInvoiceById } from '@/lib/invoice-context';
import { InvoiceListItem } from '@/lib/invoice-types';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';
import { generatePDF, printInvoice } from '@/lib/pdf-generator';
import { formatCurrency, formatDate } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useRouter } from 'next/navigation';

export function InvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);

  useEffect(() => {
    const items = getInvoiceListItems();
    setInvoices(items);
  }, []);

  const handleDeleteInvoice = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      deleteInvoice(id);
      const items = getInvoiceListItems();
      setInvoices(items);
      await Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
    }
  };

  const handleExportInvoice = async (id: string) => {
    const invoice = getInvoiceById(id);
    if (!invoice) {
      await Swal.fire({ icon: 'error', title: 'Not found', text: 'Invoice not found' });
      return;
    }

    try {
      // Open a print-friendly window so users can use the browser's "Save as PDF" (matches print preview)
      Swal.fire({ title: 'Preparing document...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      printInvoice(invoice);
      Swal.close();
      await Swal.fire({ icon: 'success', title: 'Print dialog opened', timer: 1200, showConfirmButton: false });
    } catch (e) {
      console.error(e);
      Swal.close();
      await Swal.fire({ icon: 'error', title: 'Export failed', text: String(e) });
    }
  }; 



  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Invoince CV Zen`cool
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/invoice/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    No.
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    Client
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    Issued at
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    Total
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground">
                        No invoices yet. Create one to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-border"
                    >
                      <td className="px-6 py-4 text-foreground">
                        <Link href={`/invoice/${invoice.id}`} className="hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        <Link href={`/invoice/${invoice.id}`} className="hover:underline">
                          {invoice.clientName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {formatDate(invoice.issuedDate)}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={invoice.status === 'booked' ? 'default' : 'secondary'}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/invoice/${invoice.id}`}>
                            <Button variant="ghost" size="icon" aria-label="Edit">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleExportInvoice(invoice.id)} aria-label="Export" title="Export JSON">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(invoice.id)} aria-label="Delete" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
