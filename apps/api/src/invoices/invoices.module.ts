import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { DatabaseModule } from '../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { PdfBrowserService } from '../common/filters/pdf/pdf-browser.service';
import { InvoicePdfService } from './invoice-pdf.service';

@Module({
  imports: [DatabaseModule, AuditModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, PdfBrowserService, InvoicePdfService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
