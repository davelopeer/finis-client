import { resolveApiAssetUrl } from "../api/client.js";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function toISODate(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const match = value.match(DATE_ONLY_PATTERN);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatPostedAt(value) {
  if (!value) {
    return "";
  }

  let date;
  if (typeof value === "string") {
    const match = value.match(DATE_ONLY_PATTERN);
    if (match) {
      date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }

  if (!date) {
    date = value instanceof Date ? value : new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const currentYear = new Date().getFullYear();
  const options =
    date.getFullYear() === currentYear
      ? { day: "numeric", month: "long" }
      : { day: "numeric", month: "long", year: "numeric" };

  return date.toLocaleDateString("pt-BR", options);
}

export function sortPostsByFinishedAt(posts) {
  return [...posts].sort((left, right) => {
    if (left.finishedAtValue !== right.finishedAtValue) {
      return left.finishedAtValue < right.finishedAtValue ? 1 : -1;
    }
    return left.id < right.id ? 1 : -1;
  });
}

export function reviewToPost(review) {
  const workMetadata = [review.mediaAuthor, review.mediaYear]
    .filter(Boolean)
    .join(", ");
  const finishedAtValue = toISODate(review.finishedAt);

  return {
    id: review.id,
    author: {
      name: review.author.displayName,
      nickname: review.author.username
        ? `@${review.author.username}`
        : "Username ainda não definido",
      avatarUrl: resolveApiAssetUrl(review.author.profileImageUrl),
    },
    category: review.category,
    title: review.mediaTitle,
    subtitle: workMetadata || review.mediaSubtitle || "",
    rating: review.rating,
    isMasterpiece: Boolean(review.isMasterpiece),
    description: review.description ?? "",
    isPrivate: Boolean(review.isPrivate),
    finishedAtValue,
    postedAt: formatPostedAt(finishedAtValue || review.createdAt),
    editValues: {
      workId: review.workId,
      mediaType: review.mediaType || review.category,
      mediaTitle: review.mediaTitle,
      mediaAuthor: review.mediaAuthor,
      mediaYear: review.mediaYear,
      category: review.category,
      rating: review.rating,
      isMasterpiece: Boolean(review.isMasterpiece),
      description: review.description ?? "",
      finishedAt: finishedAtValue,
      isPrivate: Boolean(review.isPrivate),
    },
  };
}
