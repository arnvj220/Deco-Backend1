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

export const addAllowedUser = async (req, res) => {
  try {
    const secret = req.headers["x-admin-secret"];
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "emails array required" });
    }

    const ops = emails.map(email => ({
      updateOne: {
        filter: { email: email.toLowerCase() },
        update: { $set: { email: email.toLowerCase() } },
        upsert: true,
      }
    }));

    const result = await AllowedUsers.bulkWrite(ops);

    return res.status(200).json({
      message: "Done",
      upserted: result.upsertedCount,
      matched: result.matchedCount,
    });
  } catch (err) {
    console.error("bulkAddAllowedUsers error:", err);
    return res.status(500).json({ message: err.message });
  }
};