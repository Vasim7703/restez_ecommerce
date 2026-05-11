const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  try {
    const r = await prisma.review.deleteMany({});
    const p = await prisma.product.deleteMany({});
    console.log(`Deleted ${r.count} reviews and ${p.count} products.`);
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

clean();
