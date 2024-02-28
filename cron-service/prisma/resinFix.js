import { prisma } from './prismaClient.js';


async function main() {
    prisma.neonEventInstance.update({
        where: {
            eventId: 60442
        },
        data: {
            category: {
                disconnect: true
            },

        }
    })

    prisma.neonEventInstance.update({
        where: {
            eventId: 60442
        },
        data: {
            category: {
                connect: {
                    name: 'Private'
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