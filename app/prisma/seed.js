import { prisma } from '$lib/db.server';

// create one record
await prisma.product.create({
    data: { barcode: '1234', name: 'Shirt' }
  })
  
// or create records in bulk
await prisma.product.createMany({
  data: [
    { barcode: '5678', name: 'Pants' },
    { barcode: '91011', name: 'Socks' }
  ]
})