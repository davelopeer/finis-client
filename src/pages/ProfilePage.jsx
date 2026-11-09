import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resolveApiAssetUrl } from "../api/client.js";
import * as profileApi from "../api/profile.js";
import * as reviewsApi from "../api/reviews.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import WorkListEditor from "../components/profile/WorkListEditor.jsx";
import PostCard from "../components/feed/PostCard.jsx";
import ReviewForm from "../components/review/ReviewForm.jsx";
import { currentUser, MEDIA_CATEGORIES } from "../data/mockData.js";
import { reviewToPost, sortPostsByFinishedAt } from "../utils/reviewPost.js";
import styles from "./ProfilePage.module.css";

const profileTabs = [
  { id: "posts", label: "Finis" },
  { id: "top", label: "Top 5" },
  { id: "next", label: "Próximas" },
  { id: "about", label: "Sobre" },
];

// groupWorksByMedia buckets a flat (already media+position ordered) work list
// into per-media arrays keyed by media id.
function groupWorksByMedia(works) {
  const grouped = {};
  for (const work of works ?? []) {
    (grouped[work.mediaType] ??= []).push(work);
  }
  return grouped;
}

/**
 * WorksTab renders a per-media-type set of ordered lists (Top 5 or Próximas).
 * On the owner's profile it shows one list per enabled media so each can be
 * curated; on other profiles it shows only the medias that actually have works.
 */
function WorksTab({ works, medias, isOwnProfile, onSave, emptyLabel }) {
  const grouped = groupWorksByMedia(works);
  const visibleMedias = isOwnProfile
    ? medias
    : medias.filter((media) => (grouped[media.id] ?? []).length > 0);

  if (visibleMedias.length === 0) {
    return (
      <section className={styles.emptyState}>
        <h3>{emptyLabel}</h3>
      </section>
    );
  }

  return (
    <div className={styles.worksGroups}>
      {visibleMedias.map((media) => (
        <div key={media.id} className={styles.worksMedia}>
          <h4 className={styles.worksMediaTitle} style={{ color: media.color }}>
            {media.label}
          </h4>
          <WorkListEditor
            items={grouped[media.id] ?? []}
            editable={isOwnProfile}
            mediaType={media.id}
            mediaLabel={media.label}
            emptyLabel={`Nenhuma obra de ${media.label.toLowerCase()} ainda.`}
            onChange={(items) => onSave(media.id, items)}
          />
        </div>
      ))}
    </div>
  );
}

function profileToUser(profile, fallbackUser) {
  const usernameLabel = profile.username
    ? `@${profile.username}`
    : "Username ainda não definido";

  return {
    ...fallbackUser,
    id: profile.id,
    name: profile.displayName,
    nickname: usernameLabel,
    avatarUrl: resolveApiAssetUrl(profile.profileImageUrl),
    bio: profile.description ?? "Esse perfil ainda não tem descrição.",
    interests: fallbackUser.interests,
    mediaPreferences: Array.isArray(profile.mediaPreferences)
      ? profile.mediaPreferences
      : null,
  };
}

function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [activeFilters, setActiveFilters] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const isOwnProfile = !username;

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setStatus("loading");
      setErrorMessage("");

      try {
        if (username) {
          const profileData = await profileApi.getProfileByUsername(username);
          if (!isMounted) {
            return;
          }

          setProfile(profileData);

          const reviewsData = await reviewsApi.getProfileReviews(username);
          if (isMounted) {
            setReviews(
              sortPostsByFinishedAt(
                (reviewsData.items ?? []).map(reviewToPost),
              ),
            );
            setStatus("success");
          }
          return;
        }

        const [profileData, reviewsData] = await Promise.all([
          profileApi.getMyProfile(token),
          reviewsApi.getMyProfileReviews(token),
        ]);

        if (isMounted) {
          setProfile(profileData);
          setReviews(
            sortPostsByFinishedAt((reviewsData.items ?? []).map(reviewToPost)),
          );
          setStatus("success");
        }
      } catch (error) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(error.message);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, username]);

  const handleDeletePost = async (post) => {
    if (deletingId) {
      return;
    }
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar este Finis? Essa ação não pode ser desfeita.",
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(post.id);
    try {
      await reviewsApi.deleteReview(token, post.id);
      setReviews((previous) => previous.filter((item) => item.id !== post.id));
    } catch (error) {
      window.alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditPost = (post) => {
    setEditErrorMessage("");
    setEditingPost(post);
  };

  const handleCloseEdit = () => {
    if (isSubmittingEdit) {
      return;
    }
    setEditingPost(null);
    setEditErrorMessage("");
  };

  const handleSubmitEdit = async (payload) => {
    if (!editingPost) {
      return;
    }
    setIsSubmittingEdit(true);
    setEditErrorMessage("");
    try {
      const updated = await reviewsApi.updateReview(
        token,
        editingPost.id,
        payload,
      );
      const updatedPost = reviewToPost(updated);
      setReviews((previous) =>
        sortPostsByFinishedAt(
          previous.map((item) =>
            item.id === updatedPost.id ? updatedPost : item,
          ),
        ),
      );
      setEditingPost(null);
    } catch (error) {
      setEditErrorMessage(error.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleSaveTopWorks = async (mediaType, items) => {
    const updated = await profileApi.updateTopWorks(token, mediaType, items);
    setProfile(updated);
  };

  const handleSaveNextWorks = async (mediaType, items) => {
    const updated = await profileApi.updateNextWorks(token, mediaType, items);
    setProfile(updated);
  };

  const fallbackUser = useMemo(
    () =>
      user
        ? {
            ...currentUser,
            name: `${user.firstName} ${user.lastName}`,
            nickname: user.email,
          }
        : currentUser,
    [user],
  );
  const pageUser = profile
    ? profileToUser(profile, fallbackUser)
    : fallbackUser;

  const preferredCategories = useMemo(() => {
    const prefs = pageUser.mediaPreferences;
    if (!Array.isArray(prefs) || prefs.length === 0) {
      return MEDIA_CATEGORIES;
    }
    return MEDIA_CATEGORIES.filter((item) => prefs.includes(item.id));
  }, [pageUser.mediaPreferences]);

  const preferredCategoryIds = useMemo(
    () => preferredCategories.map((item) => item.id),
    [preferredCategories],
  );

  const visibleReviews = useMemo(() => {
    if (preferredCategoryIds.length === MEDIA_CATEGORIES.length) {
      return reviews;
    }
    return reviews.filter((review) =>
      preferredCategoryIds.includes(review.category),
    );
  }, [reviews, preferredCategoryIds]);

  const mediaCounts = useMemo(() => {
    const counts = { books: 0, movies: 0, series: 0, games: 0, comics: 0 };
    for (const review of visibleReviews) {
      if (review.category in counts) counts[review.category]++;
    }
    return counts;
  }, [visibleReviews]);

  const filteredReviews = useMemo(() => {
    if (activeFilters.length === 0) return visibleReviews;
    return visibleReviews.filter((review) =>
      activeFilters.includes(review.category),
    );
  }, [visibleReviews, activeFilters]);

  const handleFilterChange = (categoryId) => {
    setActiveFilters((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };
  if (status === "loading") {
    return (
      <section className={styles.emptyState} aria-live="polite">
        <h3>Carregando perfil...</h3>
        <p>Estamos buscando as informações mais recentes.</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className={styles.emptyState} aria-live="assertive">
        <h3>
          {username
            ? "Perfil não encontrado."
            : "Não foi possível carregar seu perfil."}
        </h3>
        <p>{errorMessage}</p>
      </section>
    );
  }

  return (
    <div className={styles.page}>
      <ProfileHeader
        user={pageUser}
        isOwnProfile={isOwnProfile}
        onEdit={() => navigate("/profile/edit")}
        mediaCounts={mediaCounts}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        mediaPreferences={pageUser.mediaPreferences}
      />

      <nav className={styles.tabs} aria-label="Seções do perfil">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "posts" && (
        <>
          {filteredReviews.length > 0 ? (
            <section className={styles.posts}>
              {filteredReviews.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  canManage={isOwnProfile}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </section>
          ) : (
            <section className={styles.emptyState}>
              {activeFilters.length > 0 ? (
                <>
                  <h3>Nenhum Finis nessa categoria.</h3>
                  <p>Tente selecionar outra mídia ou remova o filtro.</p>
                </>
              ) : (
                <>
                  <h3>Nenhum Finis por aqui ainda.</h3>
                  <p>
                    {isOwnProfile
                      ? "Publique seu primeiro Finis para montar seu histórico."
                      : "Este perfil ainda não publicou nenhum Finis."}
                  </p>
                </>
              )}
            </section>
          )}
        </>
      )}

      {activeTab === "top" && (
        <section className={styles.works}>
          <header className={styles.worksHeader}>
            <h3>Top 5</h3>
            <p>
              {isOwnProfile
                ? "Seu top 5 de cada mídia: livros, filmes, séries, jogos e HQs. Sempre público."
                : "As obras favoritas deste perfil, por tipo de mídia."}
            </p>
          </header>
          <WorksTab
            works={profile?.topWorks ?? []}
            medias={preferredCategories}
            isOwnProfile={isOwnProfile}
            onSave={handleSaveTopWorks}
            emptyLabel={
              isOwnProfile
                ? "Monte seu Top 5 adicionando a primeira obra."
                : "Este perfil ainda não montou um Top 5."
            }
          />
        </section>
      )}

      {activeTab === "next" && (
        <section className={styles.works}>
          <header className={styles.worksHeader}>
            <h3>Próximas obras</h3>
            <p>
              {isOwnProfile
                ? profile?.nextWorksPrivate
                  ? "Até 5 por mídia que você quer consumir. Visível só para você."
                  : "Até 5 por mídia que você quer consumir. Pública."
                : "As próximas obras que este perfil pretende consumir, por mídia."}
            </p>
          </header>
          {!isOwnProfile && profile?.nextWorksPrivate ? (
            <section className={styles.emptyState}>
              <h3>Lista privada.</h3>
              <p>Este perfil mantém as próximas obras em segredo.</p>
            </section>
          ) : (
            <WorksTab
              works={profile?.nextWorks ?? []}
              medias={preferredCategories}
              isOwnProfile={isOwnProfile}
              onSave={handleSaveNextWorks}
              emptyLabel={
                isOwnProfile
                  ? "Adicione a primeira obra que você quer consumir."
                  : "Este perfil ainda não listou próximas obras."
              }
            />
          )}
        </section>
      )}

      {activeTab === "about" && (
        <section className={styles.about}>
          <article>
            <h3>Interesses</h3>
            <ul className={styles.interestList}>
              {preferredCategories.map((item) => (
                <li key={item.id} className={styles.interestActive}>
                  {item.label}
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Bio</h3>
            <p>{pageUser.bio}</p>
          </article>
        </section>
      )}

      {editingPost && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={handleCloseEdit}
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <ReviewForm
              mode="edit"
              initialValues={editingPost.editValues}
              onSubmit={handleSubmitEdit}
              onCancel={handleCloseEdit}
              isSubmitting={isSubmittingEdit}
              errorMessage={editErrorMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
