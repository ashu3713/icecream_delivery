const Menu = require('../../models/menu')


function homeController() {   //controller is a function whicch returns object
    return{
      async index(req,res) {
          const pizzas = await Menu.find()
          return res.render('home', {pizzas: pizzas})
       }
    }
}

module.exports = homeController