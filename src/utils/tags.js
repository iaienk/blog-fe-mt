export const getTags = (socket, payload) => {
  return new Promise((resolve, reject) => {
    socket.emit('GET_TAGS', payload, response => {
      if (response.success) {
        resolve(response.data);        // es. un array di stringhe
      } else {
        reject(response.error);
      }
    });
  });
};