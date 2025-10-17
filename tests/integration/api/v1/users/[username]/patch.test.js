import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH api/v1/user/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioinexistente",

        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Please choose a different username.",
        message: "Username Not Found.",
        name: "NotFoundError",
        statusCode: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });
      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      const userResponse = await response.json();

      expect(userResponse).toEqual({
        name: "ValidationError",
        action: "Please choose a different username.",
        message: "Username already in use.",
        statusCode: 400,
      }),
        expect(userResponse.statusCode).toBe(400);
    });

    test("With unique 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueUser1@gmail.com",
          password: "senha123",
        }),
      });

      await user1Response.json();

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          id: responseBody.id,
          username: "uniqueUser2",
          password: responseBody.password,
          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
        }),
      );

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();

      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      expect(response.status).toBe(200);
    });

    test("With unique 'email'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueEmail1@gmail.com",
          password: "senha123",
        }),
      });

      await user1Response.json();

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "uniqueEmail2@gmail.com",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          id: responseBody.id,
          username: "uniqueUser1",
          email: "uniqueEmail2@gmail.com",
          password: responseBody.password,
          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
        }),
      );
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();

      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      expect(response.status).toBe(200);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "senha123",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/" + createdUser.username,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "senha1234",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual(
        expect.objectContaining({
          id: responseBody.id,
          username: createdUser.username,
          email: createdUser.email,

          created_at: responseBody.created_at,
          updated_at: responseBody.updated_at,
        }),
      );
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();

      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      expect(response.status).toBe(200);

      const userInDatabase = await user.findOneByUsername(createdUser.username);

      const correctPassword = await password.compare(
        "senha1234",
        userInDatabase.password,
      );

      expect(correctPassword).toBe(true);

      const incorrectPassword = await password.compare(
        "senha123",
        userInDatabase.password,
      );
      expect(incorrectPassword).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@gmail.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@gmail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );

      const userResponse = await response.json();

      expect(userResponse).toEqual({
        name: "ValidationError",
        action: "Please use a different email.",
        message: "Email already in use.",
        statusCode: 400,
      }),
        expect(userResponse.statusCode).toBe(400);
    });
  });
});
