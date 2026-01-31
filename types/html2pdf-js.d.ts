declare module 'html2pdf.js' {
  type Html2PdfType = any;
  const html2pdf: { (): any; set: (opts: any) => any; from: (el: any) => any } & Html2PdfType;
  export default html2pdf;
}
