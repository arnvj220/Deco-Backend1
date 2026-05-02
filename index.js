// index.js
import app from "./app.js"
import { connectDB } from "./lib/mongodb.js"

const PORT = process.env.PORT || 8000

const startServer = async () => {
  try {
    let connected = false

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await connectDB()
        connected = true
        break
      } catch (error) {
        console.error(
          `Database connection failed on attempt ${attempt}:`,
          error?.message || error
        )
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }

    if (!connected) {
      console.warn("Starting server without confirmed database connection.")
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Error starting server:", error)
  }
}

startServer()