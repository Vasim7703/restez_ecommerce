import { prisma } from './lib/prisma.ts'

async function main() {
  const p = await prisma.product.create({
    data: {
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test',
      base_price: 1000,
      category: 'Sofa',
      collection: '',
      material: 'Wood',
      style: 'Modern',
      seating_capacity: 3,
      dimensions: '{}',
      fabric_options: '{}',
      images: '{}',
      in_stock: true,
      featured: false,
      premium_upcharge: 0,
      fabric_images: '{}',
    }
  })
  console.log("Created product:", p)
}

main().catch(console.error)
