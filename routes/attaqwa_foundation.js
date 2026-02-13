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
const postController = require('../controllers/post');
const seoController = require('../controllers/seo');
const isAuthenticated = require("../middleware/userSessionAuth");
const isAdmin = require("../middleware/adminSessionAuth");
const isAnySessionAuthenticated = require('../middleware/anySessionAuth');
const express = require("express");
const router = express.Router();

const redirectDeprecatedToDashboard = (req, res) => res.redirect('/dashboard');

/* GET home page. */
router.get("/", index_controller.index);
router.get('/robots.txt', seoController.getRobotsTxt);
router.get('/sitemap.xml', seoController.getSitemapXml);

// GET: Search page with results
router.get('/search', searchController.search);
router.get('/api/posts', postController.getHomePosts);
router.get('/api/posts/:id', postController.getPostById);
router.post('/api/posts', isAnySessionAuthenticated, postController.createPost);
router.post('/api/posts/:id/comments', isAnySessionAuthenticated, postController.createComment);
router.post('/api/posts/:id/like', isAnySessionAuthenticated, postController.togglePostLike);
router.post('/api/posts/:postId/comments/:commentId/like', isAnySessionAuthenticated, postController.toggleCommentLike);

// Display registration form
router.get('/register', isAuthenticated, sessionController.getClassSessionRegistration);

// Handle form submission
router.post('/register', isAuthenticated, sessionController.postClassSessionRegistration);
router.get('/my_class_sessions', isAuthenticated, sessionController.getMyClassSessions);

// Display pending registrations
router.get('/registrations/pending', isAdmin, sessionController.getPendingRegistrations);

// Handle code assignment
router.post('/registrations/pending', isAdmin, sessionController.postPendingRegistrations);

//Display all class sessions
router.get('/all_class_sessions', isAdmin, redirectDeprecatedToDashboard);

//Display specific class session participants
router.get('/class_session/:id', isAdmin, redirectDeprecatedToDashboard);

// Deprecated standalone page: add category
router.get('/add_category', isAdmin, redirectDeprecatedToDashboard);
router.post('/add_category', isAdmin, redirectDeprecatedToDashboard);

//Get: Add class Session
router.get('/add_session', isAdmin, redirectDeprecatedToDashboard);

//Post: Add class session
router.post('/add_session', isAdmin, redirectDeprecatedToDashboard);


router.get('/video_categories/:id', videoListController.getVideoList);

// Deprecated standalone page: delete category
router.get('/delete_category', isAdmin, redirectDeprecatedToDashboard);
router.post('/delete_category', isAdmin, redirectDeprecatedToDashboard);

// Admin Routes for Articles
router.get('/create_article', isAdmin, articleController.getCreateArticle); // Form to create articles
router.get('/create_article/:id', isAdmin, articleController.getCreateArticle); // Form to edit article
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
router.get('/forgot_password', authController.getForgotPasswordPage);
router.post('/forgot_password/request', authController.postForgotPasswordRequest);
router.post('/forgot_password/verify', authController.postForgotPasswordVerify);

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
router.get('/messages/:id/open', isAuthenticated, userAccount.openUserMessage);
router.get('/settings/password', isAuthenticated, userAccount.getPasswordSettings);
router.post('/settings/password', isAuthenticated, userAccount.postPasswordSettings);

router.get('/admin_signup_success', adminAccount.getAdminSignUpSuccess);

// Admin Sign-Up Routes
router.get('/signup/admin', isAdmin, adminAccount.getAdminSignUp); 

router.post('/signup/admin',validateAdminSignUp,isAdmin, adminAccount.postAdminSignUp);
router.get('/admin/settings/password', isAdmin, adminAccount.getPasswordSettings);
router.post('/admin/settings/password', isAdmin, adminAccount.postPasswordSettings);

// GET: Admin Dashboard
router.get('/dashboard',isAdmin, adminAccount.getAdminDashboard);
router.get('/api/admin/video-categories', isAdmin, adminDashboardController.getVideoCategories);
router.post('/api/admin/video-categories', isAdmin, adminDashboardController.createVideoCategory);
router.put('/api/admin/video-categories/:id', isAdmin, adminDashboardController.updateVideoCategory);
router.delete('/api/admin/video-categories/:id', isAdmin, adminDashboardController.deleteVideoCategory);
router.get('/api/admin/videos', isAdmin, adminDashboardController.getVideos);
router.post('/api/admin/videos', isAdmin, adminDashboardController.createVideo);
router.delete('/api/admin/videos/:id', isAdmin, adminDashboardController.deleteVideo);
router.get('/api/admin/admins', isAdmin, adminDashboardController.getAdmins);
router.delete('/api/admin/admins/:id', isAdmin, adminDashboardController.deleteAdmin);
router.get('/api/admin/questions', isAdmin, adminDashboardController.getQuestions);
router.put('/api/admin/questions/:id/answer', isAdmin, adminDashboardController.updateQuestionAnswer);
router.delete('/api/admin/questions/:id', isAdmin, adminDashboardController.deleteQuestion);
router.get('/api/admin/articles', isAdmin, adminDashboardController.getArticles);
router.get('/api/admin/articles/:id', isAdmin, adminDashboardController.getArticleById);
router.put('/api/admin/articles/:id', isAdmin, adminDashboardController.updateArticle);
router.delete('/api/admin/articles/:id', isAdmin, adminDashboardController.deleteArticle);
router.get('/api/admin/registrations/pending/count', isAdmin, adminDashboardController.getPendingRegistrationsCount);
router.get('/api/admin/class-sessions', isAdmin, adminDashboardController.getClassSessions);
router.post('/api/admin/class-sessions', isAdmin, adminDashboardController.createClassSession);
router.get('/api/admin/class-sessions/:id/users', isAdmin, adminDashboardController.getClassSessionUsers);
router.put('/api/admin/class-sessions/:id', isAdmin, adminDashboardController.updateClassSession);
router.delete('/api/admin/class-sessions/:id', isAdmin, adminDashboardController.deleteClassSession);
router.get('/api/admin/live-class/status', isAdmin, adminDashboardController.getLiveClassStatus);
router.post('/api/admin/live-class/start', isAdmin, adminDashboardController.startLiveClass);
router.post('/api/admin/live-class/end', isAdmin, adminDashboardController.endLiveClass);
router.get('/api/admin/live-stream-schedule', isAdmin, adminDashboardController.getLiveStreamSchedule);
router.put('/api/admin/live-stream-schedule', isAdmin, adminDashboardController.upsertLiveStreamSchedule);
router.delete('/api/admin/live-stream-schedule', isAdmin, adminDashboardController.clearLiveStreamSchedule);

// Deprecated standalone page: delete admin
router.get('/delete_admin', isAdmin, redirectDeprecatedToDashboard);
router.post('/delete_admin', isAdmin, redirectDeprecatedToDashboard);


//GET signout
router.get('/signout', sessionSignOut.signOut);

// Question Routes
router.get("/ask_sheesu",isAuthenticated, questionController.getAskQuestion);
router.post("/ask_sheesu",isAuthenticated, questionController.postAskQuestion);

// Admin routes
router.get("/manage_questions",isAdmin, redirectDeprecatedToDashboard);
router.post("/answer_question",isAdmin, redirectDeprecatedToDashboard);

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
router.get('/api/live-stream/current', index_controller.getCurrentLiveStream);

router.get('/live_class_auth', isAuthenticated, sessionController.getLiveClassAuth);

router.post('/live_class_auth', isAuthenticated, sessionController.postLiveClassAuth);

router.get('/live_class', isAuthenticated, liveClassController.getLiveClass);
router.get('/live_class/admin', isAdmin, liveClassController.getAdminLiveClass);
router.get('/api/live-class/status', isAuthenticated, liveClassController.getLiveClassStatus);

router.get('/registration_fee', isAdmin, redirectDeprecatedToDashboard);
router.post('/registration_fee', isAdmin, redirectDeprecatedToDashboard);

module.exports = router;
