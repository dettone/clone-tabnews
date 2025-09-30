import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("GET to api/status returns 200 and correct message", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.updated_at).toBeDefined();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

  expect(responseBody.updated_at).toBe(parsedUpdatedAt);

  expect(responseBody.version).toBeDefined();
  expect(responseBody.version).toEqual("16.0");
  expect(responseBody.maxConnections).toBeDefined();
  expect(typeof responseBody.maxConnections).toBe("number");
  expect(responseBody.maxConnections).toBeGreaterThan(0);

  expect(responseBody.usedConnections).toBeDefined();

  expect(typeof responseBody.usedConnections).toBe("number");
  expect(responseBody.usedConnections).toBeLessThanOrEqual(
    responseBody.maxConnections,
  );
  expect(responseBody.usedConnections).toEqual(1);
});
