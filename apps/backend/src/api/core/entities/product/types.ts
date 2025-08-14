import { Product as ProductModel } from 'api/core/entities/product/model'

export type Product = ProductModel

export type ProductRepositoryType = {
  getProductById(productId: string): Promise<Product | null>
  getProductsByCode(code: string[]): Promise<Product[]>
  createProduct(product: { code: string; name?: string; description: string }, save?: boolean): Promise<Product>
  updateProduct(productId: string, data: Partial<Product>): Promise<Product>
  saveProduct(product: Product): Promise<Product>
}
