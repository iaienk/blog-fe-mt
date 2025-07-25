/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { userSelector } from "../reducers/user.slice.js";

const defaultValue = {
    socket: undefined,
    socketReady: false,
}

export const SocketContext = createContext(defaultValue);

const SocketProvider = ({children}) => {
    const socket = useRef();
    const user = useSelector(userSelector);
    const [ready, setSocketReady] = useState(false);


    useEffect(() => {
        if (user?.accessToken) {
            socket.current = io(`${import.meta.env.VITE_API_URL}/multiuserblog`, {
              path: "/socket.io", 
                transports: ['websocket'],
                auth: {
                    token: user.accessToken
                }
            })

            socket.current.on('connected', (res) => {
                console.log('Connected to socket', res)
                setSocketReady(true);
            });

            socket.current.on('closed', (res) => {
                console.log('Disconnected from socket', res)
                setSocketReady(false)
            });

            socket.current.on('connect_error', (err) => {
                console.log('Error connecting to socket', err);
                setSocketReady(false);
                socket.current.removeAllListeners();
                socket.current.close();
            })
        }
    }, [user])

    return <SocketContext.Provider
        value={{
            socket: socket.current,
            socketReady: ready,
        }}>
        {children}
    </SocketContext.Provider>
}
export const useSocketContext = () => useContext(SocketContext) 

export default SocketProvider;