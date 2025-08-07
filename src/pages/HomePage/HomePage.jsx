// src/pages/HomePage/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector }        from "react-redux";
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus,
  selectPostsError,
  postDeleted,
} from "../../reducers/post.slice";
import PostCard       from "../../components/PostCard/PostCard";
import DetailPostPage from "../../components/DetailPostPage/DetailPostPage";
import { PostModal }  from "../../components/PostModal/PostModal";
import styles         from "./HomePage.module.scss";

export default function HomePage() {
  const dispatch = useDispatch();
  const posts    = useSelector(selectAllPosts);
  const status   = useSelector(selectPostsStatus);
  const error    = useSelector(selectPostsError);

  const [detailPost,  setDetailPost]  = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const perPage    = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(posts.length / perPage);

  // fetch on mount
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts({ limit: 100 }));
    }
  }, [dispatch, status]);

  // ordino: più recenti prima
  const sorted = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      ),
    [posts]
  );

  const pagedPosts = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  // scroll to top ad ogni cambio pagina
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // handler paginazione
  const goFirst = () => setPage(1);
  const goPrev  = () => setPage(p => Math.max(p - 1, 1));
  const goNext  = () => setPage(p => Math.min(p + 1, totalPages));
  const goLast  = () => setPage(totalPages);

  // handlers dettaglio / modale / delete
  const handleViewDetail  = p => setDetailPost(p);
  const handleCloseDetail = () => setDetailPost(null);
  const handleCloseModal  = () => {
    setEditingPost(null);
    dispatch(fetchPosts({ limit: 100 }));
  };
  const handleDelete = id => {
    dispatch(postDeleted(id));
    if (detailPost?.id === id) setDetailPost(null);
  };

  // stati UI
  if (status === "loading")   return <p>Caricamento post…</p>;
  if (status === "failed")    return <p>Errore: {error}</p>;
  if (status === "succeeded" && posts.length === 0)
                               return <p>Nessun post</p>;

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {pagedPosts.map(p => (
          <PostCard
            key={p.id}
            post={p}
            onViewDetail={handleViewDetail}
            onEdit={setEditingPost}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <div className={styles.pagination}>
        <button onClick={goFirst} disabled={page === 1}>
          « Prima
        </button>
        <button onClick={goPrev} disabled={page === 1}>
          ← Precedente
        </button>
        <span>
          Pagina {page} di {totalPages}
        </span>
        <button onClick={goNext} disabled={page === totalPages}>
          Successiva →
        </button>
        <button onClick={goLast} disabled={page === totalPages}>
          Ultima »
        </button>
      </div>

      {detailPost && (
        <DetailPostPage
          post={detailPost}
          onClose={handleCloseDetail}
          onDelete={handleDelete}
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
