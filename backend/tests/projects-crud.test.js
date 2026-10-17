const request = require("supertest");
const app = require("../server");
const testPool = require("../testDb");
const projectsRoute = require("../routes/projects");

projectsRoute.setPool(testPool);

describe("Projects CRUD integration tests", () => {
  let projectId;

  afterAll(async () => {
    await testPool.query("DELETE FROM projects WHERE name LIKE 'Test Project%'");
    await testPool.end();
  });

  test("POST creates a project", async () => {
    const response = await request(app)
      .post("/api/projects")
      .send({
        name: "Test Project CRUD",
        description: "Created during an automated test",
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.name).toBe("Test Project CRUD");

    projectId = response.body.data.id;
  });

  test("PUT updates the project", async () => {
    const response = await request(app)
      .put(`/api/projects/${projectId}`)
      .send({
        name: "Test Project CRUD Updated",
        description: "Updated during an automated test",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Test Project CRUD Updated");
  });

  test("DELETE removes the project", async () => {
    const response = await request(app)
      .delete(`/api/projects/${projectId}`);

    expect(response.status).toBe(200);

    const result = await testPool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );

    expect(result.rows).toHaveLength(0);
  });
});