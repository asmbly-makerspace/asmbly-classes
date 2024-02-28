import { prisma } from './prismaClient.js';


async function main() {
    await prisma.neonEventInstance.update({
        where: {
            eventId: 60442
        },
        data: {
            category: {
                disconnect: true
            },

        }
    })

    private_cat_id = await prisma.neonEventCategory.findUnique({
        where: {
            name: 'Private'
        }
    })

    await prisma.neonEventInstance.update({
        where: {
            eventId: 60442
        },
        data: {
            category: {
                connect: {
                    id: private_cat_id.id
                }
            },
        }
    })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })