//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


// let items = ["Buy food"];
// let workitems = [];
mongoose.connect("mongodb+srv://admin-mansi:Test3721@cluster0.cp8bk.mongodb.net/todolistDB",{useNewUrlParser: true,useUnifiedTopology: true});
//schema
const itemsSchema = new mongoose.Schema({
  name:String,
});
//model
const item = mongoose.model("Item",itemsSchema);

const item1 = new item({
  name:"Welcome to todolist!"
});
const item2 = new item({
  name:"Hit + button to add item."
});
const item3 = new item({
  name:"Hit checkbox to delete."
});

const defaultItems=[item1, item2, item3];

const listSchema=({
  name: String,
  items:[itemsSchema]
});
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

  item.find({}, function(err, foundItems){

    if(foundItems.length === 0)  //insert default items only if the collection is currently empty
    {
      item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }else{
          console.log("Inserted default items to db successfully");
        }
      });

      res.redirect("/");
    }else{
      res.render("list",{
        listTitle:"Today",
        newListItem:foundItems
      });
    }

  });



});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList)
      { //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save(function(err){
          if(err){
            console.log(err);
          }else{
            res.redirect("/"+customListName);
          }

        });

      }else{
        //show existing list
        res.render("list",{listTitle:foundList.name, newListItem:foundList.items});
      }
    }
  })

})

app.post("/",function(req,res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemNew = new item({
    name: itemName
  });

  if(listName==="Today"){
    itemNew.save(function(err){
      if(err)
      {
        console.log(err);
      }else{
        res.redirect("/");
      }
    });
  }else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(itemNew);
      foundList.save(function(err){
        if(err)
        {
          console.log(err);
        }else{
          res.redirect("/"+listName);
        }
      });
    })
  }



});

app.post("/delete",function(req,res){
   const checkedItemId = req.body.checkbox;
   const listName=req.body.listName;

   if(listName==="Today")
   {
     item.findByIdAndRemove(checkedItemId, function(err){
       if(err){
         console.log(err);
       }else{
         res.redirect("/");
       }
     });
   }else{
     List.findOneAndUpdate({name:listName}, {$pull: {items: {_id:checkedItemId}}}, function(err,foundList){
       if(!err)
       {
         res.redirect("/"+listName);
       }
     });
   }


});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function(){
  console.log("Server started successfully.");
});
