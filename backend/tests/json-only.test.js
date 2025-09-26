const request = require("supertest");
const app = require("../app");

describe("JSON-Only API Middleware", () => {
  describe("Accept Header Validation", () => {
    test("should accept requests with Accept: application/json", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.body.success).toBe(true);
    });

    test("should accept requests with Accept: */*", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "*/*");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should accept requests with Accept: application/*, */*", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "application/*, */*");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should reject requests with Accept: text/html", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "text/html");

      expect(response.status).toBe(406);
      expect(response.text).toBe(
        "This API only serves JSON. Please set Accept: application/json header."
      );
    });

    test("should reject requests with Accept: text/html, application/xhtml+xml", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "text/html, application/xhtml+xml");

      expect(response.status).toBe(406);
      expect(response.text).toBe(
        "This API only serves JSON. Please set Accept: application/json header."
      );
    });

    test("should reject requests with no Accept header", async () => {
      const response = await request(app).get("/api/children");

      expect(response.status).toBe(406);
      expect(response.text).toBe(
        "This API only serves JSON. Please set Accept: application/json header."
      );
    });
  });

  describe("Content-Type Validation for POST/PUT/PATCH", () => {
    test("should accept POST with Content-Type: application/json", async () => {
      const response = await request(app)
        .post("/api/children")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send({ name: "Test Child", birthdate: "2015-01-01" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test("should reject POST with Content-Type: application/x-www-form-urlencoded", async () => {
      const response = await request(app)
        .post("/api/children")
        .set("Accept", "application/json")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send("name=Test Child&birthdate=2015-01-01");

      expect(response.status).toBe(415);
      expect(response.text).toBe(
        "This API only accepts JSON. Please set Content-Type: application/json header."
      );
    });

    test("should reject PUT with wrong Content-Type", async () => {
      const response = await request(app)
        .put("/api/children/1")
        .set("Accept", "application/json")
        .set("Content-Type", "text/plain")
        .send("name=Test Child");

      expect(response.status).toBe(415);
      expect(response.text).toBe(
        "This API only accepts JSON. Please set Content-Type: application/json header."
      );
    });

    test("should reject PATCH with wrong Content-Type", async () => {
      const response = await request(app)
        .patch("/api/assignments/1/complete")
        .set("Accept", "application/json")
        .set("Content-Type", "multipart/form-data");

      expect(response.status).toBe(415);
      expect(response.text).toBe(
        "This API only accepts JSON. Please set Content-Type: application/json header."
      );
    });

    test("should allow GET without Content-Type validation", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("Non-API Routes Should Work Normally", () => {
    test("health endpoint should work with any Accept header", async () => {
      const response = await request(app)
        .get("/health")
        .set("Accept", "text/html");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Chores API is running!");
    });

    test("root endpoint should work with any Accept header", async () => {
      const response = await request(app).get("/").set("Accept", "text/html");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Welcome to the Family Chores API");
    });

    test("health endpoint should work with no Accept header", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("Various Accept Header Combinations", () => {
    test("should accept Accept: application/json, text/plain, */*", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "application/json, text/plain, */*");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should reject Accept: text/xml, text/html (no json)", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "text/xml, text/html");

      expect(response.status).toBe(406);
    });

    test("should accept Accept: text/html, application/json (json included)", async () => {
      const response = await request(app)
        .get("/api/children")
        .set("Accept", "text/html, application/json");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
