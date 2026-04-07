import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const upsertJsonLdScript = (dataSeoAttr, jsonObj) => {
  let el = document.querySelector(`script[type="application/ld+json"][data-seo="${dataSeoAttr}"]`);
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo', dataSeoAttr);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(jsonObj);
};

const removeJsonLdScript = (dataSeoAttr) => {
  const el = document.querySelector(`script[type="application/ld+json"][data-seo="${dataSeoAttr}"]`);
  if (el) el.remove();
};

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} [props.keywords]
 * @param {string} [props.ogImage]
 * @param {string} [props.canonicalUrl] - absolute URL override
 * @param {string} [props.type] - og:type
 * @param {boolean} [props.noindex]
 * @param {boolean} [props.includeFaqSchema] - only on pages that visibly show these FAQs (e.g. home)
 * @param {boolean} [props.includeWebSiteSchema] - WebSite + publisher; use on homepage
 * @param {{ name: string, path: string }[]} [props.breadcrumbs] - path is pathname e.g. /pyq
 */
const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  type = 'website',
  noindex = false,
  includeFaqSchema = false,
  includeWebSiteSchema = false,
  breadcrumbs = null,
}) => {
  const location = useLocation();
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://www.vimaanna.online';
  const fullUrl = canonicalUrl || `${baseUrl}${location.pathname}`;
  const breadcrumbsKey = useMemo(
    () => (Array.isArray(breadcrumbs) ? JSON.stringify(breadcrumbs) : ''),
    [breadcrumbs]
  );

  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const updateMetaTag = (name, content, isProperty = false) => {
      if (content === undefined || content === null || content === '') return;

      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    if (title) {
      updateMetaTag('title', title);
    }

    if (description) {
      updateMetaTag('description', description);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:image', ogImage || `${baseUrl}/vimaanna-logo.png`, true);
    updateMetaTag('og:site_name', 'VIMAANNA - DGCA Training Portal', true);
    updateMetaTag('og:locale', 'en_IN', true);

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', fullUrl);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage || `${baseUrl}/vimaanna-logo.png`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Per-route WebPage (does not replace static Organization JSON-LD from index.html)
    if (title && description) {
      upsertJsonLdScript('webpage', {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: fullUrl,
        inLanguage: 'en-IN',
        isPartOf: {
          '@type': 'WebSite',
          name: 'VIMAANNA DGCA Training Portal',
          url: baseUrl,
        },
      });
    }

    if (includeWebSiteSchema) {
      upsertJsonLdScript('website', {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'VIMAANNA DGCA Training Portal',
        alternateName: 'VIMAANNA',
        url: baseUrl,
        description:
          description ||
          'DGCA exam preparation for CPL and ATPL in India: question bank, PYQs, and study materials for Air Regulations, Meteorology, Air Navigation, Technical General, and Radio Telephony.',
        publisher: {
          '@type': 'Organization',
          name: 'VIMAANNA',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/vimaanna-logo.png`,
          },
        },
      });
    } else {
      removeJsonLdScript('website');
    }

    const crumbs = breadcrumbsKey ? JSON.parse(breadcrumbsKey) : [];
    if (Array.isArray(crumbs) && crumbs.length > 0) {
      upsertJsonLdScript('breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.path.startsWith('http') ? crumb.path : `${baseUrl}${crumb.path}`,
        })),
      });
    } else {
      removeJsonLdScript('breadcrumb');
    }

    if (includeFaqSchema) {
      upsertJsonLdScript('faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is DGCA exam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'DGCA (Directorate General of Civil Aviation) exam is the official examination conducted in India for obtaining pilot licenses like CPL (Commercial Pilot License) and ATPL (Airline Transport Pilot License). The exam covers subjects like Air Regulations, Meteorology, Air Navigation, Technical General, Technical Specific, and Radio Telephony.',
            },
          },
          {
            '@type': 'Question',
            name: 'How to prepare for DGCA exam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Prepare for DGCA exam by practicing previous year questions (PYQ), taking mock tests, studying from question banks, and reviewing study materials for all subjects including Air Regulations, Meteorology, Air Navigation, and Technical General. VIMAANNA provides comprehensive DGCA exam preparation resources including practice tests, PYQ sessions, and question banks.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is CPL exam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'CPL (Commercial Pilot License) exam is conducted by DGCA in India for obtaining a commercial pilot license. It includes written exams on subjects like Air Regulations, Meteorology, Air Navigation, Technical General, and Radio Telephony. VIMAANNA offers CPL exam preparation with practice tests and study materials.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is ATPL exam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ATPL (Airline Transport Pilot License) exam is the highest level of pilot license exam conducted by DGCA. It requires extensive knowledge of aviation subjects. VIMAANNA provides ATPL exam preparation resources including practice tests, question banks, and study materials for all required subjects.',
            },
          },
          {
            '@type': 'Question',
            name: 'Where can I find DGCA previous year questions?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'VIMAANNA provides comprehensive DGCA previous year questions (PYQ) for all subjects including Air Regulations, Meteorology, Air Navigation, and Technical General. Access PYQ sessions, practice tests, and question banks to prepare effectively for your DGCA exam.',
            },
          },
          {
            '@type': 'Question',
            name: 'What subjects are in DGCA exam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'DGCA exam includes subjects like Air Regulations (Civil Aviation Rules, ATC, Flight Operations), Meteorology (Weather Systems, Atmosphere, Cloud Types), Air Navigation (VOR/DME, GPS/RNAV, Flight Planning), Technical General (Aircraft Systems, Engines, Aerodynamics), Technical Specific (Aircraft Type Knowledge), and Radio Telephony (RTR-A).',
            },
          },
          {
            '@type': 'Question',
            name: 'How to become a pilot in India?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'To become a pilot in India, you need to clear DGCA exams for CPL (Commercial Pilot License) or ATPL (Airline Transport Pilot License). This requires passing written exams on Air Regulations, Meteorology, Air Navigation, Technical General, and other subjects. VIMAANNA helps you prepare with practice tests, PYQ sessions, and comprehensive study materials.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the best platform for DGCA exam preparation?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'VIMAANNA is a leading platform for DGCA exam preparation, offering practice tests, previous year questions (PYQ), comprehensive question banks, and study materials for all DGCA subjects including Air Regulations, Meteorology, Air Navigation, and Technical General. Prepare for CPL and ATPL exams with structured learning resources.',
            },
          },
        ],
      });
    } else {
      removeJsonLdScript('faq');
    }
  }, [
    title,
    description,
    keywords,
    ogImage,
    canonicalUrl,
    fullUrl,
    baseUrl,
    type,
    noindex,
    includeFaqSchema,
    includeWebSiteSchema,
    breadcrumbsKey,
    location.pathname,
  ]);

  return null;
};

export default SEO;
