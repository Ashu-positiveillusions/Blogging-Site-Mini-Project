const express = require('express');
const router = express.Router();
const authorController=require("../controller/authorController")
const blogsController=require("../controller/blogController")
const middleware=require("../middleware/authenticationAndAuthorisation")


//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Phase1:
router.post("/authors",authorController.createAuthor )

router.post("/blogs",middleware.authenticationUser, blogsController.createBlogs )

router.get("/blogs",middleware.authenticationUser, blogsController.getBlogs)

router.put("/blogs/:blogId/:authorId",middleware.authenticationUser, middleware.authorisationUser, blogsController.updateBlogs)

router.delete("/blogs/:blogId/:authorId",middleware.authenticationUser, middleware.authorisationUser, blogsController.deleteBlogById)

router.delete("/blogs",middleware.authenticationUser,blogsController.deleteBlogByQueryParams)

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Phase2:
router.post("/login", authorController.loginUser)

module.exports = router;