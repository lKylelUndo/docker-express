import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Health check success" })
});

// Example route to test the database connection
app.get("/db-test", async (_req, res) => {
    try {
        // Run a simple query to verify connection
        const results = await db.query('SELECT 1 + 1 AS solution');
        
        // serverless-mysql requires you to manually clean up connections when done
        await db.end();
        
        res.status(200).json({ 
            message: "Database connection successful!", 
            data: results 
        });
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ 
            message: "Database connection failed", 
            error: error instanceof Error ? error.message : "Unknown error" 
        });
    }
});

export default app;