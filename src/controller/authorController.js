const authorModel = require("../model/authorModel");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");



const createAuthor = async function (req, res) {

try {
    if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "Please input some data to create" });
    
    if(!req.body.fname) return res.status(400).send({ status: false, message: "Please provide a valid fname" });
    if(!req.body.fname.trim()) return res.status(400).send({ status: false, message: "Please provide a valid fname" });
    if(!req.body.lname) return res.status(400).send({ status: false, message: "Please provide a valid lname" });
    if(!req.body.lname.trim()) return res.status(400).send({ status: false, message: "Please provide a valid lname" });
    if(!req.body.email) return res.status(400).send({ status: false, message: "Please provide a valid email" });
    if(!req.body.email.trim()) return res.status(400).send({ status: false, message: "Please provide a valid email" });
    if(!req.body.password) return res.status(400).send({ status: false, message: "Please provide a valid password" });
    if(!req.body.password.trim()) return res.status(400).send({ status: false, message: "Please provide a valid password" });

    if(!req.body.title) return res.status(400).send({ status: false, message: "Please provide a valid title" });
    const titles = ["Mr", "Mrs", "Miss"]
    if(!titles.includes(req.body.title)) return res.status(400).send({ status: false, message: "Please provide a valid title from [Mr, Mrs, Miss]"});


    let email = req.body.email;
    if (validator.validate(email.trim()) == false) return res.status(400).send({ status: false, message: "Please input a valid email" });

    let duplicateEmail = await authorModel.findOne({ email });
    if (duplicateEmail) return res.status(400).send({ status: false, message: "Email is already in use" });

    let savedData = await authorModel.create(req.body);
    return res.status(201).send({ status: true, data: savedData });

}catch(error){
    return res.status(500).send({ message: "Error", error: error.message });
}
};




//login user is the Authentication part
const loginUser = async function (req, res) {
try {
    if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "Please enter email and password" });

    if (!req.body.email) return res.status(400).send({ status: false, message: "email must be present" });
    if (!req.body.password) return res.status(400).send({ status: false, message: "password must be present" });
    //extracted password and email from body
    req.body.email = req.body.email.trim()
    req.body.password = req.body.password.trim()
    const {email, password} = req.body

    //validating emailId and password which is entered by user with the DB collection of user
    
    if (validator.validate(email) == false) return res.status(400).send({ status: false, message: "Please input a valid email" });

    const author = await authorModel.findOne({email: email, password: password});
    if (!author) return res.status(404).send({status: false, message: "username or the password is not correct"});

    const token = jwt.sign({
        authorId: author._id.toString(), //extracting id from user variable defined above and converting it to string
    },
    "functionup-thorium-group5"
    ); //Here in sign function we have generated token.

    res.setHeader("x-api-key", token); //setting header(key-value pair)in headers of response,
    //Here:#key is such that it is recognized by both frontend and backend ,
    // and token is #value which is generated above in sign method/function

    return res.status(201).send({ status: true, data: token });

} catch (error) {
    res.status(500).send({ message: "Error", Error: error.message });
}
};
module.exports = {createAuthor,loginUser}