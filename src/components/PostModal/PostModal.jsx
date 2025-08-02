import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import CreatableSelect from 'react-select/creatable';
import TiptapEditor from '../TiptapEditor/TiptapEditor';
import { useSocketContext } from '../../context/SocketProvider';
import { useSelector, useDispatch  } from 'react-redux';
import { userSelector } from '../../reducers/user.slice.js';
import { uploadImageToCloudinary } from '../../utils/uploadImage.js';
import { toast } from 'react-toastify';
import { FiX, FiSave } from 'react-icons/fi';
import styles from './PostModal.module.scss';
import { fetchPosts } from '../../reducers/post.slice';

export function PostModal({ mode, initialData = {}, onClose }) {
  const { socket, ready } = useSocketContext();
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [tags, setTags] = useState(
    (initialData.tags || []).map(t => ({ value: t, label: t }))
  );
  const [availableTags, setAvailableTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // Carica i tag alla apertura della modal
  useEffect(() => {
    if (!socket || !ready) return;
    socket.emit(
      'GET_TAGS',
      { name: '', cursor: null, direction: 'next', limit: 50 },
      res => {
        if (res?.success) {
          setAvailableTags(res.data.tags.map(t => ({ value: t, label: t })));
        } else {
          console.error('Errore GET_TAGS:', res?.error);
        }
      }
    );
  }, [socket, ready]);

  // Ascolta broadcast POST_CREATED / POST_UPDATED
  useEffect(() => {
    if (!socket) return;
    const created = newPost => {
      if (newPost.authorId === user.id) {
        toast.success('Post creato!');
        onClose();
      }
    };
    const updated = updatedPost => {
      if (updatedPost.authorId === user.id) {
        toast.success('Post aggiornato!');
        onClose();
      }
    };
    socket.on('POST_CREATED', created);
    socket.on('POST_UPDATED', updated);
    return () => {
      socket.off('POST_CREATED', created);
      socket.off('POST_UPDATED', updated);
    };
  }, [socket, user.id, onClose]);

  const handleSubmit = async () => {
    if (!socket || !ready) {
      return toast.error(
        'Connessione WebSocket non disponibile. Attendi qualche secondo e riprova.'
      );
    }
    if (title.trim().length < 3) {
      return toast.error('Titolo troppo corto (min 3 caratteri)');
    }
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (plainText.length < 10) {
      return toast.error('Contenuto troppo breve (min 10 caratteri)');
    }

    // Upload immagine
    let imageUrl = initialData.image || '';
    if (imageFile) {
      try {
        imageUrl = await uploadImageToCloudinary(imageFile);
      } catch (err) {
        return toast.error('Upload immagine fallito: ' + err.message);
      }
    }

    // Prepara payload, data sempre "adesso"
    const payload = {
      ...(mode === 'edit' && { postId: initialData.id }),
      title,
      content,
      publishDate: Date.now(),
      image: imageUrl,
      tags: tags.map(t => t.value),
    };

    const eventName = mode === 'create' ? 'createPost' : 'UPDATE_POST';
    socket.emit(eventName, payload, res => {
      if (res?.success) {
        toast.success(mode === 'create' ? 'Post creato!' : 'Post aggiornato!');
        onClose();
        dispatch(fetchPosts({ limit: 100 }));
      } else {
        toast.error(res?.error?.message || 'Errore sul server');
      }
    });
  };

  return (
    <Modal onClose={onClose} className={styles['post-modal']}>
      <h2 className={styles['post-modal__header']}>
        {mode === 'create' ? 'Nuovo Post' : 'Modifica Post'}
      </h2>
      <div className={styles['post-modal__body']}>
        <label className={styles['post-modal__field']}>
          <span>Titolo</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </label>

        <label className={styles['post-modal__field']}>
          <span>Contenuto</span>
          <TiptapEditor value={content} onChange={setContent} />
        </label>

        {/* Data di pubblicazione rimossa: sempre data corrente */}

        <label className={styles['post-modal__field']}>
          <span>Tag</span>
          <CreatableSelect
            isMulti
            options={availableTags}
            value={tags}
            onChange={setTags}
            placeholder="Seleziona o crea tag…"
          />
        </label>

        <label className={styles['post-modal__field']}>
          <span>Immagine</span>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
          />
        </label>
      </div>
      <div className={styles['post-modal__actions']}>
        <button
          className={`${styles.btn} ${styles['btn--secondary']}`}
          onClick={onClose}
        >
          <FiX className={styles.icon} /> Annulla
        </button>
        <button
          className={`${styles.btn} ${styles['btn--primary']}`}
          onClick={handleSubmit}
          disabled={!ready}
        >
          <FiSave className={styles.icon} />{' '}
          {mode === 'create' ? 'Crea' : 'Aggiorna'}
        </button>
      </div>
    </Modal>
  );
}
