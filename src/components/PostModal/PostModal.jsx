import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import CreatableSelect from 'react-select/creatable';
import TiptapEditor from '../TiptapEditor/TiptapEditor';
import { useSocketContext } from '../../context/SocketProvider';
import { useSelector } from 'react-redux';
import { userSelector } from '../../reducers/user.slice.js';
import { uploadImageToCloudinary } from '../../utils/uploadImage.js';
import { toast } from 'react-toastify';
import { FiX, FiSave } from 'react-icons/fi';
import styles from './PostModal.module.scss';

export function PostModal({ mode, initialData = {}, onClose }) {
  const { socket, ready } = useSocketContext();
  const user = useSelector(userSelector);

  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [publishDate, setPublishDate] = useState(
    initialData.publishDate ? new Date(initialData.publishDate) : new Date()
  );
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
          setAvailableTags(
            res.data.tags.map(t => ({ value: t, label: t }))
          );
        } else {
          console.error('Errore GET_TAGS:', res?.error);
        }
      }
    );
  }, [socket, ready]);

  // Ascolta broadcast POST_CREATED per CREATE_POST
  useEffect(() => {
    if (!socket) return;
    const handlePostCreated = newPost => {
      if (newPost.authorId === user.id) {
        toast.success('Post creato!');
        onClose();
      }
    };
    socket.on('POST_CREATED', handlePostCreated);
    return () => {
      socket.off('POST_CREATED', handlePostCreated);
    };
  }, [socket, user.id, onClose]);

  const handleSubmit = async () => {
  console.log('[DEBUG] handleSubmit chiamata');

  if (!socket || !ready) {
    console.log('[DEBUG] Socket non pronto');
    return toast.error(
      'Connessione WebSocket non disponibile. Attendi qualche secondo e riprova.'
    );
  }

  if (title.trim().length < 3) {
    console.log('[DEBUG] Titolo troppo corto:', title);
    return toast.error('Titolo troppo corto (min 3 caratteri)');
  }

  const plainText = content.replace(/<[^>]+>/g, '').trim();
  console.log('[DEBUG] Contenuto plainText:', plainText);

  if (plainText.length < 10) {
    console.log('[DEBUG] Contenuto troppo breve:', plainText);
    return toast.error('Contenuto troppo breve (min 10 caratteri)');
  }

  // se arrivi qui, sei passato
  console.log('[DEBUG] Validazione superata, proseguo con submit');

    // Upload immagine
    let imageUrl = initialData.image || '';
    if (imageFile) {
      try {
        imageUrl = await uploadImageToCloudinary(imageFile);
      } catch (err) {
        return toast.error('Upload immagine fallito: ' + err.message);
      }
    }

    // Prepara payload coerente con spec
    const payload = {
      ...(mode === 'edit' && { postId: initialData.id }),
      title,
      content,
      publishDate: publishDate.getTime(),
      image: imageUrl,
      tags: tags.map(t => t.value),
      // authorId: user.id,
      // userIds: [user.id],
    };

    const eventName = mode === 'create' ? 'CREATE_POST' : 'UPDATE_POST';

    console.log('[DEBUG] Emitting', eventName, payload);

    socket.emit(eventName, payload, res => {
      console.log('[DEBUG] Emitting', eventName, payload);
      if (res?.success) {
        toast.success(mode === 'create' ? 'Post creato!' : 'Post aggiornato!');
        onClose();
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
        <label className={styles['post-modal__field']}>
          <span>Data di pubblicazione</span>
          <input
            type="date"
            value={publishDate.toISOString().slice(0, 10)}
            onChange={e => setPublishDate(new Date(e.target.value))}
          />
        </label>
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
          onClick={() => {
              console.log('CLICK BUTTON');
              handleSubmit();
            }}
            disabled={!ready}
        >
          <FiSave className={styles.icon} />{' '}
          {mode === 'create' ? 'Crea' : 'Aggiorna'}
        </button>
      </div>
    </Modal>
  );
}
