import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DataBaseInfo />
    </>
  );
}

function DataBaseInfo() {
  const { isLoading, data } = StatusAPI();

  const { version, maxConnections, usedConnections } = data || {};

  return (
    <div>
      <h2>Database Information</h2>
      {isLoading ? (
        "Loading..."
      ) : (
        <ul>
          <li>Version: {version}</li>
          <li>Max Connections: {maxConnections}</li>
          <li>Used Connections: {usedConnections}</li>
        </ul>
      )}
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = StatusAPI();

  return (
    <div>
      {isLoading
        ? "Loading..."
        : `Last updated at: ${new Date(data.updated_at).toLocaleString()}`}
    </div>
  );
}

function StatusAPI() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  return { isLoading, data };
}
