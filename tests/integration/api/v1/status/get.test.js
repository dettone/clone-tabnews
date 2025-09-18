test("GET to api/status returns 200 and correct message", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.message).toBe("tabnews online!");
});
