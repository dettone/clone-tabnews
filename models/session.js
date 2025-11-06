import database from "infra/database";
import { UnauthorizedError } from "infra/erros";
import crypto from "node:crypto";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days

async function findOneValidByToken(token) {
  const results = await database.query({
    text: `
      SELECT * FROM sessions
      WHERE token = $1 AND expires_at > NOW();
    `,
    values: [token],
  });
  if (results.rowCount === 0) {
    throw new UnauthorizedError({
      action: "Verifique se este usuário está logado e tente novamente.",
      message: "Usuário não possui sessão ativa.",
      name: "UnauthorizedError",
      statusCode: 401,
    });
  }

  return results.rows[0];
}

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");

  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *",
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const renewSessionObject = runUpdateQuery(sessionId, expiresAt);
  return renewSessionObject;

  async function runUpdateQuery(sessionId, expiresAt) {
    const results = await database.query({
      text: `UPDATE sessions SET updated_at = NOW(),expires_at = $2 WHERE id = $1 RETURNING *`,
      values: [sessionId, expiresAt],
    });
    return results.rows[0];
  }
}

async function expireById(sessionId) {
  console.log(sessionId);
  const expiredSessionObject = await runUpdateQuery(sessionId);

  return expiredSessionObject;

  async function runUpdateQuery(sessionId) {
    const results = await database.query({
      text: `UPDATE
       sessions SET expires_at = expires_at - interval '1 year', 
      updated_at = NOW() 
      WHERE id = $1 RETURNING *`,
      values: [sessionId],
    });
    return results.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  EXPIRATION_IN_MILLISECONDS,
  renew,
  expireById,
};

export default session;
