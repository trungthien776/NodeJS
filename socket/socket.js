module.exports= function(io,rooms){
	var chatrooms= io.of('/roomlist').on('connection',function(socket){
		console.log('connection established on server');
		socket.emit('roomupdate',JSON.stringify(rooms));

		socket.on('newroom',function(data){
			rooms.push(data);
			socket.broadcast.emit('roomupdate',JSON.stringify(rooms));
			socket.emit('roomupdate',JSON.stringify(rooms));
		})
	})

	var messages=io.of('/messages').on('connection',function(socket){
		console.log('connect chat room!');
		socket.on('joinroom',function(data){
			socket.username=data.user;
			socket.userPic=data.userPic;
			socket.join(data.room);
			updateUserList(data.room,true);
		})
		socket.on('newMessage',function(data){
			socket.broadcast.to(data.room_number).emit('messagefeed',JSON.stringify(data));
		})

		function updateUserList(room,updateAll){
			var getUser=io.of('/messages').clients(room);
			userList=[];
			for(var i in getUser){
				userList.push({user:getUser[i].username, userPic:getUser[i].userPic});
			}
			socket.to(room).emit('updateUserList',JSON.stringify(userList));

			if(updateAll){
				socket.broadcast.to(room).emit('updateUserList',JSON.stringify(userList));
			}
		}

		socket.on('updateList',function(data){
			updateUserList(data.room);
		})
	})
}