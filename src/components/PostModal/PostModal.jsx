import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import CreatableSelect from 'react-select/creatable';
import TiptapEditor from '../TiptapEditor/TiptapEditor';
import { getSocket } from '../../socket'; // usa getSocket
import { uploadImageToCloudinary } from '../../utils/uploadImage.js';
import { toast } from 'react-toastify';
import styles from './PostModal.module.scss';
import { FiX, FiSave } from 'react-icons/fi';

export function PostModal({ mode, initialData = {}, onClose }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [publishDate, setDate] = useState(
    initialData.publishDate ? new Date(initialData.publishDate) : new Date()
  );
  const [tags, setTags] = useState(
    (initialData.tags || []).map(t => ({ value: t, label: t }))
  );
  const [availableTags, setAvailableTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;
    socket.emit(
      'GET_TAGS',
      { name: '', cursor: null, direction: 'next', limit: 50 },
      res => {
        if (res?.success) {
          setAvailableTags(res.data.tags.map(t => ({ value: t, label: t })));
        }
      }
    );
  }, [socket]);

  const handleSubmit = async () => {
  console.log('[DEBUG] Cliccato Crea');

  const plainText = content.replace(/<[^>]+>/g, '').trim();
  if (title.trim().length < 3) {
    return toast.error('Titolo troppo corto (minimo 3 caratteri)');
  }
  if (plainText.length < 10) {
    return toast.error('Contenuto troppo breve (minimo 10 caratteri)');
  }

  let imageUrl = initialData.image || '';
  try {
    if (imageFile) {
      imageUrl = await uploadImageToCloudinary(imageFile);
    }
  } catch (err) {
    return toast.error('Upload immagine fallito: ' + err.message);
  }

  const payload = {
    ...(mode === 'edit' && { postId: initialData.id }),
    title,
    content,
    publishDate: publishDate.getTime(),
    image: imageUrl,
    tags: tags.map(t => t.value),
    userIds: []
  };

  const socket = getSocket();
  if (!socket) {
    console.error('[ERRORE] socket non inizializzato');
    toast.error('Connessione non disponibile. Riprova più tardi.');
    return;
  }

  console.log('Invio evento', mode === 'create' ? 'CREATE_POST' : 'UPDATE_POST', payload);

  let callbackCalled = false;
  socket.emit(mode === 'create' ? 'CREATE_POST' : 'UPDATE_POST', payload, response => {
    callbackCalled = true;
    console.log('[SOCKET RESPONSE]', response);
    if (response.success) {
      toast.success(`Post ${mode === 'create' ? 'creato' : 'aggiornato'} con successo`);
      onClose();
    } else {
      toast.error(response.error?.message || 'Errore generico dal server');
    }
  });

  setTimeout(() => {
    if (!callbackCalled) {
      toast.error('Nessuna risposta dal server. Controlla la connessione o riprova.');
    }
  }, 3000);
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
            value={publishDate.toISOString().substr(0, 10)}
            onChange={e => setDate(new Date(e.target.value))}
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
          <FiX className={styles.icon} />
          Annulla
        </button>
        <button
          className={`${styles.btn} ${styles['btn--primary']}`}
          onClick={handleSubmit}
        >
          <FiSave className={styles.icon} />
          {mode === 'create' ? 'Crea' : 'Aggiorna'}
        </button>
      </div>
    </Modal>
  );
}
