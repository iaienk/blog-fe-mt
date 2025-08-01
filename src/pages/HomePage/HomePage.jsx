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
  const posts    = useSelector(selectAllPosts);
  const status   = useSelector(selectPostsStatus);
  const error    = useSelector(selectPostsError);

  useEffect(() => {
   if (status === "idle") {
     dispatch(fetchPosts({ limit: 100 }));
   }
    
  }, [dispatch, status]);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.publishDate).getTime() -
          new Date(a.publishDate).getTime()
      ),
    [posts]
  );

  if (status === "loading")             return <p>Caricamento post…</p>;
  if (status === "failed")              return <p>Errore: {error}</p>;
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
