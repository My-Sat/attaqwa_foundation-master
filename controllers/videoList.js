const Video = require('../models/addVideo'); // Import the Video model
const VideoCategory = require('../models/videoCategory'); // Import the VideoCategory model
const asyncHandler = require('express-async-handler');

function getSiteUrl(req) {
  const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) {
    return configured;
  }

  const forwardedProto = (req.headers['x-forwarded-proto'] || '').toString().split(',')[0].trim();
  const protocol = forwardedProto || req.protocol || 'https';
  const host = req.get('host') || '';
  return `${protocol}://${host}`;
}

// GET: Display videos under a specific category
exports.getVideoList = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await VideoCategory.findById(categoryId);
    if (!category) return res.status(404).send('Category not found');

    const videos = await Video.find({ category: categoryId });
    const siteUrl = getSiteUrl(req);
    const pageUrl = `${siteUrl}/video_categories/${category._id}`;

    res.render('videoList', {
      title: `Videos - ${category.title}`,
      categoryTitle: category.title,
      videos,
      seo: {
        title: `${category.title} Videos | At-Taqwa Foundation`,
        description: `Watch ${category.title} video resources from At-Taqwa Foundation.`,
        canonical: pageUrl,
        ogType: 'video.other',
        image: '/images/attaqwa.jpg',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${category.title} Videos`,
            url: pageUrl,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${category.title} Videos`,
            itemListElement: videos.map((video, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: video.title,
              url: video.youtubeUrl,
            })),
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});
