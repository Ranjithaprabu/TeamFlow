const express = require("express");
const defaultPool = require("../db");
const router = express.Router();

let pool = defaultPool;

function setPool(newPool) {
  pool = newPool;
}

const validateProjectName = require("../validators/projectValidator");
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id ASC");

    res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching projects:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch projects",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    const validationError = validateProjectName(name);

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError,
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description)
         VALUES ($1, $2)
         RETURNING *`,
      [name.trim(), description || null]
    );

    res.status(201).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating project:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to create project",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id) || Number(id) < 1) {
      return res.status(400).json({
        status: "error",
        message: "Invalid project ID",
      });
    }
    const { name, description } = req.body;

    const validationError = validateProjectName(name);

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError,
      });
    }

    const result = await pool.query(
      `UPDATE projects
         SET name = $1, description = $2
         WHERE id = $3
         RETURNING *`,
      [name.trim(), description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Project not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating project:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to update project",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id) || Number(id) < 1) {
      return res.status(400).json({
        status: "error",
        message: "Invalid project ID",
      });
    }

    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Project not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Project deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting project:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to delete project",
    });
  }
});

module.exports = { router, setPool };
