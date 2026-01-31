'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Printer, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { Invoice, InvoiceItem } from '@/lib/invoice-types';
import { getInvoiceById, saveInvoice, deleteInvoice, createNewInvoice } from '@/lib/invoice-context';
import InvoicePreview from './invoice-preview';
import { generatePDF, printInvoice } from '@/lib/pdf-generator';
import { toast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface InvoiceEditorProps {
  invoiceId?: string;
  isNew?: boolean;
}

export function InvoiceEditor({ invoiceId, isNew }: InvoiceEditorProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNew) {
      setInvoice(createNewInvoice());
      setLoading(false);
    } else if (invoiceId) {
      const data = getInvoiceById(invoiceId);
      if (data) {
        setInvoice(data);
      }
      setLoading(false);
    }
  }, [invoiceId, isNew]);

  if (loading || !invoice) {
    return <div>Loading...</div>;
  }

  const handleSave = async () => {
    saveInvoice(invoice);
    await Swal.fire({
      icon: 'success',
      title: 'Saved',
      text: 'Invoice saved successfully',
      timer: 1500,
      showConfirmButton: false,
    });
    router.push('/');
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the invoice.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      deleteInvoice(invoice.id);
      await Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
      router.push('/');
    }
  };

  const handlePrint = () => {
    // Use the print helper that opens a print-friendly window
    printInvoice(invoice);
  };

  const handleExportPDF = async () => {
    try {
      await generatePDF(invoice);
      toast({ title: 'PDF exported' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to export PDF' });
    }
  };

  const updateInvoice = (updates: Partial<Invoice>) => {
    setInvoice((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          }
        : null
    );
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setInvoice((prev) =>
      prev ? { ...prev, items: [...prev.items, newItem] } : null
    );
  };

  const removeItem = (itemId: string) => {
    setInvoice((prev) =>
      prev
        ? { ...prev, items: prev.items.filter((item) => item.id !== itemId) }
        : null
    );
  };

  const total = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
              <Select value={invoice.status} onValueChange={(value: any) => updateInvoice({ status: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-8">
            {/* Invoice Meta */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Invoice Details</h2>
              <div className="space-y-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateInvoice({ invoiceNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Issued Date</Label>
                    <Input
                      type="date"
                      value={invoice.issuedDate}
                      onChange={(e) => updateInvoice({ issuedDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => updateInvoice({ dueDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Late Fee (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={invoice.lateFee}
                    onChange={(e) => updateInvoice({ lateFee: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* From Company */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">From (Your Company)</h2>
              <div className="space-y-4">
                <input
                  value={invoice.from.name}
                  onChange={(e) =>
                    updateInvoice({
                      from: { ...invoice.from, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm font-semibold text-foreground bg-background"
                  placeholder="Company Name"
                />
                <textarea
                  value={invoice.from.address}
                  onChange={(e) =>
                    updateInvoice({
                      from: { ...invoice.from, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Address"
                  rows={2}
                />
                <input
                  value={invoice.from.email}
                  onChange={(e) =>
                    updateInvoice({
                      from: { ...invoice.from, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Email"
                  type="email"
                />
                <input
                  value={invoice.from.phone}
                  onChange={(e) =>
                    updateInvoice({
                      from: { ...invoice.from, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Phone"
                />
                <input
                  value={invoice.from.website}
                  onChange={(e) =>
                    updateInvoice({
                      from: { ...invoice.from, website: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Website"
                />
              </div>
            </Card>

            {/* To Company */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">To (Client)</h2>
              <div className="space-y-4">
                <input
                  value={invoice.to.name}
                  onChange={(e) =>
                    updateInvoice({
                      to: { ...invoice.to, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm font-semibold text-foreground bg-background"
                  placeholder="Client Name"
                />
                <textarea
                  value={invoice.to.address}
                  onChange={(e) =>
                    updateInvoice({
                      to: { ...invoice.to, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Address"
                  rows={2}
                />
                <input
                  value={invoice.to.email}
                  onChange={(e) =>
                    updateInvoice({
                      to: { ...invoice.to, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Email"
                  type="email"
                />
                <input
                  value={invoice.to.phone}
                  onChange={(e) =>
                    updateInvoice({
                      to: { ...invoice.to, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Phone"
                />
              </div>
            </Card>

            {/* Bank Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Bank Details</h2>
              <div className="space-y-4">
                <input
                  value={invoice.bankDetails.bank}
                  onChange={(e) =>
                    updateInvoice({
                      bankDetails: { ...invoice.bankDetails, bank: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Bank Name"
                />
                <input
                  value={invoice.bankDetails.accountNumber}
                  onChange={(e) =>
                    updateInvoice({
                      bankDetails: {
                        ...invoice.bankDetails,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                  placeholder="Account Number"
                />
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Notes</h2>
              <Textarea
                value={invoice.notes}
                onChange={(e) => updateInvoice({ notes: e.target.value })}
                placeholder="Add any additional notes or terms"
                rows={4}
              />
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Items Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Items</h2>
              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm text-foreground bg-background"
                      placeholder="Item description"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, { quantity: parseFloat(e.target.value) })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(item.id, { unitPrice: parseFloat(e.target.value) })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <div className="mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm font-semibold text-foreground">
                          {(item.quantity * item.unitPrice).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={addItem}
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>
            </Card>

            {/* Totals */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">
                    {total.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-primary/20 pt-3">
                  <span>Total</span>
                  <span>{total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </Card>

            {/* Preview */}
            <div className="print:hidden">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Preview</h2>
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { display: none; }
          .print\\:block { display: block !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
