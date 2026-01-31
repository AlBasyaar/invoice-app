# Invoice Generator

A modern, professional invoice management application built with React, TypeScript, Next.js, and Tailwind CSS.

## Features

- **Create & Manage Invoices**: Create new invoices with a clean, intuitive interface
- **Invoice Dashboard**: View all invoices in a sortable table with key information
- **Detailed Editor**: Full-featured invoice editor with client info, items, and payment details
- **Invoice Preview**: Real-time preview of your invoice as you edit
- **PDF Export**: Download invoices as PDF files
- **Print Support**: Built-in browser printing functionality
- **Status Tracking**: Mark invoices as Draft or Booked
- **Local Storage**: All data is stored locally in your browser
- **Dark Mode Ready**: Built with support for light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 19.2 + TypeScript
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **PDF Generation**: html2pdf.js
- **Forms**: React Hook Form + Zod
- **State Management**: React Hooks + Local Storage

## Getting Started

### Installation

1. Clone the repository or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating an Invoice

1. Click "New Invoice" on the dashboard
2. Fill in your company details in the "From" section
3. Enter client information in the "To" section
4. Add line items by clicking "Add Item"
5. Fill in item descriptions, quantities, and unit prices
6. Optionally add notes, bank details, and late fees
7. Click "Save" to store the invoice

### Managing Invoices

- **View List**: See all invoices on the dashboard with their status, date, and total amount
- **Edit**: Click any invoice number or client name to edit
- **Change Status**: Mark invoices as Draft or Booked
- **Print**: Click the menu and select "Print" to print the invoice
- **Export PDF**: Click the menu and select "Export PDF" to download
- **Delete**: Click the menu and select "Delete" to remove an invoice

### Data Storage

All invoice data is stored locally in your browser's localStorage. The data persists between sessions but is unique to each device and browser.

## Invoice Structure

Each invoice includes:

- **Metadata**: Invoice number, status, issued date, due date, late fee
- **From**: Your company information (name, address, email, phone, website)
- **To**: Client information (name, address, email, phone)
- **Items**: Line items with description, quantity, unit price
- **Bank Details**: Bank name and account number for payment reference
- **Notes**: Additional terms or notes for the client

## Keyboard Shortcuts

- Use Tab to navigate between form fields
- Use Arrow keys to navigate table rows

## Browser Support

Works on all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- CSS Grid and Flexbox
- SVG

## License

Open source and free to use for personal or commercial purposes.

## Contributing

Feel free to fork, modify, and improve this project!

## Support

For issues or feature requests, please let me know.
