import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus,
  selectPostsError,
} from "../../reducers/post.slice";
import PostCard from "../../components/PostCard/PostCard";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  const dispatch = useDispatch();
  const posts  = useSelector(selectAllPosts);
  const status = useSelector(selectPostsStatus);
  const error  = useSelector(selectPostsError);

  console.log("🏷️ HomePage render, status:", status, "posts:", posts.length);

  useEffect(() => {
    console.log("➡️ useEffect: status è", status);
    if (status === "idle") {
      console.log("🎬 dispatch(fetchPosts)");
      dispatch(fetchPosts());
    }
  }, [dispatch, status]);

  if (status === "loading") return <p>Caricamento post…</p>;
  if (status === "failed")  return <p>Errore: {error}</p>;
  if (status === "succeeded" && posts.length === 0) return <p>Nessun post</p>;

  return (
    <div className={styles.list}>
      {posts.map((p) => (
        <PostCard post={p} key={p.id} />
      ))}
    </div>
  );
}