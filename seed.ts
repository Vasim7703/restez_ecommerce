import { prisma } from './lib/prisma.ts'
import { mockProducts } from './lib/mockData.ts'

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
        base_price: p.base_price,
        category: p.category || '',
        collection: p.collection || '',
        material: p.material || '',
        style: p.style || '',
        seating_capacity: p.seating_capacity || 1,
        dimensions: JSON.stringify(p.dimensions || {}),
        fabric_options: JSON.stringify(p.fabric_options || {}),
        images: JSON.stringify(p.images || {}),
        in_stock: Boolean(p.in_stock),
        featured: Boolean(p.featured),
        fabric_images: JSON.stringify(p.fabric_images || {}),
        premium_upcharge: Number(p.premium_upcharge) || 0,
      }
    })
  }
  console.log('Seeded mock products')
}

main().catch(console.error)
