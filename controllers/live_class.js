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
    return res.redirect('/?liveClassNotice=not_started');
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
    return res.redirect('/register?liveClassNotice=no_access');
  }

  res.render('live_class', {
    title: 'Live Class',
    classSession: registration.classSessionId,
    accessExpiresAt: registration.accessExpiresAt,
    roomName: liveState.roomName,
    liveStartedAt: liveState.startedAt,
    attendeeName: req.session.user.username || 'User',
    isAdminViewer: false,
  });
});

exports.getAdminLiveClass = asyncHandler(async (req, res) => {
  const liveState = await getCurrentLiveState();

  if (!liveState || !liveState.isLive || !liveState.activeSessionId) {
    return res.status(400).send('No live class is currently active.');
  }

  return res.render('live_class', {
    title: 'Live Class',
    classSession: liveState.activeSessionId,
    accessExpiresAt: null,
    roomName: liveState.roomName,
    liveStartedAt: liveState.startedAt,
    attendeeName: req.session?.admin?.username || 'Admin',
    isAdminViewer: true,
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
