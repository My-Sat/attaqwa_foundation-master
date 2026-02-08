const Question = require("../models/question");
const Message = require("../models/messages");
const asyncHandler = require("express-async-handler");

exports.getAskQuestion = asyncHandler(async (req, res) => {
  const success = req.flash('success');
  const error = req.flash('error');

  res.render("askQuestion", {
    title: "Ask Sheesu",
    success,
    error,
  });
});

//POST: Submit a question
exports.postAskQuestion = asyncHandler(async (req, res) => {
  const questionText = (req.body.question || '').trim();
  const userId = req.session.user?.id;

  if (!questionText) {
    req.flash('error', 'Please provide a question.');
    return res.redirect('/ask_sheesu');
  }

  if (questionText.length > 1000) {
    req.flash('error', 'Question is too long. Please keep it under 1000 characters.');
    return res.redirect('/ask_sheesu');
  }

  try {
    await Question.create({ userId, question: questionText });
    req.flash('success', 'Your question has been submitted successfully!');
    res.redirect('/ask_sheesu');
  } catch (err) {
    req.flash('error', 'Something went wrong while submitting your question.');
    res.redirect('/ask_sheesu');
  }
});

// Controller function to get a specific question by ID
exports.getQuestionDetails = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const question = await Question.findById(questionId);

  if (!question) {
    return res.status(404).render('error', { message: "Question not found." });
  }

  res.render('questionDetail', { title: 'Question Detail', question });
});

// GET: Display All Answered Questions
exports.getAllQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find({ isAnswered: true })
    .sort({ createdAt: -1 });

  res.render('allQuestions', { 
    title: "All Questions",
    questions
  });
});
