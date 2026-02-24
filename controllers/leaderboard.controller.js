import { prisma } from "../lib/prisma.js"

export const getLeaderboard = async (req, res) => {
  try {

    // Fetch only finished results from COMPLETED rounds
    const results = await prisma.roundResult.findMany({
      where: {
        finished: true,
        round: {
          status: "COMPLETED"
        }
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

    // Aggregate totals across all completed rounds
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

    // Assign competition ranks (handle ties)
    let currentRank = 1

    for (let i = 0; i < leaderboard.length; i++) {

      if (i > 0) {

        const prev = leaderboard[i - 1]
        const curr = leaderboard[i]

        if (
          curr.totalPoints === prev.totalPoints &&
          curr.totalTime === prev.totalTime
        ) {
          leaderboard[i].rank = prev.rank
        } else {
          leaderboard[i].rank = i + 1
        }

      } else {
        leaderboard[i].rank = 1
      }

    }

    res.json({
      status: true,
      data: leaderboard
    })

  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}