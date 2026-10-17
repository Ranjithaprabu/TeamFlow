const request = require("supertest");
const app = require("../server");

describe("Projects API", () => {
  test("GET /api/projects returns a successful response", async () => {
    const response = await request(app).get("/api/projects");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toBeInstanceOf(Array);
  });
  test("POST rejects an empty project name", async () => {
    const response = await request(app).post("/api/projects").send({
      name: "   ",
      description: "Test project",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Project name is required");
  });

  test("POST rejects a project name longer than 150 characters", async () => {
    const response = await request(app)
      .post("/api/projects")
      .send({
        name: "A".repeat(151),
        description: "Test project",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Project name cannot exceed 150 characters"
    );
  });
});
