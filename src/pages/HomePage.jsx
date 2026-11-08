import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "../components/feed/PostCard.jsx";
import FeedFilters from "../components/feed/FeedFilters.jsx";
import * as feedApi from "../api/feed.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { reviewToPost } from "../utils/reviewPost.js";
import styles from "./HomePage.module.css";

function HomePage() {
  const { token } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const loadMoreRef = useRef(null);

  const fetchFeed = useCallback(
    async ({ cursor = null, append = false } = {}) => {
      if (!token) {
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setStatus("loading");
        setErrorMessage("");
      }

      try {
        const response = await feedApi.getFriendsFeed(token, {
          cursor,
          categories: selectedCategories,
        });

        const mappedPosts = (response.items ?? []).map(reviewToPost);

        setPosts((previous) =>
          append ? [...previous, ...mappedPosts] : mappedPosts,
        );
        setNextCursor(response.nextCursor ?? null);
        setHasMore(Boolean(response.hasMore));
        setStatus("success");
      } catch (error) {
        if (append) {
          setErrorMessage(error.message);
        } else {
          setPosts([]);
          setNextCursor(null);
          setHasMore(false);
          setStatus("error");
          setErrorMessage(error.message);
        }
      } finally {
        setIsLoadingMore(false);
      }
    },
    [selectedCategories, token],
  );

  useEffect(() => {
    fetchFeed({ cursor: null, append: false });
  }, [fetchFeed]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || status !== "success" || isLoadingMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          fetchFeed({ cursor: nextCursor, append: true });
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchFeed, hasMore, isLoadingMore, nextCursor, status]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId],
    );
  };

  const hasActiveFilters = selectedCategories.length > 0;

  return (
    <div className={styles.layout}>
      <section className={styles.feed}>
        <header className={styles.feedHeader}>
          <div>
            <h1>Seu feed</h1>
            <p>O que seus amigos andam lendo, vendo e jogando.</p>
          </div>
          <span className={styles.feedCount}>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </header>

        <div className={styles.posts}>
          {status === "loading" && (
            <div className={styles.empty} aria-live="polite">
              <h3>Carregando feed...</h3>
              <p>Buscando as reviews mais recentes dos seus amigos.</p>
            </div>
          )}

          {status === "error" && (
            <div className={styles.empty} aria-live="assertive">
              <h3>Não foi possível carregar o feed.</h3>
              <p>{errorMessage}</p>
            </div>
          )}

          {status === "success" &&
            posts.length > 0 &&
            posts.map((post) => <PostCard key={post.id} post={post} />)}

          {status === "success" && posts.length === 0 && (
            <div className={styles.empty}>
              {hasActiveFilters ? (
                <>
                  <h3>Nenhum post bate com esses filtros.</h3>
                  <p>Tente marcar outras categorias ou tipos de review.</p>
                </>
              ) : (
                <>
                  <h3>Nenhum post por aqui ainda.</h3>
                  <p>
                    Quando seus amigos publicarem reviews, elas aparecerão aqui.
                  </p>
                </>
              )}
            </div>
          )}

          {status === "success" && hasMore && (
            <div
              ref={loadMoreRef}
              className={styles.loadMore}
              aria-live="polite"
            >
              {isLoadingMore
                ? "Carregando mais posts..."
                : "Role para carregar mais"}
            </div>
          )}

          {status === "success" && errorMessage && (
            <div className={styles.empty} aria-live="assertive">
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
      </section>

      <FeedFilters
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
      />
    </div>
  );
}

export default HomePage;
