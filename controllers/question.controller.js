// controllers/question.controller.js
import { Question } from "../models/index.js"

export const createQuestion = async (req, res) => {
  try {
    const { roundId, text, options, answer, link, reward } = req.body
    console.log(roundId);
    if (!text) {
      return res.status(400).json({ status: false, message: "Question text is required" })
    }

    const question = await Question.create({
      roundId,
      text,
      options: options ?? null,
      answer,
      link: link ?? null,
      reward
    })

    res.status(201).json({ status: true, data: question })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}

export const getQuestionsByRound = async (req, res) => {
  try {
    const { roundId } = req.params

    // Exclude answer from participants
    const questions = await Question.find({ roundId }, { answer: 0 }).lean()

    res.json({ status: true, data: questions })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params
    const { text, options, answer, link, reward } = req.body

    const question = await Question.findByIdAndUpdate(
      id,
      { $set: { text, options, answer, link, reward } },
      { returnDocument: 'after', runValidators: true }
    )

    if (!question) return res.status(404).json({ status: false, message: "Question not found" })

    res.json({ status: true, data: question })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params

    const question = await Question.findByIdAndDelete(id)
    if (!question) return res.status(404).json({ status: false, message: "Question not found" })

    res.json({ status: true, message: "Question deleted" })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}