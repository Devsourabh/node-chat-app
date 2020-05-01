const socket = io()

const indexForm = document.querySelector('#indexForm')

const roomTemplate = document.querySelector("#room-data").innerHTML

socket.on('sendRoomData', (room) => {
    console.log(room)
    const html = Mustache.render(roomTemplate, {
        room
    })
    indexForm.insertAdjacentHTML('afterend',html)

})