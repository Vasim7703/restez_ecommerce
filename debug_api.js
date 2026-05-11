const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Test 1: Can we create a product?
  try {
    const testProduct = await prisma.product.create({
      data: {
        name: 'Debug Test Product',
        slug: 'debug-test-' + Date.now(),
        description: 'Test',
        base_price: 1000,
        category: 'Sofa',
        collection: 'Test',
        material: 'Teak Wood',
        style: 'Modern',
        seating_capacity: 3,
        dimensions: JSON.stringify({ length: 200, width: 90, height: 90 }),
        fabric_options: JSON.stringify({ standard: ['Red'], premium: ['Blue'] }),
        premium_upcharge: 0,
        images: JSON.stringify({ main: '/test.png' }),
        fabric_images: JSON.stringify({}),
        in_stock: true,
        featured: false,
      }
    });
    console.log('✅ Product CREATE success, id:', testProduct.id);

    // Clean up test product
    await prisma.product.delete({ where: { id: testProduct.id } });
    console.log('✅ Product DELETE success');
  } catch (err) {
    console.error('❌ Product CREATE failed:', err.message, '| code:', err.code);
  }

  // Test 2: Can we upsert SiteConfig?
  try {
    const config = await prisma.siteConfig.upsert({
      where: { key: 'test_key' },
      update: { value: JSON.stringify({ test: true }) },
      create: { key: 'test_key', value: JSON.stringify({ test: true }) },
    });
    console.log('✅ SiteConfig UPSERT success:', config.key);

    // Clean up
    await prisma.siteConfig.delete({ where: { key: 'test_key' } });
    console.log('✅ SiteConfig DELETE success');
  } catch (err) {
    console.error('❌ SiteConfig UPSERT failed:', err.message, '| code:', err.code);
  }
}

main().finally(() => prisma.$disconnect());
