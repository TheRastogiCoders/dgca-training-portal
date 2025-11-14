import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Stepper from './ui/Stepper';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const normalize = (str) => (str || '').toLowerCase().replace(/\s+/g, '-');

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

const defaultChapters = {
  // Subject → Book → Chapters
  'air-regulations': {
    'ic-joshi': [
      'Rules of the Air',
      'ATC Procedures',
      'Licensing & Documents',
      'Flight Planning & Altimeter Settings',
      'Performance & Operations'
    ],
    'oxford': [
      'Air Law Fundamentals',
      'Operational Procedures',
      'Human Performance (Law Focus)',
      'ICAO Annex Overview'
    ]
  },
  'air-navigation': {
    'ic-joshi': [
      'Basic Nav Concepts',
      'Dead Reckoning',
      'Radio Navigation (VOR/DME/NDB)',
      'RNAV/GNSS',
      'Flight Planning & Wind Triangle'
    ],
    'oxford': [
      'Instruments & Errors',
      'Great Circle & Rhumb Lines',
      'Charts & Projections',
      'Time, Position & ETA',
      'Advanced RNAV'
    ]
  },
  'meteorology': {
    'ic-joshi': [
      'Atmosphere & Temperature',
      'Pressure, Wind & Clouds',
      'Fronts & Frontal Weather',
      'Visibility & Hazards',
      'Forecasts & Reports (METAR/TAF)'
    ],
    'oxford': [
      'Synoptic Meteorology',
      'Turbulence & Icing',
      'Thunderstorms & Convection',
      'Fog & Low Visibility',
      'Climatology for Aviation'
    ]
  },
  'technical-general': {
    'ic-joshi': [
      'Aerodynamics Basics',
      'Engines & Fuel',
      'Instruments',
      'Electrical & Hydraulic Systems'
    ],
    'oxford': [
      'Performance & Limitations',
      'Aircraft Structures',
      'Stability & Control'
    ]
  },
  'technical-specific': {
    'ic-joshi': [
      'Type Systems Overview',
      'Powerplant & Propellers',
      'Operational Limitations'
    ],
    'oxford': [
      'Type Performance',
      'Avionics & Automation'
    ]
  },
  'radio-telephony': {
    'ic-joshi': [
      'Phraseology Basics',
      'Circuit & Pattern Calls',
      'Emergency & Abnormal',
      'IFR Clearances'
    ],
    'oxford': [
      'Properties of Radio Waves',
      'Radio Propagation Theory',
      'Modulation',
      'Antennae',
      'Doppler Radar Systems',
      'VHF Direction Finder (VDF)',
      'Automatic Direction Finder (ADF)',
      'VHF Omni-directional Range (VOR)',
      'Instrument Landing System (ILS)',
      'Microwave Landing System (MLS)',
      'Radar Principles',
      'Ground Radar',
      'Airborne Weather Radar',
      'Secondary Surveillance Radar (SSR)',
      'Distance Measuring Equipment (DME)',
      'Area Navigation Systems (RNAV)',
      'Electronic Flight Information System (EFIS)',
      'Global Navigation Satellite System (GNSS)'
    ],
    'cae-oxford': [
      'Properties of Radio Waves',
      'Radio Propagation Theory',
      'Modulation',
      'Antennae',
      'Doppler Radar Systems',
      'VHF Direction Finder (VDF)',
      'Automatic Direction Finder (ADF)',
      'VHF Omni-directional Range (VOR)',
      'Instrument Landing System (ILS)',
      'Microwave Landing System (MLS)',
      'Radar Principles',
      'Ground Radar',
      'Airborne Weather Radar',
      'Secondary Surveillance Radar (SSR)',
      'Distance Measuring Equipment (DME)',
      'Area Navigation Systems (RNAV)',
      'Electronic Flight Information System (EFIS)',
      'Global Navigation Satellite System (GNSS)'
    ]
  }
};

const BookChapters = () => {
  const { subjectSlug, bookSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const chapters = useMemo(() => {
    const bySubject = defaultChapters[subjectSlug] || {};
    const list = bySubject[bookSlug] || [];
    // Debug: log what we're looking for
    if (list.length === 0) {
      console.log('No chapters found for:', { subjectSlug, bookSlug, availableBooks: Object.keys(bySubject) });
    }
    return list.map((title, index) => ({
      id: `${index + 1}`,
      title,
      // placeholder values for future uploads
      status: 'coming-soon',
    }));
  }, [subjectSlug, bookSlug]);

  const subjectName = friendly(subjectSlug);
  const bookName = friendly(bookSlug);

  const startChapter = (chapter) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    // Placeholder navigation to a future runner page
    alert(`Chapter "${chapter.title}" is coming soon. You can upload content later.`);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <div className="flex">
        <nav className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 min-h-screen sticky top-16 hidden md:block">
          <div className="p-6">
            <div className="space-y-2">
              <Link to="/" className="sidebar-item">Home</Link>
              <Link to="/question-bank" className="sidebar-item">Question Bank</Link>
              <Link to={`/books/${subjectSlug}`} className="sidebar-item">Back to Books</Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <Stepper steps={["Subject", "Book", "Chapter", "Practice"]} current={2} />
            <div className="mb-6 mt-2">
              <Link to={`/books/${subjectSlug}`} className="text-blue-600 hover:underline">← Back to {subjectName} Books</Link>
            </div>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{bookName}</h1>
              <p className="text-gray-600">Chapters for {subjectName}</p>
            </div>

            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">No chapters found for this book.</p>
                <p className="text-sm text-gray-500">Subject: {subjectSlug}, Book: {bookSlug}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((ch) => (
                  <Card key={ch.id} className="p-6 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Chapter {ch.id}</h3>
                      <p className="text-gray-700">{ch.title}</p>
                    </div>
                    <div className="mt-4">
                      <Button className="w-full" onClick={() => startChapter(ch)}>
                        {ch.status === 'coming-soon' ? 'View (Coming Soon)' : 'Start Practice'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {showLogin && (
        <LoginModal onLogin={() => setShowLogin(false)} onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
};

export default BookChapters;


