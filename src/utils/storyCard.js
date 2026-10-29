const WIDTH = 1080;
const HEIGHT = 1920;
const SQUARE = 660;

const BACKGROUNDS = {
  books: "/share/books.jpg",
  movies: "/share/movies.jpg",
  series: "/share/series.jpg",
  games: "/share/games.jpg",
  comics: "/share/comics.jpg",
};

const backgroundCache = new Map();

const INK = "#1B1A17";
const INK_SOFT = "#3B3A36";
const MUTED = "#6B6A64";
const RULE = "#E6E4DE";
const BURGUNDY = "#7B1113";
const GOLD = "#C9A227";
const STAR_EMPTY = "#E4DDD4";
const MASTERPIECE = "#6B7F99";

export async function downloadStoryImage(post) {
  const blob = await renderStoryCard(post);
  downloadBlob(blob, fileNameFor(post.title));
}

export async function renderStoryCard(post) {
  await ensureFonts();
  const background = await loadBackground(post.category);
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Não foi possível gerar a arte.");
  }
  drawStory(context, post, background);
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Não foi possível gerar a arte."));
      }
    }, "image/png");
  });
  return blob;
}

function drawStory(context, post, background) {
  if (background) {
    drawCover(context, background);
    const shade = context.createRadialGradient(
      WIDTH / 2,
      HEIGHT / 2,
      SQUARE * 0.15,
      WIDTH / 2,
      HEIGHT / 2,
      HEIGHT * 0.72,
    );
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.38)");
    context.fillStyle = shade;
    context.fillRect(0, 0, WIDTH, HEIGHT);
  } else {
    context.fillStyle = "#1B1A17";
    context.fillRect(0, 0, WIDTH, HEIGHT);
  }

  const cardX = (WIDTH - SQUARE) / 2;
  const cardY = (HEIGHT - SQUARE) / 2;

  context.save();
  context.shadowColor = "rgba(0,0,0,0.4)";
  context.shadowBlur = 40;
  context.shadowOffsetY = 16;
  roundRect(context, cardX, cardY, SQUARE, SQUARE, 16);
  context.fillStyle = "#FFFFFF";
  context.fill();
  context.restore();

  const pad = 44;
  const padX = cardX + pad;
  const contentW = SQUARE - pad * 2;
  let cursor = cardY + 48;
  const footerTop = cardY + SQUARE - 72;

  const title = fitWrappedText(
    context,
    post.title || "Finis",
    contentW,
    3,
    46,
    30,
    700,
  );
  context.fillStyle = INK;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.letterSpacing = "0px";
  context.font = `700 ${title.size}px "Bricolage Grotesque", sans-serif`;
  title.lines.forEach((line) => {
    context.fillText(line, padX, cursor);
    cursor += Math.round(title.size * 1.08);
  });

  if (post.subtitle) {
    cursor += 10;
    context.font = "400 22px Inter, sans-serif";
    context.fillStyle = MUTED;
    wrapText(context, post.subtitle, contentW, 1).forEach((line) => {
      context.fillText(line, padX, cursor);
      cursor += 30;
    });
  }

  if (post.rating > 0 || post.isMasterpiece) {
    cursor += 18;
    drawRating(
      context,
      padX,
      cursor,
      Number(post.rating) || 0,
      post.isMasterpiece,
    );
    cursor += 46;
  }

  if (post.postedAt) {
    cursor += 8;
    context.letterSpacing = "0.14em";
    context.font = "600 13px Inter, sans-serif";
    context.fillStyle = BURGUNDY;
    context.fillText("TERMINEI EM", padX, cursor);
    context.letterSpacing = "0px";
    cursor += 22;
    context.font = '600 28px "Bricolage Grotesque", sans-serif';
    context.fillStyle = INK;
    context.fillText(fitLine(context, post.postedAt, contentW), padX, cursor);
    cursor += 40;
  }

  if (cursor < footerTop - 40) {
    cursor += 4;
    context.strokeStyle = RULE;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(padX, cursor);
    context.lineTo(padX + 64, cursor);
    context.stroke();
    cursor += 18;

    const lineHeight = 30;
    const excerptLines = Math.max(
      0,
      Math.min(4, Math.floor((footerTop - cursor - 8) / lineHeight)),
    );
    const excerpt = clipText(post.description, 180);
    if (excerpt && excerptLines > 0) {
      context.font = "italic 400 22px Inter, sans-serif";
      context.fillStyle = INK_SOFT;
      wrapText(context, `“${excerpt}”`, contentW, excerptLines).forEach(
        (line) => {
          context.fillText(line, padX, cursor);
          cursor += lineHeight;
        },
      );
    }
  }

  context.strokeStyle = RULE;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(padX, footerTop);
  context.lineTo(padX + contentW, footerTop);
  context.stroke();

  context.font = "500 18px Inter, sans-serif";
  context.fillStyle = MUTED;
  context.textBaseline = "middle";
  context.fillText(
    fitLine(context, authorSignature(post), contentW * 0.62),
    padX,
    footerTop + 32,
  );
  context.textAlign = "right";
  context.fillStyle = BURGUNDY;
  context.font = '700 18px "Bricolage Grotesque", sans-serif';
  context.fillText("finis", padX + contentW, footerTop + 32);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.letterSpacing = "0px";
}

async function loadBackground(category) {
  const src = BACKGROUNDS[category] || BACKGROUNDS.books;
  if (!backgroundCache.has(src)) {
    backgroundCache.set(
      src,
      loadImage(src).catch((error) => {
        backgroundCache.delete(src);
        throw error;
      }),
    );
  }

  try {
    return await backgroundCache.get(src);
  } catch {
    return null;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Fundo indisponível"));
    image.src = src;
  });
}

function drawCover(context, image) {
  const scale = Math.max(WIDTH / image.width, HEIGHT / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(
    image,
    (WIDTH - width) / 2,
    (HEIGHT - height) / 2,
    width,
    height,
  );
}

function drawRating(context, x, y, rating, masterpiece) {
  const outer = 16;
  const inner = 6.6;
  const step = 40;
  for (let index = 0; index < 5; index += 1) {
    const cx = x + outer + index * step;
    const cy = y + outer + 4;
    const amount = masterpiece ? 1 : Math.min(1, Math.max(0, rating - index));
    drawStar(context, cx, cy, outer, inner, STAR_EMPTY);
    if (amount > 0) {
      context.save();
      context.beginPath();
      context.rect(
        cx - outer - 2,
        cy - outer - 2,
        (outer * 2 + 4) * amount,
        outer * 2 + 4,
      );
      context.clip();
      drawStar(context, cx, cy, outer, inner, GOLD);
      context.restore();
    }
  }

  if (!masterpiece) {
    return;
  }

  const cx = x + outer + 5 * step + 8;
  const cy = y + outer + 4;
  drawStar(context, cx, cy, outer, inner, MASTERPIECE);
  context.font = "600 18px Inter, sans-serif";
  context.fillStyle = MASTERPIECE;
  context.textBaseline = "middle";
  context.fillText("(obra prima)", cx + outer + 16, cy + 1);
  context.textBaseline = "top";
}

function drawStar(context, cx, cy, outer, inner, fill) {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const radius = point % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (point === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }
  context.closePath();
  context.fillStyle = fill;
  context.fill();
}

function fitWrappedText(
  context,
  text,
  maxWidth,
  maxLines,
  startSize,
  minSize,
  weight,
) {
  let size = startSize;
  let lines = [];
  while (size >= minSize) {
    context.font = `${weight} ${size}px "Bricolage Grotesque", sans-serif`;
    lines = wrapText(context, text, maxWidth, maxLines);
    const truncated = lines.some((line) => line.endsWith("…"));
    if (!truncated || size === minSize) {
      break;
    }
    size -= 4;
  }
  return { size, lines };
}

function wrapText(context, text, maxWidth, maxLines) {
  const tokens = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .flatMap((word) => breakToken(context, word, maxWidth));

  if (!tokens.length || maxLines <= 0) {
    return [];
  }

  const lines = [];
  let current = "";
  let index = 0;

  while (index < tokens.length && lines.length < maxLines) {
    const next = current ? `${current} ${tokens[index]}` : tokens[index];
    if (context.measureText(next).width <= maxWidth) {
      current = next;
      index += 1;
      continue;
    }

    const isLastLine = lines.length === maxLines - 1;
    if (!current || (isLastLine && index < tokens.length)) {
      lines.push(withEllipsis(context, current || tokens[index], maxWidth));
      return lines;
    }

    lines.push(current);
    current = "";
  }

  if (current) {
    lines.push(
      index < tokens.length
        ? withEllipsis(context, current, maxWidth)
        : current,
    );
  }

  return lines.slice(0, maxLines);
}

function breakToken(context, word, maxWidth) {
  if (context.measureText(word).width <= maxWidth) {
    return [word];
  }
  const parts = [];
  let chunk = "";
  for (const char of word) {
    const next = chunk + char;
    if (context.measureText(next).width <= maxWidth) {
      chunk = next;
    } else {
      if (chunk) {
        parts.push(chunk);
      }
      chunk = char;
    }
  }
  if (chunk) {
    parts.push(chunk);
  }
  return parts;
}

function withEllipsis(context, line, maxWidth) {
  const ellipsis = "…";
  let result = line.trimEnd();
  if (!result) {
    return ellipsis;
  }
  if (context.measureText(`${result}${ellipsis}`).width <= maxWidth) {
    return `${result}${ellipsis}`;
  }
  while (
    result &&
    context.measureText(`${result}${ellipsis}`).width > maxWidth
  ) {
    result = result.slice(0, -1);
  }
  return `${result.trimEnd()}${ellipsis}`;
}

function fitLine(context, text, maxWidth) {
  if (context.measureText(text).width <= maxWidth) {
    return text;
  }
  return withEllipsis(context, text, maxWidth);
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function authorSignature(post) {
  const nickname = post.author?.nickname || "";
  if (nickname && !nickname.includes("ainda não")) {
    return nickname;
  }
  return post.author?.name || "Finis";
}

function clipText(text, max) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean || clean.length <= max) {
    return clean;
  }
  const sliced = clean.slice(0, max);
  const cut = sliced.lastIndexOf(" ");
  const base = cut > 40 ? sliced.slice(0, cut) : sliced;
  return `${base.trim()}…`;
}

function fileNameFor(title) {
  const slug = String(title || "finis")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `finis-${slug || "review"}.png`;
}

async function ensureFonts() {
  if (!document.fonts?.load) {
    return;
  }
  await Promise.all([
    document.fonts.load('700 84px "Bricolage Grotesque"'),
    document.fonts.load('600 36px "Bricolage Grotesque"'),
    document.fonts.load("600 20px Inter"),
    document.fonts.load("italic 400 32px Inter"),
    document.fonts.ready,
  ]);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
