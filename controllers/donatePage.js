// Controller to render the Donate page
exports.getDonatePage = (req, res) => {
  const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  const forwardedProto = (req.headers['x-forwarded-proto'] || '').toString().split(',')[0].trim();
  const protocol = forwardedProto || req.protocol || 'https';
  const host = req.get('host') || '';
  const siteUrl = configured || `${protocol}://${host}`;

  res.render('donatePage', {
    title: 'Donate',
    seo: {
      title: 'Donate | At-Taqwa Foundation',
      description: 'Support At-Taqwa Foundation programs through Mobile Money or bank transfer donations.',
      canonical: `${siteUrl}/donate`,
      ogType: 'website',
      image: '/images/attaqwa.jpg',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'DonateAction',
          name: 'Donate to At-Taqwa Foundation',
          target: `${siteUrl}/donate`,
          agent: {
            '@type': 'Organization',
            name: 'At-Taqwa Foundation',
          },
        },
      ],
    },
  });
};
  
