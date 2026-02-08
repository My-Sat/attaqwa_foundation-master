const asyncHandler = require('express-async-handler');
const Registration = require('../models/class_registration');
const LiveClassState = require('../models/live_class_state');

async function getCurrentLiveState() {
  return LiveClassState.findOne({}).populate('activeSessionId');
}

exports.getLiveClass = asyncHandler(async (req, res) => {
  const userId = req.session.user.id;
  const liveState = await getCurrentLiveState();

  if (!liveState || !liveState.isLive || !liveState.activeSessionId) {
    req.flash('error', 'Class has not started yet. Please wait for admin to start the live class.');
    return res.redirect('/');
  }

  const activeSessionId = liveState.activeSessionId._id;
  const registration = await Registration.findOne({
    userId,
    classSessionId: activeSessionId,
    approved: true,
    accessExpiresAt: { $gt: new Date() },
  })
    .populate('classSessionId')
    .sort({ accessExpiresAt: -1, createdAt: -1 });

  if (!registration) {
    req.flash('error', 'You do not have active access for the current live session. Register and wait for approval.');
    return res.redirect('/register');
  }

  res.render('live_class', {
    title: 'Live Class',
    classSession: registration.classSessionId,
    accessExpiresAt: registration.accessExpiresAt,
    roomName: liveState.roomName,
    liveStartedAt: liveState.startedAt,
    attendeeName: req.session.user.username || 'User',
  });
});

exports.getLiveClassStatus = asyncHandler(async (req, res) => {
  const liveState = await getCurrentLiveState();

  if (!liveState || !liveState.isLive || !liveState.activeSessionId) {
    return res.json({
      isLive: false,
      activeSessionId: null,
    });
  }

  return res.json({
    isLive: true,
    activeSessionId: String(liveState.activeSessionId._id),
    roomName: liveState.roomName,
    startedAt: liveState.startedAt || null,
  });
});
