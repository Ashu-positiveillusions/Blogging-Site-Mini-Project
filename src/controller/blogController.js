const blogsModel = require("../model/blogsModel");
const authorModel = require("../model/authorModel");
const validator = require("../validators/validator")

const createBlogs = async function (req, res) {

try {
    if(Object.keys(req.body).length ==0) return res.status(400).send({ status: false, message: "Please enter blog data to create" });
    
    if(!req.body.title) return res.status(400).send({ status: false, message: "Please provide valid title" });
    if(!req.body.title.trim()) return res.status(400).send({ status: false, message: "Please provide valid title" });
    if(!req.body.body) return res.status(400).send({ status: false, message: "Please provide valid body" });
    if(!req.body.body.trim()) return res.status(400).send({ status: false, message: "Please provide valid body" });
    if(!req.body.authorId) return res.status(400).send({ status: false, message: "Please provide valid authorId" });
    if(!validator.isValidObjectId(req.body.authorId)) return res.status(400).send({ status: false, message: "Please provide valid authorId" });
    if(!req.body.category) return res.status(400).send({ status: false, message: "Please provide valid category" });
    if(!req.body.category.trim()) return res.status(400).send({ status: false, message: "Please provide valid category" });

    let authorCheck = await authorModel.findOne({ _id: req.body.authorId});
    if (!authorCheck ) return res.status(400).send({ status: false, message: "Author do not exist." });

    if(req.body.isPublished === true) req.body.publishedAt = Date.now()

    let blogCreated = await blogsModel.create(req.body);
    return res.status(201).send({ status: true, data: blogCreated });
} catch (error) {
    return res.status(500).send({ message: "Error", error: error.message });
}
};



const getBlogs = async function (req, res) {
try {
    let filter = req.query;

    let {tags, subcategory,authorId,category} = filter

    let appliedFilter = {isDeleted: false,isPublished: true}
    if(authorId) appliedFilter.authorId=authorId
    if(category) appliedFilter.category=category
    if(tags) appliedFilter.tags = {$in:[tags]} 
    if(subcategory) appliedFilter.subcategory = {$in:[subcategory]}

    let blogs = await blogsModel.find(appliedFilter).populate("authorId");
    if (blogs.length == 0) return res.status(404).send({ status: false, message: "Blogs not found." });
    return res.status(200).send({ status: true, data: blogs });

}catch (error) {
    return res.status(500).send({ message: "Error", error: error.message });
}
};



const updateBlogs = async function (req, res) {
try {
    let blogId = req.params.blogId;
    if(!validator.isValidObjectId(blogId)) return res.status(400).send({ status: false, message: "Please provide valid blogId" });
    
    if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "Enter Data to update." })

    let validBlog = await blogsModel.findOne({ _id: blogId , isDeleted: false })
    if (!validBlog) return res.status(404).send({ status: false, message: "Blog not found." })

    // can update title, body, adding tags, adding a subcategory and isPublished

    const updations = {}

    if(req.body.title){
        req.body.title = req.body.title.trim()
        if(!req.body.title) return res.status(400).send({status: false, message: "Please provide a valid string to update title."})
        updations.title = req.body.title
    }

    if(req.body.body){
        req.body.body = req.body.body.trim()
        if(!req.body.body) return res.status(400).send({status: false, message: "Please provide a valid string to update body."})
        updations.body = req.body.body
    }

    if(req.body.tags){
        let tags = req.body.tags
        if(tags.length == 0 ) return res.status(400).send({status: false, message: "Please provide valid tags to update body."})
        let existingTags = validBlog.tags
        if(existingTags.includes(tags)) return res.status(400).send({status: false, message: "tag already existing."})
        updations.tags = existingTags.concat(tags)
    }

    if(req.body.subcategory){
        let subcategory = req.body.subcategory
        if(subcategory.length == 0 ) return res.status(400).send({status: false, message: "Please provide valid subcategory to update body."})
        let existingSubcategory = validBlog.subcategory
        if(existingSubcategory.includes(subcategory)) return res.status(400).send({status: false, message: "subcategory already existing."})
        updations.subcategory = existingSubcategory.concat(subcategory)
    }

    if(req.body.isPublished){ 
        updations.isPublished = true
        updations.publishedAt = Date.now()
    }

    let updatedBlog = await blogsModel.findOneAndUpdate({ _id: blogId, isDeleted: false },updations,{ new: true });
    if (!updatedBlog) return res.status(404).send({ status: false, message: "No such blog exists" });
    return res.status(200).send({status:true, data:updatedBlog})

} catch (error) {
    return res.status(500).send({ message: "Error", error: error.message });
    }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteBlogById = async function (req, res) {
try {
    let blog = req.params.blogId;
    if(!validator.isValidObjectId(blog)) return res.status(400).send({ status: false, message: "Please provide valid blogId" });


    let validBlog = await blogsModel.findOneAndUpdate({ _id: blog, isDeleted: false },{isDeleted: true, deletedAt: Date.now()},{ new: true });
    if (!validBlog) return res.status(404).send({ status: false, message: "No such blog exists" });
    
    return res.status(200).send({ status: true, message: "Blog deleted" });

}catch (error) {
    return res.status(500).send({ message: "Error", error: error.message });
}
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteBlogByQueryParams = async function (req, res) {
try {
    let filter = req.query;

    let {tags, subcategory,authorId,category, isPublished} = filter

    let appliedFilter = {isDeleted: false}
    if(authorId) { 
        if(!validator.isValidObjectId(authorId)) return res.status(400).send({ status: false, message: "Please provide valid authorId" });
        appliedFilter.authorId=authorId
    }
    if(category) appliedFilter.category=category
    if(tags) appliedFilter.tags = {$in:[tags]} 
    if(subcategory) appliedFilter.subcategory = {$in:[subcategory]}
    if(isPublished == false) appliedFilter.isPublished = false

    let deleteBlogs = await blogsModel.updateMany(appliedFilter,{isDeleted: true, deletedAt:Date.now()},{new:true}).lean();
    if (deleteBlogs.length == 0) {
        return res.status(404).send({ status: false, message: "Blogs not found." });
    }
    return res.status(200).send({ status: true, message: "Blogs deleted" });
} catch (error) {
    return res.status(500).send({ message: "Error", error: error.message });
}
};

module.exports = {createBlogs, getBlogs, updateBlogs, deleteBlogById, deleteBlogByQueryParams}