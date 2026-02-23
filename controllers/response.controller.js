import { supabase } from "../config/supabase.js"

export const submitResponse = async (req, res) => {
  const userId = req.user.id
  const { questionId, submittedAnswer } = req.body

  try {
    // get question
    const { data: question, error: qErr } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single()

    if (qErr || !question) {
      return res.status(404).json({ message: "Question not found" })
    }

    const isCorrect = submittedAnswer === question.answer
    const pointsEarned = isCorrect ? question.reward : 0

    const { error } = await supabase
      .from("responses")
      .upsert([
        {
          userId,
          questionId,
          roundId: question.roundId,
          submittedAnswer,
          isCorrect,
          pointsEarned
        }
      ], { onConflict: "userId,questionId" })

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    return res.json({ message: "Saved", isCorrect, pointsEarned })

  } catch {
    return res.status(500).json({ message: "Server error" })
  }
}


export const getMyResponses = async (req, res) => {
  const userId = req.user.id
  const roundId = Number(req.params.roundId)

  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("userId", userId)
    .eq("roundId", roundId)

  if (error) return res.status(400).json({ message: error.message })

  res.json(data)
}