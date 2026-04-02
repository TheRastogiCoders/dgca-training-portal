import React from 'react';
import { Link } from 'react-router-dom';
import GLOBAL_ASSETS from '../config/globalAssets';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link">
              <img
                src={GLOBAL_ASSETS.LOGO}
                alt="VIMAANNA - DGCA Exam Preparation"
                className="footer-logo"
              />
            </Link>
            <p className="footer-tagline">Wings within reach.</p>
            <p className="footer-desc">DGCA exam preparation for CPL & ATPL - question banks, PYQ, and study materials.</p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3 className="footer-heading">Quick Links</h3>
            <nav className="footer-nav" aria-label="Footer quick links">
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/question-bank">Question Bank</Link>
              <Link to="/pyq">PYQ</Link>
              <Link to="/library">Library</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login">Login</Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h3 className="footer-heading">Resources</h3>
            <ul className="footer-list">
              <li><Link to="/terms-and-conditions">Terms and Conditions</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/cookies">Cookies</Link></li>
              <li><Link to="/payment-policy">Payment Policy</Link></li>
              <li><Link to="/press">Press</Link></li>
            </ul>
          </div>

          {/* Platforms */}
          <div className="footer-col">
            <h3 className="footer-heading">Platforms</h3>
            <ul className="footer-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/training">Training</Link></li>
              <li><Link to="/test">Test</Link></li>
              <li><Link to="/partner-with-us">Partner With Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h3 className="footer-heading">Contact</h3>
            <ul className="footer-list footer-contact">
              <li>
                <a href="mailto:contactvimaanna@gmail.com">contactvimaanna@gmail.com</a>
              </li>
              <li className="footer-note">We respond within 24 hours.</li>
            </ul>
          </div>
        </div>

        <div className="footer-start">
          <p className="footer-start-title">Start here</p>
          <p className="footer-start-text">
            New to DGCA prep? Begin with PYQ practice, then move to chapter-wise question bank drills.
          </p>
          <div className="footer-start-links">
            <Link to="/pyq">Start PYQ</Link>
            <Link to="/question-bank">Open Question Bank</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} VIMAANNA. All rights reserved.</p>
          <p className="footer-legal">For personal DGCA exam preparation only. Content must not be redistributed.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
