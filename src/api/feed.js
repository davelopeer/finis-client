import { apiRequest } from "./client.js";

const FEED_API_BASE = "/v1/feed";

export function getFriendsFeed(token, { cursor = null, categories = [] } = {}) {
  const params = new URLSearchParams();
  if (cursor) {
    params.set("cursor", cursor);
  }
  categories.forEach((category) => params.append("category", category));

  const queryString = params.toString();
  const url = queryString ? `${FEED_API_BASE}?${queryString}` : FEED_API_BASE;

  return apiRequest(url, { token });
}
