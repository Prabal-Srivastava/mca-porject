import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const socket = io(socketUrl, {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

export const runCodeSocket = (job_id, onUpdate) => {
  socket.emit("join_job", { job_id });

  socket.on("job_update", (data) => {
    console.log("Job Update:", data);
    if (onUpdate) onUpdate(data);
  });
};

export default socket;
