const express = require("express")
const { getCollegeInsights } = require('./aiConfig.js');
const { marked } = require('marked');
const session = require("express-session")
const csv = require("csv-parser");
const app = express()
const fs = require("fs")
const path = require("path")
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "clg-selector",
    resave: false,
    saveUninitialized: true,
}));
let colleges = [];

fs.createReadStream("clg.csv")
.pipe(csv())
.on("data", (row) => {
    colleges.push(row);
})
.on("end", () => {
   // console.log(colleges);
   // console.log(colleges.length);
});
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "..", "FRONTEND", "Views"));
app.get("/result", async (req, res) => {
    // console.log(req.session);
    const userlocation = req.session.location;
    const userfees = (req.session.fees);
    const userplacement = (req.session.placement);
    // console.log("User location: ", userlocation);
    // console.log("User Fees", userfees);
    // console.log("User placement", userplacement);
    //Scoring 
    for(let college of colleges){
         let score = 0;
         // console.log(college);

    // Loaction
        if(college.Location === userlocation){
            score+=100;
        }
    // Fees
        const fee = Number(college.Fees)
        if(userfees === "Upto 5L" && fee <= 500000){
            score+=100; //upto 5L
        }
        else if(userfees === "5L to 9L" && fee > 500000 && fee <= 900000){
            score+=100; // 5L to 9L
        }
        else if(userfees === "9L to 12L" && fee >  900000 && fee <= 1200000){
            score+=100; // 9L to 12L
        }
        else if(userfees === "16L to 19L" &&fee >= 1600000 && fee <= 1900000){
            score+=100; // 16L  to 19L
        }
        else if(userfees === "19L to 21L" &&fee > 1900000 && fee <= 2100000){
            score+=100; // 19L to 21L
        }
        else if(userfees === "Above 21L" && fee > 2100000){
            score+=100; //Above 21L
        }
    // Placement  
        const place = Number(college.Placement)
        if(userplacement === "Upto 5LPA" && place <=5){
            score+=100; //Upto 5LPA
        } 
        else if(userplacement === "5LPA to 7LPA" && place > 5 && place<= 7){
            score+=100; // 5LPA to 7LPA
        }
        else if(userplacement === "7LPA to 9LPA" && place > 7 && place<= 9){
            score+=100; // 7LPA to 9LPA
        }
        else if(userplacement === "Above 9LPA" && place > 9) {
            score+=100; // Above 9LPA
        }
        college.score = score;
    }
    // Sorting & Top 3
    colleges.sort((a, b) => b.score - a.score);
    // console.log(colleges);
    const top3 = colleges.slice(0, 3);
    for (const college of top3) {
    college.aiData = await getCollegeInsights(college);
    }
    // console.log(top3);
    // res.sendFile(resultpage);
    res.render("index",{
        colleges: top3
    });

});
app.use(express.static(path.join(__dirname, "..", "FRONTEND")));
const homepage = path.join(__dirname,"..","index.html")
const feepage = path.join(__dirname,"..","FRONTEND/Fees/index.html")
const locationpage = path.join(__dirname,"..","/FRONTEND/Location/index.html")
const placementpage = path.join(__dirname,"..","/FRONTEND/Placement/index.html")
// const resultpage = path.join(__dirname,"..","/FRONTEND/views/result.ejs")


app.get('/',(req,res)=>{
    res.sendFile(homepage)
})
app.get("/location", (req, res) => {
    res.sendFile(locationpage);
});
app.post('/location',(req,res)=>{
    // console.log(req.body);
    req.session.location = req.body.location;
    // console.log(req.session);
    res.redirect("/fees");
})
app.get("/fees", (req, res) => {
    res.sendFile(feepage);
});
app.post('/fees',(req,res)=>{
    req.session.fees = req.body.fees;
    // console.log(req.session);
    res.redirect("/placement");
})
app.get("/placement", (req, res) => {
    res.sendFile(placementpage);
});
app.post('/placement',(req,res)=>{
    //  console.log("PLACEMENT POST HIT");
    req.session.placement = req.body.placement;
    // console.log(req.session);
    res.redirect("/result");
})


app.listen(3000,()=>{
    console.log("server is started...")
})