const request = require("supertest");
const app = require("../server");
const testPool = require("../testDb");
const tasksRoute = require("../routes/tasks");

tasksRoute.setPool(testPool);

describe("Tasks CRUD integration tests", () => {
  let projectId;
  let taskId;

  beforeAll(async () => {
    const project = await testPool.query(
      `INSERT INTO projects (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      ["Test Project Tasks", "Project for task tests"]
    );

    projectId = project.rows[0].id;
  });

  afterAll(async () => {
    if (projectId) {
      await testPool.query("DELETE FROM projects WHERE id = $1", [projectId]);
    }

    await testPool.end();
  });

  test("POST creates a task", async () => {
    const response = await request(app).post("/api/tasks").send({
      project_id: projectId,
      title: "Test Task",
      description: "Created by an automated test",
      status: "Todo",
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.title).toBe("Test Task");

    taskId = response.body.data.id;
  });

  test("PUT updates a task", async () => {
    const response = await request(app).put(`/api/tasks/${taskId}`).send({
      project_id: projectId,
      title: "Updated Test Task",
      description: "Updated by an automated test",
      status: "In Progress",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Updated Test Task");
    expect(response.body.data.status).toBe("In Progress");
  });

  test("DELETE removes a task", async () => {
    const response = await request(app).delete(`/api/tasks/${taskId}`);

    expect(response.status).toBe(200);

    const result = await testPool.query("SELECT * FROM tasks WHERE id = $1", [
      taskId,
    ]);

    expect(result.rows).toHaveLength(0);
  });

  test("Deleting a project also deletes its tasks", async () => {
    const project = await testPool.query(
      `INSERT INTO projects (name, description)
       VALUES ($1, $2)
       RETURNING id`,
      ["Test Project Cascade", "Cascade test"]
    );

    const cascadeProjectId = project.rows[0].id;

    const task = await testPool.query(
      `INSERT INTO tasks (project_id, title, status)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [cascadeProjectId, "Cascade Test Task", "Todo"]
    );

    const cascadeTaskId = task.rows[0].id;

    await testPool.query("DELETE FROM projects WHERE id = $1", [
      cascadeProjectId,
    ]);

    const result = await testPool.query("SELECT * FROM tasks WHERE id = $1", [
      cascadeTaskId,
    ]);

    expect(result.rows).toHaveLength(0);
  });
});
