import { IsUUID, IsArray, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';
import { CreateInvoiceChargeDto } from './create-invoice-charge.dto';

export class CreateInvoiceDto {
  @IsUUID()
  visitId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceChargeDto)
  additionalCharges?: CreateInvoiceChargeDto[];
}
