const generateMessage = (username,text) => {
    return  {
        username,
        text,
        createdAt:new Date().getTime()
    }
}

const generateLocationMessage = (username,{latitude,longitude}) =>{
    return {
        username,
        url:`http://google.com/maps?q${latitude},${longitude}`,
        createdAt:new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}