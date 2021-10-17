//Robert Bajan 08/09/21
const { response } = require("express")
const express = require("express")
const validator = require("validator")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const app = express()

app.use(express.static("Public"))
app.use(bodyParser.urlencoded({extended:true}))

const saltRounds = 10;

mongoose.connect("mongodb+srv://admin:admin@iservice.0pw77.mongodb.net/iService?retryWrites=true&w=majority", {useNewUrlParser: true})      //Sets up the local database
    
    const userSchema = new mongoose.Schema(             //Sets up the MongoDB Schema
        {
            first:{
                type: String,
                required: true
            },
            last:{
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
                index: { unique: true },
                validate: [validator.isEmail, "The email provided is not valid"],
                validate(value) {
                    if (!validator.isEmail(value)){
                        throw new Error("The email provided is not valid")
                    }
                }
            },
            residence:{
                type: String,
                required: true
            },
            password:{
                type: String,
                required: true,
                minlength: 8
            },
            conpassword:{
                type: String,
                required: true,
                minlength: 8
            },
            address:{
                type: String,
                required: true
            },
            city:{
                type: String,
                required: true
            },
            state:{
                type: String,
                required: true
            },
            postal:{
                type: Number,
                required: false,
                minlength: 4,
                maxlength: 4
            },
            mobile:{
                type: Number,
                required:false
            }
        }
    )

    const User = mongoose.model('Users', userSchema)         //Turns the schema into a usable model

app.get('/', (req, res)=> {             //Retrieves the html file and presents in on the local server via the web browser
    res.sendFile(__dirname + "/login.html")
})

app.get('/signup.html', (req, res)=> {             //Retrieves the html file and presents in on the local server via the web browser
    res.sendFile(__dirname + "/signup.html")
})

app.post('/', (req, res)=> {            //Retrieves the post from the login page
    const email = req.body.email
    const password = req.body.password

    User.findOne({email: email}, (err, user) =>{
        if (err)
        {res.send("Please enter a valid email")}
        else{
            bcrypt.compare(password, user.password, (err, result) =>{
                if (result){
                    res.send("Successfully Logged In")
                }
                else
                {res.send("Invalid email or Password")}
            })
        }
    })
})

app.post('/signup', (req, res)=> {            //Retrieves the post from the signup page
    
    const salt = bcrypt.genSaltSync(saltRounds)
    

    const first = req.body.first
    const last = req.body.last
    const email = req.body.email
    const residence = req.body.residence
    const password = bcrypt.hashSync(req.body.password, salt)
    const conpassword = bcrypt.hashSync(req.body.conpassword, salt)
    const address = req.body.address
    const city = req.body.city
    const state = req.body.state
    const postal = req.body.postal
    const mobile = req.body.mobile

    if(!validator.equals(password, conpassword)) {
        res.status(400).send("Passwords do not match")
    }
    else {  

        const NewUser = new User(
        {
            first: first,
            last: last,
            email: email,
            residence: residence,
            password: password,
            conpassword: conpassword,
            address: address,
            city: city,
            state: state,
            postal: postal,
            mobile: mobile
        }
    )
        NewUser.save((err)=>{           //Prints the data into the selected database
            if(err)
            {console.log(err)}
            else
            {console.log("Inserted Successfully")}
        })
    }
    
    res.redirect('/')
    
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8080;
}
app.listen(port);