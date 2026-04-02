import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';

function ContactSupport() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, message: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const canSubmit = name.trim().length > 1 && emailValid && message.trim().length > 4;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const supportEmail = 'contactvimaanna@gmail.com';
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject || 'Support request')}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;
    window.location.href = mailtoUrl;
    
    // Reset form after a delay
    setTimeout(() => {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTouched({ name: false, email: false, message: false });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <SEO
        title="Contact Us | Vimaanna"
        description="Contact Vimaanna support for DGCA preparation help, platform issues, and guidance."
        keywords="Vimaanna contact, DGCA support, pilot exam help"
      />
      <div className="min-h-screen gradient-bg">
        <main className="page-content">
          <div className="page-content-inner max-w-6xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-900 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>

            <section className="site-card-glass rounded-3xl p-6 md:p-10 mb-6 md:mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 mb-3">Contact</p>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3">Let&apos;s solve it quickly</h1>
              <p className="text-slate-600 max-w-2xl">
                Questions about PYQ, reports, login, or dashboard access? Send a message and our support team will
                respond within 24 hours.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <a href="mailto:contactvimaanna@gmail.com" className="text-sm font-semibold text-blue-700 hover:underline">contactvimaanna@gmail.com</a>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500 mb-1">Response Time</p>
                  <p className="text-sm font-semibold text-slate-900">Within 24 hours</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500 mb-1">Hours</p>
                  <p className="text-sm font-semibold text-slate-900">Mon-Sat, 9:00-18:00 IST</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <div className="site-card rounded-3xl p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Send a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                          placeholder="John Doe"
                          aria-invalid={touched.name && name.trim().length < 2}
                        />
                        {touched.name && name.trim().length < 2 && (
                          <p className="mt-1 text-xs text-red-600">Please enter your name</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                          className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${touched.email && !emailValid ? 'border-red-300' : 'border-gray-200'}`}
                          placeholder="john@example.com"
                          aria-invalid={touched.email && !emailValid}
                        />
                        {touched.email && !emailValid && (
                          <p className="mt-1 text-xs text-red-600">Enter a valid email</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                        placeholder="Login issue / PYQ issue / Report issue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] h-36 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                        placeholder="Describe your issue clearly so we can resolve it faster..."
                        aria-invalid={touched.message && message.trim().length < 5}
                      />
                      {touched.message && message.trim().length < 5 && (
                        <p className="mt-1 text-xs text-red-600">Please provide more details</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-base transition-all ${
                        canSubmit && !isSubmitting
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? 'Opening email...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-6">
                <div className="site-card rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Before you send</h3>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li>Include the page name where the issue occurred.</li>
                    <li>Add screenshot and exact error message if possible.</li>
                    <li>Mention your username/email used for login.</li>
                    <li>For answer issues, include question text and source file/session.</li>
                  </ul>
                </div>
                <div className="site-card-glass rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Need fast help?</h3>
                  <p className="text-sm text-slate-700 mb-4">
                    For urgent account access or admin issues, email directly and mention &quot;Urgent&quot; in subject.
                  </p>
                  <a
                    href="mailto:contactvimaanna@gmail.com?subject=Urgent%20Support%20Request"
                    className="inline-flex items-center text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Email support directly
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default ContactSupport;


