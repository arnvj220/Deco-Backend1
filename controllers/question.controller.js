import { prisma } from "../prisma"

export const createQuestion = async (req, res) => {
  try {
    const { roundId, options, answer, link, reward } = req.body

    const question = await prisma.question.create({
      data: {
        roundId,
        options,
        answer,
        link,
        reward
      }
    })

    res.status(201).json({
      status: true,
      data: question
    })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}

export const getQuestionsByRound = async (req, res) => {
  try {
    const { roundId } = req.params

    const questions = await prisma.question.findMany({
      where: { roundId: Number(roundId) }
    })

    res.json({ status: true, data: questions })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params

    const question = await prisma.question.update({
      where: { id: Number(id) },
      data: req.body
    })

    res.json({ status: true, data: question })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.question.delete({
      where: { id: Number(id) }
    })

    res.json({ status: true, message: "Question deleted" })
  } catch (err) {
    res.status(500).json({ status: false, message: err.message })
  }
}