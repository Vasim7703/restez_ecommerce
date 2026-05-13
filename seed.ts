import { prisma } from './lib/prisma'
import { mockProducts } from './lib/mockData'

async function main() {
  for (const p of mockProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        description: p.description || '',
        category: p.category || '',
        collection: p.collection || '',
        material: p.material || '',
        style: p.style || '',
        seating_capacity: p.seating_capacity || 1,
        dimensions: JSON.stringify(p.dimensions || {}),
        images: JSON.stringify(p.images || {}),
        in_stock: Boolean(p.in_stock),
        featured: Boolean(p.featured),
      }
    })
  }
  console.log('Seeded mock products')
}

main().catch(console.error)
