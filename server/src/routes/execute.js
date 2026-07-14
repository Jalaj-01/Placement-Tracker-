import { Router } from 'express'

const router = Router()

router.post('/java', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ error: 'Code is required' })
    }

    const createRes = await fetch(
      `https://api.paiza.io/runners/create?source_code=${encodeURIComponent(
        code
      )}&language=java&api_key=guest`,
      { method: 'POST' }
    )

    if (!createRes.ok) {
      throw new Error(`Failed to create execution session (HTTP ${createRes.status})`)
    }

    const createData = await createRes.json()
    const runId = createData.id
    let currentStatus = createData.status

    if (!runId) {
      throw new Error(createData.message || 'Could not initiate execution.')
    }

    // Poll for results (max 15 attempts, 1s delay)
    let attempts = 0
    let details = null

    while (currentStatus === 'running' && attempts < 15) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++

      const detailsRes = await fetch(
        `https://api.paiza.io/runners/get_details?id=${runId}&api_key=guest`
      )
      if (detailsRes.ok) {
        details = await detailsRes.json()
        currentStatus = details.status
      }
    }

    if (currentStatus === 'running') {
      return res.status(408).json({ error: 'Execution timed out' })
    }

    res.json(details)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Execution failed' })
  }
})

router.post('/verilog', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ error: 'Code is required' })
    }

    const createRes = await fetch(
      `https://api.paiza.io/runners/create?source_code=${encodeURIComponent(
        code
      )}&language=verilog&api_key=guest`,
      { method: 'POST' }
    )

    if (!createRes.ok) {
      throw new Error(`Failed to create execution session (HTTP ${createRes.status})`)
    }

    const createData = await createRes.json()
    const runId = createData.id
    let currentStatus = createData.status

    if (!runId) {
      throw new Error(createData.message || 'Could not initiate execution.')
    }

    // Poll for results (max 15 attempts, 1s delay)
    let attempts = 0
    let details = null

    while (currentStatus === 'running' && attempts < 15) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++

      const detailsRes = await fetch(
        `https://api.paiza.io/runners/get_details?id=${runId}&api_key=guest`
      )
      if (detailsRes.ok) {
        details = await detailsRes.json()
        currentStatus = details.status
      }
    }

    if (currentStatus === 'running') {
      return res.status(408).json({ error: 'Execution timed out' })
    }

    res.json(details)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Execution failed' })
  }
})

export default router
