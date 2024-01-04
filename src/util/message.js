

const generateMessage = (user,message) => {
    return {
        user,
        message,
        createAt:new Date().getTime()
    }
}


module.exports = {
    generateMessage
}