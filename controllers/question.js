const Question = require("../models/question");
const Message = require("../models/messages");
const asyncHandler = require("express-async-handler");

exports.getAskQuestion = asyncHandler(async (req, res) => {
  const success = req.flash('success'); // Explicitly fetch 'success' messages
  const error = req.flash('error');    // Explicitly fetch 'error' messages

  console.log('Flash Success on GET:', success);
  console.log('Flash Error on GET:', error);

  res.render("askQuestion", {
    title: "Ask Sheesu",
    success,
    error,
  });
});

//POST: Submit a question
exports.postAskQuestion = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const userId = req.session.user?.id;

  if (!question) {
    req.flash('error', 'Please provide a question.');
    return res.redirect('/ask_sheesu');
  }

  try {
    await Question.create({ userId, question });
    req.flash('success', 'Your question has been submitted successfully!');
    console.log('Flash Success Set:', req.session.flash);
    res.redirect('/ask_sheesu');
  } catch (err) {
    req.flash('error', 'Something went wrong while submitting your question.');
    console.log('Flash Error Set on Exception:', req.session.flash);
    res.redirect('/ask_sheesu');
  }
});

// GET: Display all questions (Admin view)
exports.getQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find()
    .populate('userId', 'username phoneNumber') // Fetch only username and phone fields
    .sort({ createdAt: -1 });
  res.render("manageQuestions", { 
    title: "Manage Questions", 
    questions 
  });
});

// POST: Admin submits an answer to a question
exports.postAnswerQuestion = asyncHandler(async (req, res) => {
  const { questionId, answer } = req.body;

  // Find the question to get the associated userId
  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).send('Question not found.');
  }

  // Update the question with the answer
  question.answer = answer;
  question.isAnswered = true;
  await question.save();

  // Create a message for the associated user
  if (question.userId) {
    await Message.create({
      userId: question.userId,
      question: question.question,
      answer
    });
  }

  res.redirect('/manage_questions');
});

// Controller function to get a specific question by ID
exports.getQuestionDetails = asyncHandler(async (req, res) => {
    const questionId = req.params.id;
  
    // Find the question by ID
    const question = await Question.findById(questionId);
  
    if (!question) {
      return res.status(404).render('error', { message: "Question not found." });
    }
  
    // Render the question details page
    res.render('questionDetail', { question });
  });

  // GET: Display All Answered Questions
exports.getAllQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({ isAnswered: true }).sort({ createdAt: -1 });

  res.render('allQuestions', { 
    title: "All Questions",
    questions
  });
});

// GET: Display all questions with delete link
exports.getDisplayDeleteQuestions = asyncHandler(async (req, res) => {
  const success = req.flash('success'); // Explicitly fetch 'success' messages
  const error = req.flash('error');    // Explicitly fetch 'error' messages

  const questions = await Question.find().populate('userId', 'username'); // Fetch questions with associated users
  res.render('deleteQuestion', {
    title: 'Delete Questions',
    questions,
    success,
    error,
  });
});

exports.postDeleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.body;

  try {
    await Question.findByIdAndDelete(questionId);
    req.flash('success', 'Question deleted successfully.');
    res.redirect('/delete_question');
  } catch (err) {
    console.error('Error deleting question:', err);
    req.flash('error', 'Failed to delete question. Please try again.');
    res.redirect('/delete_question');
  }
});
