import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        let connected = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await prisma.$connect();
                connected = true;
                break;
            } catch (error) {
                console.error(`Database warmup failed on attempt ${attempt}:`, error?.code || error?.message || error);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }

        if (!connected) {
            console.warn("Starting server without confirmed database warmup.");
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
}
startServer();
