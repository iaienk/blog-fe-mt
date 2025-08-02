// src/pages/HomePage/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus,
  selectPostsError,
} from "../../reducers/post.slice";
import PostCard from "../../components/PostCard/PostCard";
import DetailPostPage from "../../components/DetailPostPage/DetailPostPage";
import { PostModal } from "../../components/PostModal/PostModal";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const dispatch = useDispatch();
  const posts    = useSelector(selectAllPosts);
  const status   = useSelector(selectPostsStatus);
  const error    = useSelector(selectPostsError);

  // per aprire il detail modal
  const [detailPost, setDetailPost] = useState(null);
  // per aprire il create/edit modal
  const [editingPost, setEditingPost] = useState(null);

  // Carica i post al mount o quando lo status torna idle
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts({ limit: 100 }));
    }
  }, [dispatch, status]);

  // Ordina post per data di pubblicazione (più recente → più vecchio)
  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.publishDate).getTime() -
          new Date(a.publishDate).getTime()
      ),
    [posts]
  );

  // Handlers
  const handleViewDetail = (post) => {
    setDetailPost(post);
  };

  // chiude TUTTE le modal e ricarica i post
  const handleCloseModal = () => {
    setDetailPost(null);
    setEditingPost(null);
    dispatch(fetchPosts({ limit: 100 }));
  };

  // Stati di caricamento / errore / vuoto
  if (status === "loading") return <p>Caricamento post…</p>;
  if (status === "failed")  return <p>Errore: {error}</p>;
  if (status === "succeeded" && posts.length === 0) return <p>Nessun post</p>;

  return (
    <div className={styles.container}>
      {/* Navbar già gestisce "Nuovo Post" */}

      {/* Lista dei post */}
      <div className={styles.list}>
        {sortedPosts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            onViewDetail={handleViewDetail}
            onEdit={(post) => setEditingPost(post)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {detailPost && (
        <DetailPostPage
          post={detailPost}
          onClose={handleCloseModal}
        />
      )}

      {/* Create/Edit Modal */}
      {editingPost && (
        <PostModal
          mode={editingPost.id ? "edit" : "create"}
          initialData={editingPost}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
