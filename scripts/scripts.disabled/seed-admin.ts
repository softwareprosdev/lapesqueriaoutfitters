import { getPayload } from 'payload'
import config from '../payload-config'

const seedAdmin = async () => {
  const payload = await getPayload({ config })

  try {
    // Check if admin already exists
    const existingAdmin = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@shennastudio.com',
        },
      },
    })

    if (existingAdmin.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@shennastudio.com',
          password: 'Change_This_Password_123!',
          firstName: 'Admin',
          lastName: 'User',
          roles: ['admin'],
        },
      })
      console.log('✅ Admin user created successfully!')
      console.log('Email: admin@shennastudio.com')
      console.log('Password: Change_This_Password_123!')
      console.log('⚠️  IMPORTANT: Change this password immediately after first login!')
    } else {
      console.log('Admin user already exists')
    }
  } catch (error) {
    console.error('Error creating admin:', error)
  }

  process.exit(0)
}

seedAdmin()
