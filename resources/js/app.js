import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'


let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(pizza){  // function declaration and definition
  axios.post('/update-cart', pizza).then(res => {
      cartCounter.innerText = res.data.totalQty
      new Noty({
          type: 'success',
          timeout: 1000,
          progressBar: false,
          text: 'Item added to cart'
      }).show();
  }).catch(err =>{
    new Noty({
        type: 'error',
        timeout: 1000,
        progressBar: false,
        text: 'Something went wrong'
    }).show();
  })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        
        let pizza = JSON.parse(btn.dataset.pizza );
        updateCart(pizza)  // function call
    })
})

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}



// change order status

let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')      // creates <small></small>  tag

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
       let dataProp = status.dataset.status
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    })

}

updateStatus(order);



// Socket

let socket = io()


// Join
if(order) {
    socket.emit('join', `order_${order._id}`)                  // created socket room(order._id) for each different user
}

// check if we are admin
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
    initAdmin(socket)
    socket.emit('join', 'adminRoom')                             // created socket room(adminRoom) for admin
}


socket.on('orderUpdated', (data) => {                        // listening the event emited at server.js
    const updatedOrder = { ...order }                        // copying object order to updatedOrder
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})

