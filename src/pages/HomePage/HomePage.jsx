import React, { useEffect, useState } from 'react';
import styles from './HomePage.module.scss';
import { getSocket } from '../../socket.js';
import PostCard from '../../components/PostCard/PostCard.jsx'; 

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPosts = () => {
    const tryEmit = () => {
      const socket = getSocket();
      if (!socket) {
        console.log('[DEBUG] Socket non ancora disponibile, ritento tra 300ms...');
        return setTimeout(tryEmit, 300); // ⏳ ritenta finché non c'è
      }

      console.log('[DEBUG] Socket pronto, invio GET_POSTS');

      socket.emit('GET_POSTS', { cursor: null, direction: 'next', limit: 10 }, (res) => {
        console.log('[DEBUG] Risposta GET_POSTS:', res);

        if (res?.success) {
          console.log('[DEBUG] GET_POSTS OK', res.data.posts);
          setPosts(res.data.posts);
        } else {
          console.error('Errore nel recupero dei post:', res?.error);
        }

        setLoading(false);
      });
    };

    tryEmit();
  };

  fetchPosts();
}, []);

  return (
    <div className={styles.container}>
      {loading ? (
        <p>Caricamento post...</p>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
};

export default HomePage;