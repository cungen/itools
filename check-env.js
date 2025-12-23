#!/usr/bin/env node

// Quick script to check if .env.local exists and has the right variables
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env.local')

console.log('Checking .env.local file...\n')

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file does not exist!')
  console.log('\nPlease create .env.local with:')
  console.log('VITE_SUPABASE_URL=your_supabase_url')
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const content = fs.readFileSync(envPath, 'utf-8')
const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))

console.log('✅ .env.local file exists\n')
console.log('Found variables:')
lines.forEach(line => {
  const [key] = line.split('=')
  if (key) {
    const hasVitePrefix = key.trim().startsWith('VITE_')
    const hasPlasmoPrefix = key.trim().startsWith('PLASMO_PUBLIC_')
    const icon = hasVitePrefix ? '✅' : hasPlasmoPrefix ? '⚠️ ' : '❌'
    console.log(`${icon} ${key.trim()}`)
  }
})

const hasViteUrl = lines.some(line => line.startsWith('VITE_SUPABASE_URL'))
const hasViteKey = lines.some(line => line.startsWith('VITE_SUPABASE_ANON_KEY'))

console.log('\n---')
if (hasViteUrl && hasViteKey) {
  console.log('✅ VITE_ prefixed variables found!')
  console.log('⚠️  Make sure to restart the dev server: pnpm dev:web')
} else {
  console.log('❌ Missing VITE_ prefixed variables!')
  if (!hasViteUrl) {
    console.log('   Missing: VITE_SUPABASE_URL')
  }
  if (!hasViteKey) {
    console.log('   Missing: VITE_SUPABASE_ANON_KEY')
  }
  console.log('\nYour .env.local should contain:')
  console.log('VITE_SUPABASE_URL=your_supabase_url')
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
}

