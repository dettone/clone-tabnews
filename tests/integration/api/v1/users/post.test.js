import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST api/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "dettoni",
          email: "dettonex25@gmail.com",
          password: "senha123",
        }),
      });
      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          id: responseBody.id,
          username: responseBody.username,
          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
        }),
      );
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();

      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(response.status).toBe(201);
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "duplicatedName1",
          email: "dublicado@gmail.com",
          password: "senha123",
        }),
      });
      await response1.json();

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "duplicatedName2",
          email: "Dublicado@gmail.com",
          password: "senha123",
        }),
      });

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        name: "ValidationError",
        action: "Please use a different email.",
        message: "Email already in use.",
        statusCode: 400,
      }),
        expect(response2.status).toBe(400);
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "duplicatedName12",
          email: "dettonex24@gmail.com",
          password: "senha123",
        }),
      });

      await response1.json();

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "duplicatedName12",
          email: "jodettone@gmail.com",
          password: "senha123",
        }),
      });

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        name: "ValidationError",
        action: "Please choose a different username.",
        message: "Username already in use.",
        statusCode: 400,
      }),
        expect(response2.status).toBe(400);
    });
  });
});
