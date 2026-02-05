const index_controller = require("../controllers/index");
const categoryController = require('../controllers/addCategory');
const sessionController = require('../controllers/class_session');
const deleteCategoryController = require('../controllers/deleteCategory');
const deleteVideoController = require('../controllers/deleteVideo');
const userAccount = require("../controllers/userAccount");
const adminAccount = require('../controllers/adminAccount');
const questionController = require("../controllers/question");
const sessionSignOut = require("../controllers/signOut");
const { validateUserSignUp } = require("../middleware/userValidation");
const { validateAdminSignUp } = require("../middleware/adminValidation");
const addVideoController = require("../controllers/addVideo");
const donateController = require('../controllers/donatePage');
const videoListController = require("../controllers/videoList");
const articleController = require('../controllers/article');
const liveClassController = require('../controllers/live_class'); 
const searchController = require("../controllers/searchController");
const isAuthenticated = require("../middleware/userSessionAuth");
const isAdmin = require("../middleware/adminSessionAuth");
const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", index_controller.index);

// GET: Search page with results
router.get('/search', searchController.search);

// Display registration form
router.get('/register', isAuthenticated, sessionController.getClassSessionRegistration);

// Handle form submission
router.post('/register', isAuthenticated, sessionController.postClassSessionRegistration);

// Display pending registrations
router.get('/registrations/pending', isAdmin, sessionController.getPendingRegistrations);

// Handle code assignment
router.post('/registrations/pending', isAdmin, sessionController.postPendingRegistrations);

//Display all class sessions
router.get('/all_class_sessions', isAdmin, sessionController.getAllClassSessions);

//Display specific class session participants
router.get('/class_session/:id', isAdmin, sessionController.getUsersForClassSession);

//Get: Add video category
router.get('/add_category', isAdmin, categoryController.getAddCategory);

//Post: Add video category
router.post('/add_category', isAdmin, categoryController.postAddCategory);

//Get: Add class Session
router.get('/add_session', isAdmin, sessionController.getAddClassSession);

//Post: Add class session
router.post('/add_session', isAdmin, sessionController.postAddClassSession);


router.get('/video_categories/:id', videoListController.getVideoList);

// Add routes for deleting a video category
router.get('/delete_category', isAdmin, deleteCategoryController.getDeleteCategory);

router.post('/delete_category', isAdmin, deleteCategoryController.postDeleteCategory);

// Admin Routes for Articles
router.get('/create_article', isAdmin, articleController.getCreateArticle); // Form to create articles
router.post('/create_article', isAdmin, articleController.postCreateArticle); // Save article

// Public Routes for Articles
router.get('/article/:id', articleController.getArticle); // View a specific article
router.get('/all_articles', articleController.getAllArticles); // View all articles

// Fetch and List Articles for Delete
router.get('/delete_article', articleController.getDeleteArticle);
router.post('/delete_article', articleController.postDeleteArticle);

// Fetch and List Articles for Edit
router.get('/edit_article', articleController.getEditArticleList);
router.post('/edit_article', articleController.getArticleForEdit);
router.post('/update_article', articleController.postUpdateArticle);

// GET: Render add video form
router.get('/add_video', addVideoController.getAddVideo);

// POST: Handle video form submission
router.post('/add_video', addVideoController.postAddVideo);

// Get: Display delete video category dropdown
router.get("/delete_video_list", isAdmin, deleteVideoController.getVideoCategories);

// Post: Display videos under selected category
router.post("/delete_video", isAdmin, deleteVideoController.postVideoList);

// Post: Delete a specific video
router.post("/delete_video/:id", isAdmin, deleteVideoController.postDeleteVideo);


// GET: Display the sign-in page
router.get('/signin', adminAccount.getSignInPage);

// POST: Handle user sign-in
router.post('/signin/user', userAccount.postUserSignIn);

// POST: Handle admin sign-in
router.post('/signin/admin', adminAccount.postAdminSignIn);

// User Sign-Up Routes
router.get('/signup', userAccount.getUserSignUp);

router.post('/signup',validateUserSignUp, userAccount.postUserSignUp);

router.get('/user_signup_success', userAccount.getUserSignUpSuccess);

router.get('/user_messages', userAccount.getUserMessages);

router.get('/admin_signup_success', adminAccount.getAdminSignUpSuccess);

// Admin Sign-Up Routes
router.get('/signup/admin', isAdmin, adminAccount.getAdminSignUp); 

router.post('/signup/admin',validateAdminSignUp,isAdmin, adminAccount.postAdminSignUp);

// GET: Admin Dashboard
router.get('/dashboard',isAdmin, adminAccount.getAdminDashboard);

// GET: Display list of admins for deletion
router.get('/delete_admin', isAdmin, adminAccount.getDeleteAdminPage);

// POST: Handle admin deletion
router.post('/delete_admin', isAdmin, adminAccount.postDeleteAdmin);


//GET signout
router.get('/signout', sessionSignOut.signOut);

// Question Routes
router.get("/ask_sheesu",isAuthenticated, questionController.getAskQuestion);
router.post("/ask_sheesu",isAuthenticated, questionController.postAskQuestion);

// Admin routes
router.get("/manage_questions",isAdmin, questionController.getQuestions);
router.post("/answer_question",isAdmin, questionController.postAnswerQuestion);

// Route to get question details by ID
router.get('/all_questions', questionController.getAllQuestions);

// Route to get question details by ID
router.get('/question/:id', questionController.getQuestionDetails);

// GET: Display all questions to be deleted
router.get('/delete_question', isAdmin, questionController.getDisplayDeleteQuestions);

// POST: Delete a question
router.post('/delete_question', isAdmin, questionController.postDeleteQuestion);

//Donate Page
router.get('/donate', donateController.getDonatePage);

router.get('/live_class_auth', isAuthenticated, sessionController.getLiveClassAuth);

router.post('/live_class_auth', isAuthenticated, sessionController.postLiveClassAuth);

router.get('/live_class', isAuthenticated, liveClassController.getLiveClass);

router.get('/registration_fee', isAdmin, adminAccount.getRegistrationFee);
router.post('/registration_fee', isAdmin, adminAccount.postRegistrationFee);

module.exports = router;