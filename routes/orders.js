const express = require("express");
const { idleTimeoutMillis } = require("pg/lib/defaults");
const router = express.Router();
//const createtempVars = require("/lightEats/helpers/")

const queryString =` SELECT  orders.created_at , orders.id ,customers.name as customer_name ,orders.order_total,menu_items.name,menu_items.price,orders_items.quantity
FROM orders
JOIN orders_items ON orders.id = orders_items.order_id
JOIN customers ON customer_id= customers.id
JOIN menu_items ON menu_items.id = orders_items.menu_item_id
WHERE customer_id = $1
ORDER BY orders.id ;`;

module.exports = (db) => {

  router.get("/:user_id", (req, res) => {
    //checl login
    const user = req.session.user;
    const user_id = req.params.user_id;
    if ( user.id != user_id) {
      return res.redirect("/");
    }
    db.query(queryString, [user_id])
    .then(data => {
      const result = data.rows;
      if (result.length !== 0) {
      const tempVars = createtempVars(result);
      res.render('orders', {user, result:tempVars});
      } else {
        res.render('orders', {id:2 ,result:null});
      }
    })
    .catch(err => res.json(err.message));
  });

  router.post("/", (req, res) => {

    console.log(req.body);
    //make fxn into array of objects
    //create array
    //for key in res.body
    // create empty object
    //
    res.redirect("/");

  });



  return router;
};

const createtempVars= function(result) {
  console.log(result.length);
  let ordersArray = [];
  let a= result[0].id;
  let newObj={}
  let orderAlreadyinResult ="new"
  for(let i=0; i<result.length;i++)
   {
    console.log(i);
     if(a === result[i].id){

       if(orderAlreadyinResult==="new"){
        newObj.id = result[i].id;
        newObj.created_at= result[i].created_at.toString().substring(0,24);
        newObj.customer_name = result[i].customer_name;
        newObj.order_total= (result[i].order_total/100).toFixed(2);
        newObj.quantity = 0;
        orderAlreadyinResult="old";
        newObj.items =[];
       }

        let b ={
          item_name:result[i].name,
          quantity :result[i].quantity,
          price:(result[i].price/100).toFixed(2)
        }
        newObj.items.push(b);

        newObj.quantity += result[i].quantity;


     }
     else {

      ordersArray.push(newObj)
       newObj ={};
       a= result[i].id;
       orderAlreadyinResult="new";
       i--;
     }
     if(i ===result.length-1){
       ordersArray.push(newObj);
     }
   }
   return ordersArray;
 }

//start with this
// const body = { 'id-0': '1', 'number-0': '10', 'id-1': '2', 'number-1': '5' }
//end up with data like this
//  const postArray = [

//   { id:1, number:10},
//   { id:2, number:5 }

//  ];
