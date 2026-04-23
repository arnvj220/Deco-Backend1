import { prisma } from "../lib/prisma.js"

export const getLeaderboard = async (req, res) => {
  try {
    const now = new Date()

    // Check if all rounds have ended
    const unfinishedRounds = await prisma.round.findMany({
      where: {
        endsAt: {
          gt: now
        }
      }
    })

    if (unfinishedRounds.length > 0) {
      return res.json({
        status: true,
        data: [],
        message: "Leaderboard will be available once all rounds have ended."
      })
    }

    const results = await prisma.roundResult.findMany({
      where: {
        finished: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true
          }
        }
      }
    })

    const leaderboardMap = {}

    // Aggregate totals
    for (const result of results) {

      const userId = result.userId

      if (!leaderboardMap[userId]) {

        leaderboardMap[userId] = {
          userId: userId,
          name: result.user.name,
          email: result.user.email,
          avatar_url: result.user.avatar_url,
          totalPoints: 0,
          totalTime: 0
        }

      }

      leaderboardMap[userId].totalPoints += result.totalScore ?? 0
      leaderboardMap[userId].totalTime += result.totalTime ?? 0

    }

    const leaderboard = Object.values(leaderboardMap)

    // Sort by points DESC, time ASC
    leaderboard.sort((a, b) => {

      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }

      return a.totalTime - b.totalTime

    })

    // Assign ranks
    if (leaderboard.length > 0) {
      leaderboard[0].rank = 1
    }

    for (let i = 1; i < leaderboard.length; i++) {

      const prev = leaderboard[i - 1]
      const curr = leaderboard[i]

      if (
        curr.totalPoints === prev.totalPoints &&
        curr.totalTime === prev.totalTime
      ) {

        curr.rank = prev.rank

      } 
      else {

        curr.rank = i + 1

      }

    }

    res.json({
      status: true,
      data: leaderboard
    })

  } 
  catch (err) {

    res.status(500).json({
      status: false,
      message: err.message
    })

  }
}
