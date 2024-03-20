const socketIO = require('socket.io');


module.exports = (server) => {
  const io = socketIO(server);

//   io.use((socket,next)=> {
//     sessionMiddleware(socket.request,{},next)
//   })
    
  io.on('connection', function(client) {
   
    
    console.log(`Client ${client.id} connected`)
    //let users = Array.from(io.sockets.sockets.values()).map(socket => ({id: socket.id,username: socket.username,avatar: socket.userAvatar}))
    client.on('disconnect' , () => {

        console.log(`Client ${client.id} has left`)
        // client.broadcast.emit('user-leave',client.id) // gửi thông báo 1 user thoát/refresh page đến để mọi người xóa client đó trong danh sách online
    })
    

   
    //   try {
    //     let dataSearchKey = data.messageModel.from.toString() +"_"+data.messageModel.to.toString()
    //     let reverseKey = data.messageModel.to.toString() +"_"+data.messageModel.from.toString()
    //     if(!messageData[dataSearchKey])
    //     {
    //       if(!messageData[reverseKey])
    //       {
    //         messageData[dataSearchKey] = []
    //       }
    //       else
    //       {
    //         dataSearchKey = reverseKey
    //       }  
    //     }
    //       messageData[dataSearchKey].push(data.messageModel)
    //     client.to(data.recipientId).emit("private message", data.messageModel);
    //   } catch (error) {
    //     console.log("Cannot store the message: "+error)
    //   }
      
    // });

    // client.on("load message", data => {
    //   let dataSearchKey = data.userID.toString() +"_"+data.with.toString()
    //   let reverseKey = data.with.toString() +"_"+data.userID.toString()
    //   let previousMessage = "a";
    //   if(messageData[dataSearchKey])
    //   {
    //     previousMessage = messageData[dataSearchKey]
    //   }
    //   else if(messageData[reverseKey])
    //   {
    //     previousMessage = messageData[reverseKey]
    //   }
    //   else
    //   {
    //     previousMessage = "";
    //   }
    //   client.emit("load message",previousMessage)
    // })

    //gửi danh sách những đang online cho người mới vào
    // client.emit('list-users',users)


    });
    return io;
};