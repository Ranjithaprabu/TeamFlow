const express = require("express");
const defaultPool = require("../db");
const router = express.Router();

let pool = defaultPool;

function setPool(newPool) {
  pool = newPool;
}
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
           tasks.*,
           projects.name AS project_name
         FROM tasks
         JOIN projects ON tasks.project_id = projects.id
         ORDER BY tasks.id ASC`
    );

    res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch tasks",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { project_id, title, description, status } = req.body;

    if (!Number.isInteger(project_id) || project_id <= 0) {
      return res.status(400).json({
        status: "error",
        message: "A valid project_id is required",
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Task title is required",
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        status: "error",
        message: "Task title cannot exceed 150 characters",
      });
    }

    const validStatuses = ["Todo", "In Progress", "Done"];
    const taskStatus = status ?? "Todo";

    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({
        status: "error",
        message: "Status must be Todo, In Progress, or Done",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
      [project_id, title.trim(), description ?? null, taskStatus]
    );

    res.status(201).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        status: "error",
        message: "The selected project does not exist",
      });
    }

    console.error("Error creating task:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to create task",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { project_id, title, description, status } = req.body;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task ID",
      });
    }

    if (!Number.isInteger(project_id) || project_id <= 0) {
      return res.status(400).json({
        status: "error",
        message: "A valid project_id is required",
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Task title is required",
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        status: "error",
        message: "Task title cannot exceed 150 characters",
      });
    }

    const validStatuses = ["Todo", "In Progress", "Done"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status must be Todo, In Progress, or Done",
      });
    }

    const result = await pool.query(
      `UPDATE tasks
         SET project_id = $1,
             title = $2,
             description = $3,
             status = $4
         WHERE id = $5
         RETURNING *`,
      [project_id, title.trim(), description ?? null, status, Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        status: "error",
        message: "The selected project does not exist",
      });
    }

    console.error("Error updating task:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to update task",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid task ID",
      });
    }

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Task deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting task:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to delete task",
    });
  }
});

module.exports = { router, setPool };
