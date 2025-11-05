import database from "infra/database.js";
import password from "models/password.js";
import { NotFoundError, ValidationError } from "infra/erros.js";

async function findOneById(userId) {
  const userFind = runSelectedQuery(userId);

  return userFind;

  async function runSelectedQuery(userId) {
    const result = await database.query({
      text: "SELECT * FROM users WHERE id = $1 LIMIT 1;",
      values: [userId],
    });
    if (result.rowCount == 0) {
      throw new NotFoundError({
        action: "Please choose a different id.",
        message: "Id Not Found.",
        name: "NotFoundError",
        statusCode: 404,
      });
    }
    return result.rows[0];
  }
}

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
        message: "Username Not Found.",
        name: "NotFoundError",
        statusCode: 404,
      });
    }
    return result.rows[0];
  }
}

async function findOneByEmail(userEmail) {
  const userFind = runSelectedQuery(userEmail);

  return userFind;

  async function runSelectedQuery(userEmail) {
    const result = await database.query({
      text: "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;",
      values: [userEmail],
    });
    if (result.rowCount == 0) {
      throw new NotFoundError({
        action: "Please choose a different username.",
        message: "Email Not Found.",
        name: "NotFoundError",
        statusCode: 401,
      });
    }
    return result.rows[0];
  }
}
async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

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

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }
  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const result = await database.query({
      text: `UPDATE users SET username = $1, email = $2, password = $3,   updated_at = NOW() WHERE id = $4 RETURNING *;`,
      values: [
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
        userWithNewValues.id,
      ],
    });
    return result.rows[0];
  }
}

async function validateUniqueUsername(userName) {
  const result = await database.query({
    text: `SELECT * FROM users WHERE LOWER(username) = LOWER($1);`,
    values: [userName],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "Username already in use.",
      action: "Please choose a different username.",
      statusCode: 400,
    });
  }
}
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

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  update,
  findOneByUsername,
  findOneByEmail,
  findOneById,
};

export default user;
