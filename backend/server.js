const express = require("express");
const cors = require("cors");
const pool = require("./db");


const app = express();
const PORT = 5000;

const { router: projectsRouter } = require("./routes/projects");
const { router: tasksRouter } = require("./routes/tasks");

app.use(cors());
app.use(express.json());

app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON request body",
    });
  }

  next(err);
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "TeamFlow API is running",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      status: "success",
      message: "PostgreSQL connected!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;