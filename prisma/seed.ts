// prisma/seed.ts
import { PrismaClient, UserRole } from '@/lib/generated/prisma/client'
import prisma from '@/lib/prisma'


async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Admin & Cashier Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flowpos.com' },
    update: {},
    create: {
      name: 'Adil Admin',
      email: 'admin@flowpos.com',
      role: UserRole.ADMIN,
    },
  })

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@flowpos.com' },
    update: {},
    create: {
      name: 'John Cashier',
      email: 'cashier@flowpos.com',
      role: UserRole.CASHIER,
    },
  })

  // 2. Create Categories
  const categories = ['Main Course', 'Beverages', 'Desserts']
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName }
    })
  }

  // 3. Create a Sample Product with Inventory
  const mainCourse = await prisma.category.findFirst({ where: { name: 'Main Course' } })

  if (mainCourse) {
    await prisma.product.create({
      data: {
        name: 'Classic Burger',
        price: 850.00,
        cost: 450.00,
        sku: 'BRG-001',
        description: 'Juicy beef patty with cheese',
        categoryId: mainCourse.id,
        inventory: {
          create: {
            quantityOnHand: 50,
            reorderLevel: 10,
          }
        }
      }
    })
  }

  console.log('✅ Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })