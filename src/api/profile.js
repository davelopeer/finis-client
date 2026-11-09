import { apiRequest } from "./client.js";

const PROFILES_API_BASE = "/v1/profiles";

export function getMyProfile(token) {
  return apiRequest(`${PROFILES_API_BASE}/me`, { token });
}

export function updateMyProfile(token, payload) {
  return apiRequest(`${PROFILES_API_BASE}/me`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function uploadMyAvatar(token, file) {
  const body = new FormData();
  body.append("avatar", file);

  return apiRequest(`${PROFILES_API_BASE}/me/avatar`, {
    method: "POST",
    token,
    body,
  });
}

export function removeMyAvatar(token) {
  return apiRequest(`${PROFILES_API_BASE}/me/avatar`, {
    method: "DELETE",
    token,
  });
}

export function getProfileByUsername(username) {
  return apiRequest(`${PROFILES_API_BASE}/${encodeURIComponent(username)}`);
}

// updateTopWorks replaces the always-public "Top 5" list for one media type
// (e.g. top 5 books). items is an ordered array of { workId, mediaType }; the
// server resolves title/author/year.
export function updateTopWorks(token, mediaType, items) {
  return apiRequest(
    `${PROFILES_API_BASE}/me/top-works/${encodeURIComponent(mediaType)}`,
    {
      method: "PUT",
      token,
      body: { items },
    },
  );
}

// updateNextWorks replaces the "Próximas obras" list for one media type (public
// or private depending on the profile flag).
export function updateNextWorks(token, mediaType, items) {
  return apiRequest(
    `${PROFILES_API_BASE}/me/next-works/${encodeURIComponent(mediaType)}`,
    {
      method: "PUT",
      token,
      body: { items },
    },
  );
}
