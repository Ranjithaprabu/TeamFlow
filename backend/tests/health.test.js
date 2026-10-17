const request = require("supertest");
const app = require("../server");

describe("Health API", () => {
  test("GET /api/health returns a successful response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });
  test("unknown routes return 404", async () => {
    const response = await request(app).get("/api/route-that-does-not-exist");
  
    expect(response.status).toBe(404);
  });
});