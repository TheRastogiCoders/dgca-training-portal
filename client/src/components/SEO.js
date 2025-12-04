import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage,
  canonicalUrl,
  type = 'website'
}) => {
  const location = useLocation();
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://www.vimaanna.online';
  const fullUrl = canonicalUrl || `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:image', ogImage || `${baseUrl}/vimaanna-logo.png`, true);
    updateMetaTag('og:site_name', 'VIMAANNA - DGCA Training Portal', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage || `${baseUrl}/vimaanna-logo.png`);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Structured Data (JSON-LD)
    let structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredData);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'VIMAANNA',
      alternateName: 'VIMAANNA DGCA Training Portal',
      description: description || 'DGCA Exam Preparation Platform for Pilot License Exams (CPL, ATPL) - Practice Tests, Question Bank, and Study Materials for Air Regulations, Meteorology, Air Navigation, and Technical Subjects',
      url: baseUrl,
      logo: `${baseUrl}/vimaanna-logo.png`,
      sameAs: [
        // Add social media links here if available
      ],
      offers: {
        '@type': 'Offer',
        category: 'DGCA Exam Preparation, Pilot License Exam, Aviation Exam',
        name: 'DGCA Practice Tests and Study Materials for Pilot License Exams',
        description: 'Comprehensive DGCA exam preparation for pilot license exams (CPL, ATPL) with practice tests, question banks, and study materials for commercial pilot license and airline transport pilot license exams'
      },
      educationalCredentialAwarded: 'DGCA Exam Preparation, Pilot License Exam Preparation, Aviation Exam Preparation'
    };

    structuredData.textContent = JSON.stringify(jsonLd);

    // Add FAQ Structured Data for common search queries
    let faqStructuredData = document.querySelector('script[data-faq="true"]');
    if (!faqStructuredData) {
      faqStructuredData = document.createElement('script');
      faqStructuredData.setAttribute('type', 'application/ld+json');
      faqStructuredData.setAttribute('data-faq', 'true');
      document.head.appendChild(faqStructuredData);
    }

    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is DGCA exam?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DGCA (Directorate General of Civil Aviation) exam is the official examination conducted in India for obtaining pilot licenses like CPL (Commercial Pilot License) and ATPL (Airline Transport Pilot License). The exam covers subjects like Air Regulations, Meteorology, Air Navigation, Technical General, Technical Specific, and Radio Telephony.'
          }
        },
        {
          '@type': 'Question',
          name: 'How to prepare for DGCA exam?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Prepare for DGCA exam by practicing previous year questions (PYQ), taking mock tests, studying from question banks, and reviewing study materials for all subjects including Air Regulations, Meteorology, Air Navigation, and Technical General. VIMAANNA provides comprehensive DGCA exam preparation resources including practice tests, PYQ sessions, and question banks.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is CPL exam?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CPL (Commercial Pilot License) exam is conducted by DGCA in India for obtaining a commercial pilot license. It includes written exams on subjects like Air Regulations, Meteorology, Air Navigation, Technical General, and Radio Telephony. VIMAANNA offers CPL exam preparation with practice tests and study materials.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is ATPL exam?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ATPL (Airline Transport Pilot License) exam is the highest level of pilot license exam conducted by DGCA. It requires extensive knowledge of aviation subjects. VIMAANNA provides ATPL exam preparation resources including practice tests, question banks, and study materials for all required subjects.'
          }
        },
        {
          '@type': 'Question',
          name: 'Where can I find DGCA previous year questions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VIMAANNA provides comprehensive DGCA previous year questions (PYQ) for all subjects including Air Regulations, Meteorology, Air Navigation, and Technical General. Access PYQ sessions, practice tests, and question banks to prepare effectively for your DGCA exam.'
          }
        },
        {
          '@type': 'Question',
          name: 'What subjects are in DGCA exam?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DGCA exam includes subjects like Air Regulations (Civil Aviation Rules, ATC, Flight Operations), Meteorology (Weather Systems, Atmosphere, Cloud Types), Air Navigation (VOR/DME, GPS/RNAV, Flight Planning), Technical General (Aircraft Systems, Engines, Aerodynamics), Technical Specific (Aircraft Type Knowledge), and Radio Telephony (RTR-A).'
          }
        },
        {
          '@type': 'Question',
          name: 'How to become a pilot in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'To become a pilot in India, you need to clear DGCA exams for CPL (Commercial Pilot License) or ATPL (Airline Transport Pilot License). This requires passing written exams on Air Regulations, Meteorology, Air Navigation, Technical General, and other subjects. VIMAANNA helps you prepare with practice tests, PYQ sessions, and comprehensive study materials.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is the best platform for DGCA exam preparation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'VIMAANNA is one of the best platforms for DGCA exam preparation, offering practice tests, previous year questions (PYQ), comprehensive question banks, and study materials for all DGCA subjects including Air Regulations, Meteorology, Air Navigation, and Technical General. Prepare for CPL and ATPL exams with our free resources.'
          }
        }
      ]
    };

    faqStructuredData.textContent = JSON.stringify(faqJsonLd);

  }, [title, description, keywords, ogImage, canonicalUrl, fullUrl, baseUrl, type]);

  return null;
};

export default SEO;

