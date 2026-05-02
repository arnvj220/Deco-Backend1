// controllers/response.controller.js
import { Question, Response } from "../models/index.js"

export const submitResponse = async (req, res) => {
  const userId = req.user._id
  const { questionId, submittedAnswer } = req.body

  try {
    const question = await Question.findById(questionId).populate("roundId").lean()

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    const round = question.roundId // populated Round doc
    const now = new Date()

    if (now < round.startedAt || now > round.endsAt) {
      return res.status(403).json({ message: "Round is not active" })
    }

    const isCorrect = submittedAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
    const pointsEarned = isCorrect ? question.reward : 0

    // Upsert: update existing answer or create new one
    await Response.findOneAndUpdate(
      { userId, questionId },
      {
        $set: {
          submittedAnswer,
          isCorrect,
          pointsEarned,
          roundId: round._id
        },
        $setOnInsert: { userId, questionId }
      },
      { upsert: true, returnDocument: 'after' }
    )

    return res.json({ status: true, message: "Answer submitted" })
  } catch (error) {
    console.error("Submit response error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

export const getMyResponses = async (req, res) => {
  const userId = req.user._id
  const { roundId } = req.params

  try {
    const data = await Response.find({ userId, roundId }).lean()
    return res.json(data)
  } catch (error) {
    return res.status(500).json({ message: "Server error" })
  }
}