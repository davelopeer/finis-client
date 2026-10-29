import { apiRequest } from "./client.js";

const REVIEWS_API_BASE = "/v1/reviews";
const PROFILES_API_BASE = "/v1/profiles";

function buildReviewBody(payload) {
  const body = new FormData();
  body.append("workId", payload.workId ?? "");
  body.append("mediaType", payload.mediaType ?? "");
  body.append("rating", String(payload.rating ?? 0));
  body.append("isMasterpiece", String(payload.isMasterpiece ?? false));
  body.append("description", payload.description ?? "");
  body.append("isPrivate", String(payload.isPrivate ?? false));

  if (payload.finishedAt) {
    body.append("finishedAt", payload.finishedAt);
  }

  return body;
}

export function createReview(token, payload) {
  return apiRequest(REVIEWS_API_BASE, {
    method: "POST",
    token,
    body: buildReviewBody(payload),
  });
}

export function updateReview(token, id, payload) {
  return apiRequest(`${REVIEWS_API_BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: buildReviewBody(payload),
  });
}

export function deleteReview(token, id) {
  return apiRequest(`${REVIEWS_API_BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export function getMyProfileReviews(token) {
  return apiRequest(`${PROFILES_API_BASE}/me/reviews`, { token });
}

export function getProfileReviews(username) {
  return apiRequest(
    `${PROFILES_API_BASE}/${encodeURIComponent(username)}/reviews`,
  );
}
