import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Ignore if directory already exists
    }

    // Clean filename and make unique
    const uniqueId = Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_')
    const fileName = `${uniqueId}-${originalName}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    // Return the public URL
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({ success: true, url: fileUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 })
  }
}
