import React, { useEffect, useState } from 'react';
import styles from './HomePage.module.scss';
import { useSocketContext } from '../../context/SocketProvider';
import PostCard from '../../components/PostCard/PostCard.jsx';

const HomePage = () => {
  const { socket, ready } = useSocketContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!ready) {
      console.log('[DEBUG] Socket non ancora disponibile, attendo...');
      return;
    }

    setLoading(true);
    console.log('[DEBUG] Socket pronto, invio GET_POSTS');

    socket.emit(
      'GET_POSTS',
      { cursor: null, direction: 'next', limit: 10 },
      (res) => {
        console.log('[DEBUG] Risposta GET_POSTS:', res);

        if (res?.success) {
          console.log('[DEBUG] GET_POSTS OK', res.data.posts);
          setPosts(res.data.posts);
        } else {
          console.error('Errore nel recupero dei post:', res?.error);
        }

        setLoading(false);
      }
    );

    // opzionale: pulisci listener se l'evento fosse persistente
    // return () => {
    //   socket.off('GET_POSTS');
    // };
  }, [socket, ready]);

  useEffect(() => {
    
    if (!ready) return;
    const onNew = (newPost) => {
      setPosts(prev => [newPost, ...prev]);
    };
    socket.on('POST_CREATED', onNew);
    return () => {
      socket.off('POST_CREATED', onNew);
    };
  }, [socket, ready]);

  return (
    <div className={styles.container}>
      {loading ? (
        <p>Caricamento post...</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};

export default HomePage;