import React, { useMemo, useState } from 'react';

function ContactSupport() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, message: false });

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const canSubmit = name.trim().length > 1 && emailValid && message.trim().length > 4;

  const handleSubmit = (e) => {
    e.preventDefault();
    const supportEmail = 'support@vimaanna.com';
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject || 'Support request')}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 lg:py-14 bg-gradient-to-b from-white via-indigo-50/60 to-blue-100/60">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Contact Support</h1>
          <p className="text-gray-600 mt-1">We're here to help. Share a few details and we will get back to you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="backdrop-blur bg-white/80 border border-white/60 shadow-xl shadow-indigo-100/50 rounded-2xl p-5 sm:p-6 lg:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                      placeholder="Your name"
                      aria-invalid={touched.name && name.trim().length < 2}
                      required
                    />
                    {touched.name && name.trim().length < 2 && (
                      <p className="mt-1 text-xs text-rose-600">Please enter at least 2 characters.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      className={`w-full border rounded-xl px-4 py-3 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${touched.email && !emailValid ? 'border-rose-300' : 'border-gray-200'}`}
                      placeholder="you@example.com"
                      aria-invalid={touched.email && !emailValid}
                      required
                    />
                    {touched.email && !emailValid && (
                      <p className="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[15px] h-48 sm:h-52 lg:h-56 resize-y bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Describe the issue or request"
                    aria-invalid={touched.message && message.trim().length < 5}
                    required
                  />
                  {touched.message && message.trim().length < 5 && (
                    <p className="mt-1 text-xs text-rose-600">Please provide at least 5 characters.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-white transition-colors ${canSubmit ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30' : 'bg-blue-300 cursor-not-allowed'}`}
                  >
                    Send via Gmail
                  </button>
                  <a
                    href="mailto:support@vimaanna.com"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Or email us directly
                  </a>
                  <span className="text-xs text-gray-500">Typical response time: within 24 hours</span>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 border border-white/60 rounded-2xl p-5 shadow-md">
              <h3 className="font-medium mb-2">Quick tips</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Include screenshots or error messages when possible.</li>
                <li>Share steps to reproduce the issue.</li>
                <li>Tell us your browser and device.</li>
              </ul>
            </div>
            <div className="bg-white/80 border border-white/60 rounded-2xl p-5 shadow-md">
              <h3 className="font-medium mb-2">Other ways to reach us</h3>
              <div className="text-sm text-gray-700">
                <p><span className="text-gray-500">Email:</span> support@vimaanna.com</p>
                <p><span className="text-gray-500">Hours:</span> Mon–Sat, 9:00–18:00 IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactSupport;


