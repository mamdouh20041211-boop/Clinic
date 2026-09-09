import { Injectable } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PdfBrowserService } from '../common/filters/pdf/pdf-browser.service';
import { renderInvoiceHtml } from './pdf/invoice-template';

@Injectable()
export class InvoicePdfService {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfBrowserService: PdfBrowserService,
  ) {}

  async generate(invoiceId: string, language: 'ar' | 'en') {
    const invoice = await this.invoicesService.findOne(invoiceId);
    const html = renderInvoiceHtml(invoice, language);
    return this.pdfBrowserService.renderHtmlToPdf(html);
  }
}
