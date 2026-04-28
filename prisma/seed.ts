import { PrismaClient } from '@prisma/client'
import { mockProducts } from '../lib/mockData'
import { MOCK_CUSTOMERS, MOCK_ADMIN } from '../lib/store'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Seed Users
  const allMockUsers = [...MOCK_CUSTOMERS, MOCK_ADMIN]
  
  for (const user of allMockUsers) {
    // We are simulating bcrypt hash for the seed
    const hashedPassword = await bcrypt.hash(user.password, 10)
    
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    })
  }

  // 2. Seed Products
  for (const product of mockProducts) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        base_price: product.base_price,
        category: product.category,
        collection: product.collection,
        material: product.material,
        seating_capacity: product.seating_capacity,
        style: product.style,
        dimensions: JSON.stringify(product.dimensions),
        fabric_options: JSON.stringify(product.fabric_options),
        premium_upcharge: product.premium_upcharge,
        images: JSON.stringify(product.images),
        in_stock: product.in_stock,
        featured: product.featured,
      },
    })

    // Seed Reviews for Product
    if (product.reviews && product.reviews.length > 0) {
      for (const review of product.reviews) {
        await prisma.review.create({
          data: {
            productId: createdProduct.id,
            user_name: review.user_name,
            rating: review.rating,
            comment: review.comment,
            date: review.date,
            verified_purchase: review.verified_purchase,
          }
        })
      }
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
