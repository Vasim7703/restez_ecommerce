const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.order.findFirst({ orderBy: { createdAt: 'desc' } })
  .then(o => console.log(JSON.stringify(JSON.parse(o.items), null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
