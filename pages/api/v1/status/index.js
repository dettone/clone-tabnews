import database from "infra/database";

async function status(request, response) {
  const databaseName = process.env.POSTGRES_DB;
  const version = await database.query("SHOW server_version;");

  const maxConnections = await database.query("SHOW max_connections");
  const updateAt = new Date().toISOString();

  const usedConnections = await database.query({
    text: `SELECT count(*) AS used_connections FROM pg_stat_activity WHERE datname = $1;`,
    values: [databaseName],
  });
  console.log(usedConnections.rows);
  response.status(200).json({
    updated_at: updateAt,
    version: version.rows[0].server_version,
    maxConnections: Number(maxConnections.rows[0].max_connections),
    usedConnections: Number(usedConnections.rows[0].used_connections),
  });
}

export default status;
