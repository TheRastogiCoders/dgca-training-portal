import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import Modal from './ui/Modal';
import usePersistentState from '../hooks/usePersistentState';

const EXCLUDED_CHAPTER_NAMES = new Set([
  'Overview and Definitions',
  'Revision Questions',
  'Index'
]);

const sanitizeChapters = (chapters = []) =>
  (chapters || [])
    .filter((chapter) => !EXCLUDED_CHAPTER_NAMES.has(chapter.name))
    .map((chapter, index) => ({
      ...chapter,
      id: index + 1
    }));

const sanitizeBook = (book) =>
  book
    ? {
        ...book,
        chapters: sanitizeChapters(book.chapters)
      }
    : book;

const slugify = (name) => {
  if (!name) return '';
  // Handle special cases like "Directional Gyro Indicator (DGI)" -> "directional-gyro-indicator-dgi"
  return name
    .toLowerCase()
    .replace(/\(([^)]+)\)/g, (match, acronym) => `-${acronym.toLowerCase()}`) // Extract acronyms from parentheses
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
};

const QuestionBank = () => {
  const navigate = useNavigate();
  const [selectedSubjectId, setSelectedSubjectId] = usePersistentState('questionBank:selectedSubjectId', null);
  const [selectedBookKey, setSelectedBookKey] = usePersistentState('questionBank:selectedBookKey', null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [clickedChapter, setClickedChapter] = useState(null);
  const [showBookComingSoonModal, setShowBookComingSoonModal] = useState(false);
  const subBooksRef = useRef(null);

  const subjects = [
    {
      id: 1,
      title: "Air Regulations",
      icon: "📋",
      description: "Civil Aviation Rules & Regulations",
      color: "from-blue-500 to-blue-600",
      totalQuestions: 1250,
      chapters: [
        { id: 1, name: "Civil Aviation Rules", questions: 320, difficulty: "Medium" },
        { id: 2, name: "Air Traffic Control", questions: 280, difficulty: "Hard" },
        { id: 3, name: "Flight Operations", questions: 250, difficulty: "Medium" },
        { id: 4, name: "Aircraft Registration", questions: 200, difficulty: "Easy" },
        { id: 5, name: "Licensing & Certification", questions: 200, difficulty: "Medium" }
      ]
    },
    {
      id: 2,
      title: "Air Navigation",
      icon: "🧭",
      description: "Navigation Systems & Procedures",
      color: "from-green-500 to-green-600",
      totalQuestions: 980,
      chapters: [
        { id: 1, name: "Dead Reckoning", questions: 180, difficulty: "Medium" },
        { id: 2, name: "VOR/DME Navigation", questions: 220, difficulty: "Hard" },
        { id: 3, name: "GPS & RNAV", questions: 200, difficulty: "Medium" },
        { id: 4, name: "Flight Planning", questions: 190, difficulty: "Hard" },
        { id: 5, name: "Radio Navigation", questions: 190, difficulty: "Medium" }
      ]
    },
    {
      id: 3,
      title: "Meteorology",
      icon: "🌤️",
      description: "Weather Systems & Aviation Weather",
      color: "from-yellow-500 to-orange-500",
      totalQuestions: 750,
      chapters: [
        { id: 1, name: "Atmosphere & Pressure", questions: 150, difficulty: "Easy" },
        { id: 2, name: "Cloud Types & Formation", questions: 180, difficulty: "Medium" },
        { id: 3, name: "Weather Fronts", questions: 160, difficulty: "Medium" },
        { id: 4, name: "Wind Systems", questions: 140, difficulty: "Easy" },
        { id: 5, name: "Weather Hazards", questions: 120, difficulty: "Hard" }
      ]
    },
    {
      id: 4,
      title: "Technical General",
      icon: "⚙️",
      description: "Aircraft Systems & General Knowledge",
      color: "from-red-500 to-red-600",
      totalQuestions: 2540,
      chapters: []
    },
    {
      id: 5,
      title: "Technical Specific",
      icon: "✈️",
      description: "Aircraft Type Specific Knowledge",
      color: "from-purple-500 to-purple-600",
      totalQuestions: 850,
      chapters: [
        { id: 1, name: "Cessna 172 Systems", questions: 200, difficulty: "Medium" },
        { id: 2, name: "Piper Cherokee", questions: 180, difficulty: "Medium" },
        { id: 3, name: "Multi-Engine Aircraft", questions: 220, difficulty: "Hard" },
        { id: 4, name: "Turboprop Systems", questions: 150, difficulty: "Hard" },
        { id: 5, name: "Jet Aircraft Basics", questions: 100, difficulty: "Hard" }
      ]
    },
    {
      id: 6,
      title: "Radio Telephony (RTR)-A",
      icon: "📻",
      description: "Radio Communication Procedures",
      color: "from-cyan-500 to-cyan-600",
      totalQuestions: 650,
      chapters: [
        { id: 1, name: "Standard Phraseology", questions: 150, difficulty: "Easy" },
        { id: 2, name: "ATC Communications", questions: 180, difficulty: "Medium" },
        { id: 3, name: "Emergency Procedures", questions: 120, difficulty: "Medium" },
        { id: 4, name: "Radio Equipment", questions: 100, difficulty: "Easy" },
        { id: 5, name: "International Procedures", questions: 100, difficulty: "Hard" }
      ]
    }
  ];

  const allBooks = [
    {
      id: 1,
      title: "CAE Oxford",
      description: "CPL/ATPL Ground Training Series",
      icon: "📘",
      color: "from-blue-500 to-blue-600",
      slug: "cae-oxford"
    },
    {
      id: 2,
      title: "RK Bali",
      description: "CPL/ATPL Ground Training Series",
      icon: "📗",
      color: "from-emerald-500 to-green-600",
      slug: "rk-bali"
    },
    {
      id: 3,
      title: "IC Joshi",
      description: "CPL/ATPL Ground Training Series",
      icon: "📖",
      color: "from-indigo-500 to-purple-600",
      slug: "ic-joshi"
    }
  ];

  // Technical General specific books
  const technicalGeneralBooks = [
    {
      id: 1,
      title: "Principles of Flight",
      description: "CPL/ATPL Ground Training Series",
      icon: "🛫",
      color: "from-indigo-500 to-blue-600",
      slug: "principles-of-flight-2014",
      totalQuestions: 244,
      difficulty: "Medium",
      chapters: [
        { id: 1, name: "The Atmosphere", questions: 21, difficulty: "Easy" },
        { id: 2, name: "Basic Aerodynamic Theory", questions: 9, difficulty: "Medium" },
        { id: 3, name: "Subsonic Airflow", questions: 20, difficulty: "Medium" },
        { id: 4, name: "Lift", questions: 36, difficulty: "Medium" },
        { id: 5, name: "Drag", questions: 5, difficulty: "Medium" },
        { id: 6, name: "Stalling", questions: 37, difficulty: "Medium" },
        { id: 7, name: "High Lift Devices", questions: 0, difficulty: "Medium" },
        { id: 8, name: "Airframe Contamination", questions: 7, difficulty: "Easy" },
        { id: 9, name: "Stability and Control", questions: 31, difficulty: "Hard" },
        { id: 10, name: "Controls", questions: 35, difficulty: "Easy" },
        { id: 11, name: "Flight Mechanics", questions: 0, difficulty: "Hard" },
        { id: 12, name: "High Speed Flight", questions: 27, difficulty: "Hard" },
        { id: 13, name: "Limitations", questions: 13, difficulty: "Medium" },
        { id: 14, name: "Windshear", questions: 17, difficulty: "Medium" },
        { id: 15, name: "Propellers", questions: 17, difficulty: "Medium" }
      ]
    },
    {
      id: 2,
      title: "Airframes and Systems",
      description: "CPL/ATPL Ground Training Series",
      icon: "🛩️",
      color: "from-sky-500 to-cyan-600",
      slug: "airframes-and-systems",
      totalQuestions: 445,
      difficulty: "Medium",
      chapters: [
        { id: 1, name: "Fuselage, Wings and Stabilizing Surfaces", questions: 20, difficulty: "Medium" },
        { id: 2, name: "Basic Hydraulics", questions: 50, difficulty: "Medium" },
        { id: 3, name: "Landing Gear", questions: 40, difficulty: "Easy" },
        { id: 4, name: "Aircraft Wheels", questions: 25, difficulty: "Easy" },
        { id: 5, name: "Aircraft Tyres", questions: 25, difficulty: "Easy" },
        { id: 6, name: "Aircraft Brakes", questions: 24, difficulty: "Medium" },
        { id: 7, name: "Flight Control Systems", questions: 35, difficulty: "Medium" },
        { id: 8, name: "Flight Controls", questions: 35, difficulty: "Medium" },
        { id: 9, name: "Powered Flying Controls", questions: 10, difficulty: "Hard" },
        { id: 10, name: "Aircraft Pneumatic Systems", questions: 40, difficulty: "Medium" },
        { id: 11, name: "Pressurization Systems", questions: 46, difficulty: "Medium" },
        { id: 12, name: "Ice and Rain Protection", questions: 30, difficulty: "Medium" },
        { id: 13, name: "Aircraft Oxygen Equipment", questions: 26, difficulty: "Easy" },
        { id: 14, name: "Smoke Detection", questions: 20, difficulty: "Easy" },
        { id: 15, name: "Fire Detection and Protection", questions: 30, difficulty: "Medium" },
        { id: 16, name: "Aircraft Fuel Systems", questions: 34, difficulty: "Medium" }
      ]
    },
    {
      id: 3,
      title: "Electrics and Electronics",
      description: "CPL/ATPL Ground Training Series",
      icon: "🔌",
      color: "from-teal-500 to-emerald-600",
      slug: "electrics-and-electronics",
      totalQuestions: 450,
      difficulty: "Medium",
      chapters: [
        { id: 1, name: "DC Electrics - Basic Principles", questions: 56, difficulty: "Easy" },
        { id: 2, name: "DC Electrics - Switches", questions: 25, difficulty: "Easy" },
        { id: 3, name: "DC Electrics - Circuit Protection and Capacitors", questions: 20, difficulty: "Medium" },
        { id: 4, name: "DC Electrics - Batteries", questions: 30, difficulty: "Easy" },
        { id: 5, name: "DC Electrics - Magnetism", questions: 9, difficulty: "Medium" },
        { id: 6, name: "DC Electrics - Generators and Alternators", questions: 20, difficulty: "Medium" },
        { id: 7, name: "DC Electrics - DC Motors", questions: 8, difficulty: "Medium" },
        { id: 8, name: "DC Electrics - Aircraft Electrical Power Systems", questions: 39, difficulty: "Medium" },
        { id: 9, name: "DC Electrics - Bonding and Screening", questions: 7, difficulty: "Easy" },
        { id: 10, name: "DC Electrics - Specimen Questions", questions: 31, difficulty: "Easy" },
        { id: 11, name: "AC Electrics - Introduction to AC", questions: 32, difficulty: "Medium" },
        { id: 12, name: "AC Electrics - Alternators", questions: 65, difficulty: "Medium" },
        { id: 13, name: "AC Electrics - Practical Aircraft Systems", questions: 11, difficulty: "Medium" },
        { id: 14, name: "AC Electrics - Transformers", questions: 7, difficulty: "Medium" },
        { id: 15, name: "AC Electrics - AC Motors", questions: 10, difficulty: "Medium" },
        { id: 16, name: "AC Electrics - Semiconductors", questions: 25, difficulty: "Medium" },
        { id: 17, name: "AC Electrics - Logic Gates", questions: 15, difficulty: "Medium" }
      ]
    },
    {
      id: 4,
      title: "Powerplant",
      description: "CPL/ATPL Ground Training Series",
      icon: "🔥",
      color: "from-orange-500 to-amber-600",
      slug: "powerplant",
      totalQuestions: 393,
      difficulty: "Hard",
      chapters: [
        { id: 1, name: "Piston Engines - Introduction", questions: 0, difficulty: "Easy" },
        { id: 2, name: "Piston Engines - General", questions: 55, difficulty: "Easy" },
        { id: 3, name: "Piston Engines - Lubrication", questions: 10, difficulty: "Medium" },
        { id: 4, name: "Piston Engines - Cooling", questions: 6, difficulty: "Medium" },
        { id: 5, name: "Piston Engines - Ignition", questions: 10, difficulty: "Medium" },
        { id: 6, name: "Piston Engines - Fuel", questions: 16, difficulty: "Medium" },
        { id: 7, name: "Piston Engines - Mixture", questions: 10, difficulty: "Medium" },
        { id: 8, name: "Piston Engines - Carburettors", questions: 20, difficulty: "Medium" },
        { id: 9, name: "Piston Engines - Icing", questions: 0, difficulty: "Easy" },
        { id: 10, name: "Piston Engines - Fuel Injection", questions: 0, difficulty: "Medium" },
        { id: 11, name: "Piston Engines - Performance and Power Augmentation", questions: 62, difficulty: "Hard" },
        { id: 12, name: "Piston Engines - Propellers", questions: 30, difficulty: "Medium" },
        { id: 13, name: "Gas Turbines - Introduction", questions: 18, difficulty: "Easy" },
        { id: 14, name: "Gas Turbines - Air Inlets", questions: 7, difficulty: "Medium" },
        { id: 15, name: "Gas Turbines - Compressors", questions: 40, difficulty: "Hard" },
        { id: 16, name: "Gas Turbines - Combustion Chambers", questions: 10, difficulty: "Hard" },
        { id: 17, name: "Gas Turbines - The Turbine Assembly", questions: 10, difficulty: "Hard" },
        { id: 18, name: "Gas Turbines - The Exhaust System", questions: 11, difficulty: "Medium" },
        { id: 19, name: "Gas Turbines - Lubrication", questions: 17, difficulty: "Medium" },
        { id: 20, name: "Gas Turbines - Thrust", questions: 9, difficulty: "Medium" },
        { id: 21, name: "Gas Turbines - Reverse Thrust", questions: 6, difficulty: "Medium" },
        { id: 22, name: "Gas Turbines - Gearboxes and Accessory Drives", questions: 2, difficulty: "Medium" },
        { id: 23, name: "Gas Turbines - Ignition Systems", questions: 8, difficulty: "Easy" },
        { id: 24, name: "Gas Turbines - Auxiliary Power Units and Engine Starting", questions: 20, difficulty: "Medium" },
        { id: 25, name: "Gas Turbines - Fuels", questions: 3, difficulty: "Medium" },
        { id: 26, name: "Gas Turbines - Fuel Systems", questions: 13, difficulty: "Medium" },
        { id: 27, name: "Gas Turbines - Bleed Air", questions: 0, difficulty: "Medium" }
      ]
    }
  ];

const airNavigationOxfordBooks = [
  {
    id: 1,
    title: "Instrumentation",
    description: "CPL/ATPL Ground Training Series",
    icon: "🛩️",
    color: "from-indigo-500 to-purple-500",
    slug: "instrument-2014",
    totalQuestions: 220,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "Characteristics and General Definitions", questions: 0, difficulty: "Medium" },
      { id: 2, name: "Pitot and Static Sources", questions: 8, difficulty: "Medium" },
      { id: 3, name: "Air Temperature Measurement", questions: 8, difficulty: "Medium" },
      { id: 4, name: "The Airspeed Indicator (ASI)", questions: 9, difficulty: "Medium" },
      { id: 5, name: "The Pressure Altimeter", questions: 7, difficulty: "Medium" },
      { id: 6, name: "The Vertical Speed Indicator", questions: 9, difficulty: "Medium" },
      { id: 7, name: "The Machmeter", questions: 9, difficulty: "Medium" },
      { id: 8, name: "Air Data Computer", questions: 0, difficulty: "Medium" },
      { id: 9, name: "Terrestrial Magnetism", questions: 7, difficulty: "Medium" },
      { id: 10, name: "The Direct Indicating Compass", questions: 9, difficulty: "Medium" },
      { id: 11, name: "Gyroscopes", questions: 9, difficulty: "Medium" },
      { id: 12, name: "Directional Gyro Indicator (DGI)", questions: 10, difficulty: "Medium" },
      { id: 13, name: "The Artificial Horizon", questions: 9, difficulty: "Medium" },
      { id: 14, name: "The Turn and Slip Indicator", questions: 6, difficulty: "Medium" },
      { id: 15, name: "The Turn Co-ordinator", questions: 3, difficulty: "Medium" },
      { id: 16, name: "Aircraft Magnetism", questions: 7, difficulty: "Medium" },
      { id: 17, name: "Remote Indicating Magnetic Compass", questions: 6, difficulty: "Medium" },
      { id: 18, name: "Inertial Navigation Systems", questions: 8, difficulty: "Medium" },
      { id: 19, name: "Inertial Reference System", questions: 1, difficulty: "Medium" },
      { id: 20, name: "Radio Altimeter", questions: 0, difficulty: "Medium" },
      { id: 21, name: "Flight Management System", questions: 0, difficulty: "Medium" },
      { id: 22, name: "Electronic Flight Information Systems", questions: 16, difficulty: "Medium" },
      { id: 23, name: "Basic Computers", questions: 0, difficulty: "Medium" },
      { id: 24, name: "Future Air Navigation Systems (FANS)", questions: 0, difficulty: "Medium" },
      { id: 25, name: "Flight Director Systems", questions: 0, difficulty: "Medium" },
      { id: 26, name: "Autopilot", questions: 0, difficulty: "Medium" },
      { id: 27, name: "Autoland", questions: 0, difficulty: "Medium" },
      { id: 28, name: "Autothrottle", questions: 0, difficulty: "Medium" },
      { id: 29, name: "Yaw Dampers", questions: 0, difficulty: "Medium" },
      { id: 30, name: "Control Laws", questions: 0, difficulty: "Medium" },
      { id: 31, name: "AFCS Revision Questions", questions: 56, difficulty: "Medium" },
      { id: 32, name: "Flight Warning Systems", questions: 0, difficulty: "Medium" },
      { id: 33, name: "Aerodynamic Warnings", questions: 0, difficulty: "Medium" },
      { id: 34, name: "Ground Proximity Warning System", questions: 13, difficulty: "Medium" },
      { id: 35, name: "Airborne Collision and Avoidance System", questions: 5, difficulty: "Medium" },
      { id: 36, name: "Flight Data Recorder", questions: 0, difficulty: "Medium" },
      { id: 37, name: "Cockpit Voice Recorder", questions: 5, difficulty: "Medium" },
      { id: 38, name: "Engine Instrumentation", questions: 0, difficulty: "Medium" },
      { id: 39, name: "Electronic Instrumentation", questions: 0, difficulty: "Medium" }
    ]
  },
  {
    id: 4,
    title: "General Nav",
    description: "CPL/ATPL Ground Training Series",
    icon: "🧭",
    color: "from-slate-600 to-blue-600",
    slug: "cae-oxford-general-navigation",
    totalQuestions: 0,
    difficulty: "Medium",
    chapters: [
      // Mark chapters with connected practice sets as having questions (>0)
      { id: 1, name: "Direction, Latitude and Longitude", questions: 50, difficulty: "Medium", pageStart: 1, pageEnd: 20 },
      { id: 2, name: "Great Circles, Rhumb Lines & Directions on the Earth", questions: 60, difficulty: "Medium", pageStart: 21, pageEnd: 42 },
      { id: 3, name: "Earth Magnetism", questions: 40, difficulty: "Medium", pageStart: 43, pageEnd: 66 },
      { id: 4, name: "The Navigation Computer - Slide Rule Face", questions: 40, difficulty: "Medium", pageStart: 67, pageEnd: 82 },
      { id: 5, name: "The Navigation Computer - Distance, Speed, Time and Conversions", questions: 40, difficulty: "Medium", pageStart: 83, pageEnd: 102 },
      { id: 6, name: "The Navigation Computer - TAS and Altitude Conversions", questions: 40, difficulty: "Medium", pageStart: 103, pageEnd: 122 },
      { id: 7, name: "The Navigation Computer - Triangle of Velocities", questions: 40, difficulty: "Medium", pageStart: 123, pageEnd: 136 },
      { id: 8, name: "The Navigation Computer - Calculation of Heading and Wind Finding", questions: 40, difficulty: "Medium", pageStart: 137, pageEnd: 166 },
      { id: 9, name: "The Navigation Computer - Multi-drift Winds and Wind Components", questions: 40, difficulty: "Medium", pageStart: 167, pageEnd: 186 },
      { id: 10, name: "The 1 in 60 Rule", questions: 20, difficulty: "Medium", pageStart: 187, pageEnd: 196 },
      { id: 11, name: "Navigation Using the 1 in 60 Rule", questions: 25, difficulty: "Medium", pageStart: 197, pageEnd: 208 },
      { id: 12, name: "Other Applications of the 1 in 60 Rule", questions: 20, difficulty: "Medium", pageStart: 209, pageEnd: 218 },
      { id: 13, name: "Topographical Maps and Map Reading", questions: 10, difficulty: "Medium", pageStart: 219, pageEnd: 236 },
      { id: 14, name: "Convergency and Conversion Angle", questions: 13, difficulty: "Medium", pageStart: 237, pageEnd: 258 },
      { id: 15, name: "Departure", questions: 16, difficulty: "Medium", pageStart: 259, pageEnd: 272 },
      { id: 16, name: "Scale", questions: 20, difficulty: "Medium", pageStart: 273, pageEnd: 280 },
      { id: 17, name: "General Chart Properties", questions: 0, difficulty: "Medium", pageStart: 281, pageEnd: 290 },
      { id: 18, name: "Mercator Charts - Properties", questions: 20, difficulty: "Medium", pageStart: 291, pageEnd: 306 },
      { id: 19, name: "Mercator Charts - Scale", questions: 30, difficulty: "Medium", pageStart: 307, pageEnd: 318 },
      { id: 20, name: "Mid Course Test", questions: 54, difficulty: "Medium", pageStart: 319, pageEnd: 332 },
      { id: 21, name: "Lambert’s Conformal Chart - 1", questions: 0, difficulty: "Medium", pageStart: 333, pageEnd: 348 },
      { id: 22, name: "Lambert’s Conformal Chart - 2", questions: 20, difficulty: "Medium", pageStart: 349, pageEnd: 362 },
      { id: 23, name: "The Polar Stereographic Chart", questions: 0, difficulty: "Medium", pageStart: 363, pageEnd: 376 },
      { id: 24, name: "Time (1)", questions: 16, difficulty: "Medium", pageStart: 377, pageEnd: 390 },
      { id: 25, name: "Time (2)", questions: 24, difficulty: "Medium", pageStart: 391, pageEnd: 418 },
      { id: 26, name: "Time (3)", questions: 22, difficulty: "Medium", pageStart: 419, pageEnd: 452 },
      { id: 27, name: "Gridded Charts", questions: 6, difficulty: "Medium", pageStart: 453, pageEnd: 474 },
      { id: 28, name: "Plotting", questions: 15, difficulty: "Medium", pageStart: 475, pageEnd: 490 },
      { id: 29, name: "The Direct Indicating Compass", questions: 0, difficulty: "Medium", pageStart: 491, pageEnd: 498 },
      { id: 30, name: "Aircraft Magnetism", questions: 6, difficulty: "Medium", pageStart: 499, pageEnd: 506 },
      { id: 31, name: "General Navigation Problems", questions: 0, difficulty: "Medium", pageStart: 507, pageEnd: null }
    ]
  },
  {
    id: 5,
    title: "Operational Procedures",
    description: "CPL/ATPL Ground Training Series",
    icon: "🛡️",
    color: "from-rose-500 to-pink-600",
    slug: "operational-procedures",
    totalQuestions: 255,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "ICAO Annex 6", questions: 6, difficulty: "Medium", pageStart: 1, pageEnd: 6 },
      { id: 2, name: "CS-OPS General Requirements", questions: 6, difficulty: "Medium", pageStart: 7, pageEnd: 18 },
      { id: 3, name: "Operator Supervision and Certification", questions: 6, difficulty: "Medium", pageStart: 19, pageEnd: 26 },
      { id: 4, name: "Operational Procedures", questions: 6, difficulty: "Medium", pageStart: 27, pageEnd: 44 },
      { id: 5, name: "All Weather Operations", questions: 8, difficulty: "Medium", pageStart: 45, pageEnd: 64 },
      { id: 6, name: "Aeroplane Equipment and Instruments", questions: 7, difficulty: "Medium", pageStart: 65, pageEnd: 82 },
      { id: 7, name: "Crew, Logs and Records", questions: 6, difficulty: "Medium", pageStart: 83, pageEnd: 98 },
      { id: 8, name: "Long Range Flight and Polar Navigation", questions: 4, difficulty: "Medium", pageStart: 99, pageEnd: 104 },
      { id: 9, name: "MNPSA", questions: 7, difficulty: "Medium", pageStart: 105, pageEnd: 124 },
      { id: 10, name: "Special Operational Procedures and Hazards", questions: 6, difficulty: "Medium", pageStart: 125, pageEnd: 138 },
      { id: 11, name: "Fire and Smoke", questions: 10, difficulty: "Medium", pageStart: 139, pageEnd: 150 },
      { id: 12, name: "Pressurisation Failure", questions: 6, difficulty: "Medium", pageStart: 151, pageEnd: 158 },
      { id: 13, name: "Windshear and Microburst", questions: 10, difficulty: "Medium", pageStart: 159, pageEnd: 166 },
      { id: 14, name: "Wake Turbulence", questions: 18, difficulty: "Medium", pageStart: 167, pageEnd: 174 },
      { id: 15, name: "Security", questions: 6, difficulty: "Medium", pageStart: 175, pageEnd: 182 },
      { id: 16, name: "Emergency and Precautionary Landings", questions: 14, difficulty: "Medium", pageStart: 183, pageEnd: 192 },
      { id: 17, name: "Fuel Jettison", questions: 8, difficulty: "Medium", pageStart: 193, pageEnd: 198 },
      { id: 18, name: "Transport of Dangerous Goods by Air", questions: 12, difficulty: "Medium", pageStart: 199, pageEnd: 208 },
      { id: 19, name: "Contaminated Runways", questions: 12, difficulty: "Medium", pageStart: 209, pageEnd: null },
      { id: 20, name: "Revision Questions", questions: 97, difficulty: "Medium", pageStart: 0, pageEnd: 0 }
    ]
  },
  {
    id: 2,
    title: "Flight Planning & Monitoring",
    description: "CPL/ATPL Ground Training Series",
    icon: "🗺️",
    color: "from-blue-500 to-cyan-500",
    slug: "cae-oxford-flight-planning-monitoring",
    totalQuestions: 260,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "Air Information Publications", questions: 6, difficulty: "Medium" },
      { id: 2, name: "Fuel Policy and Fuel Monitoring", questions: 7, difficulty: "Medium" },
      { id: 3, name: "Nautical Air Miles", questions: 30, difficulty: "Medium" },
      { id: 4, name: "Single-engine Piston Aeroplane (SEP)", questions: 4, difficulty: "Medium" },
      { id: 5, name: "Multi-engine Piston Aeroplane (MEP)", questions: 3, difficulty: "Medium" },
      { id: 6, name: "Medium Range Jet Transport planning", questions: 18, difficulty: "Medium" },
      { id: 7, name: "MRJT Detailed Flight Planning, En Route Climb, Cruise-Integrated Range, Descent Tables", questions: 4, difficulty: "Medium" },
      { id: 8, name: "En Route Climb Table", questions: 0, difficulty: "Medium" },
      { id: 9, name: "Cruise / Integrated Range Tables", questions: 0, difficulty: "Medium" },
      { id: 10, name: "Descent Tables", questions: 0, difficulty: "Medium" },
      { id: 11, name: "MRJT Additional Procedures", questions: 0, difficulty: "Medium" },
      { id: 12, name: "Topographical Chart", questions: 20, difficulty: "Medium" },
      { id: 13, name: "Airways", questions: 81, difficulty: "Medium" },
      { id: 14, name: "Airways – Miscellaneous Charts", questions: 43, difficulty: "Medium" },
      { id: 15, name: "ATC Flight Plan", questions: 16, difficulty: "Medium" },
      { id: 16, name: "Point of Equal Time (PET)", questions: 14, difficulty: "Medium" },
      { id: 17, name: "Point of Safe Return (PSR)", questions: 12, difficulty: "Medium" }
    ]
  },
  {
    id: 3,
    title: "Mass and Balance and Performance",
    description: "CPL/ATPL Ground Training Series",
    icon: "📊",
    color: "from-purple-500 to-pink-500",
    slug: "performance",
    totalQuestions: 131,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "Mass and Balance and Performance", questions: 30, difficulty: "Medium" },
      { id: 4, name: "General Principles - Descent", questions: 19, difficulty: "Medium" },
      { id: 7, name: "Single-engine Class B Aircraft - Take-off", questions: 11, difficulty: "Medium" },
      { id: 11, name: "Multi-engine Class B - Take-off", questions: 13, difficulty: "Medium" },
      { id: 17, name: "Class A - En Route", questions: 43, difficulty: "Medium" },
      { id: 18, name: "Landing", questions: 15, difficulty: "Medium" }
    ]
  }
];

const airRegulationsOxfordBooks = [
  {
    id: 1,
    title: "CAE Oxford",
    description: "CPL/ATPL Ground Training Series",
    icon: "📘",
    color: "from-blue-500 to-blue-600",
    slug: "oxford",
    totalQuestions: 525,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "International Agreements and Organizations", questions: 26, difficulty: "Medium" },
      { id: 2, name: "Airworthiness of Aircraft", questions: 4, difficulty: "Medium" },
      { id: 3, name: "Aircraft Nationality and Registration Marks", questions: 12, difficulty: "Medium" },
      { id: 4, name: "Flight Crew Licensing", questions: 55, difficulty: "Medium" },
      { id: 5, name: "Rules of the Air", questions: 51, difficulty: "Medium" },
      { id: 6, name: "Instrument Procedures - Departures", questions: 13, difficulty: "Medium" },
      { id: 7, name: "Approach Procedures", questions: 46, difficulty: "Medium" },
      { id: 8, name: "Circling Approach", questions: 8, difficulty: "Medium" },
      { id: 9, name: "Holding Procedures", questions: 5, difficulty: "Medium" },
      { id: 10, name: "Altimeter Setting Procedure", questions: 10, difficulty: "Medium" },
      { id: 11, name: "Parallel or Near-parallel Runway Operation", questions: 9, difficulty: "Medium" },
      { id: 12, name: "SSR and ACAS", questions: 8, difficulty: "Medium" },
      { id: 13, name: "Airspace", questions: 37, difficulty: "Medium" },
      { id: 14, name: "Air Traffic Services", questions: 36, difficulty: "Medium" },
      { id: 15, name: "Separation", questions: 50, difficulty: "Medium" },
      { id: 16, name: "Control of Aircraft", questions: 40, difficulty: "Medium" },
      { id: 17, name: "Aeronautical Information Service (AIS)", questions: 18, difficulty: "Medium" },
      { id: 18, name: "Aerodromes - Physical Characteristics", questions: 15, difficulty: "Medium" },
      { id: 19, name: "Aerodromes - Visual Aids, Markings and Signs", questions: 10, difficulty: "Medium" },
      { id: 20, name: "Aerodrome Lighting", questions: 25, difficulty: "Medium" },
      { id: 21, name: "Obstacle Marking and Aerodrome Services", questions: 12, difficulty: "Medium" },
      { id: 22, name: "Facilitation", questions: 6, difficulty: "Medium" },
      { id: 23, name: "Search and Rescue", questions: 9, difficulty: "Medium" },
      { id: 24, name: "Security", questions: 15, difficulty: "Medium" },
      { id: 25, name: "Aircraft Accident and Incident Investigation", questions: 5, difficulty: "Medium" }
    ]
  }
];

const airRegulationsSubBooks = [
  {
    id: 1,
    title: "Air Law",
    description: "CPL/ATPL Ground Training Series",
    icon: "⚖️",
    color: "from-blue-500 to-blue-600",
    slug: "air-law",
    totalQuestions: 525,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "International Agreements and Organizations", questions: 26, difficulty: "Medium" },
      { id: 2, name: "Airworthiness of Aircraft", questions: 4, difficulty: "Medium" },
      { id: 3, name: "Aircraft Nationality and Registration Marks", questions: 12, difficulty: "Medium" },
      { id: 4, name: "Flight Crew Licensing", questions: 55, difficulty: "Medium" },
      { id: 5, name: "Rules of the Air", questions: 51, difficulty: "Medium" },
      { id: 6, name: "Instrument Procedures - Departures", questions: 13, difficulty: "Medium" },
      { id: 7, name: "Approach Procedures", questions: 46, difficulty: "Medium" },
      { id: 8, name: "Circling Approach", questions: 8, difficulty: "Medium" },
      { id: 9, name: "Holding Procedures", questions: 5, difficulty: "Medium" },
      { id: 10, name: "Altimeter Setting Procedure", questions: 10, difficulty: "Medium" },
      { id: 11, name: "Parallel or Near-parallel Runway Operation", questions: 9, difficulty: "Medium" },
      { id: 12, name: "SSR and ACAS", questions: 8, difficulty: "Medium" },
      { id: 13, name: "Airspace", questions: 37, difficulty: "Medium" },
      { id: 14, name: "Air Traffic Services", questions: 36, difficulty: "Medium" },
      { id: 15, name: "Separation", questions: 50, difficulty: "Medium" },
      { id: 16, name: "Control of Aircraft", questions: 40, difficulty: "Medium" },
      { id: 17, name: "Aeronautical Information Service (AIS)", questions: 18, difficulty: "Medium" },
      { id: 18, name: "Aerodromes - Physical Characteristics", questions: 15, difficulty: "Medium" },
      { id: 19, name: "Aerodromes - Visual Aids, Markings and Signs", questions: 10, difficulty: "Medium" },
      { id: 20, name: "Aerodrome Lighting", questions: 25, difficulty: "Medium" },
      { id: 21, name: "Obstacle Marking and Aerodrome Services", questions: 12, difficulty: "Medium" },
      { id: 22, name: "Facilitation", questions: 6, difficulty: "Medium" },
      { id: 23, name: "Search and Rescue", questions: 9, difficulty: "Medium" },
      { id: 24, name: "Security", questions: 15, difficulty: "Medium" },
      { id: 25, name: "Aircraft Accident and Incident Investigation", questions: 5, difficulty: "Medium" }
    ]
  },
  {
    id: 2,
    title: "Human Performance and Limitations",
    description: "CPL/ATPL Ground Training Series",
    icon: "🧠",
    color: "from-purple-500 to-indigo-600",
    slug: "human-performance-and-limitations",
    totalQuestions: 295,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "The Circulation System", questions: 20, difficulty: "Medium" },
      { id: 2, name: "Oxygen and Respiration", questions: 26, difficulty: "Medium" },
      { id: 3, name: "The Nervous System, Ear, Hearing and Balance", questions: 23, difficulty: "Medium" },
      { id: 4, name: "The Eye and Vision", questions: 23, difficulty: "Medium" },
      { id: 5, name: "Flying and Health", questions: 26, difficulty: "Medium" },
      { id: 6, name: "Stress", questions: 20, difficulty: "Medium" },
      { id: 7, name: "Information Processing, Human Error & the Learning Process", questions: 20, difficulty: "Medium" },
      { id: 8, name: "Behaviour and Motivation", questions: 20, difficulty: "Medium" },
      { id: 9, name: "Cognition in Aviation", questions: 20, difficulty: "Medium" },
      { id: 10, name: "Sleep and Fatigue", questions: 20, difficulty: "Medium" },
      { id: 11, name: "Individual Differences and Interpersonal Relationships", questions: 17, difficulty: "Medium" },
      { id: 12, name: "Communication and Cooperation", questions: 20, difficulty: "Medium" },
      { id: 13, name: "Man and Machine", questions: 20, difficulty: "Medium" },
      { id: 14, name: "Decision Making and Risk", questions: 20, difficulty: "Medium" },
      { id: 15, name: "Human Factors Incident Reporting", questions: 0, difficulty: "Medium" },
      { id: 16, name: "Introduction to Crew Resource Management", questions: 0, difficulty: "Medium" },
      { id: 17, name: "Specimen Questions", questions: 0, difficulty: "Medium" }
    ]
  }
];

const meteorologyOxfordBooks = [
  {
    id: 1,
    title: "CAE Oxford Meteorology",
    description: "CPL/ATPL Ground Training Series",
    icon: "🌤️",
    color: "from-yellow-500 to-orange-500",
    slug: "cae-oxford",
    totalQuestions: 519,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "The Atmosphere", questions: 24, difficulty: "Medium" },
      { id: 2, name: "Pressure", questions: 15, difficulty: "Medium" },
      { id: 3, name: "Density", questions: 6, difficulty: "Medium" },
      { id: 4, name: "Pressure Systems", questions: 26, difficulty: "Medium" },
      { id: 5, name: "Temperature", questions: 15, difficulty: "Medium" },
      { id: 6, name: "Humidity", questions: 15, difficulty: "Medium" },
      { id: 7, name: "Adiabatics and Stability", questions: 17, difficulty: "Medium" },
      { id: 8, name: "Turbulence", questions: 15, difficulty: "Medium" },
      { id: 9, name: "Altimetry", questions: 38, difficulty: "Medium" },
      { id: 10, name: "Winds", questions: 35, difficulty: "Medium" },
      { id: 11, name: "Upper Winds", questions: 23, difficulty: "Medium" },
      { id: 12, name: "Clouds", questions: 39, difficulty: "Medium" },
      { id: 13, name: "Cloud Formation and Precipitation", questions: 12, difficulty: "Medium" },
      { id: 14, name: "Thunderstorms", questions: 15, difficulty: "Medium" },
      { id: 15, name: "Visibility", questions: 15, difficulty: "Medium" },
      { id: 16, name: "Icing", questions: 15, difficulty: "Medium" },
      { id: 17, name: "Air Masses", questions: 15, difficulty: "Medium" },
      { id: 18, name: "Occlusions", questions: 16, difficulty: "Medium" },
      { id: 19, name: "Other Depressions", questions: 12, difficulty: "Medium" },
      { id: 20, name: "Global Climatology", questions: 39, difficulty: "Medium" },
      { id: 21, name: "Local Winds and Weather", questions: 0, difficulty: "Medium" },
      { id: 22, name: "Area Climatology", questions: 0, difficulty: "Medium" },
      { id: 23, name: "Route Climatology", questions: 0, difficulty: "Medium" },
      { id: 24, name: "Satellite Observations", questions: 0, difficulty: "Medium" },
      { id: 25, name: "Meteorological Aerodrome Reports (METARs)", questions: 8, difficulty: "Medium" },
      { id: 26, name: "Terminal Aerodrome Forecasts (TAFs)", questions: 7, difficulty: "Medium" },
      { id: 27, name: "Significant Weather and Wind Charts", questions: 17, difficulty: "Medium" },
      { id: 28, name: "Warning Messages", questions: 70, difficulty: "Medium" },
      { id: 29, name: "Meteorological Information for Aircraft in Flight", questions: 10, difficulty: "Medium" }
    ]
  }
];

const radioTelephonyOxfordBooks = [
  {
    id: 1,
    title: "Radio Navigation Systems",
    description: "CPL/ATPL Ground Training Series",
    icon: "📻",
    color: "from-cyan-500 to-blue-600",
    slug: "cae-oxford",
    totalQuestions: 289,
    difficulty: "Medium",
    chapters: [
      { id: 1, name: "Properties of Radio Waves", questions: 22, difficulty: "Medium" },
      { id: 2, name: "Radio Propagation Theory", questions: 8, difficulty: "Medium" },
      { id: 3, name: "Modulation", questions: 4, difficulty: "Medium" },
      { id: 4, name: "Antennae", questions: 4, difficulty: "Medium" },
      { id: 5, name: "Doppler Radar Systems", questions: 3, difficulty: "Medium" },
      { id: 6, name: "VHF Direction Finder (VDF)", questions: 6, difficulty: "Medium" },
      { id: 7, name: "Automatic Direction Finder (ADF)", questions: 21, difficulty: "Medium" },
      { id: 8, name: "VHF Omni-directional Range (VOR)", questions: 33, difficulty: "Medium" },
      { id: 9, name: "Instrument Landing System (ILS)", questions: 14, difficulty: "Medium" },
      { id: 10, name: "Microwave Landing System (MLS)", questions: 1, difficulty: "Medium" },
      { id: 11, name: "Radar Principles", questions: 14, difficulty: "Medium" },
      { id: 12, name: "Ground Radar", questions: 4, difficulty: "Medium" },
      { id: 13, name: "Airborne Weather Radar", questions: 11, difficulty: "Medium" },
      { id: 14, name: "Secondary Surveillance Radar (SSR)", questions: 5, difficulty: "Medium" },
      { id: 15, name: "Distance Measuring Equipment (DME)", questions: 19, difficulty: "Medium" },
      { id: 16, name: "Area Navigation Systems (RNAV)", questions: 15, difficulty: "Medium" },
      { id: 17, name: "Electronic Flight Information System (EFIS)", questions: 9, difficulty: "Medium" },
      { id: 18, name: "Global Navigation Satellite System (GNSS)", questions: 26, difficulty: "Medium" },
      { id: 19, name: "Communications", questions: 60, difficulty: "Medium" }
    ]
  }
];

  // Filter books based on selected subject
  const getAvailableBooks = (subject) => {
    if (subject?.title === "Technical General") {
      // First step for Technical General: show only CAE Oxford
      return allBooks.filter(book => book.title === "CAE Oxford");
    }
    if (subject?.title === "Air Regulations") {
      return allBooks.filter(book => ["CAE Oxford", "RK Bali"].includes(book.title));
    }
    if (subject?.title === "Air Navigation") {
      return allBooks.filter(book => ["CAE Oxford", "RK Bali"].includes(book.title));
    }
    if (subject?.title === "Meteorology") {
      return allBooks.filter(book => ["CAE Oxford", "IC Joshi"].includes(book.title));
    }
    return allBooks.filter(book => book.title === "CAE Oxford");
  };

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) || null,
    [selectedSubjectId]
  );

  const resolveSelectedBook = useMemo(() => {
    if (!selectedSubject) return null;

    // Check special cases first (before direct book match)
    if (selectedSubject.title === 'Air Regulations') {
      // If CAE Oxford is selected, don't return a book - show sub-books instead
      if (selectedBookKey === 'cae-oxford' || selectedBookKey === 'oxford') {
        return null; // This will trigger the sub-books view
      }
      // Check if a sub-book is selected (air-law or human-performance-and-limitations)
      const subBook = airRegulationsSubBooks.find((book) => book.slug === selectedBookKey);
      if (subBook) {
        console.log('Air Regulations: Returning sub-book with chapters:', subBook.chapters?.length);
        return sanitizeBook(subBook);
      }
      // Otherwise, check if a specific air regulations book is selected
      const airRegBook = airRegulationsOxfordBooks.find((book) => book.slug === selectedBookKey);
      if (airRegBook) {
        console.log('Air Regulations: Returning specific book with chapters:', airRegBook.chapters?.length);
        return sanitizeBook(airRegBook);
      }
    }

    if (selectedSubject.title === 'Radio Telephony (RTR)-A') {
      // If CAE Oxford is selected, return the radio navigation systems book directly
      if (selectedBookKey === 'cae-oxford') {
        const radioBook = radioTelephonyOxfordBooks[0];
        if (radioBook) {
          console.log('Radio Telephony: Returning radio book with chapters:', radioBook.chapters?.length);
          return sanitizeBook(radioBook);
        }
      }
      // Otherwise, check if a specific radio book is selected
      const radioBook = radioTelephonyOxfordBooks.find((book) => book.slug === selectedBookKey);
      if (radioBook) {
        console.log('Radio Telephony: Returning specific radio book with chapters:', radioBook.chapters?.length);
        return sanitizeBook(radioBook);
      }
    }

    if (selectedSubject.title === 'Meteorology') {
      // If CAE Oxford is selected, return the meteorology book directly
      if (selectedBookKey === 'cae-oxford' || selectedBookKey === 'oxford') {
        const meteorologyBook = meteorologyOxfordBooks[0];
        if (meteorologyBook) {
          console.log('Meteorology: Returning CAE Oxford book with chapters:', meteorologyBook.chapters?.length);
          return sanitizeBook(meteorologyBook);
        }
      }
      // Otherwise, check if a specific meteorology book is selected
      const meteorologyBook = meteorologyOxfordBooks.find((book) => book.slug === selectedBookKey);
      if (meteorologyBook) {
        console.log('Meteorology: Returning specific meteorology book with chapters:', meteorologyBook.chapters?.length);
        return sanitizeBook(meteorologyBook);
      }
    }

    if (selectedSubject.title === 'Technical General') {
      const technicalBook = technicalGeneralBooks.find((book) => book.slug === selectedBookKey);
      if (technicalBook) {
        return sanitizeBook(technicalBook);
      }
    }

    if (selectedSubject.title === 'Air Navigation') {
      const navBook = airNavigationOxfordBooks.find((book) => book.slug === selectedBookKey);
      if (navBook) {
        return sanitizeBook(navBook);
      }
    }

    // Finally, check direct book match (but skip for Radio Telephony with cae-oxford since we handled it above)
    const availableBooks = getAvailableBooks(selectedSubject);
    const directBook = availableBooks.find((book) => book.slug === selectedBookKey);
    if (directBook) {
      return sanitizeBook(directBook);
    }

    return null;
  }, [selectedSubject, selectedBookKey]);

  // Auto-scroll to sub-books when CAE Oxford is selected for Air Regulations
  useEffect(() => {
    if (selectedSubject?.title === 'Air Regulations' && 
        (selectedBookKey === 'cae-oxford' || selectedBookKey === 'oxford') && 
        !resolveSelectedBook && 
        subBooksRef.current) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        subBooksRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [selectedSubject, selectedBookKey, resolveSelectedBook]);

  const handleSubjectClick = (subject) => {
    setSelectedSubjectId(subject?.id ?? null);
    setSelectedBookKey(null);
  };

  const handleBookClick = (book) => {
    // Check if RK Bali is clicked
    if (book.title === 'RK Bali') {
      setShowBookComingSoonModal(true);
      return;
    }
    setSelectedBookKey(book.slug);
  };

  const handleChapterClick = (subject, chapter, book) => {
    // If chapter has no questions, show the coming soon modal
    if (!chapter.questions) {
      setClickedChapter({ subject, chapter, book });
      setShowComingSoonModal(true);
      return;
    }
    
    const chapterSlug = slugify(chapter?.name || 'overview');
    navigate(`/pyq/book/${book.slug}/${chapterSlug}`);
  };

  const handleViewNextChapter = () => {
    if (!clickedChapter) {
      setShowComingSoonModal(false);
      return;
    }

    const { subject, chapter, book } = clickedChapter;
    const allChapters = sanitizeChapters(book.chapters) || sanitizeChapters(subject.chapters) || [];
    const currentIndex = allChapters.findIndex(ch => ch.id === chapter.id);
    
    // Find the next chapter with questions
    let nextChapter = null;
    for (let i = currentIndex + 1; i < allChapters.length; i++) {
      if (allChapters[i].questions && allChapters[i].questions > 0) {
        nextChapter = allChapters[i];
        break;
      }
    }

    setShowComingSoonModal(false);
    
    if (nextChapter) {
      const chapterSlug = slugify(nextChapter?.name || 'overview');
      navigate(`/pyq/book/${book.slug}/${chapterSlug}`);
    } else {
      // If no next chapter with questions, just close the modal
      setClickedChapter(null);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubjectId(null);
    setSelectedBookKey(null);
  };

  const handleBackToBooks = () => {
    setSelectedBookKey(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        {/* Sidebar */}
        <SiteSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 pt-20 md:pt-24 pb-20 md:pb-8 md:ml-56 lg:ml-64 xl:ml-72">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
                Question Bank
              </h1>
              <p className="text-base md:text-lg text-gray-800 bg-white/70 inline-block px-4 py-2 rounded-full shadow-sm">
                Practice questions organized by subject and chapter
              </p>
              {/* Open access: no login required banner for question bank */}
            </div>

            {/* Back Button */}
            {(selectedSubject || resolveSelectedBook) && (
              <div className="mb-6">
                <button
                  onClick={selectedBookKey ? handleBackToBooks : handleBackToSubjects}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {selectedBookKey ? 'Back to Books' : 'Back to Subjects'}
                </button>
              </div>
            )}

            {/* Subjects View */}
            {!selectedSubject && !resolveSelectedBook && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Choose Your Subject
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                      <Card 
                        key={subject.id} 
                        className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <div className="text-center">
                          <div className={`w-16 h-16 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            {subject.icon}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {subject.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                            {subject.description}
                          </p>
                          <div className="flex items-center justify-center text-sm">
                            <span className="text-blue-600 font-semibold inline-flex items-center">
                              Start now
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Question Bank Overview</h3>
                    <p className="text-gray-600">Comprehensive coverage of all DGCA subjects</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">5,580</div>
                      <div className="text-gray-600">Total Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">6</div>
                      <div className="text-gray-600">Subjects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">30</div>
                      <div className="text-gray-600">Chapters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
                      <div className="text-gray-600">DGCA Aligned</div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Book Selection View */}
            {selectedSubject && !resolveSelectedBook && (
              <div>
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${selectedSubject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                    {selectedSubject.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubject.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedSubject.description}</p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-full">
                    <span className="text-blue-800 font-medium text-sm">
                      📚 Choose your study material
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Select Your Book
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {getAvailableBooks(selectedSubject).map((book) => (
                      <Card 
                        key={book.id} 
                        className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                        onClick={() => handleBookClick(book)}
                      >
                        <div className="text-center">
                          <div className={`w-20 h-20 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            {book.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-base leading-relaxed">
                            {book.description}
                          </p>
                          <div className="flex items-center justify-center">
                            <div className={`flex items-center px-6 py-3 bg-gradient-to-r ${book.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform group-hover:scale-105`}>
                              <span className="mr-2">{book.icon}</span>
                              Select Book
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Books View for Air Regulations > CAE Oxford */}
            {selectedSubject && !resolveSelectedBook && selectedSubject.title === 'Air Regulations' && (selectedBookKey === 'cae-oxford' || selectedBookKey === 'oxford') && (
              <div ref={subBooksRef}>
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${selectedSubject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                    {selectedSubject.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubject.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedSubject.description}</p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-full">
                    <span className="text-blue-800 font-medium text-sm">
                      📚 Choose your study material
                    </span>
                  </div>
                </div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Select Your Book
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {airRegulationsSubBooks.map((book) => (
                      <Card
                        key={book.id}
                        className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                        onClick={() => setSelectedBookKey(book.slug)}
                      >
                        <div className="text-center">
                          <div className={`w-20 h-20 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            {book.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
                            CPL/ATPL Ground Training Series
                          </p>
                          <div className="flex items-center justify-center">
                            <div className={`flex items-center px-6 py-3 bg-gradient-to-r ${book.color} text-white font-semibold rounded-lg`}>
                              <span className="mr-2">{book.icon}</span>
                              Select Book
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chapters/Sub-Books View */}
            {selectedSubject && resolveSelectedBook && (() => {
              const bookChapters = sanitizeChapters(resolveSelectedBook?.chapters) || [];
              const subjectChapters = sanitizeChapters(selectedSubject?.chapters) || [];
              const chapters = bookChapters.length > 0 ? bookChapters : subjectChapters;
              
              console.log('Rendering chapters:', { 
                bookChapters: bookChapters.length, 
                subjectChapters: subjectChapters.length,
                finalChapters: chapters.length,
                bookTitle: resolveSelectedBook?.title,
                subjectTitle: selectedSubject?.title,
                bookSlug: resolveSelectedBook?.slug,
                selectedBookKey
              });

              return (
                <div>
                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-r ${selectedSubject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                      {selectedSubject.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubject.title}</h2>
                    <p className="text-gray-600 mb-4">{selectedSubject.description}</p>
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${resolveSelectedBook.color} rounded-xl flex items-center justify-center text-white text-2xl mr-3`}>
                        {resolveSelectedBook.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900">
                          {resolveSelectedBook.title}
                        </h3>
                        <p className="text-sm text-gray-600">{resolveSelectedBook.description}</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-full">
                      <span className="text-blue-800 font-medium text-sm">
                        📚 Practice information available
                      </span>
                    </div>
                  </div>

                  {selectedSubject.title === 'Technical General' && selectedBookKey === 'cae-oxford' ? (
                  // For Technical General, after selecting CAE Oxford, show 4 Oxford sub-books
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {technicalGeneralBooks.map((book) => (
                      <Card
                        key={book.id}
                        className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                        onClick={() => setSelectedBookKey(book.slug)}
                      >
                        <div className="text-center">
                          <div className={`w-20 h-20 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            {book.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
                            CPL/ATPL Ground Training Series
                          </p>
                          <div className="flex items-center justify-center">
                            <div className={`flex items-center px-6 py-3 bg-gradient-to-r ${book.color} text-white font-semibold rounded-lg`}>
                              <span className="mr-2">{book.icon}</span>
                              Select Book
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : selectedSubject.title === 'Air Navigation' && selectedBookKey === 'cae-oxford' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {airNavigationOxfordBooks.map((book) => (
                      <Card
                        key={book.id}
                        className="p-8 cursor-pointer hover:shadow-xl transition-all duration-300 group"
                        onClick={() => setSelectedBookKey(book.slug)}
                      >
                        <div className="text-center">
                          <div className={`w-20 h-20 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            {book.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
                            CPL/ATPL Ground Training Series
                          </p>
                          <div className="flex items-center justify-center">
                            <div className={`flex items-center px-6 py-3 bg-gradient-to-r ${book.color} text-white font-semibold rounded-lg`}>
                              <span className="mr-2">{book.icon}</span>
                              Select Book
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-2">No chapters found for this book.</p>
                    <p className="text-sm text-gray-500">
                      Book: {resolveSelectedBook?.title || 'Unknown'} | 
                      Subject: {selectedSubject?.title || 'Unknown'} |
                      Key: {selectedBookKey || 'None'}
                    </p>
                  </div>
                ) : (
                  // Default: show chapters for the selected book
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {chapters.map((chapter) => (
                      <Card key={chapter.id} className={`p-6 hover:shadow-lg transition-all duration-300 ${!chapter.questions ? 'opacity-75' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{chapter.name}</h3>
                              {!chapter.questions && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-300">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                {chapter.questions ? `${chapter.questions} questions` : 'Chapter overview'}
                              </span>
                        {(Number.isFinite(chapter.pageStart) || Number.isFinite(chapter.pageEnd)) && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 3a2 2 0 00-2 2v11.5A1.5 1.5 0 003.5 18H15a3 3 0 003-3V5a2 2 0 00-2-2H4zm0 2h12v10a1 1 0 01-1 1H4V5zm3 2v2h6V7H7zm0 4v2h6v-2H7z" />
                            </svg>
                            {Number.isFinite(chapter.pageStart) && Number.isFinite(chapter.pageEnd)
                              ? `Pages ${chapter.pageStart}–${chapter.pageEnd}`
                              : Number.isFinite(chapter.pageStart)
                              ? `Page ${chapter.pageStart}+`
                              : `Up to page ${chapter.pageEnd}`}
                          </span>
                        )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                            {chapter.difficulty}
                          </span>
                        </div>

                        <div className="flex justify-center">
                          <button
                            onClick={() => handleChapterClick(selectedSubject, chapter, resolveSelectedBook)}
                            className={`w-full py-3 px-6 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform ${
                              chapter.questions
                                ? `bg-gradient-to-r ${resolveSelectedBook.color} text-white hover:shadow-lg hover:scale-[1.02]`
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:shadow-md cursor-pointer'
                            }`}
                            title={chapter.questions ? `Practice with ${resolveSelectedBook.title}` : 'Click to view details'}
                          >
                            <div className="flex items-center justify-center">
                              <span className="mr-2">{resolveSelectedBook.icon}</span>
                              {chapter.questions ? 'Start Practice' : 'Coming Soon'}
                            </div>
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                </div>
              );
            })()}
          </div>
        </main>
      </div>

      {/* Coming Soon Modal */}
      <Modal
        open={showComingSoonModal}
        onClose={() => {
          setShowComingSoonModal(false);
          setClickedChapter(null);
        }}
        title="Chapter Coming Soon"
        footer={
          <>
            <button
              onClick={() => {
                setShowComingSoonModal(false);
                setClickedChapter(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleViewNextChapter}
              className={`px-6 py-2 bg-gradient-to-r ${clickedChapter?.book?.color || 'from-blue-500 to-blue-600'} text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
            >
              View Next Chapter
            </button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-gray-700">
            This chapter does not include questions. Would you like to view the next chapter?
          </p>
        </div>
      </Modal>

      {/* RK Bali Coming Soon Modal */}
      <Modal
        open={showBookComingSoonModal}
        onClose={() => setShowBookComingSoonModal(false)}
        title="Coming Soon"
        footer={
          <button
            onClick={() => setShowBookComingSoonModal(false)}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
          >
            OK, I'll Select Another Book
          </button>
        }
      >
        <div className="py-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">RK Bali Book Coming Soon</h3>
          </div>
          <p className="text-gray-700 text-center mb-4">
            The RK Bali book is currently under development and will be available soon.
          </p>
          <p className="text-gray-600 text-center text-sm">
            Please select another book to continue your practice.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionBank;
