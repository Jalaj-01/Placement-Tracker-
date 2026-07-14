import { Router } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

router.post('/upload', async (req, res) => {
  try {
    const { name, base64Data } = req.body
    if (!name || !base64Data) {
      return res.status(400).json({ error: 'Filename and base64Data are required' })
    }

    // base64Data looks like: "data:image/png;base64,iVBORw0KGgo..."
    const commaIndex = base64Data.indexOf(',')
    const cleanBase64 = commaIndex !== -1 ? base64Data.slice(commaIndex + 1) : base64Data
    const buffer = Buffer.from(cleanBase64, 'base64')

    const filename = `${Date.now()}_${name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    const filepath = path.join(UPLOADS_DIR, filename)

    await fs.promises.writeFile(filepath, buffer)

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`
    res.json({ url: fileUrl })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Upload failed' })
  }
})

export default router
