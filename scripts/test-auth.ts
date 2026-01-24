#!/usr/bin/env tsx

/**
 * Authentication Test Script
 * Tests the NextAuth.js setup for the admin panel
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env.local') })

import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function testAuth() {
  console.log('🔐 Testing Authentication Setup...\n')

  try {
    // Test 1: Check if admin user exists
    console.log('Test 1: Checking admin user in database...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@shennastudio.com' },
    })

    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return false
    }

    console.log('✅ Admin user exists')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Name: ${adminUser.name}`)

    // Test 2: Verify password hash
    console.log('\nTest 2: Verifying password hash...')
    const isPasswordValid = await bcrypt.compare('admin123', adminUser.password)

    if (!isPasswordValid) {
      console.log('❌ Password hash verification failed!')
      return false
    }

    console.log('✅ Password hash is valid')

    // Test 3: Check NextAuth tables
    console.log('\nTest 3: Checking NextAuth database tables...')

    const accountsCount = await prisma.account.count()
    const sessionsCount = await prisma.session.count()
    const verificationTokensCount = await prisma.verificationToken.count()

    console.log('✅ NextAuth tables exist')
    console.log(`   Accounts: ${accountsCount}`)
    console.log(`   Sessions: ${sessionsCount}`)
    console.log(`   Verification Tokens: ${verificationTokensCount}`)

    // Test 4: Check environment variables
    console.log('\nTest 4: Checking environment variables...')

    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ]

    let allEnvVarsPresent = true
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.log(`❌ Missing ${envVar}`)
        allEnvVarsPresent = false
      } else {
        console.log(`✅ ${envVar} is set`)
      }
    }

    if (!allEnvVarsPresent) {
      return false
    }

    console.log('\n✅ All authentication tests passed!')
    console.log('\n📝 Test Credentials:')
    console.log('   Email: admin@shennastudio.com')
    console.log('   Password: admin123')
    console.log('\n🌐 Access Points:')
    console.log('   Login: http://localhost:3000/admin/login')
    console.log('   Dashboard: http://localhost:3000/admin')
    console.log('   API: http://localhost:3000/api/auth')

    return true
  } catch (error) {
    console.error('❌ Test failed with error:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
