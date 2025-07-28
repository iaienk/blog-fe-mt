/* eslint-disable react-refresh/only-export-components */
import {createContext, useContext, useEffect, useRef, useState} from "react";
import io from "socket.io-client";
import {useSelector} from "react-redux";
import {userSelector} from "../reducers/user.slice.js";

const defaultValue = {
  socket: undefined,
  ready: false,       // ← rinomina per coerenza
};

export const SocketContext = createContext(defaultValue);

// **hook** per consumare il context
export const useSocketContext = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const socket = useRef();
  const user = useSelector(userSelector);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user?.accessToken) {
      socket.current = io(
        "https://todo-pp.longwavestudio.dev/multiuserblog",
        {
          transports: ["websocket"],
          auth: { token: user.accessToken },
        }
      );

      socket.current.on("connected", (res) => {
        console.log("Connected to socket", res);
        setReady(true);
      });

      socket.current.on("closed", (res) => {
        console.log("Disconnected from socket", res);
        setReady(false);
      });

      socket.current.on("connect_error", (err) => {
        console.log("Error connecting to socket", err);
        setReady(false);
        socket.current.removeAllListeners();
        socket.current.close();
      });
    }
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket: socket.current,
        ready,           // ← valore coerente con useSocketContext
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;