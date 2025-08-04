/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { userSelector } from "../reducers/user.slice.js";
import { postUpdated }  from "../reducers/post.slice";

const SocketContext = createContext({ socket: null, ready: false });
export const useSocketContext = () => useContext(SocketContext);

export default function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const user      = useSelector(userSelector);
  const dispatch  = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user?.accessToken) return;
    // se il socket esiste già, non facciamo nulla
    if (socketRef.current) return;

    // inizializza la connessione
    const s = io("https://todo-pp.longwavestudio.dev/multiuserblog", {
      transports: ["websocket"],
      auth: { token: user.accessToken },
      autoConnect: true,
    });
    socketRef.current = s;

    s.on("connect", () => {
      setReady(true);
      console.log("Socket connesso:", s.id);
    });
    s.on("disconnect", reason => {
      setReady(false);
      console.log("Socket disconnesso:", reason);
    });
    // silenziamo l’errore iniziale di StrictMode
    s.on("connect_error", () => { /* skip */ });

    // ascoltiamo l’update singolo e lo upserta nello store
    s.on("POST_UPDATED", updatedPost => {
      dispatch(postUpdated({
        id:           updatedPost.id,
        title:        updatedPost.title,
        content:      updatedPost.content,
        publishDate:  new Date(updatedPost.publishDate).getTime(),
        image:        updatedPost.image,
        tags:         updatedPost.tags,
        authorId:     updatedPost.authorId
      }));
    });

    // **Nessun cleanup**: non chiudiamo mai il socketRef durante mount/unmount di StrictMode
  }, [user, dispatch]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, ready }}>
      {children}
    </SocketContext.Provider>
  );
}