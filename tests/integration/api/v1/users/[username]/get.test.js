import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET api/v1/user/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "mesmoCase",
          email: "mesmoCase@gmail.com",
          password: "senha123",
        }),
      });
      await response1.json();

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/mesmoCase",
      );

      expect(response2.status).toBe(200);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "mesmoCase",
        email: "mesmoCase@gmail.com",
        password: "senha123",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });
  });

  test("With exact case mismatch", async () => {
    const response1 = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "caseDiferente",
        email: "caseDiferente@gmail.com",
        password: "senha123",
      }),
    });
    await response1.json();

    const response2 = await fetch(
      "http://localhost:3000/api/v1/users/casediferente",
    );

    expect(response2.status).toBe(200);

    const responseBody = await response2.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "caseDiferente",
      email: "caseDiferente@gmail.com",
      password: "senha123",
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });
  });

  test("With nonexistent user", async () => {
    const response2 = await fetch(
      "http://localhost:3000/api/v1/users/usuarioinexistente",
    );

    expect(response2.status).toBe(404);

    const responseBody = await response2.json();

    expect(responseBody).toEqual({
      action: "Please choose a different username.",
      message: "Username already in use.",
      name: "NotFoundError",
      statusCode: 404,
    });
  });
});
