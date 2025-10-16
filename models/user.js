import database from "infra/database.js";
import password from "models/password.js";
import { NotFoundError, ValidationError } from "infra/erros.js";

async function findOneByUsername(userName) {
  const userFind = runSelectedQuery(userName);

  return userFind;

  async function runSelectedQuery(userName) {
    const result = await database.query({
      text: "SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;",
      values: [userName],
    });
    if (result.rowCount == 0) {
      throw new NotFoundError({
        action: "Please choose a different username.",
        message: "Username already in use.",
        name: "NotFoundError",
        statusCode: 404,
      });
    }
    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail(userEmail) {
    const result = await database.query({
      text: `SELECT 1 FROM users WHERE LOWER(email) = LOWER($1);`,
      values: [userEmail],
    });
    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Email already in use.",
        action: "Please use a different email.",
      });
    }
  }

  async function validateUniqueUsername(userName) {
    const result = await database.query({
      text: `SELECT * FROM users WHERE LOWER(username) = LOWER($1);`,
      values: [userName],
    });
    console.log(userName);
    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Username already in use.",
        action: "Please choose a different username.",
      });
    }
  }

  async function hashPasswordInObject(userInputValues) {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
  }

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `INSERT INTO 
      users (username, email, password)
      VALUES 
      ($1, $2, $3)
      RETURNING *
      ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
