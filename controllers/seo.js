const asyncHandler = require('express-async-handler');
const Article = require('../models/article');
const Question = require('../models/question');
const VideoCategory = require('../models/videoCategory');

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

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrl(siteUrl, path) {
  return `${siteUrl}${path}`;
}

exports.getRobotsTxt = asyncHandler(async (req, res) => {
  const siteUrl = getSiteUrl(req);
  const content = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /dashboard',
    'Disallow: /signin',
    'Disallow: /forgot_password',
    'Disallow: /register',
    'Disallow: /my_class_sessions',
    'Disallow: /user_messages',
    'Sitemap: ' + buildUrl(siteUrl, '/sitemap.xml'),
    '',
  ].join('\n');

  res.type('text/plain; charset=utf-8');
  return res.send(content);
});

exports.getSitemapXml = asyncHandler(async (req, res) => {
  const siteUrl = getSiteUrl(req);

  const [articles, questions, videoCategories] = await Promise.all([
    Article.find({
      $or: [
        { status: 'published' },
        { status: { $exists: false } },
      ],
    }, '_id updatedAt'),
    Question.find({ isAnswered: true }, '_id updatedAt'),
    VideoCategory.find({}, '_id updatedAt'),
  ]);

  const entries = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/all_articles', changefreq: 'weekly', priority: '0.8' },
    { path: '/all_questions', changefreq: 'daily', priority: '0.8' },
    { path: '/donate', changefreq: 'monthly', priority: '0.6' },
  ];

  articles.forEach((article) => {
    entries.push({
      path: `/article/${article._id}`,
      lastmod: article.updatedAt,
      changefreq: 'weekly',
      priority: '0.7',
    });
  });

  questions.forEach((question) => {
    entries.push({
      path: `/question/${question._id}`,
      lastmod: question.updatedAt,
      changefreq: 'weekly',
      priority: '0.7',
    });
  });

  videoCategories.forEach((category) => {
    entries.push({
      path: `/video_categories/${category._id}`,
      lastmod: category.updatedAt,
      changefreq: 'weekly',
      priority: '0.7',
    });
  });

  const xmlBody = entries.map((entry) => {
    const loc = escapeXml(buildUrl(siteUrl, entry.path));
    const lastmod = entry.lastmod ? `<lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>` : '';
    const changefreq = entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : '';
    const priority = entry.priority ? `<priority>${entry.priority}</priority>` : '';
    return `<url><loc>${loc}</loc>${lastmod}${changefreq}${priority}</url>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlBody}</urlset>`;

  res.type('application/xml; charset=utf-8');
  return res.send(xml);
});
