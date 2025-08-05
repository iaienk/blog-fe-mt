// src/pages/HomePage/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus,
  selectPostsError,
  postDeleted,
} from "../../reducers/post.slice";
import PostCard from "../../components/PostCard/PostCard";
import DetailPostPage from "../../components/DetailPostPage/DetailPostPage";
import { PostModal } from "../../components/PostModal/PostModal";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const dispatch    = useDispatch();
  const posts       = useSelector(selectAllPosts);
  const status      = useSelector(selectPostsStatus);
  const error       = useSelector(selectPostsError);

  const [detailPost,   setDetailPost]   = useState(null);
  const [editingPost,  setEditingPost]  = useState(null);

  // 1) fetch on mount
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts({ limit: 100 }));
    }
  }, [dispatch, status]);

  // 2) sorted posts
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)),
    [posts]
  );

  // 3) Handlers
  const handleViewDetail = post => setDetailPost(post);

  const handleCloseDetail = () => setDetailPost(null);

  const handleCloseModal = () => {
    setEditingPost(null);
    dispatch(fetchPosts({ limit: 100 }));
  };

  // **NUOVO**: quando un post viene cancellato
  const handleDelete = postId => {
    dispatch(postDeleted(postId));
    // se stiamo guardando il dettaglio di quel post, chiudi il modal di dettaglio
    if (detailPost?.id === postId) {
      setDetailPost(null);
    }
  };

  // 4) UI states
  if (status === "loading")   return <p>Caricamento post…</p>;
  if (status === "failed")    return <p>Errore: {error}</p>;
  if (status === "succeeded" && posts.length === 0)
                               return <p>Nessun post</p>;

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {sortedPosts.map(p => (
          <PostCard
            key={p.id}
            post={p}
            onViewDetail={handleViewDetail}
            onEdit={post => setEditingPost(post)}
            onDelete={handleDelete}            // passa onDelete a PostCard
          />
        ))}
      </div>

      {detailPost && (
        <DetailPostPage
          post={detailPost}
          onClose={handleCloseDetail}
          onDelete={handleDelete}            // passa onDelete anche a DetailPostPage
        />
      )}

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
