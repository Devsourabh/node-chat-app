const socket = io()

// Elements
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormBtn = messageForm.querySelector('button')
const sendLocationBtn = document.querySelector('#sendLocation')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options

const Data = Qs.parse(location.search, { ignoreQueryPrefix: true })


// autoscroll function
const autoscroll = ()=>{
    // New message Element
    const newMessage = messages.lastElementChild

    // height of the new message
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // visible Height
    const visibleHeight = messages.offsetHeight

    // Height Of message Container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled
    const scrolloffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrolloffset){
        messages.scrollTop = messages.scrollHeight
    }
}


socket.on('message',({ username, text,createdAt})=>{
    const html = Mustache.render(messageTemplate,{
        username,
        text,
        createdAt:moment(createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', ({ username, url, createdAt}) => {
    const html = Mustache.render(locationTemplate,{
        username,
        url,
        createdAt:moment(createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomdata',({ room, users })=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    sidebar.innerHTML = html
})


messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    message = messageFormInput.value

    messageFormBtn.setAttribute('disabled','disabled')
    socket.emit('sendMessage',message,(error)=>{
        messageFormBtn.removeAttribute('disabled')
        messageFormInput.value = ""
        messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered!')
    })
})

sendLocationBtn.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert("Your Browser doesn't support Geolocation")
    }

    navigator.geolocation.getCurrentPosition((position)=>{

        sendLocationBtn.setAttribute('disabled','disabled')

        socket.emit('sendLocation',{ latitude:position.coords.latitude, longitude:position.coords.longitude },()=>{
            sendLocationBtn.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', Data, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})