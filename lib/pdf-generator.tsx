import { Invoice } from './invoice-types';

export async function generatePDF(invoice: Invoice) {
  // Dynamically import html2pdf to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;

  // Create an isolated iframe and write the invoice HTML into it so that
  // global styles (including those using unsupported color functions)
  // are not applied/parsed by html2canvas.
  const iframe = document.createElement('iframe');
  // place iframe off-screen but visible with opacity 0 so html2canvas can render it
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '800px';
  iframe.style.height = '1120px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Unable to create iframe document');
  }

  doc.open();
  doc.write(generateInvoiceHTML(invoice));
  doc.close();

  const element = doc.body;

  // Wait for images in the iframe to load (or timeout after 3s)
  await new Promise<void>((resolve) => {
    const imgs = Array.from(doc.images) as HTMLImageElement[];
    if (imgs.length === 0) return resolve();
    let loaded = 0;
    const check = () => {
      loaded++;
      if (loaded === imgs.length) resolve();
    };
    imgs.forEach((img) => {
      if (img.complete) return check();
      img.addEventListener('load', check);
      img.addEventListener('error', check);
    });
    // timeout fallback
    setTimeout(resolve, 3000);
  });

  const options = {
    margin: 10,
    filename: `invoice-${invoice.invoiceNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      // onclone allows us to sanitize styles on the cloned document before html2canvas parses them
      onclone: (clonedDoc: Document) => {
        try {
          const win = clonedDoc.defaultView;
          if (!win) return;
          const all = Array.from(clonedDoc.getElementsByTagName('*')) as Element[];
          for (const el of all) {
            try {
              const cs = win.getComputedStyle(el);
              // properties to check
              const props = ['background-color', 'color', 'border-color', 'outline-color'];
              for (const prop of props) {
                const val = cs.getPropertyValue(prop);
                if (val && (val.includes('oklab') || val.includes('color-mix'))) {
                  // Use safe fallbacks: white background, dark text, neutral border
                  if (prop === 'background-color') {
                    (el as HTMLElement).style.setProperty(prop, '#ffffff');
                  } else if (prop === 'color') {
                    (el as HTMLElement).style.setProperty(prop, '#111111');
                  } else {
                    (el as HTMLElement).style.setProperty(prop, '#e5e7eb');
                  }
                }
              }
            } catch (e) {
              // ignore per-element errors
            }
          }
        } catch (e) {
          // ignore onclone errors
        }
      },
    },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  };

  try {
    await html2pdf().set(options).from(element).save();
  } finally {
    // Clean up iframe
    try {
      document.body.removeChild(iframe);
    } catch (e) {
      // ignore
    }
  }
}

export function generateInvoiceHTML(invoice: Invoice): string {
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
        body { font-family: Arial, sans-serif; color: #1a202c; background: #f7f7f7; }
        .container { width: 794px; margin: 24px auto; background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px; box-sizing: border-box; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb; }
        .company-info { display: flex; gap: 16px; align-items: center; }
        .logo { width: 72px; height: 72px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; background: #ffffff; }
        .logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .company-details h1 { margin: 0; font-size: 20px; font-weight: 700; }
        .company-details p { margin: 4px 0; font-size: 13px; color: #6b7280; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 28px; font-weight: 700; color: #5b21b6; margin-bottom: 8px; }
        .invoice-details p { margin: 4px 0; font-size: 13px; color: #6b7280; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
        .party h3 { margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
        .party p { margin: 4px 0; font-size: 13px; color: #374151; }
        .party p.name { font-weight: 700; }
        .items-table { width: 100%; margin-bottom: 24px; border-collapse: collapse; }
        .items-table th { text-align: left; padding: 12px 8px; font-weight: 700; color: #1a202c; border-bottom: 2px solid #e5e7eb; }
        .items-table th:nth-child(2), .items-table th:nth-child(3), .items-table th:nth-child(4), .items-table th:nth-child(5) { text-align: right; }
        .items-table td { padding: 12px 8px; border-bottom: 1px solid #f1f1f1; font-size: 14px; color: #25303a; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
        .totals-box { width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .totals-row.total { border-bottom: none; padding-top: 12px; font-size: 16px; font-weight: 700; }
        .footer { padding-top: 24px; border-top: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .footer-section h3 { margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
        .footer-section p { margin: 4px 0; font-size: 13px; color: #374151; }
        .notes { margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="company-info">
          <div class="logo"><img src="https://res.cloudinary.com/dr5pehdsw/image/upload/v1769828376/Logo_Zencool_pmyw1u.jpg" alt="${invoice.from.name} logo" crossorigin="anonymous"/></div>
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

export function printInvoice(invoice: Invoice) {
  // Open a new window and trigger print with the invoice HTML
  const html = generateInvoiceHTML(invoice);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.open();
  // Add onload print and close
  printWindow.document.write(html.replace('<body>', `<body onload="window.print();window.close();">`));
  printWindow.document.close();
}