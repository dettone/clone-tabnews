import retry from "async-retry";

import { faker } from "@faker-js/faker";

import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";
import session from "models/session";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 10000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    }
  }
}

async function clearDatabase() {
  await database.query("DROP schema public cascade; create schema public");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createSession(userId) {
  return await session.create(userId);
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validpassword",
  });
}
const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
};
export default orchestrator;
