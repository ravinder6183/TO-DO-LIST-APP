const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ravinder6183:Piyush_31@cluster0.md1b7jj.mongodb.net/todoListDB");

const itemSchema = new mongoose.Schema({
  name:String
}); 

const Item = mongoose.model("Item",itemSchema);

const item1 =new Item({
  name:"Welcome"
});

const item2 =new Item({
  name:"Hit + to add tasks"
});

const item3 =new Item({
  name:"Check the box to delete the task"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  Item.find().then(function(foundItems){
    // mongoose.connection.close();
    if (foundItems.length === 0){
      Item.insertMany(defaultItems);
    }else{
      // console.log(foundItems);
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});


app.get("/:customListName",function(req,res){
  const newCustomListName = _.capitalize(req.params.customListName);

  List.findOne({name: newCustomListName}).then(function(foundList){
    if (!foundList){
      //create a new List
      const list = new List({
        name: newCustomListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + newCustomListName);
    }else{
      //showing the list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })

  
});



app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item =new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(function(newfoundList){
      // console.log(newfoundList.items);
      newfoundList.items.push(item);
      newfoundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = (req.body.checkbox);
  const newListName = req.body.listName;

  if (newListName === "Today"){
      Item.findByIdAndDelete(checkedItemId).then(function(){
        res.redirect("/");
      });
  } else{
      List.findOneAndUpdate({name: newListName},{$pull: { items : {_id : checkedItemId}}}).then(()=>{
        res.redirect("/" + newListName);
      });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
