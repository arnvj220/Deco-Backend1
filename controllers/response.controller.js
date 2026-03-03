import { prisma } from "../lib/prisma.js";

export const submitResponse = async (req, res) => {
  const userId = req.user.id;
  const { questionId, submittedAnswer } = req.body;

  try {
    // Get question
    const question = await prisma.question.findUnique({
      where: {
        id: Number(questionId),
      },
      include: {
        round: true,
      },
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const now = new Date()

    if (now < question.round.startedAt || now > question.round.endsAt) {
      return res.status(403).json({
        message: "Round is not active",
      })
    }

    const isCorrect = submittedAnswer === question.answer;
    const pointsEarned = isCorrect ? question.reward : 0;

    // Upsert response (because of @@unique([userId, questionId]))
    await prisma.response.upsert({
      where: {
        userId_questionId: {
          userId: userId,
          questionId: Number(questionId),
        },
      },
      update: {
        submittedAnswer: submittedAnswer,
        isCorrect: isCorrect,
        pointsEarned: pointsEarned,
      },
      create: {
        userId: userId,
        questionId: Number(questionId),
        roundId: question.roundId,
        submittedAnswer: submittedAnswer,
        isCorrect: isCorrect,
        pointsEarned: pointsEarned,
      },
    });

    return res.json({
      message: "Saved",
      isCorrect,
      pointsEarned,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyResponses = async (req, res) => {
  const userId = req.user.id;
  const roundId = Number(req.params.roundId);

  try {
    const data = await prisma.response.findMany({
      where: {
        userId: userId,
        roundId: roundId,
      },
    });

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
