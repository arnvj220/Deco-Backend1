import { Round, RoundResult } from "../models/index.js"

export const getLeaderboard = async (req, res) => {
  try {
    const now = new Date()

    // Check if any rounds are still running
    const unfinishedRounds = await Round.find({ endsAt: { $gt: now } }).lean()
    console.log(unfinishedRounds);
    if (unfinishedRounds.length > 0) {
      const availableAt = unfinishedRounds.reduce((latest, round) => {
        if (!latest || round.endsAt > latest) return round.endsAt
        return latest
      }, null)

      return res.json({
        status: true,
        data: [],
        message: "Leaderboard will be available once all rounds have ended.",
        availableAt
      })
    }

    // Get the latest round end time
    const lastRound = await Round.findOne({}, { endsAt: 1 })
      .sort({ endsAt: -1 })
      .lean()

    if (!lastRound) {
      return res.status(400).json({
        status: false,
        message: "No rounds found"
      })
    }

    if (now < lastRound.endsAt) {
      return res.status(400).json({
        status: false,
        message: "Leaderboard not available until all rounds are completed",
        availableAt: lastRound.endsAt
      })
    }

    // Fetch all finished results with user info
    const results = await RoundResult.find({ finished: true })
      .populate("userId", "name email avatar_url")
      .lean()

    const leaderboardMap = {}

    for (const result of results) {
      const user = result.userId // populated
      const uid = user._id.toString()

      if (!leaderboardMap[uid]) {
        leaderboardMap[uid] = {
          userId: uid,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          totalPoints: 0,
          totalTime: 0
        }
      }

      leaderboardMap[uid].totalPoints += result.totalScore ?? 0
      leaderboardMap[uid].totalTime += result.totalTime ?? 0
    }

    const leaderboard = Object.values(leaderboardMap)

    // Sort: points DESC, time ASC
    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
      return a.totalTime - b.totalTime
    })

    // Assign ranks (ties share the same rank)
    if (leaderboard.length > 0) leaderboard[0].rank = 1

    for (let i = 1; i < leaderboard.length; i++) {
      const prev = leaderboard[i - 1]
      const curr = leaderboard[i]

      if (curr.totalPoints === prev.totalPoints && curr.totalTime === prev.totalTime) {
        curr.rank = prev.rank
      } else {
        curr.rank = i + 1
      }
    }

    res.json({ status: true, data: leaderboard })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}