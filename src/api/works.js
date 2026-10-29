import { apiRequest } from "./client.js";

const WORKS_API_BASE = "/v1/works";
const WORK_REQUESTS_API_BASE = "/v1/work-requests";

// searchWorks runs the catalog full-text search for a single media type.
export function searchWorks(token, mediaType, query) {
  const params = new URLSearchParams({ q: query });
  return apiRequest(
    `${WORKS_API_BASE}/${encodeURIComponent(mediaType)}/search?${params.toString()}`,
    { token },
  );
}

// requestWork registers a "obra não encontrada" request for future cataloguing.
export function requestWork(token, { mediaType, title, year }) {
  return apiRequest(WORK_REQUESTS_API_BASE, {
    method: "POST",
    token,
    body: { mediaType, title, year },
  });
}
