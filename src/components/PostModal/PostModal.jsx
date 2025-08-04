// src/components/PostModal/PostModal.jsx
import React, { useState, useEffect } from 'react';
import Modal                       from '../Modal/Modal';
import CreatableSelect             from 'react-select/creatable';
import TiptapEditor                from '../TiptapEditor/TiptapEditor';
import { useSocketContext }        from '../../context/SocketProvider';
import { useSocketEmit }           from '../../hooks/useSocketEmit';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector }            from '../../reducers/user.slice.js';
import { fetchPosts }              from '../../reducers/post.slice';
import { uploadImageToCloudinary } from '../../utils/uploadImage.js';
import { toast }                   from 'react-toastify';
import { FiX, FiSave }             from 'react-icons/fi';
import styles                      from './PostModal.module.scss';

export function PostModal({ mode, initialData = {}, onClose }) {
  const { socket, ready } = useSocketContext();
  const { getTags }       = useSocketEmit();
  const user              = useSelector(userSelector);
  const dispatch          = useDispatch();

  // form state
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [selectedTags, setSelectedTags] = useState(
    (initialData.tags || []).map(t => ({ value: t, label: `#${t}` }))
  );
  const [tagOptions, setTagOptions] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');           // for CreatableSelect input
  const [imageFile, setImageFile] = useState(null);

 useEffect(() => {
   if (!ready) return;

   // se il campo è vuoto, azzeriamo le opzioni e non facciamo fetch
   if (inputValue.trim() === '') {
     setTagOptions([]);
     setTagsLoading(false);
     return;
   }

   // debounce di 500ms
   const timer = setTimeout(() => {
     setTagsLoading(true);
     getTags({ name: inputValue, cursor: null, direction: 'next', limit: 50 })
       .then(data => {
         const list = Array.isArray(data.tags) ? data.tags : [];
         const sorted = [...list].sort((a, b) => a.localeCompare(b));
         setTagOptions(sorted.map(tag => ({ value: tag, label: `#${tag}` })));
       })
       .catch(err => {
         console.error('Errore getTags:', err);
         toast.error('Impossibile caricare i tag');
       })
       .finally(() => {
         setTagsLoading(false);
       });
   }, 500);

   return () => clearTimeout(timer);
 }, [inputValue, ready, getTags]);

  // listeners for create/update events
  useEffect(() => {
    if (!socket) return;
    const onCreated = newPost => {
      if (newPost.authorId === user.id) {
        toast.success('Post creato!');
        onClose();
        dispatch(fetchPosts({ limit: 100 }));
      }
    };
    const onUpdated = updPost => {
      if (updPost.authorId === user.id) {
        toast.success('Post aggiornato!');
        onClose();
        dispatch(fetchPosts({ limit: 100 }));
      }
    };
    socket.on('POST_CREATED', onCreated);
    socket.on('POST_UPDATED', onUpdated);
    return () => {
      socket.off('POST_CREATED', onCreated);
      socket.off('POST_UPDATED', onUpdated);
    };
  }, [socket, user.id, onClose, dispatch]);

  const handleSubmit = async () => {
    if (!ready) {
      return toast.error('WebSocket non disponibile. Riprova più tardi.');
    }
    if (title.trim().length < 3) {
      return toast.error('Titolo troppo corto (min 3 caratteri)');
    }
    const plain = content.replace(/<[^>]+>/g, '').trim();
    if (plain.length < 10) {
      return toast.error('Contenuto troppo breve (min 10 caratteri)');
    }

    let imageUrl = initialData.image || '';
    if (imageFile) {
      try {
        imageUrl = await uploadImageToCloudinary(imageFile);
      } catch (err) {
        return toast.error('Upload immagine fallito: ' + err.message);
      }
    }

   const payload = {
     ...(mode === 'edit' && { postId: initialData.id }),
     title,
     content,
     publishDate: Date.now(),
     tags: selectedTags.map(t => t.value),
     // includi image solo in create
    ...(mode === 'create' && { image: imageUrl }),
  };

    const eventName = mode === 'create' ? 'createPost' : 'updatePost';
    socket.emit(eventName, payload, res => {
      if (res?.success) {
        toast.success(mode === 'create' ? 'Post creato!' : 'Post aggiornato!');
        onClose(res.data);
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
        {/* Titolo */}
        <label className={styles['post-modal__field']}>
          <span>Titolo</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </label>

        {/* Contenuto */}
        <label className={styles['post-modal__field']}>
          <span>Contenuto</span>
          <TiptapEditor value={content} onChange={setContent} />
        </label>

        {/* Tag con debounce */}
        <label className={styles['post-modal__field']}>
          <span>Tag</span>
        <CreatableSelect
          isMulti
          options={tagOptions}
          value={selectedTags}
          onChange={(newValue, actionMeta) => {
            setSelectedTags(newValue);
            // se hai selezionato un’opzione o ne hai creata una, resetta l’input
            if (actionMeta.action === 'select-option' || actionMeta.action === 'create-option') {
              setInputValue('');
            }
          }}
          inputValue={inputValue}
          onInputChange={(value, { action }) => {
            if (action === 'input-change') {
              setInputValue(value);
            }
          }}
          isLoading={tagsLoading}
          noOptionsMessage={() =>
            tagsLoading ? 'Caricamento…' : 'Inizia a digitare per cercare tag'
          }
          placeholder="Digita per cercare o crea un tag…"
        />
        </label>

        {/* Immagine */}
        <label className={styles['post-modal__field']}>
          <span>Immagine</span>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
          />
        </label>
      </div>

      {/* Azioni */}
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
