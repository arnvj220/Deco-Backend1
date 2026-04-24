import { prisma } from "../lib/prisma.js"

export const truncateTables = async (req, res) => {
  try {
    // Truncate tables and reset auto-increment using raw SQL
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "RoundResult" RESTART IDENTITY CASCADE')
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Response" RESTART IDENTITY CASCADE')
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Question" RESTART IDENTITY CASCADE')
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Round" RESTART IDENTITY CASCADE')

    res.json({
      status: true,
      message: "Tables truncated successfully and auto-increment reset"
    })
  } catch (err) {
    console.error("Truncate error:", err)
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}