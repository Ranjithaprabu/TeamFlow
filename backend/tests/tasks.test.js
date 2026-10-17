const request = require("supertest");
const app = require("../server");

describe("Tasks API", () => {
  test("GET /api/tasks returns a successful response", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toBeInstanceOf(Array);
  });
  test("POST rejects an empty task title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        project_id: 1,
        title: "   ",
        description: "Test task",
        status: "Todo",
      });
  
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Task title is required");
  });
  test("POST rejects an invalid task status", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        project_id: 1,
        title: "Test task",
        description: "Testing status validation",
        status: "Invalid Status",
      });
  
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Status must be Todo, In Progress, or Done"
    );
  });
});