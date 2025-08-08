export const getTags = (socket, payload) => {
  return new Promise((resolve, reject) => {
    socket.emit('GET_TAGS', payload, response => {
      if (response.success) {
        resolve(response.data);
      } else {
        reject(response.error);
      }
    });
  });
};