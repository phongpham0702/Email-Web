let socket; // my socket
let onlineUsers = []
let userName;
let selectedUser = null;

window.onload = () => {
    const socket = io();
    socket.on("connect", handleConnectionSuccess)
    socket.on("disconnect", () => {
        console.log("Kết nối thất bại")
    })
    socket.on("error", () => {
        console.log("Kết nối gặp lỗi")
    })


    function handleConnectionSuccess() {
        socket.emit('user-connected')
    }
    
}
