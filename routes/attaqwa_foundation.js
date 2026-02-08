const index_controller = require("../controllers/index");
const sessionController = require('../controllers/class_session');
const userAccount = require("../controllers/userAccount");
const adminAccount = require('../controllers/adminAccount');
const authController = require('../controllers/auth');
const questionController = require("../controllers/question");
const sessionSignOut = require("../controllers/signOut");
const { validateUserSignUp } = require("../middleware/userValidation");
const { validateAdminSignUp } = require("../middleware/adminValidation");
const donateController = require('../controllers/donatePage');
const videoListController = require("../controllers/videoList");
const articleController = require('../controllers/article');
const liveClassController = require('../controllers/live_class'); 
const searchController = require("../controllers/searchController");
const adminDashboardController = require('../controllers/adminDashboard');
const isAuthenticated = require("../middleware/userSessionAuth");
const isAdmin = require("../middleware/adminSessionAuth");
const express = require("express");
const router = express.Router();

const redirectDeprecatedToDashboard = (req, res) => res.redirect('/dashboard');

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

// Deprecated standalone page: add category
router.get('/add_category', isAdmin, redirectDeprecatedToDashboard);
router.post('/add_category', isAdmin, redirectDeprecatedToDashboard);

//Get: Add class Session
router.get('/add_session', isAdmin, sessionController.getAddClassSession);

//Post: Add class session
router.post('/add_session', isAdmin, sessionController.postAddClassSession);


router.get('/video_categories/:id', videoListController.getVideoList);

// Deprecated standalone page: delete category
router.get('/delete_category', isAdmin, redirectDeprecatedToDashboard);
router.post('/delete_category', isAdmin, redirectDeprecatedToDashboard);

// Admin Routes for Articles
router.get('/create_article', isAdmin, articleController.getCreateArticle); // Form to create articles
router.post('/create_article', isAdmin, articleController.postCreateArticle); // Save article

// Public Routes for Articles
router.get('/article/:id', articleController.getArticle); // View a specific article
router.get('/all_articles', articleController.getAllArticles); // View all articles

// Deprecated standalone pages: article delete/edit
router.get('/delete_article', isAdmin, redirectDeprecatedToDashboard);
router.post('/delete_article', isAdmin, redirectDeprecatedToDashboard);
router.get('/edit_article', isAdmin, redirectDeprecatedToDashboard);
router.post('/edit_article', isAdmin, redirectDeprecatedToDashboard);
router.post('/update_article', isAdmin, redirectDeprecatedToDashboard);

// Deprecated standalone page: add video
router.get('/add_video', isAdmin, redirectDeprecatedToDashboard);
router.post('/add_video', isAdmin, redirectDeprecatedToDashboard);

// Deprecated standalone pages: delete video flow
router.get("/delete_video_list", isAdmin, redirectDeprecatedToDashboard);
router.post("/delete_video", isAdmin, redirectDeprecatedToDashboard);
router.post("/delete_video/:id", isAdmin, redirectDeprecatedToDashboard);


// GET: Display the sign-in page
router.get('/signin', authController.getSignInPage);

// POST: Handle sign-in for all roles
router.post('/signin', authController.postSignIn);

// Backward compatibility for legacy sign-in routes
router.get('/signin/user', (req, res) => res.redirect('/signin'));
router.get('/signin/admin', (req, res) => res.redirect('/signin'));
router.post('/signin/user', authController.postSignIn);
router.post('/signin/admin', authController.postSignIn);

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
router.get('/api/admin/video-categories', isAdmin, adminDashboardController.getVideoCategories);
router.post('/api/admin/video-categories', isAdmin, adminDashboardController.createVideoCategory);
router.delete('/api/admin/video-categories/:id', isAdmin, adminDashboardController.deleteVideoCategory);
router.get('/api/admin/videos', isAdmin, adminDashboardController.getVideos);
router.post('/api/admin/videos', isAdmin, adminDashboardController.createVideo);
router.delete('/api/admin/videos/:id', isAdmin, adminDashboardController.deleteVideo);
router.get('/api/admin/admins', isAdmin, adminDashboardController.getAdmins);
router.delete('/api/admin/admins/:id', isAdmin, adminDashboardController.deleteAdmin);
router.get('/api/admin/questions', isAdmin, adminDashboardController.getQuestions);
router.delete('/api/admin/questions/:id', isAdmin, adminDashboardController.deleteQuestion);
router.get('/api/admin/articles', isAdmin, adminDashboardController.getArticles);
router.get('/api/admin/articles/:id', isAdmin, adminDashboardController.getArticleById);
router.put('/api/admin/articles/:id', isAdmin, adminDashboardController.updateArticle);
router.delete('/api/admin/articles/:id', isAdmin, adminDashboardController.deleteArticle);
router.get('/api/admin/class-sessions', isAdmin, adminDashboardController.getClassSessions);
router.delete('/api/admin/class-sessions/:id', isAdmin, adminDashboardController.deleteClassSession);

// Deprecated standalone page: delete admin
router.get('/delete_admin', isAdmin, redirectDeprecatedToDashboard);
router.post('/delete_admin', isAdmin, redirectDeprecatedToDashboard);


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

// Deprecated standalone page: delete question
router.get('/delete_question', isAdmin, redirectDeprecatedToDashboard);
router.post('/delete_question', isAdmin, redirectDeprecatedToDashboard);

//Donate Page
router.get('/donate', donateController.getDonatePage);
router.get('/api/home-feed/:type', index_controller.getHomeFeed);

router.get('/live_class_auth', isAuthenticated, sessionController.getLiveClassAuth);

router.post('/live_class_auth', isAuthenticated, sessionController.postLiveClassAuth);

router.get('/live_class', isAuthenticated, liveClassController.getLiveClass);

router.get('/registration_fee', isAdmin, adminAccount.getRegistrationFee);
router.post('/registration_fee', isAdmin, adminAccount.postRegistrationFee);

module.exports = router;
