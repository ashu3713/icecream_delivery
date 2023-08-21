const Order = require('../../../models/order')

function statusController() {
    return {
        update(req, res) {
            Order.updateOne({_id: req.body.orderId}, { status: req.body.status }, (err, data)=> {
                if(err) {
                    return res.redirect('/admin/orders')
                }
                // Emit event 
                const eventEmitter = req.app.get('eventEmitter')                                               // requested eventEmitter from server.js
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status })           // emited the event orderUpdated which will be caught in server.js which will pass it to socket in app.js
                return res.redirect('/admin/orders')
            })
        }
    }
}

module.exports = statusController