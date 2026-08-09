import express from "express";
import cors from "cors";
import db from "./db";

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

app.post("/add-product", async (req, res) => {
    try {
        console.log("req body:", req.body);
        const { product_name, product_quantity } = req.body;

        // Create table if it doesn't exist yet
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_name VARCHAR(255) NOT NULL,
                product_quantity INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert into database
        const result = await db.query(
            "INSERT INTO products (product_name, product_quantity) VALUES (?, ?)",
            [product_name, product_quantity]
        );

        await db.end();

        return res.status(200).json({ 
            message: "Product added successfully!", 
            data: result 
        });
    }
    catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ 
            message: "Database connection failed", 
            error: error instanceof Error ? error.message : "Unknown error" 
        });
    }
});

export default app;