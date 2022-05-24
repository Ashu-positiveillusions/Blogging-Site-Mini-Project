const jwt = require("jsonwebtoken");
const validator = require("../validators/validator")
const blogsModel = require("../model/blogsModel")

const authenticationUser = function (req, res, next) {
try {
    let token = req.headers["x-api-key"];
    if (!token) return res.status(400).send({ status: false, message: "token must be present" });

    //verifying token with secret key
    let decodedToken = jwt.verify(token, "functionup-thorium-group5"); 

    //validating token value inside decodedToken
    if (!decodedToken)return res.status(401).send({ status: false, message: "token is invalid" });
    
    req.authorId = decodedToken.authorId;

    next();
} catch (error) {
    res.status(500).send({ message: "Error", error: error.message });
}
};

const authorisationUser = async function (req, res, next) {
try {
    let authorisedUser = req.authorId
    let blogId = req.params.blogId;
    if(!validator.isValidObjectId(blogId)) return res.status(400).send({ status: false, message: "Please provide valid authorId" });
    let blog = await blogsModel.findOne({_id:blogId}).lean()
    if (authorisedUser !== blog.authorId) return res.status(401).send({status: false,message: "You are not an authorized person to make these changes"});
    next();
} catch (error) {
    return res.status(500).send({ message: "Error", error: error.message });
}
};
module.exports = {authenticationUser, authorisationUser}