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
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const dispatch = useDispatch();
  const posts  = useSelector(selectAllPosts);
  const status = useSelector(selectPostsStatus);
  const error  = useSelector(selectPostsError);

  // Stato per la modal di dettaglio
  const [detailPost, setDetailPost] = useState(null);

  // Carica i post al mount
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts({ limit: 100 }));
    }
  }, [dispatch, status]);

  // Ordinamento più recente → più vecchio
  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.publishDate).getTime() -
          new Date(a.publishDate).getTime()
      ),
    [posts]
  );

  // Apre la modal di dettaglio
  const handleViewDetail = (post) => {
    setDetailPost(post);
  };

  // Chiude la modal e ricarica i post
  const handleCloseModal = () => {
    setDetailPost(null);
    // Ricarica i post dal server
    dispatch(fetchPosts({ limit: 100 }));
  };

  // Stati di caricamento / errore
  if (status === "loading") return <p>Caricamento post…</p>;
  if (status === "failed")  return <p>Errore: {error}</p>;
  if (status === "succeeded" && posts.length === 0)
    return <p>Nessun post</p>;

  return (
    <div className={styles.list}>
      {sortedPosts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onViewDetail={handleViewDetail}
        />
      ))}

      {/* Modal di dettaglio */}
      {detailPost && (
        <DetailPostPage
          post={detailPost}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
