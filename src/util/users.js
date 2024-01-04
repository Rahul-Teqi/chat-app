users = []

const addUser = ({id,name,room}) =>{

    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!name || !room){
        return {error : "Name and Room are required"}
    }

    // Check the name is there or not
    const ExistUser = users.find((user)=> user.name === name && user.room === room)
    if(ExistUser){
        return {
            error:"Name is in use!, Enter other Name."
        }
    }
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert hours to 12-hour format
    const formattedHours = hours % 12 || 12;
    const createAt = `${formattedHours}:${minutes} ${ampm}`

    const user = {id,name,room,createAt}
    users.push(user) 
    return { user }

}

const revomeUser = (id) =>{

    const index = users.findIndex((user)=>user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) =>{
    return users.find((user)=> user.id === id)
}

const getRoomUser = (room) => {
    return users.filter((user)=> user.room === room.toLowerCase())
}

module.exports = {
    addUser,
    revomeUser,
    getUser,
    getRoomUser
}