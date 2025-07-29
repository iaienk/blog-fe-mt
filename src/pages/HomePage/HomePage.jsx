import React, { useEffect, useMemo } from "react";
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

  // Ordina per data discendente: trasformo publishDate in millisecondi
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const timeA = new Date(a.publishDate).getTime();
      const timeB = new Date(b.publishDate).getTime();
      return timeB - timeA;  // post più recente (timeB grande) prima
    });
  }, [posts]);

  if (status === "loading")               return <p>Caricamento post…</p>;
  if (status === "failed")                return <p>Errore: {error}</p>;
  if (status === "succeeded" && posts.length === 0)
                                           return <p>Nessun post</p>;

  return (
    <div className={styles.list}>
      {sortedPosts.map((p) => (
        <PostCard post={p} key={p.id} />
      ))}
    </div>
  );
}