import { NextRequest, NextResponse } from 'next/server'

// Store sessions in memory (in production, use Redis/Database)
const sessions = new Map<string, {
  code: string
  status: 'pending' | 'connected' | 'failed'
  createdAt: Date
}>()

function generatePairingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Clean phone number
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
    
    if (cleanNumber.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Generate pairing code
    const pairingCode = generatePairingCode()
    
    // Store session
    sessions.set(cleanNumber, {
      code: pairingCode,
      status: 'pending',
      createdAt: new Date()
    })

    // In a real implementation, this would:
    // 1. Initialize Baileys connection
    // 2. Request pairing code from WhatsApp
    // 3. Send the code to the user's WhatsApp
    
    return NextResponse.json({
      success: true,
      pairingCode,
      phoneNumber: cleanNumber,
      message: `Code envoyé! Ouvrez WhatsApp > Appareils connectés > Connecter un appareil > Entrez le code: ${pairingCode}`
    })
    
  } catch (error) {
    console.error('Pairing error:', error)
    return NextResponse.json({ error: 'Pairing failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phoneNumber = searchParams.get('phone')
  
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
  }
  
  const session = sessions.get(phoneNumber)
  
  if (!session) {
    return NextResponse.json({ status: 'not_found' })
  }
  
  return NextResponse.json({
    status: session.status,
    code: session.code
  })
}
