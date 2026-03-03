import { prisma } from "../lib/prisma.js"


//Current active round (if any)
export const getActiveRound = async (req, res) => {
  try {
    const round = await prisma.round.findFirst({
      where: { status: "ACTIVE" }
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

    if (!round || round.status !== "ACTIVE") {
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
        startTime: new Date(),
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

    const endTime = new Date()
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


// Admin creates a new round (initially UPCOMING)
export const createRound = async (req, res) => {
  const { startedAt } = req.body;
  const { endsAt } = req.body;

  try {
    const round = await prisma.round.create({
      data: {
        startedAt: new Date(startedAt),
        endsAt: new Date(endsAt),
        status: "UPCOMING"
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

// Admin activates a round (sets it to ACTIVE, deactivates any other active round)
export const activateRound = async (req, res) => {
  const roundId = Number(req.params.roundId)

  try {
    await prisma.$transaction([
      prisma.round.updateMany({
        where: { status: "ACTIVE" },
        data: { status: "COMPLETED" }
      }),
      prisma.round.update({
        where: { id: roundId },
        data: { status: "ACTIVE" }
      })
    ])

    return res.json({ message: "Round activated" })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export const closeRound = async (req, res) => {
  const roundId = Number(req.params.roundId)

  try {
    await prisma.round.update({
      where: { id: roundId },
      data: { status: "COMPLETED" }
    })

    return res.json({ message: "Round closed" })
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}

export const getAllRoundsAdmin = async (req, res) => {
  try {
    const rounds = await prisma.round.findMany({
      include: {
        questions: {
          select: {
            id: true
          }
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

    const formatted = rounds.map(round => {
      const totalParticipants = round.results.length
      const finishedCount = round.results.filter(r => r.finished).length

      return {
        id: round.id,
        startedAt: round.startedAt,
        endsAt: round.endsAt,
        status: round.status,
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