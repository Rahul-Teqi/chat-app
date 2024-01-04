const socket = io()

//Elements
const $messages = document.querySelector('#messages')
const $sideBar = document.querySelector('#sideBar')
const $messageForm = document.querySelector('#ChatForm')
const $messageFormInput = document.querySelector('#message')
const $messageFormButton = document.querySelector('#MessageBtn')

//Templates
const ServerMessageTemplate = document.querySelector('#serverMessageTemplate').innerHTML
const OwnMessageTemplate = document.querySelector('#ownMessageTemplate').innerHTML
const OtherMessageTemplate = document.querySelector('#OtherMessageTemplate').innerHTML
const SideBarUserTemplate = document.querySelector('#SideBarUserTemplate').innerHTML

// Get the Data from URL
const {name , room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
if(!name || !room){
    location.href = '/?error=Please enter Name and Room'
}

// put the room name
document.getElementById('RoomName').innerText = room+" Room"

//AutoScroll

const autoscroll = () => {
    //New Messgae Element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visiable height
    const visiableHeight = $messages.offsetHeight
 
    //Height of message container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visiableHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    } 
} 


//New Message 
socket.on('message',(message)=>{

    var html ="";
    if(message.user == name.toLowerCase()){
        html = Mustache.render(OwnMessageTemplate,{
            name:capitalizeFirstLetter(message.user),
            message:message.message,
            createAt:moment(message.createAt).format('h:mm a')
        })
    }else{
        html = Mustache.render(OtherMessageTemplate,{
            name:capitalizeFirstLetter(message.user),
            message:message.message,
            createAt:moment(message.createAt).format('h:mm a')
        })
    } 

    $messages.insertAdjacentHTML('beforeend',html)
    // console.log(message);
    autoscroll()
})

//Server Message
socket.on('serverMessage',(message)=>{
    const html = Mustache.render(OwnMessageTemplate,{
        name:capitalizeFirstLetter(message.user),
        message:message.message,
        createAt:moment(message.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
    // console.log(message);
})

//SomeOne has Join the Room
socket.on('SomeOneJoin',(message)=>{
    const html = Mustache.render(ServerMessageTemplate,{
        message:capitalizeFirstLetter(message.message)
    })
    $messages.insertAdjacentHTML('beforeend',html)
    // console.log(message);
    autoscroll()

})

//SomeOne Left 
socket.on('SomeOneLeft',(message)=>{
    const html = Mustache.render(ServerMessageTemplate,{
        message:capitalizeFirstLetter(message.message)
    })
    $messages.insertAdjacentHTML('beforeend',html)
    // console.log(message);
    autoscroll()

})

//Room Data
socket.on('roomData',({users})=>{
    // console.log(users);
    const html = Mustache.render(SideBarUserTemplate,{
        users
    })

    $sideBar.innerHTML = html
})


//Join the Socket
socket.emit('join',{name,room},(error)=>{
    if(error){
        location.href = '/?error='+error
    }
})

let flag = true;

document.getElementById('arrowElement').addEventListener('click', () => {
    const sideBar = document.getElementById('sideBar');
    const arrowCon = document.getElementById('ArrowCon');
    const messageCon = document.querySelector('.messageCon');

    if (flag) {
        sideBar.classList.add('showSideBar');
        arrowCon.classList.add('ArrowConMove');
    } else {
        sideBar.classList.remove('showSideBar');
        arrowCon.classList.remove('ArrowConMove');
    }

    flag = !flag;

    // Adjust messageCon height when opening/closing sidebar
    adjustMessageConHeight();
});

// handle keyboard visibility
if (window.matchMedia('(max-width: 767px)').matches) {
    // Add resize event listener only for mobile devices
    window.addEventListener('resize', () => {
        adjustMessageConHeight();
    });
}

function adjustMessageConHeight() {
    const messageCon = document.querySelector('.messageCon');
    const navHeight = document.querySelector('nav').offsetHeight;
    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    messageCon.style.height = `calc(100vh - ${navHeight + keyboardHeight + 50 }px)`;
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//Send Message to server
$messageForm.addEventListener('submit',(event)=>{
    event.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = event.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=""
        $messageFormInput.focus()

        if(error){
            return console.log(error);
        }

        console.log("Message delivered!");
    })

})