import React from 'react';
import SEO from './SEO';

const PAGE_CONTENT = {
  'terms-and-conditions': {
    title: 'Terms and Conditions',
    intro: 'These terms govern use of Vimaanna for DGCA exam preparation.',
    points: [
      'Use content for personal study purposes only.',
      'Do not copy, resell, or redistribute platform material.',
      'Question sets may be updated periodically for clarity and relevance.',
      'We may restrict accounts that violate platform rules.',
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    intro: 'We collect only the information required to run your account and improve learning features.',
    points: [
      'Account data is used for login, progress tracking, and support.',
      'We do not sell your personal information to third parties.',
      'Security controls are applied to protect stored account data.',
      'You can contact support for account data related requests.',
    ],
  },
  cookies: {
    title: 'Cookies',
    intro: 'Cookies help maintain sessions, preferences, and platform stability.',
    points: [
      'Essential cookies keep login and navigation working.',
      'Performance cookies help us identify and fix issues.',
      'Disabling cookies may impact parts of the platform.',
      'We use cookies to improve reliability, not intrusive tracking.',
    ],
  },
  'payment-policy': {
    title: 'Payment Policy',
    intro: 'This page explains how payment-related terms are handled when paid offerings are available.',
    points: [
      'Any paid feature will clearly show pricing and scope.',
      'Refund terms will be stated at checkout where applicable.',
      'Payment disputes should be raised through support.',
      'Current core preparation tools may be accessed without a payment flow.',
    ],
  },
  press: {
    title: 'Press',
    intro: 'For media and publication requests, connect with the Vimaanna team.',
    points: [
      'Media inquiries can be sent to the official support email.',
      'Brand assets and platform details can be shared on request.',
      'Please include publication timeline and context in your inquiry.',
      'We respond as quickly as possible during working hours.',
    ],
  },
  training: {
    title: 'Training',
    intro: 'Training resources are organized by DGCA subjects and chapters.',
    points: [
      'Start with foundational subjects and build chapter confidence.',
      'Use PYQ sessions to align with exam patterns.',
      'Track weak areas regularly and revise based on results.',
      'Consistency matters more than long one-time sessions.',
    ],
  },
  test: {
    title: 'Test',
    intro: 'Practice tests are designed to simulate exam-style question flow.',
    points: [
      'Attempt full-length practice sets for realistic exam conditioning.',
      'Review explanations for incorrect answers immediately.',
      'Retake weak chapters until accuracy improves.',
      'Use profile progress to monitor preparation trend.',
    ],
  },
  'partner-with-us': {
    title: 'Partner With Us',
    intro: 'We welcome collaboration with educators, training institutes, and aviation communities.',
    points: [
      'Share your organization profile and collaboration idea.',
      'Partnerships may include content support and outreach initiatives.',
      'We prioritize student value and academic integrity.',
      'Reach us via email to start the discussion.',
    ],
  },
};

const FooterInfoPage = ({ pageKey }) => {
  const content = PAGE_CONTENT[pageKey] || PAGE_CONTENT['terms-and-conditions'];

  return (
    <>
      <SEO
        title={`${content.title} | Vimaanna`}
        description={`${content.title} page for Vimaanna DGCA preparation platform.`}
        keywords={`Vimaanna, ${content.title}, DGCA preparation`}
      />
      <div className="min-h-screen gradient-bg">
        <main className="page-content">
          <div className="page-content-inner max-w-4xl mx-auto">
            <section className="site-card p-7 md:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{content.title}</h1>
              <p className="text-slate-600 mb-6">{content.intro}</p>
              <ul className="space-y-3">
                {content.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default FooterInfoPage;
