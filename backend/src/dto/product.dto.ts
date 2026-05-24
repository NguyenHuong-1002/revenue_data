import { MinLength, isNotEmpty, IsNumber } from "class-validator"
export class ProductDTO {

  // @isNotEmpty()
  categoryId?: number

  @MinLength(5, { message: 'This field must be than 5 character Nine Dev' })
  productName?: string
  @IsNumber()
  price?: number
}