import dotenv from "dotenv"
import { connectDB } from "../lib/mongodb.js"
import { Round } from "../models/index.js"

dotenv.config()

const migrateRoundNumbers = async () => {
  await connectDB()

  const latest = await Round.findOne({ roundNumber: { $exists: true } }).sort({ roundNumber: -1 }).lean()
  let nextRoundNumber = latest?.roundNumber ? latest.roundNumber + 1 : 1

  const roundsWithoutNumber = await Round.find({ roundNumber: { $exists: false } }).sort({ _id: 1 })

  if (!roundsWithoutNumber.length) {
    console.log("No rounds found that need roundNumber assignment.")
    process.exit(0)
  }

  for (const round of roundsWithoutNumber) {
    round.roundNumber = nextRoundNumber
    await round.save()
    console.log(`Updated round ${round._id} -> roundNumber ${nextRoundNumber}`)
    nextRoundNumber += 1
  }

  console.log(`Migration complete. Assigned roundNumber to ${roundsWithoutNumber.length} round(s).`)
  process.exit(0)
}

migrateRoundNumbers().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
