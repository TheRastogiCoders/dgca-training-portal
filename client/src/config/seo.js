// SEO Configuration for DGCA-focused pages

export const SEO_CONFIG = {
  home: {
    title: "VIMAANNA - DGCA Exam Preparation | Pilot License Exam (CPL/ATPL) Practice Tests, Question Bank & Study Materials",
    description: "Best DGCA exam preparation platform for pilot license exams (CPL, ATPL). Practice tests, PYQ sessions, question banks for Air Regulations, Meteorology, Air Navigation, Technical General. Free aviation exam preparation, pilot exam questions, and study materials. Prepare for commercial pilot license and airline transport pilot license exams.",
    keywords: "DGCA exam, DGCA preparation, DGCA practice test, DGCA question bank, DGCA study material, Air Regulations DGCA, Meteorology DGCA, Air Navigation DGCA, Technical General DGCA, DGCA pilot exam, DGCA CPL exam, DGCA ATPL exam, DGCA online test, DGCA previous year questions, DGCA mock test, aviation exam preparation, pilot license exam, DGCA training, DGCA coaching, pilot exam, pilot license, CPL exam, ATPL exam, commercial pilot license, airline transport pilot license, aviation training, pilot training, aviation exam, pilot test, aviation questions, pilot questions, DGCA syllabus, aviation syllabus, pilot syllabus, DGCA exam pattern, pilot exam pattern, aviation exam pattern, DGCA exam date, pilot exam date, aviation exam date, DGCA result, pilot exam result, aviation exam result, DGCA online coaching, pilot online coaching, aviation online coaching, DGCA study guide, pilot study guide, aviation study guide, DGCA books, pilot books, aviation books, DGCA notes, pilot notes, aviation notes, DGCA mock test online, pilot mock test, aviation mock test, DGCA sample papers, pilot sample papers, aviation sample papers, DGCA previous papers, pilot previous papers, aviation previous papers, Indian aviation exam, Indian pilot exam, India DGCA, DGCA India, aviation India, pilot India, commercial pilot India, airline pilot India, flight training India, aviation academy India, pilot academy India, how to become pilot, pilot career, aviation career, pilot license India, CPL license India, ATPL license India"
  },
  questionBank: {
    title: "DGCA Question Bank | Pilot License Exam Practice Questions for All Subjects - VIMAANNA",
    description: "Comprehensive DGCA question bank for pilot license exams (CPL, ATPL) with thousands of practice questions for Air Regulations, Meteorology, Air Navigation, Technical General, Technical Specific, and Radio Telephony. Free aviation exam questions and pilot exam questions with detailed solutions.",
    keywords: "DGCA question bank, DGCA practice questions, DGCA exam questions, pilot exam questions, aviation exam questions, Air Regulations questions, Meteorology questions, Air Navigation questions, Technical General questions, DGCA MCQ, DGCA practice test, pilot practice test, aviation practice test, CPL questions, ATPL questions, commercial pilot questions, airline pilot questions"
  },
  pyq: {
    title: "DGCA PYQ Practice Tests | Pilot License Exam Previous Year Questions - VIMAANNA",
    description: "Practice DGCA previous year questions (PYQ) for pilot license exams (CPL, ATPL) with our comprehensive test series. Access PYQ sessions for Air Regulations, Meteorology, Air Navigation, and Technical General. Free aviation mock tests and pilot exam practice tests.",
    keywords: "DGCA PYQ, DGCA previous year questions, pilot PYQ, aviation PYQ, DGCA practice test, DGCA mock test, pilot mock test, aviation mock test, DGCA exam questions, pilot exam questions, aviation exam questions, DGCA sample papers, pilot sample papers, DGCA test series, pilot test series, DGCA online practice, pilot online practice, DGCA exam preparation, pilot exam preparation, CPL PYQ, ATPL PYQ, commercial pilot PYQ"
  },
  library: {
    title: "DGCA Study Materials & Library | Notes, Books & Resources - VIMAANNA",
    description: "Access comprehensive DGCA study materials, notes, books, and resources for all DGCA subjects. Free study materials for Air Regulations, Meteorology, Air Navigation, and Technical subjects.",
    keywords: "DGCA study materials, DGCA notes, DGCA books, DGCA resources, DGCA study guide, aviation study materials, pilot study resources, DGCA exam books"
  },
  subjects: {
    'air-regulations': {
      title: "Air Regulations DGCA Preparation | Practice Tests & Study Materials - VIMAANNA",
      description: "Comprehensive Air Regulations DGCA preparation with practice tests, question banks, PYQ sessions, and study materials. Master Civil Aviation Rules, Air Traffic Control, and Flight Operations for DGCA exams.",
      keywords: "Air Regulations DGCA, DGCA Air Regulations, Civil Aviation Rules, ATC DGCA, Flight Operations DGCA, Aircraft Registration DGCA, Licensing DGCA, Air Regulations practice test, Air Regulations question bank"
    },
    'meteorology': {
      title: "Meteorology DGCA Preparation | Weather Systems & Practice Tests - VIMAANNA",
      description: "Master Meteorology for DGCA exams with practice tests, question banks, and study materials. Learn about Atmosphere, Pressure, Cloud Types, Weather Fronts, Wind Systems, and Weather Hazards.",
      keywords: "Meteorology DGCA, DGCA Meteorology, Aviation Weather, Weather Systems DGCA, Atmosphere DGCA, Cloud Types DGCA, Weather Fronts DGCA, Meteorology practice test, Meteorology question bank"
    },
    'air-navigation': {
      title: "Air Navigation DGCA Preparation | Navigation Systems & Practice Tests - VIMAANNA",
      description: "Comprehensive Air Navigation DGCA preparation with practice tests and study materials. Learn Dead Reckoning, VOR/DME Navigation, GPS & RNAV, Flight Planning, and Radio Navigation for DGCA exams.",
      keywords: "Air Navigation DGCA, DGCA Air Navigation, Navigation Systems, VOR DME Navigation, GPS RNAV DGCA, Flight Planning DGCA, Radio Navigation DGCA, Air Navigation practice test, Air Navigation question bank"
    },
    'technical-general': {
      title: "Technical General DGCA Preparation | Aircraft Systems & Practice Tests - VIMAANNA",
      description: "Master Technical General for DGCA exams with practice tests and study materials. Learn Aircraft Engines, Electrical Systems, Hydraulic Systems, Aerodynamics, and Aircraft Structures.",
      keywords: "Technical General DGCA, DGCA Technical General, Aircraft Systems, Aircraft Engines DGCA, Electrical Systems DGCA, Hydraulic Systems DGCA, Aerodynamics DGCA, Technical General practice test"
    },
    'technical-specific': {
      title: "Technical Specific DGCA Preparation | Aircraft Type Knowledge - VIMAANNA",
      description: "Technical Specific DGCA preparation with practice tests and study materials. Learn about Cessna 172 Systems, Piper Cherokee, Multi-Engine Aircraft, Turboprop Systems, and Jet Aircraft.",
      keywords: "Technical Specific DGCA, DGCA Technical Specific, Aircraft Type Knowledge, Cessna 172 DGCA, Multi-Engine Aircraft DGCA, Turboprop Systems DGCA, Jet Aircraft DGCA"
    },
    'radio-telephony': {
      title: "Radio Telephony (RTR-A) DGCA Preparation | Communication Procedures - VIMAANNA",
      description: "Master Radio Telephony (RTR-A) for DGCA exams with practice tests and study materials. Learn Standard Phraseology, ATC Communications, Emergency Procedures, Radio Equipment, and International Procedures.",
      keywords: "Radio Telephony DGCA, RTR-A DGCA, Radio Communication DGCA, ATC Communications DGCA, Standard Phraseology DGCA, Emergency Procedures DGCA, Radio Equipment DGCA"
    }
  }
};

export const getSEOForSubject = (subjectSlug) => {
  return SEO_CONFIG.subjects[subjectSlug] || SEO_CONFIG.home;
};

export const getSEOForPage = (page) => {
  return SEO_CONFIG[page] || SEO_CONFIG.home;
};

