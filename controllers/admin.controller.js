import { Round, Question, Response, RoundResult } from "../models/index.js"

export const truncateTables = async (req, res) => {
  try {
    await Promise.all([
      RoundResult.deleteMany({}),
      Response.deleteMany({}),
      Question.deleteMany({}),
      Round.deleteMany({}),
    ])

    res.json({
      status: true,
      message: "Collections truncated successfully"
    })
  } catch (err) {
    console.error("Truncate error:", err)
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}
