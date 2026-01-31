import { Invoice } from './invoice-types';

export async function generatePDF(invoice: Invoice) {
  // Dynamically import html2pdf to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;

  const element = document.createElement('div');
  element.innerHTML = generateInvoiceHTML(invoice);

  const options = {
    margin: 10,
    filename: `invoice-${invoice.invoiceNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  };

  html2pdf().set(options).from(element).save();
}

function generateInvoiceHTML(invoice: Invoice): string {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const itemsRows = invoice.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">1</td>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">${item.unitPrice.toLocaleString('id-ID')}</td>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${(item.quantity * item.unitPrice).toLocaleString('id-ID')}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #1a202c; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb; }
        .company-info { display: flex; gap: 16px; }
        .logo { width: 96px; height: 96px; background-color: #5b21b6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; flex-shrink: 0; }
        .company-details h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .company-details p { margin: 4px 0; font-size: 14px; color: #6b7280; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 32px; font-weight: bold; color: #5b21b6; margin-bottom: 8px; }
        .invoice-details p { margin: 4px 0; font-size: 14px; color: #6b7280; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
        .party h3 { margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
        .party p { margin: 4px 0; font-size: 14px; color: #374151; }
        .party p.name { font-weight: 600; }
        .items-table { width: 100%; margin-bottom: 32px; border-collapse: collapse; }
        .items-table th { text-align: left; padding: 8px; font-weight: 600; color: #1a202c; border-bottom: 2px solid #e5e7eb; }
        .items-table th:nth-child(2), .items-table th:nth-child(3), .items-table th:nth-child(4), .items-table th:nth-child(5) { text-align: right; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
        .totals-box { width: 256px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .totals-row.total { border-bottom: none; padding-top: 12px; font-size: 16px; font-weight: bold; }
        .footer { padding-top: 32px; border-top: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .footer-section h3 { margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
        .footer-section p { margin: 4px 0; font-size: 14px; color: #374151; }
        .notes { margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="company-info">
          <div class="logo">S</div>
          <div class="company-details">
            <h1>${invoice.from.name}</h1>
            <p>${invoice.from.address}</p>
          </div>
        </div>
        <div class="invoice-details">
          <h2>Invoice ${invoice.invoiceNumber}</h2>
          <p>Issued at: ${formatDate(invoice.issuedDate)}</p>
          <p>Due at: ${formatDate(invoice.dueDate)}</p>
          ${invoice.lateFee > 0 ? `<p>Late fee: ${invoice.lateFee}%</p>` : ''}
        </div>
      </div>

      <!-- Parties -->
      <div class="parties">
        <div class="party">
          <h3>From</h3>
          <p class="name">${invoice.from.name}</p>
          <p>${invoice.from.address}</p>
          <p>${invoice.from.email}</p>
          ${invoice.from.phone ? `<p>${invoice.from.phone}</p>` : ''}
        </div>
        <div class="party">
          <h3>To</h3>
          <p class="name">${invoice.to.name}</p>
          <p>${invoice.to.address}</p>
          <p>${invoice.to.email}</p>
          ${invoice.to.phone ? `<p>${invoice.to.phone}</p>` : ''}
        </div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Price</th>
            <th>Sum</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${total.toLocaleString('id-ID')}</span>
          </div>
          <div class="totals-row total">
            <span>Total</span>
            <span>${total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        ${
          invoice.notes
            ? `
          <div class="footer-section notes">
            <h3>Notes</h3>
            <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
          </div>
        `
            : ''
        }
        <div class="footer-section">
          <h3>Bank Details</h3>
          <p>${invoice.bankDetails.bank}</p>
          <p>${invoice.bankDetails.accountNumber}</p>
        </div>
        <div class="footer-section">
          <h3>Contact</h3>
          ${invoice.from.website ? `<p>${invoice.from.website}</p>` : ''}
          <p>${invoice.from.email}</p>
          ${invoice.from.phone ? `<p>${invoice.from.phone}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}
