import { prisma } from "../lib/prisma.js"


// Get currently active round (time based)
export const getActiveRound = async (req, res) => {
  try {

    const now = new Date()

    const round = await prisma.round.findFirst({
      where: {
        startedAt: { lte: now },
        endsAt: { gte: now }
      }
    })

    if (!round) {
      return res.status(404).json({ message: "No active round" })
    }

    return res.json(round)

  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}


// Participant starts a round
export const startRound = async (req, res) => {

  const userId = req.user.id
  const roundId = Number(req.params.roundId)

  try {

    const round = await prisma.round.findUnique({
      where: { id: roundId }
    })

    if (!round) {
      return res.status(404).json({ message: "Round not found" })
    }

    const now = new Date()

    if (now < round.startedAt || now > round.endsAt) {
      return res.status(400).json({ message: "Round not active" })
    }

    const existing = await prisma.roundResult.findUnique({
      where: {
        userId_roundId: {
          userId,
          roundId
        }
      }
    })

    if (existing) {
      return res.status(400).json({ message: "Round already started" })
    }

    await prisma.roundResult.create({
      data: {
        userId,
        roundId,
        startTime: now,
        finished: false
      }
    })

    return res.json({ message: "Round started" })

  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}


// Participant finishes a round
export const finishRound = async (req, res) => {

  const userId = req.user.id
  const roundId = Number(req.params.roundId)

  try {

    const result = await prisma.roundResult.findUnique({
      where: {
        userId_roundId: {
          userId,
          roundId
        }
      }
    })

    if (!result || result.finished) {
      return res.status(400).json({ message: "Invalid finish request" })
    }

    const round = await prisma.round.findUnique({
      where: { id: roundId }
    })

    if (!round) {
      return res.status(404).json({ message: "Round not found" })
    }

    const now = new Date()

    if (now < round.startedAt) {
      return res.status(400).json({ message: "Round not started yet" })
    }

    if (now > round.endsAt) {
      return res.status(400).json({ message: "Round already ended" })
    }

    const endTime = now

    const totalTime = Math.floor(
      (endTime.getTime() - result.startTime.getTime()) / 1000
    )

    const responses = await prisma.response.findMany({
      where: { userId, roundId }
    })

    const totalScore = responses.reduce(
      (sum, r) => sum + r.pointsEarned,
      0
    )

    await prisma.roundResult.update({
      where: {
        userId_roundId: {
          userId,
          roundId
        }
      },
      data: {
        endTime,
        totalTime,
        totalScore,
        finished: true
      }
    })

    return res.json({ message: "Round finished" })

  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}


// Admin creates a new round
export const createRound = async (req, res) => {

  const { startedAt, endsAt } = req.body

  try {

    if (new Date(startedAt) >= new Date(endsAt)) {
      return res.status(400).json({
        message: "End time must be after start time"
      })
    }

    const round = await prisma.round.create({
      data: {
        startedAt: new Date(startedAt),
        endsAt: new Date(endsAt)
      }
    })

    return res.status(201).json({
      message: "Round created successfully",
      round
    })

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}


// Get all rounds (ADMIN)
export const getAllRoundsAdmin = async (req, res) => {

  try {

    const rounds = await prisma.round.findMany({
      include: {
        questions: {
          select: { id: true }
        },
        results: {
          select: {
            id: true,
            finished: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    })

    const now = new Date()

    const formatted = rounds.map(round => {

      let status

      if (now < round.startedAt) {
        status = "UPCOMING"
      }
      else if (now <= round.endsAt) {
        status = "ACTIVE"
      }
      else {
        status = "COMPLETED"
      }

      const totalParticipants = round.results.length
      const finishedCount = round.results.filter(r => r.finished).length

      return {
        id: round.id,
        startedAt: round.startedAt,
        endsAt: round.endsAt,
        status,
        totalQuestions: round.questions.length,
        totalParticipants,
        finishedCount
      }
    })

    return res.json(formatted)

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}