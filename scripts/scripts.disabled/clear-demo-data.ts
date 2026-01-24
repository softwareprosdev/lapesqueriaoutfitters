/**
 * Clear Demo Data
 *
 * Removes all demo products and the demo category from the database.
 * This prepares the store for production by cleaning up sample data.
 *
 * Run: npm run payload:clear-demo
 */

import { getPayload } from 'payload'
import config from '../payload-config'

async function clearDemoData() {
  console.log('🧹 Starting demo data cleanup...')

  try {
    const payload = await getPayload({ config })

    // Find demo category
    const demoCategory = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: 'demo-collection'
        }
      }
    })

    if (demoCategory.docs.length === 0) {
      console.log('ℹ️  No demo category found. Nothing to clean up.')
      process.exit(0)
    }

    const categoryId = demoCategory.docs[0].id

    // Find all products in demo category
    const demoProducts = await payload.find({
      collection: 'products',
      where: {
        category: {
          equals: categoryId
        }
      },
      limit: 1000 // Get all demo products
    })

    console.log(`📦 Found ${demoProducts.docs.length} demo products to remove`)

    // Delete each product
    let deletedCount = 0
    for (const product of demoProducts.docs) {
      try {
        await payload.delete({
          collection: 'products',
          id: product.id
        })
        deletedCount++
        console.log(`✅ Deleted product: ${product.name}`)
      } catch (error) {
        console.error(`❌ Error deleting product ${product.name}:`, error)
      }
    }

    // Delete demo category
    console.log('🗑️  Deleting demo category...')
    await payload.delete({
      collection: 'categories',
      id: categoryId
    })

    console.log('\n🎉 Demo data cleanup complete!')
    console.log(`📊 Deleted ${deletedCount} products`)
    console.log(`📁 Deleted demo category`)
    console.log('\n✅ Your store is now ready for production!')

  } catch (error) {
    console.error('❌ Error clearing demo data:', error)
    throw error
  }

  process.exit(0)
}

clearDemoData()
