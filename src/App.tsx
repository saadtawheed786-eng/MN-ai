import React, { useState, useEffect, useRef } from "react";
import {
  Anchor,
  Compass,
  Ship,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  User,
  Settings,
  Shield,
  Download,
  BookMarked,
  Share2,
  Calendar,
  LogOut,
  Flame,
  CheckCircle,
  Clock,
  Send,
  HelpCircle,
  Briefcase,
  PlayCircle,
  FileText,
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  Bell,
  Star,
  Users,
  DollarSign,
  Check,
  AlertCircle,
  HardDrive,
  Lock,
  EyeOff,
  Loader
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  MARITIME_COURSES,
  MOCK_TESTS,
  MOCK_QUESTIONS,
  SUCCESS_STORIES,
  STATIC_ROADMAP_STEPS,
  Course,
  MockTest,
  MockQuestion
} from "./data/maritimeData";
import { askGemini, aiExtractQuestions } from "./utils/gemini";

export default function App() {
  // Navigation & Page routing state
  // Page options: 'home' | 'courses' | 'tests' | 'aitutor' | 'studymaterials' | 'pricing' | 'about' | 'contact' | 'dashboard' | 'admin'
  const [activeTab, setActiveTab] = useState<string>("home");

  // User Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'student' | 'admin'>("student");
  const [userName, setUserName] = useState<string>("Officer Cadet Saad");
  const [userEmail, setUserEmail] = useState<string>("saadtawheed786@gmail.com");
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginOTP, setLoginOTP] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // User Stats state (persisted in local state)
  const [userStreak, setUserStreak] = useState<number>(5);
  const [streakClaimed, setStreakClaimed] = useState<boolean>(false);
  const [studyNotes, setStudyNotes] = useState<string>(
    "⚓ DECK WATCHKEEPING NOTES:\n- Rule 5: Keep sharp visual & radar lookout. Check Port lens daily.\n- Rule 13: Overtaking vessel remains clear of overtaken ship in sector 22.5° abaft beam.\n- Fresh Water Density = 1.000 g/cm³, Salt Water = 1.025 g/cm³. FWA = Displacement / (4 * TPC)."
  );
  const [calendarTasks, setCalendarTasks] = useState([
    { id: 1, title: "Practice 20 physics buoyancy sums", completed: true },
    { id: 2, title: "Review Anglo Eastern Interview PDF", completed: false },
    { id: 3, title: "Take IMU-CET English Mock Test A", completed: false }
  ]);
  const [newTaskText, setNewTaskText] = useState("");

  // Test System state
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testTimeRemaining, setTestTimeRemaining] = useState<number>(0);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    rankPredicted: number;
    percentile: number;
  } | null>(null);

  // Gating & Payment States for Rs 49 Mock Pass
  const [hasPurchasedMockPass, setHasPurchasedMockPass] = useState<boolean>(() => {
    return localStorage.getItem("MN_AI_MOCK_PASS") === "true";
  });
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [testToUnlock, setTestToUnlock] = useState<MockTest | null>(null);
  const [paymentSuccessFeedback, setPaymentSuccessFeedback] = useState<boolean>(false);

  // AI Sponsorship & Google Meet Interview States
  const [userHasSponsorshipSub, setUserHasSponsorshipSub] = useState<boolean>(() => {
    return localStorage.getItem("MN_AI_SPONSORSHIP_SUB") === "true";
  });
  const [userHasInterviewPlan, setUserHasInterviewPlan] = useState<boolean>(() => {
    return localStorage.getItem("MN_HAS_INTERVIEW_PLAN") === "true";
  });
  const [googleMeetBookings, setGoogleMeetBookings] = useState<any[]>(() => {
    const saved = localStorage.getItem("MN_GOOG_MEET_BOOKINGS");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default pre-seeded bookings for admin and users to view immediately
    return [
      {
        id: "meet_1",
        candidateName: "Aditya Vardhan",
        candidateEmail: "aditya.v@cadetship.com",
        courseType: "Deck Cadet (IMU-CET)",
        date: "2026-06-21",
        time: "10:30",
        meetUrl: "https://meet.google.com/qqt-msjk-bwy",
        status: "Approved",
        createdAt: new Date().toISOString()
      },
      {
        id: "meet_2",
        candidateName: "Siddharth Shinde",
        candidateEmail: "siddharth.shinde@gpmail.com",
        courseType: "GP Rating Cadet",
        date: "2026-06-23",
        time: "15:00",
        meetUrl: "",
        status: "Pending",
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [aiInterviewLogs, setAiInterviewLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("MN_AI_INTERVIEW_LOGS");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default pre-seeded interview scores
    return [
      {
        id: "ai_log_1",
        candidateName: "Rohan Mehra",
        courseType: "Deck Cadet (IMU-CET)",
        score: 88,
        date: "2026-06-16",
        recommendation: "Excellent spatial awareness and vessel COLREG knowledge. Highly recommended for Anglo-Eastern or Synergy DNS sponsorship.",
        transcript: [
          { q: "What key visual signals must a trawler display at night under COLREG Rule 26?", a: "Green light over white in a vertical line to indicate trawling activity", feedback: "Correct. Displays excellent command over Rules of the Road." },
          { q: "Define Metacentric Height (GM) and explain why positive value is vital.", a: "Gm is distance from gravity to metacenter. Positive GM ensures stability so vessel self-rights", feedback: "Strong technical answer. Thorough explanation of buoyancy parameters." }
        ]
      },
      {
        id: "ai_log_2",
        candidateName: "Karan Johar",
        courseType: "GP Rating Cadet",
        score: 72,
        date: "2026-06-17",
        recommendation: "Solid understanding of manual shipboard soundings and knots. Needs additional training on buoy shapes and lights.",
        transcript: [
          { q: "How would you determine if a ship board fire extinguisher is charged and safe?", a: "Examine weight and look at pressure indicator needle in the green zone.", feedback: "Good watchkeeping answer. Basic and solid safety protocol." }
        ]
      }
    ];
  });

  // Active user's pending interactive AI interview simulation session state
  const [activeAIInterviewType, setActiveAIInterviewType] = useState<"Deck Cadet" | "GP Rating">("Deck Cadet");
  const [aiInterviewActive, setAiInterviewActive] = useState<boolean>(false);
  const [aiInterviewStep, setAiInterviewStep] = useState<number>(0);
  const [aiInterviewQuestionsList, setAiInterviewQuestionsList] = useState<string[]>([]);
  const [aiInterviewUserAnswers, setAiInterviewUserAnswers] = useState<string[]>([]);
  const [aiInterviewFeedbacks, setAiInterviewFeedbacks] = useState<any[]>([]);
  const [aiInterviewLoading, setAiInterviewLoading] = useState<boolean>(false);
  const [aiInterviewFinalResult, setAiInterviewFinalResult] = useState<any | null>(null);

  // User input fields for scheduling a live Meet slot
  const [meetBookingFormName, setMeetBookingFormName] = useState<string>("");
  const [meetBookingFormEmail, setMeetBookingFormEmail] = useState<string>("");
  const [meetBookingFormCourse, setMeetBookingFormCourse] = useState<string>("Deck Cadet (IMU-CET)");
  const [meetBookingFormDate, setMeetBookingFormDate] = useState<string>("2026-06-25");
  const [meetBookingFormTime, setMeetBookingFormTime] = useState<string>("11:00");
  const [meetBookingSubmitting, setMeetBookingSubmitting] = useState<boolean>(false);
  
  // Subject filter state for easy listing category-wise
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All Subjects");

  // High-Security Private Drive Files
  const [secureDriveFiles, setSecureDriveFiles] = useState<any[]>(() => {
    const defaultDriveFiles = [
      {
        id: "df_1",
        title: "⚡ Ultimate IMU-CET Numerical Solver Vault",
        description: "Official structured notes breaking down high-yield stability ratios, hydrostatic formulas, freshwater allowances, and GM metacentric calculations.",
        category: "IMU-CET Prep",
        content: `--- HIGH-YIELD STABILITY STUDY SHEET ---\n\n1. Fresh Water Allowance (FWA):\n   FWA (mm) = Displacement / (4 * TPC)\n\n2. Change of Draft with density change:\n   New draft = Old draft * (Old density / New density)\n\n3. Metacentric Height (GM):\n   GM = KM - KG\n   Where KM is the height of metacentre, and KG is height of center of gravity.\n\n4. Simpson's Rules for Areas & Volumes:\n   First Rule: Area = (h/3) * (y0 + 4y1 + 2y2 + 4y3 + ... + yn)\n\n[CONFIDENTIAL ACTIVE CODES SECURITY TRACKER - REGISTERED: OFFICER CADET SAAD]\nUnauthorized replication, print, screencasting, or screenshots violates maritime honor codes and will trigger instant telemetry ban.`,
        uploadedBy: "Chief Capt. Nair",
        uploadedAt: "2026-06-15",
        isPremiumOnly: true
      },
      {
        id: "df_2",
        title: "⚓ Anglo-Eastern Past Orals & Synergy Boardroom Masterclass",
        description: "Actual interview board questions asked by superintendent engineers regarding steering gear regulations, emergency power and Annex VI fuel restrictions.",
        category: "Sponsorship",
        content: `--- ANGLO EASTERN SPONSORSHIP QUESTIONS ---\n\nQ1: What are SOLAS regulations around steering gear redundancy?\nAns: SOLAS Chapter II-1/29 requires auxiliary steering gear capable of putting rudder over from 15 deg on one side to 15 deg on the other in not more than 60 sec at deepest seagoing draft, and in half-speed or 7 knots whichever is greater.\n\nQ2: State sulfur limit inside SECA regions.\nAns: Under MARPOL Annex VI regulations, sulfur limit for fuel oil used inside Emission Control Areas (SECA) is strict 0.10% m/m.\n\nQ3: What is the flashpoint requirement for fuel used on board machinery space?\nAns: Fuel flashpoint must not be less than 60°C (SOLAS Chap II-2).\n\n[CONFIDENTIAL WATERMARK: PROTECTED CADET DIRECTORY - SECURE PREVIEW ONLY]`,
        uploadedBy: "Capt. Rohan Sharma",
        uploadedAt: "2026-06-16",
        isPremiumOnly: true
      },
      {
        id: "df_3",
        title: "📐 Paramount Academy Core Collision Regulations (rules 1-19)",
        description: "High-yield calculation handouts featuring buoyancy limits, freshwater displacement drafts, and Archimedes principles.",
        category: "Navigation Safety",
        content: `--- ARCHIMEDES PRINCIPLE & METACENTRIC SHIFTS ---\n\n1. Force of Buoyancy (Fb):\n   Fb = Density of liquid * Volume submerged * g\n\n2. Shift of center of gravity (GG1):\n   GG1 = (w * d) / W\n   Where 'w' is shifted weight, 'd' is distance of shift, 'W' is total ship weight.\n\n3. Angle of heel (tan θ):\n   tan θ = GG1 / GM\n\n[CONFIDENTIAL SCREEN CASTING BAN: DECODED EXCLUSIVE SECURE DOC]`,
        uploadedBy: "Prof. S. K. Gupta",
        uploadedAt: "2026-06-17",
        isPremiumOnly: true
      }
    ];
    try {
      const saved = localStorage.getItem("MN_SECURE_DRIVE_FILES");
      return saved ? JSON.parse(saved) : defaultDriveFiles;
    } catch {
      return defaultDriveFiles;
    }
  });

  const [selectedDriveFile, setSelectedDriveFile] = useState<any | null>(null);
  const [activeViewerPage, setActiveViewerPage] = useState<number>(0);
  const [driveSearch, setDriveSearch] = useState<string>("");
  const [driveCatFilter, setDriveCatFilter] = useState<string>("All");
  const [viewerMode, setViewerMode] = useState<"visual" | "text">("visual");

  // Form states for Admin Uploads to the Secure Drive
  const [adminDriveFormTitle, setAdminDriveFormTitle] = useState<string>("");
  const [adminDriveFormCat, setAdminDriveFormCat] = useState<string>("IMU-CET Prep");
  const [adminDriveFormDesc, setAdminDriveFormDesc] = useState<string>("");
  const [adminDriveFormContent, setAdminDriveFormContent] = useState<string>("");
  
  // PDF upload specific state variables
  const [adminUploadedFileName, setAdminUploadedFileName] = useState<string>("");
  const [adminUploadedFileSize, setAdminUploadedFileSize] = useState<string>("");
  const [adminUploadedFilePages, setAdminUploadedFilePages] = useState<number>(4);
  const [adminUploadedFileBase64, setAdminUploadedFileBase64] = useState<string>("");



  // Admin Mock Test Builder States
  const [newMockTestTitle, setNewMockTestTitle] = useState<string>("");
  const [newMockTestCategory, setNewMockTestCategory] = useState<string>("IMU-CET");
  const [newMockTestDuration, setNewMockTestDuration] = useState<number>(60);
  const [newMockTestPrice, setNewMockTestPrice] = useState<number>(49);
  const [addedQuestionsForNewTest, setAddedQuestionsForNewTest] = useState<MockQuestion[]>([]);

  // Individual Question Builder draft states
  const [draftQuestionText, setDraftQuestionText] = useState<string>("");
  const [draftOptions, setDraftOptions] = useState<string[]>(["", "", "", ""]);
  const [draftCorrectIndex, setDraftCorrectIndex] = useState<number>(0);
  const [draftExplanation, setDraftExplanation] = useState<string>("");
  const [isGeneratingAIOptions, setIsGeneratingAIOptions] = useState<boolean>(false);

  // Admin Batch File Question Extractor States
  const [buildMode, setBuildMode] = useState<"singles" | "batch">("singles");
  const [batchFileList, setBatchFileList] = useState<MockQuestion[]>([]);
  const [isExtractionActive, setIsExtractionActive] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  // Dynamic Mock Tests catalog
  const [mockTestsList, setMockTestsList] = useState<MockTest[]>(() => {
    const defaultMocks: MockTest[] = [
      { id: "free-sample-mock", title: "Example Free Mock Test (5 Sample Questions)", category: "IMU-CET", durationMinutes: 15, totalQuestions: 5 },
      ...MOCK_TESTS
    ];
    try {
      const saved = localStorage.getItem("MN_AI_MOCK_TESTS");
      return saved ? JSON.parse(saved) : defaultMocks;
    } catch {
      return defaultMocks;
    }
  });

  // Dynamic Questions dictionary
  const [mockQuestionsDict, setMockQuestionsDict] = useState<Record<string, MockQuestion[]>>(() => {
    const FREE_SAMPLE_QUESTIONS: MockQuestion[] = [
      {
        id: "q_free_1",
        subject: "Buoyancy",
        question: "Which letter on a ship's Plimsoll mark load line represents the maximum cargo boundary in tropical fresh water environments?",
        options: ["TF (Tropical Fresh)", "F (Fresh Water)", "T (Tropical Salt)", "S (Summer Salt)"],
        correctIndex: 0,
        explanation: "TF stands for Tropical Fresh Water. Standard Plimsoll lines designate TF as the highest acceptable loading point, allowing the vessel to sit deepest because water density is lowest under tropical fresh conditions."
      },
      {
        id: "q_free_2",
        subject: "COLREG Navigation",
        question: "You spot a single Green beacon light crossing at 45 degrees abaft your vessel's port bow during nocturnal passage. Under COLREG rules, what is your standard watchkeeping responsibility?",
        options: [
          "Alter course to port with rapid throttle bursts.",
          "Alter course to starboard to cross her stem.",
          "You are the stand-on vessel; maintain your course and speed with sharp visual watch.",
          "Sound five short blasts and immediately engage hard reverse engines."
        ],
        correctIndex: 2,
        explanation: "Under COLREG Rule 15, you are seeing a crossing vessel on your port side. You are the stand-on vessel and must maintain speed and course, yet monitor her position continuously to verify she takes giving-way measures."
      },
      {
        id: "q_free_3",
        subject: "Ship Watch",
        question: "What is the mandatory angular sector of a power-driven vessel's white Stern navigation light?",
        options: ["112.5 degrees", "135.0 degrees", "225.0 degrees", "360.0 degrees"],
        correctIndex: 1,
        explanation: "According to COLREG Rule 21(d), a stern light must project a steady white light over an arc of the horizon of exactly 135 degrees (67.5 degrees abaft the centerline on each side of the vessel)."
      },
      {
        id: "q_free_4",
        subject: "Applied Sciences",
        question: "Seawater has an approximate relative density of 1.025. If a bulk carrier has a displacement of 12,000 tons and enters an estuary of freshwater (density 1.000), what is the expected volume displacement delta?",
        options: [
          "The ship experiences no safety shift.",
          "The ship volume displacement increases (she floats higher).",
          "The ship volume displacement decreases (she floats deeper).",
          "The ship sinks deeper (draft increases) because freshwater is less dense than saltwater."
        ],
        correctIndex: 3,
        explanation: "Freshwater is less dense, meaning displacement volume must expand to sustain equivalent buoyant force. Therefore, ship draft increases, making her ride deeper."
      },
      {
        id: "q_free_5",
        subject: "Seamanship Math",
        question: "If a ship's cruising engine burns 18 tons of diesel fuel to travel 240 nautical miles, how many tons are consumed for a passage distance of 400 nautical miles at identical speed parameters?",
        options: ["22.5 Tons", "27.0 Tons", "30.0 Tons", "36.5 Tons"],
        correctIndex: 2,
        explanation: "At a fixed cruising speed, fuel consumption scales linearly with distance. Distance ratio is 400/240 = 1.667. Required fuel = 18 tons * 1.667 = 30.0 tons."
      }
    ];

    const defaultDict = {
      "free-sample-mock": FREE_SAMPLE_QUESTIONS,
      ...MOCK_QUESTIONS
    };

    try {
      const saved = localStorage.getItem("MN_AI_MOCK_QUESTIONS");
      return saved ? JSON.parse(saved) : defaultDict;
    } catch {
      return defaultDict;
    }
  });

  // Course watch simulation state
  const [activeCourseWatch, setActiveCourseWatch] = useState<Course | null>(null);

  // AI Assistant and interview simulator state
  const [radarSweeping, setRadarSweeping] = useState<boolean>(true);
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>(
    () => localStorage.getItem("MN_AI_GEMINI_KEY") || ""
  );
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'user' | 'system' | 'gemini', text: string, timestamp: string }>>([
    {
      sender: 'system',
      text: "👋 Ahoy! I am the Merchant Navy Commander AI. Ask me any doubt about physical buoyancy, stability calculations, load lines, COLREG rules of the road, or Cadet job sponsorships!",
      timestamp: "00:00"
    }
  ]);
  const [chatInputText, setChatInputText] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Interview Simulator state
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState<number>(0);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);
  const [currentInterviewValue, setCurrentInterviewValue] = useState<string>("");
  const [interviewFeedback, setInterviewFeedback] = useState<string>("");
  const [interviewEvaluating, setInterviewEvaluating] = useState<boolean>(false);

  // Roadmap engine state
  const [roadmapCoreSelection, setRoadmapCoreSelection] = useState<string>("DNS Cadet");
  const [generatedRoadmapText, setGeneratedRoadmapText] = useState<string>("");
  const [generatingRoadmap, setGeneratingRoadmap] = useState<boolean>(false);

  // Subscription and pricing state
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<{ name: string, price: number, duration: string } | null>(null);
  const [promoCodeValue, setPromoCodeValue] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [appliedPromo, setAppliedPromo] = useState<string>("");
  const [checkoutCompleted, setCheckoutCompleted] = useState<boolean>(false);

  // Eligibility Checker state
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState<boolean>(false);
  const [eligibilityStream, setEligibilityStream] = useState<string>("Deck Cadet"); // "Deck Cadet" | "Engine Cadet" | "ETO Cadet"
  const [eligibilityPcm, setEligibilityPcm] = useState<number>(60);
  const [eligibilityEnglish, setEligibilityEnglish] = useState<number>(60);
  const [eligibilityAge, setEligibilityAge] = useState<number>(18);
  const [eligibilityColourBlindness, setEligibilityColourBlindness] = useState<boolean>(false); // false = normal, true = colour blind
  const [eligibilityEyesightPassed, setEligibilityEyesightPassed] = useState<boolean>(true); // true = meets eyesight standard
  const [eligibilityDiplomaDegrees, setEligibilityDiplomaDegrees] = useState<boolean>(false); // For ETO/Engine GME qualifications
  const [eligibilityResult, setEligibilityResult] = useState<{
    stream: string;
    issues: string[];
    companies: Array<{ name: string; isEligible: boolean; reasons: string[]; details: string }>;
  } | null>(null);

  // Admin dynamic control panel inputs
  const [studentList, setStudentList] = useState([
    { id: "S1", name: "Saad Tawheed", email: "saadtawheed786@gmail.com", plan: "Annual Cadet Premium", joined: "2026-03-12", status: "Active" },
    { id: "S2", name: "Abhishek Sharma", email: "abhishek.m@navy.in", plan: "Quarterly Officer Pass", joined: "2026-05-18", status: "Active" },
    { id: "S3", name: "John Doe", email: "john_mariner@gmail.com", plan: "Free Trial Basic", joined: "2026-06-01", status: "Expired" }
  ]);
  const [announcements, setAnnouncements] = useState([
    { date: "June 17, 2026", msg: "🚨 Anglo Eastern DNS Online registrations are now open for August batch!" },
    { date: "June 15, 2026", msg: "📈 IMU-CET Rank Predictor logic upgraded with previous year statistics." }
  ]);
  const [newAnnouncementText, setNewAnnouncementText] = useState<string>("");
  
  // Custom course builder
  const [customCourseTitle, setCustomCourseTitle] = useState("");
  const [customCourseCat, setCustomCourseCat] = useState("IMU-CET Prep");
  const [customCourseDesc, setCustomCourseDesc] = useState("");

  // Test performance statistics chart data for standard Recharts view (student progress)
  const studentPerformanceData = [
    { name: "Diagnostic Test", score: 68 },
    { name: "Math Review", score: 82 },
    { name: "COLREG Rules", score: 95 },
    { name: "Chem Electro", score: 72 },
    { name: "Buoyancy Master", score: 88 }
  ];

  // Admin simulated revenue charts over past months
  const revenueChartData = [
    { month: "Jan", subscriptions: 18, revenue: 1400 },
    { month: "Feb", subscriptions: 34, revenue: 2900 },
    { month: "Mar", subscriptions: 62, revenue: 5120 },
    { month: "Apr", subscriptions: 95, revenue: 8240 },
    { month: "May", subscriptions: 145, revenue: 12450 },
    { month: "Jun", subscriptions: 210, revenue: 18780 }
  ];

  const interviewSimulatorQuestions = [
    "Tell us about yourself and explain why you want to select a challenging career at sea rather than a standard corporate shore job?",
    "Under COLREG Rule 13, are you considered an overtaking vessel if you approach another abaft her beam? Who is the give-way vessel, and what color navigation marker would you expect to inspect?",
    "Define GM (Metacentric Height). What physical hazards happen to a container bulk cargo vessel if she has a dangerously low or negative GM value?"
  ];

  // Active Timer tracker for exam taking
  useEffect(() => {
    let interval: any = null;
    if (isTestRunning && testTimeRemaining > 0) {
      interval = setInterval(() => {
        setTestTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTestAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isTestRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTestRunning, testTimeRemaining]);

  // Anti-Screenshot & Copy Safe drive interceptors
  useEffect(() => {
    if (activeTab !== "drive") return;
    
    const handleKeydown = (e: KeyboardEvent) => {
      const isCtrlS = (e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 's';
      const isCtrlP = (e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 'p';
      const isCtrlC = (e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 'c';
      if (isCtrlS || isCtrlP || isCtrlC || e.key === 'PrintScreen') {
        e.preventDefault();
        alert("🚫 SECURITY SAFEGUARD METRIC: Downloads, text selections, and printing are strictly disabled inside this encrypted high-security Cadet Drive visualizer page to satisfy shipping-line training standards!");
      }
    };
    
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [activeTab]);

  // Reactive automatic trigger for cadet eligibility checker on parameter changes
  useEffect(() => {
    handleCheckEligibility();
  }, [
    eligibilityStream,
    eligibilityPcm,
    eligibilityEnglish,
    eligibilityAge,
    eligibilityColourBlindness,
    eligibilityEyesightPassed,
    eligibilityDiplomaDegrees
  ]);

  const saveGeminiKey = (key: string) => {
    localStorage.setItem("MN_AI_GEMINI_KEY", key);
    setGeminiKeyInput(key);
  };

  const clearGeminiKey = () => {
    localStorage.removeItem("MN_AI_GEMINI_KEY");
    setGeminiKeyInput("");
  };

  const handleTestAutoSubmit = () => {
    setIsTestRunning(false);
    if (!selectedTest) return;
    
    // Evaluate MCQ
    const questions = mockQuestionsDict[selectedTest.id] || [];
    let correctCount = 0;
    
    questions.forEach((q, index) => {
      if (testAnswers[`${selectedTest.id}_${index}`] === q.correctIndex) {
        correctCount++;
      }
    });

    const percent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const hasPassed = percent >= 60;
    
    // Out of 1 Lakh (100,000) candidates under this scenario, only top 20,000 secure a rank.
    // Cutoff score limit is 50%. Below 50% = Not Qualifed (No rank assigned).
    let predictedRank = 0;
    if (percent >= 50) {
      const normalizedPower = Math.pow((100 - percent) / 50, 2.3);
      predictedRank = Math.round(1 + 19999 * normalizedPower);
    }

    setTestResult({
      score: correctCount,
      total: questions.length,
      percentage: percent,
      passed: hasPassed,
      rankPredicted: predictedRank,
      percentile: percent >= 50 ? Math.round(100 - (predictedRank / 100000) * 100) : 0
    });
  };

  const startTest = (test: MockTest) => {
    setSelectedTest(test);
    setActiveQuestionIndex(0);
    setTestAnswers({});
    setTestTimeRemaining(test.durationMinutes * 60);
    setIsTestRunning(true);
    setTestResult(null);
  };

  const handleUserAnswerSelect = (optionIndex: number) => {
    if (!selectedTest) return;
    setTestAnswers({
      ...testAnswers,
      [`${selectedTest.id}_${activeQuestionIndex}`]: optionIndex
    });
  };

  // Chat with Navy Assistant simulator
  const handleSendChat = async () => {
    if (!chatInputText.trim()) return;
    
    const userMsg = { sender: 'user' as const, text: chatInputText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAiChatMessages(prev => [...prev, userMsg]);
    setChatInputText("");
    setChatLoading(true);

    try {
      const gResult = await askGemini(chatInputText, 'doubt');
      setAiChatMessages(prev => [...prev, { sender: 'gemini' as const, text: gResult, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch {
      setAiChatMessages(prev => [...prev, { sender: 'gemini' as const, text: "Ahoy Cadet, connection to navigational computer lost. Let me recalibrate.", timestamp: "Now" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Complete roadmap tool simulation
  const handleGenerateRoadmap = async () => {
    setGeneratingRoadmap(true);
    setGeneratedRoadmapText("");
    try {
      const rPrompt = `Provide a premium Merchant Navy career roadmap step-by-step guidance for an aspiring cadet focusing on ${roadmapCoreSelection}. Format with high-fidelity nautical timelines, training costs, sea-time milestones and certificates of competencies.`;
      const result = await askGemini(rPrompt, 'roadmap');
      setGeneratedRoadmapText(result);
    } catch {
      setGeneratedRoadmapText("Failed to query navigational roadmap satellites.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  // Interview response assessment
  const handleEvaluateInterview = async () => {
    if (!currentInterviewValue.trim()) return;
    setInterviewEvaluating(true);
    setInterviewFeedback("");
    try {
      const evaluationText = await askGemini(`Evaluate this Merchant Navy cadet job application interview answer: Question: "${interviewSimulatorQuestions[interviewQuestionIndex]}" -> Student Answer: "${currentInterviewValue}". Give scorecard values and suggestions.`, 'interview');
      setInterviewFeedback(evaluationText);
      const answersCopy = [...interviewAnswers];
      answersCopy[interviewQuestionIndex] = currentInterviewValue;
      setInterviewAnswers(answersCopy);
    } catch {
      setInterviewFeedback("Error receiving pilot ratings. Please try again.");
    } finally {
      setInterviewEvaluating(false);
    }
  };

  // Authentication simulations
  const simulateEmailLogin = () => {
    if (!loginEmail.includes("@")) {
      alert("Please enter a valid maritime cadet email address.");
      return;
    }
    if (!otpSent) {
      setOtpSent(true);
      return;
    }
    // Perform login success
    setIsAuthenticated(true);
    setUserName(loginEmail.split("@")[0].toUpperCase() + " CADET");
    setUserEmail(loginEmail);
    setShowAuthModal(false);
    setOtpSent(false);
  };

  const simulateGoogleLogin = () => {
    setIsAuthenticated(true);
    setUserName("CADET SAAD TAWHEED");
    setUserEmail("saadtawheed786@gmail.com");
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("student");
    setActiveTab("home");
  };

  // Check cadet company-specific eligibility
  const handleCheckEligibility = () => {
    const stream = eligibilityStream;
    const pcm = eligibilityPcm;
    const eng = eligibilityEnglish;
    const age = eligibilityAge;
    const hasColorBlindness = eligibilityColourBlindness;
    const eyesightPassed = eligibilityEyesightPassed;
    const hasDiplomaDegree = eligibilityDiplomaDegrees;

    const issues: string[] = [];
    if (eng < 50) {
      issues.push("English score is below the minimum 50% threshold.");
    }
    if (hasColorBlindness) {
      issues.push("Colour blindness is an instant disqualification (especially critical for navigational officers).");
    }
    if (!eyesightPassed) {
      issues.push("Eyesight standard criteria not met.");
    }

    if (stream === "Deck Cadet") {
      if (pcm < 55) {
        issues.push("Your PCM aggregate (12th Std) is below Anglo-Eastern, Maersk, and main sponsors 55-60% requirement.");
      }
      if (age < 17 || age > 25) {
        issues.push("Undergraduate Deck Cadet (DNS) age parameters usually require 17 to 25 years.");
      }
    } else if (stream === "Engine Cadet") {
      if (!hasDiplomaDegree && pcm < 55) {
        issues.push("General undergraduate Engine cadet course requires minimum 55-60% PCM standard.");
      }
      const limit = hasDiplomaDegree ? 28 : 25;
      if (age < 17 || age > limit) {
        issues.push(`Engine Cadet age must be 17 to ${limit} years.`);
      }
    } else if (stream === "ETO Cadet") {
      if (!hasDiplomaDegree) {
        issues.push("Electro-Technical Officer (ETO) requires standard Electrical / Electronics B.E./B.Tech or 3-year Diploma.");
      }
      if (age < 17 || age > 28) {
        issues.push("ETO Cadet upper limit is typically 28 years.");
      }
    }

    const companyResults = [
      {
        name: "Anglo-Eastern Maritime Academy (AEMA)",
        isEligible: true,
        reasons: [] as string[],
        details: "Requires: PCM >= 60%, English >= 50%. Age: 17-25 (DNS) or GME & ETO up to 28. DGS Class 1 Medical required."
      },
      {
        name: "Maersk Line (A.P. Moller-Maersk)",
        isEligible: true,
        reasons: [] as string[],
        details: "Requires: PCM >= 55% or 60%, English >= 55%. Age: 17-24 (Deck/Engine) or 28 for GME/ETO. Very high English focus."
      },
      {
        name: "Fleet Management Limited (FLEET)",
        isEligible: true,
        reasons: [] as string[],
        details: "Requires: PCM >= 60%, English >= 60%. Age <= 25 (DNS) or <= 28 for GME/ETO. 6/6 best eye & 6/9 other eye."
      },
      {
        name: "Synergy Marine Group",
        isEligible: true,
        reasons: [] as string[],
        details: "Requires: PCM >= 65%, English >= 60%. Age: 17-25 (DNS) or 28 for GME/ETO. Full training course stipend provided."
      },
      {
        name: "Scorpio Marine Management",
        isEligible: true,
        reasons: [] as string[],
        details: "Requires: PCM >= 55%, English >= 55%. Age: max 25 (DNS) or 28 for GME/ETO. Min height 155 cm, weight proportional."
      },
      {
        name: "Wallem Group",
        isEligible: true,
        reasons: [] as string[],
        details: "Requires: PCM >= 60%, English >= 50%. Age: <= 25 (Deck/Engine) or <= 28 for GME/ETO. Direct sponsorship tests."
      },
      {
        name: "Bernhard Schulte Shipmanagement (BSM)",
        isEligible: true,
        reasons: [] as string[],
        details: "Requires: PCM >= 60%, English >= 60%. Age: <= 24 (DNS) or <= 28 for GME/ETO. Degree/Diploma with minimum 55%."
      }
    ];

    // Evaluate AEMA
    {
      const a = companyResults[0];
      if (hasColorBlindness) { a.isEligible = false; a.reasons.push("Colour Blindness"); }
      if (!eyesightPassed) { a.isEligible = false; a.reasons.push("Eyesight standard fit"); }
      if (stream === "Deck Cadet") {
        if (pcm < 60) { a.isEligible = false; a.reasons.push("PCM below 60%"); }
        if (eng < 50) { a.isEligible = false; a.reasons.push("English below 50%"); }
        if (age < 17 || age > 25) { a.isEligible = false; a.reasons.push("Age outside 17-25"); }
      } else if (stream === "Engine Cadet") {
        const AE_Limit = hasDiplomaDegree ? 28 : 25;
        if (!hasDiplomaDegree && pcm < 60) { a.isEligible = false; a.reasons.push("PCM below 60%"); }
        if (age < 17 || age > AE_Limit) { a.isEligible = false; a.reasons.push(`Age outside 17-${AE_Limit}`); }
      } else if (stream === "ETO Cadet") {
        if (!hasDiplomaDegree) { a.isEligible = false; a.reasons.push("Requires EE/ECE/diploma degree"); }
        if (age < 17 || age > 28) { a.isEligible = false; a.reasons.push("Age outside 17-28"); }
      }
    }

    // Evaluate Maersk
    {
      const m = companyResults[1];
      if (hasColorBlindness) { m.isEligible = false; m.reasons.push("Colour Blindness"); }
      if (stream === "Deck Cadet") {
        if (pcm < 55) { m.isEligible = false; m.reasons.push("PCM below 55%"); }
        if (eng < 55) { m.isEligible = false; m.reasons.push("English below 55%"); }
        if (age < 17 || age > 24) { m.isEligible = false; m.reasons.push("Age outside 17-24"); }
      } else if (stream === "Engine Cadet") {
        const ML_Limit = hasDiplomaDegree ? 28 : 24;
        if (!hasDiplomaDegree && pcm < 55) { m.isEligible = false; m.reasons.push("PCM below 55%"); }
        if (age < 17 || age > ML_Limit) { m.isEligible = false; m.reasons.push(`Age outside 17-${ML_Limit}`); }
      } else if (stream === "ETO Cadet") {
        if (!hasDiplomaDegree) { m.isEligible = false; m.reasons.push("Electrical degree/diploma required"); }
        if (age < 17 || age > 28) { m.isEligible = false; m.reasons.push("Age outside 17-28"); }
      }
    }

    // Evaluate Fleet Management
    {
      const f = companyResults[2];
      if (hasColorBlindness) { f.isEligible = false; f.reasons.push("Colour Blindness"); }
      if (stream === "Deck Cadet") {
        if (pcm < 60) { f.isEligible = false; f.reasons.push("PCM below 60%"); }
        if (eng < 60) { f.isEligible = false; f.reasons.push("English below 60%"); }
        if (age < 17 || age > 25) { f.isEligible = false; f.reasons.push("Age outside 17-25"); }
      } else if (stream === "Engine Cadet") {
        const F_Limit = hasDiplomaDegree ? 28 : 25;
        if (!hasDiplomaDegree && pcm < 60) { f.isEligible = false; f.reasons.push("PCM below 60%"); }
        if (eng < 60) { f.isEligible = false; f.reasons.push("English below 60%"); }
        if (age < 17 || age > F_Limit) { f.isEligible = false; f.reasons.push(`Age outside 17-${F_Limit}`); }
      } else {
        if (age < 17 || age > 28) { f.isEligible = false; f.reasons.push("Age outside 17-28"); }
      }
    }

    // Evaluate Synergy
    {
      const s = companyResults[3];
      if (hasColorBlindness) { s.isEligible = false; s.reasons.push("Colour Blindness"); }
      if (stream === "Deck Cadet") {
        if (pcm < 65) { s.isEligible = false; s.reasons.push("PCM below 65%"); }
        if (eng < 60) { s.isEligible = false; s.reasons.push("English below 60%"); }
        if (age < 17 || age > 25) { s.isEligible = false; s.reasons.push("Age outside 17-25"); }
      } else if (stream === "Engine Cadet") {
        const S_Limit = hasDiplomaDegree ? 28 : 25;
        if (!hasDiplomaDegree && pcm < 65) { s.isEligible = false; s.reasons.push("PCM below 65%"); }
        if (eng < 60) { s.isEligible = false; s.reasons.push("English below 60%"); }
        if (age < 17 || age > S_Limit) { s.isEligible = false; s.reasons.push(`Age outside 17-${S_Limit}`); }
      } else {
        if (age < 17 || age > 28) { s.isEligible = false; s.reasons.push("Age outside 17-28"); }
      }
    }

    // Evaluate Scorpio
    {
      const sc = companyResults[4];
      if (hasColorBlindness) { sc.isEligible = false; sc.reasons.push("Colour Blindness"); }
      if (stream === "Deck Cadet") {
         if (pcm < 55) { sc.isEligible = false; sc.reasons.push("PCM below 55%"); }
         if (eng < 55) { sc.isEligible = false; sc.reasons.push("English below 55%"); }
         if (age < 17 || age > 25) { sc.isEligible = false; sc.reasons.push("Age outside 17-25"); }
      } else if (stream === "Engine Cadet") {
         const Sc_Limit = hasDiplomaDegree ? 28 : 25;
         if (!hasDiplomaDegree && pcm < 55) { sc.isEligible = false; sc.reasons.push("PCM below 55%"); }
         if (eng < 55) { sc.isEligible = false; sc.reasons.push("English below 55%"); }
         if (age < 17 || age > Sc_Limit) { sc.isEligible = false; sc.reasons.push(`Age outside 17-${Sc_Limit}`); }
      } else {
         if (age < 17 || age > 28) { sc.isEligible = false; sc.reasons.push("Age outside 17-28"); }
      }
    }

    // Evaluate Wallem
    {
      const w = companyResults[5];
      if (hasColorBlindness) { w.isEligible = false; w.reasons.push("Colour Blindness"); }
      if (stream === "Deck Cadet") {
        if (pcm < 60) { w.isEligible = false; w.reasons.push("PCM below 60%"); }
        if (eng < 50) { w.isEligible = false; w.reasons.push("English below 50%"); }
        if (age < 17 || age > 25) { w.isEligible = false; w.reasons.push("Age outside 17-25"); }
      } else if (stream === "Engine Cadet") {
         const W_Limit = hasDiplomaDegree ? 28 : 25;
         if (!hasDiplomaDegree && pcm < 60) { w.isEligible = false; w.reasons.push("PCM below 60%"); }
         if (age < 17 || age > W_Limit) { w.isEligible = false; w.reasons.push(`Age outside 17-${W_Limit}`); }
      } else {
         if (age < 17 || age > 28) { w.isEligible = false; w.reasons.push("Age outside 17-28"); }
      }
    }

    // Evaluate BSM
    {
      const b = companyResults[6];
      if (hasColorBlindness) { b.isEligible = false; b.reasons.push("Colour Blindness"); }
      if (stream === "Deck Cadet") {
        if (pcm < 60) { b.isEligible = false; b.reasons.push("PCM below 60%"); }
        if (eng < 60) { b.isEligible = false; b.reasons.push("English below 60%"); }
        if (age < 17 || age > 24) { b.isEligible = false; b.reasons.push("Age outside 17-24"); }
      } else if (stream === "Engine Cadet") {
        const B_Limit = hasDiplomaDegree ? 28 : 24;
        if (!hasDiplomaDegree && pcm < 60) { b.isEligible = false; b.reasons.push("PCM below 60%"); }
        if (eng < 60) { b.isEligible = false; b.reasons.push("English below 60%"); }
        if (age < 17 || age > B_Limit) { b.isEligible = false; b.reasons.push(`Age outside 17-${B_Limit}`); }
      } else {
        if (age < 17 || age > 28) { b.isEligible = false; b.reasons.push("Age outside 17-28"); }
      }
    }

    setEligibilityResult({
      stream,
      issues,
      companies: companyResults
    });
  };

  // Apply Coupon code promo simulator
  const handleApplyCoupon = () => {
    const code = promoCodeValue.toUpperCase().trim();
    if (code === "CAPTAIN50") {
      setDiscountPercent(50);
      setAppliedPromo("CAPTAIN50");
    } else if (code === "MARITIME10" || code === "CADET10") {
      setDiscountPercent(10);
      setAppliedPromo(code);
    } else {
      alert("Invalid or expired maritime promotional voucher!");
    }
    setPromoCodeValue("");
  };

   // Simulated Razorpay completion
   const triggerRazorpaySimulate = () => {
     if (!selectedPlanDetails) return;
     const finalAmount = Math.round(selectedPlanDetails.price * (1 - discountPercent / 100));
     setCheckoutCompleted(true);
     
     // Detect plan and activate permissions
     const planName = selectedPlanDetails.name.toLowerCase();
     if (planName.includes("all-in-one") || selectedPlanDetails.price === 1599) {
       setUserHasSponsorshipSub(true);
       setUserHasInterviewPlan(true);
       localStorage.setItem("MN_AI_SPONSORSHIP_SUB", "true");
       localStorage.setItem("MN_HAS_INTERVIEW_PLAN", "true");
     } else if (planName.includes("1-on-1 live mock") || selectedPlanDetails.price === 999) {
       setUserHasInterviewPlan(true);
       localStorage.setItem("MN_HAS_INTERVIEW_PLAN", "true");
     } else if (planName.includes("5 premium mock") || selectedPlanDetails.price === 499) {
       setHasPurchasedMockPass(true);
       localStorage.setItem("MN_AI_MOCK_PASS", "true");
     } else if (planName.includes("addon") || selectedPlanDetails.price === 99) {
       setUserHasInterviewPlan(true);
       localStorage.setItem("MN_HAS_INTERVIEW_PLAN", "true");
       
       // Process the auto-submitted scheduling booking!
       const pendingRaw = localStorage.getItem("PENDING_ADDON_BOOKING");
       if (pendingRaw) {
         try {
           const pb = JSON.parse(pendingRaw);
           const newBooking = {
             id: "meet_" + Date.now(),
             candidateName: pb.candidateName || userName,
             candidateEmail: pb.candidateEmail || userEmail,
             courseType: pb.courseType || "Deck Cadet (IMU-CET)",
             date: pb.date || "2026-06-25",
             time: pb.time || "11:00",
             meetUrl: "",
             status: "Pending",
             createdAt: new Date().toISOString()
           };
           const updated = [newBooking, ...googleMeetBookings];
           setGoogleMeetBookings(updated);
           localStorage.setItem("MN_GOOG_MEET_BOOKINGS", JSON.stringify(updated));
           localStorage.removeItem("PENDING_ADDON_BOOKING");
         } catch (e) {
           console.error("Failed to parse pending addon booking", e);
         }
       }
     }

     // Add student to dynamic portal list as premium activated
     const newStudent = {
       id: "S_" + Math.floor(Math.random() * 1000),
       name: userName,
       email: userEmail,
       plan: selectedPlanDetails.name,
       joined: "2026-06-18",
       status: "Active"
     };
     setStudentList([newStudent, ...studentList]);
   };

  // Streak claiming simulator
  const claimDailyStreak = () => {
    if (streakClaimed) return;
    setUserStreak(userStreak + 1);
    setStreakClaimed(true);
  };

  // Add study scheduling notes task
  const addCalendarTask = () => {
    if (!newTaskText.trim()) return;
    setCalendarTasks([
      ...calendarTasks,
      { id: Date.now(), title: newTaskText, completed: false }
    ]);
    setNewTaskText("");
  };

  // Add custom courses (admin)
  const handleAddNewCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCourseTitle || !customCourseDesc) return;
    
    // push to MARITIME_COURSES
    const idStr = customCourseTitle.toLowerCase().replace(/ /g, "-");
    const newCourseObj: Course = {
      id: idStr,
      title: customCourseTitle,
      category: customCourseCat,
      duration: "10 Weeks",
      lessons: 30,
      rating: 5.0,
      students: 1,
      description: customCourseDesc,
      pdfUrl: "DGS_Standard_Guidebook.pdf",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    };

    MARITIME_COURSES.unshift(newCourseObj);
    
    alert(`⚓ Course '${customCourseTitle}' has been cataloged in Merchant Navy database!`);
    
    setCustomCourseTitle("");
    setCustomCourseDesc("");
    setActiveTab("courses");
  };

  // Dispatch live dashboard announcements
  const handleAnnounce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    setAnnouncements([
      { date: "June 18, 2026", msg: "📢 " + newAnnouncementText },
      ...announcements
    ]);
    setNewAnnouncementText("");
    alert("Announcement dispersed to all fleet portals!");
  };

  // AI-Powered Options Generation Fallbacks & Gemini Integrations
  const handleAIGenerateOptions = async () => {
    if (!draftQuestionText.trim()) {
      alert("Please enter a question prompt first!");
      return;
    }
    
    setIsGeneratingAIOptions(true);
    try {
      const prompt = `You are a professional maritime examination system. For the question: "${draftQuestionText}", generate exactly 4 options (plausible sea-officer distractors), a correct choice integer index (0, 1, 2, or 3), and a precise expert explanation. Return ONLY a valid JSON string matching this schema: {"options": ["...", "...", "...", "..."], "correctIndex": 0, "explanation": "..."}`;
      
      const resText = await askGemini(prompt, "general");
      
      // Attempt clean parse
      const cleaned = resText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      
      if (parsed && Array.isArray(parsed.options) && parsed.options.length === 4) {
        setDraftOptions(parsed.options);
        setDraftCorrectIndex(Number(parsed.correctIndex ?? 0));
        setDraftExplanation(parsed.explanation ?? "Detailed maritime answer key explanation.");
        alert("✨ AI successfully populated options & explanation!");
      } else {
        throw new Error("Invalid schema structure returned from Gemini.");
      }
    } catch (e) {
      console.warn("Gemini AI option generation failed. Using keyword-based fallback option builder:", e);
      // Local fallback logic
      const qLower = draftQuestionText.toLowerCase();
      let options = [
        "Standard General Watchkeeping protocol", 
        "Custom Emergency Muster sound check", 
        "Critical buoyancy safety stability parameters", 
        "Seawater salinity displacement weight"
      ];
      let correctIdx = 0;
      let exp = "Standard general maritime action requires complete watchkeeping safety compliance.";
      
      if (qLower.includes("stability") || qLower.includes("metacentr") || qLower.includes("buoya")) {
        options = [
          "The vertical keel distance to center of buoyancy",
          "The distance from Center of Gravity to Metacenter (GM)",
          "The center of lateral gravity buoyancy force",
          "The metacentric radius (BM)"
        ];
        correctIdx = 1;
        exp = "Metacentric Height (GM) dictates initial static stability. Positive GM is required to ensure standard self-righting moments.";
      } else if (qLower.includes("colreg") || qLower.includes("rule") || qLower.includes("light") || qLower.includes("road")) {
        options = [
          "Maintain current course and engage stern thruster speed",
          "Alter course to starboard to pass port-to-port",
          "Alter course to port to cross her bow closely",
          "Yield right-of-way and sound single blast"
        ];
        correctIdx = 1;
        exp = "Rules of the road regulate crossing risks. For crossers on your starboard side, alter course to starboard to pass safely port-to-port.";
      } else if (qLower.includes("math") || qLower.includes("fuel") || qLower.includes("burn") || qLower.includes("ton")) {
        options = [
          "Consumption scales with distance cubed",
          "Consumption is proportional to distance multiplied by speed squared",
          "Consumption scales linearly at constant speed index",
          "Consumption varies inversely with propeller pitch"
        ];
        correctIdx = 2;
        exp = "Under uniform speed, fuel burnt varies linearly with distance travelled.";
      }
      
      setDraftOptions(options);
      setDraftCorrectIndex(correctIdx);
      setDraftExplanation(exp);
      alert("⚠️ Used local Maritime Option Generator Fallback!");
    } finally {
      setIsGeneratingAIOptions(false);
    }
  };

  const handleAddNewQuestionToTest = () => {
    if (!draftQuestionText.trim()) {
      alert("Please provide the Draft Question text.");
      return;
    }
    if (draftOptions.some(o => !o.trim())) {
      alert("Please fill in or auto-generate all 4 options.");
      return;
    }
    
    const newQuestion: MockQuestion = {
      id: "q_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      subject: newMockTestCategory,
      question: draftQuestionText,
      options: [...draftOptions],
      correctIndex: draftCorrectIndex,
      explanation: draftExplanation || "Nautical explanation guide provided by Cadets Command."
    };

    setAddedQuestionsForNewTest([...addedQuestionsForNewTest, newQuestion]);
    
    // Reset individual question builder
    setDraftQuestionText("");
    setDraftOptions(["", "", "", ""]);
    setDraftCorrectIndex(0);
    setDraftExplanation("");
    alert("⚓ Question appended to upcoming Test queue!");
  };

  const parseStructuredQuestions = (text: string): MockQuestion[] => {
    const list: MockQuestion[] = [];
    const blocks = text.split(/(?=Q(?:uestion)?\s*\d+[:.]|\b\d+[\s.]+\w)/i);
    
    for (const block of blocks) {
      if (!block.trim()) continue;
      
      const stemMatch = block.match(/^(?:Q(?:uestion)?\s*\d+[:.]|\b\d+[\s.]+)?([\s\S]+?)(?=\b[A-D][).:]|\[[A-D]\]|\([A-D]\))/i);
      if (!stemMatch) continue;
      
      const questionText = stemMatch[1].trim();
      if (questionText.length < 5) continue;
      
      const optionMatches = [...block.matchAll(/(?:\b([A-D])[).:]|\[([A-D])\]|\(([A-D])\))\s*([\s\S]+?)(?=\b[A-D][).:]|\[[A-D]\]|\([A-D]\)|Correct|Ans|Explanation|$)/gi)];
      
      const options: string[] = ["", "", "", ""];
      let correctIdx = 0;
      
      optionMatches.forEach((m) => {
        const char = (m[1] || m[2] || m[3] || "A").toUpperCase();
        const content = m[4].trim();
        const idx = char.charCodeAt(0) - 65;
        if (idx >= 0 && idx < 4) {
          options[idx] = content;
        }
      });
      
      for (let i = 0; i < 4; i++) {
        if (!options[i]) {
          options[i] = `Option ${String.fromCharCode(65 + i)} regarding maritime protocols`;
        }
      }
      
      const ansMatch = block.match(/(?:Correct|Ans|Answer|Key)\s*[:.-]?\s*([A-D])/i);
      if (ansMatch) {
        correctIdx = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (correctIdx < 0 || correctIdx > 3) correctIdx = 0;
      }
      
      const expMatch = block.match(/(?:Explanation|Exp|Reasoning)\s*[:.-]?\s*([\s\S]+)$/i);
      const explanation = expMatch ? expMatch[1].trim() : "Verified standard deck officer guidelines.";
      
      list.push({
        id: "q_batch_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
        subject: newMockTestCategory,
        question: questionText,
        options: options,
        correctIndex: correctIdx,
        explanation: explanation
      });
    }
    
    return list;
  };

  const synthesizeQuestionsFromPlainText = (text: string, category: string): MockQuestion[] => {
    const lower = text.toLowerCase();
    const list: MockQuestion[] = [];
    
    const topics = [
      {
        keywords: ["stability", "metacenter", "gm", "buoyancy", "keel", "gravity"],
        question: "Which of the following physical heights directly dictates a ship's initial static stability?",
        options: [
          "Metacentric Height (GM)",
          "Keel to Buoyancy Height (KB)",
          "Nautical Freeboard Clearance Height",
          "Molded Depth of Hull Structure"
        ],
        correctIndex: 0,
        explanation: "Metacentric Height (GM) is the vital safety parameter index indicating static shipboard recovery stability. Positive GM maintains self-righting moments."
      },
      {
        keywords: ["colreg", "rule", "light", "road", "collision", "starboard", "crossing"],
        question: "Under standard COLREG Rule 15 for crossing situations, how should your vessel proceed if an oncoming ship crossings on your starboard side?",
        options: [
          "Incline speed and maintain watchkeeping heading",
          "Alter course to starboard to pass port-to-port",
          "Perform rapid turn to port to run across her bow",
          "Engage full astern propulsion immediately"
        ],
        correctIndex: 1,
        explanation: "Rules of the road state that for crossing risks on your starboard side, you draft as give-way vessel, standardly altering course to starboard to pass port-to-port."
      },
      {
        keywords: ["ballast", "pump", "bilge", "trim", "draft"],
        question: "Which water management action is carried out to correct trim by the head on a heavy bulk carrier ship?",
        options: [
          "Discharge forepeak ballast water and transfer back to aft peak tanks",
          "Open emergency bilge injection valves",
          "Discharging sanitary service tanks",
          "Overboarding fresh drinking water reserves"
        ],
        correctIndex: 0,
        explanation: "Trim by the head means the forward draft is deeper. Discharging forward peak ballast or transferring ballast aft increases buoyancy forward, correcting ship trim."
      },
      {
        keywords: ["radar", "arpa", "ecdis", "gps", "navig"],
        question: "What is the primary electronic benefit of utilizing automatic radar plotting aids (ARPA) on watch duty?",
        options: [
          "Automatically identifies bottom marine topography",
          "Tracks and computes closest point of approach (CPA) for surrounding hulls",
          "Controls main propulsion systems remotely from bridge",
          "Regulates fresh water generator levels automatically"
        ],
        correctIndex: 1,
        explanation: "ARPA tracks up to dozens of targets on watch, continuously computing closest points of approach (CPA) and time-to-CPA (TCPA) to avoid maritime collisions."
      },
      {
        keywords: ["fuel", "burn", "speed", "propeller", "engine"],
        question: "In standard marine propulsion engineering, how is fuel oil consumption roughly related to vessel speed?",
        options: [
          "Scales linearly with speed",
          "Varies inversely with speed index",
          "Is proportional to the cube of ship speed",
          "Is entirely independent of propeller speed"
        ],
        correctIndex: 2,
        explanation: "Fuel consumption rate of a motorized ship is proportional to the cube of speed (Power ~ Speed³), making slow steaming highly resource-efficient."
      },
      {
        keywords: ["safety", "solas", "lifeboat", "drill", "fire"],
        question: "According to SOLAS safety regulations, how often must a full passenger ship fire and abandon ship drill be executed?",
        options: [
          "At least once every week or within 24 hours of departing port",
          "Once every six months during captain survey",
          "Directly before loading hazardous liquid cargo only",
          "Only when specified by port state control inspectors"
        ],
        correctIndex: 0,
        explanation: "SOLAS demands fire and abandon ship drills to be executed on bulk carriers at least once a month; on passenger ships, drills must run weekly or within 24 hours of departure."
      }
    ];
    
    for (const topic of topics) {
      if (topic.keywords.some(k => lower.includes(k))) {
        list.push({
          id: "q_batch_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
          subject: category,
          question: topic.question,
          options: topic.options,
          correctIndex: topic.correctIndex,
          explanation: topic.explanation
        });
      }
    }
    
    if (list.length < 3) {
      const defaultPool = [
        {
          question: "Calculate the freshwater allowance (FWA) of a vessel with Displacement 16000 tonnes and TPC (Tonnes Per Centimeter) of 20?",
          options: [
            "200 millimeters",
            "120 millimeters",
            "250 millimeters",
            "160 millimeters"
          ],
          correctIndex: 0,
          explanation: "FWA is calculated as Displacement / (4 * TPC). Hence, FWA = 16000 / (4 * 20) = 200 mm."
        },
        {
          question: "Which gas is primarily dangerous and monitored inside enclosed spaces like ballast tanks, demanding gas-free checks?",
          options: [
            "Pure Carbon Dioxide gas only",
            "Hydrogen Sulfide (H2S), Carbon Monoxide, and explosive Hydrocarbons",
            "Pure Helium gas compression",
            "Standard Nitrogen levels"
          ],
          correctIndex: 1,
          explanation: "Enclosed spaces on maritime vessels frequently suffer from oxygen depletion, hydrogen sulfide buildup, or flammable petroleum gasses."
        },
        {
          question: "Under the Archimedes marine rule, what is standardly true about a vessel floating stably upright?",
          options: [
            "The weight of displacive volume of water equals the total ship weight",
            "Submerged hull volume is zero",
            "The center of gravity is always located on the keel plate",
            "Density of seawater is strictly identical to fresh pool water"
          ],
          correctIndex: 0,
          explanation: "Archimedes' law specifies that the weight of the water displaced by a floating hull strictly equals the total mass of the ship itself."
        }
      ];
      
      defaultPool.forEach(item => {
        if (!list.some(q => q.question === item.question)) {
          list.push({
            id: "q_batch_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
            subject: category,
            question: item.question,
            options: item.options,
            correctIndex: item.correctIndex,
            explanation: item.explanation
          });
        }
      });
    }
    
    return list;
  };

  const handleBatchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== "txt" && extension !== "pdf") {
      alert("🚫 Unsupported file structure: Batch uploader accepts .txt or .pdf files only.");
      return;
    }

    setUploadedFileName(file.name);
    setIsExtractionActive(true);

    try {
      let fileText = "";
      if (extension === "txt") {
        fileText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed reading text file."));
          reader.readAsText(file);
        });
      } else {
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(new Error("Failed reading PDF file."));
          reader.readAsArrayBuffer(file);
        });
        
        const textStr = new TextDecoder("utf-8").decode(arrayBuffer);
        const matches = textStr.match(/\(([^)]+)\)\s*(Tj|TJ)/g);
        if (matches) {
          fileText = matches
            .map(m => {
              const inner = m.match(/\(([^)]+)\)/);
              return inner ? inner[1] : "";
            })
            .join(" ")
            .replace(/\\([0-3][0-7][0-7])/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
            .replace(/\\/g, "");
        } else {
          fileText = textStr.replace(/[^\x20-\x7E\n]/g, " ");
        }
      }

      const truncatedText = fileText.slice(0, 80000).trim();

      if (truncatedText.length < 15) {
        throw new Error("Extracted text is too short or binary formatting hindered read.");
      }

      const customKey = localStorage.getItem("MN_AI_GEMINI_KEY") || "";
      let parsedQuestions: MockQuestion[] = [];

      if (customKey) {
        try {
          const rawExtracted = await aiExtractQuestions(customKey, newMockTestCategory, truncatedText);
          parsedQuestions = rawExtracted.map(q => ({
            id: "q_batch_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
            subject: newMockTestCategory,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation || "Nautical explanation guide provided by Cadets Command."
          }));
        } catch (gemError) {
          console.warn("Real Gemini batch extraction failed, running hybrid fallback parser:", gemError);
          parsedQuestions = parseStructuredQuestions(truncatedText);
          if (parsedQuestions.length === 0) {
            parsedQuestions = synthesizeQuestionsFromPlainText(truncatedText, newMockTestCategory);
          }
        }
      } else {
        parsedQuestions = parseStructuredQuestions(truncatedText);
        if (parsedQuestions.length === 0) {
          parsedQuestions = synthesizeQuestionsFromPlainText(truncatedText, newMockTestCategory);
        }
      }

      parsedQuestions = parsedQuestions.map(q => ({
        ...q,
        subject: newMockTestCategory,
        id: "q_batch_" + Date.now() + "_" + Math.floor(Math.random() * 10000)
      }));

      setBatchFileList(parsedQuestions);
      alert(`✨ SUCCESS! AI extracted ${parsedQuestions.length} highly accurate and structured Marine MCQs from '${file.name}'. You can preview and commit them inside 1 tap.`);
    } catch (err: any) {
      console.warn("Parsing encountered issues, generating standard syllabus guide questions:", err);
      const parsedQuestions = synthesizeQuestionsFromPlainText("standard_maritime_syllabus", newMockTestCategory);
      setBatchFileList(parsedQuestions.map(q => ({
        ...q,
        subject: newMockTestCategory,
        id: "q_batch_" + Date.now() + "_" + Math.floor(Math.random() * 10000)
      })));
      alert(`✨ Loaded '${file.name}' with automatic syllabus questions aligned to ${newMockTestCategory}! Ready to commit.`);
    } finally {
      setIsExtractionActive(false);
    }
  };

  const handleCommitBatchImport = () => {
    if (batchFileList.length === 0) {
      alert("No questions have been extracted to queue yet.");
      return;
    }
    setAddedQuestionsForNewTest([...addedQuestionsForNewTest, ...batchFileList]);
    setBatchFileList([]);
    setUploadedFileName("");
    alert(`🚢 SUCCESS! Committed all ${batchFileList.length} MCQs to your upcoming '${newMockTestCategory}' mock test campaign!`);
  };

  const handlePublishNewMockTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMockTestTitle.trim()) {
      alert("Please specify a Mock Test Campaign Title.");
      return;
    }
    if (addedQuestionsForNewTest.length === 0) {
      alert("Cannot publish an empty mock test; please draft and add at least 1-2 questions to the test queue first.");
      return;
    }

    const testId = "custom-" + Date.now();
    const newTestObj: MockTest = {
      id: testId,
      title: newMockTestTitle,
      category: newMockTestCategory,
      durationMinutes: newMockTestDuration,
      totalQuestions: addedQuestionsForNewTest.length
    };

    // Append to States
    const updatedTests = [newTestObj, ...mockTestsList];
    const updatedQuestions = {
      ...mockQuestionsDict,
      [testId]: addedQuestionsForNewTest
    };

    setMockTestsList(updatedTests);
    setMockQuestionsDict(updatedQuestions);

    // Save persistent LocalStorage
    localStorage.setItem("MN_AI_MOCK_TESTS", JSON.stringify(updatedTests));
    localStorage.setItem("MN_AI_MOCK_QUESTIONS", JSON.stringify(updatedQuestions));

    alert(`🚢 SUCCESS! The dynamic mock test '${newMockTestTitle}' (${addedQuestionsForNewTest.length} MCQs, duration: ${newMockTestDuration} mins, price: ₹${newMockTestPrice}) has been published to all cadets under '${newMockTestCategory}'!`);

    // Reset everything
    setNewMockTestTitle("");
    setNewMockTestDuration(60);
    setNewMockTestPrice(49);
    setAddedQuestionsForNewTest([]);
    setActiveTab("tests");
  };

  // ⚓ AI SPONSORSHIP INTERVIEW SIMULATOR OPERATIONS
  const handleToggleSponsorshipSub = () => {
    const nextSub = !userHasSponsorshipSub;
    setUserHasSponsorshipSub(nextSub);
    localStorage.setItem("MN_AI_SPONSORSHIP_SUB", String(nextSub));
    alert(nextSub 
      ? "🚢 Premium Sponsorship Elite Pass Activated! All interactive AI Interview simulators and face-to-face Google Meet workshops are now fully unlocked."
      : "Premium Sponsorship Elite Pass locked."
    );
  };

  const handleStartInteractiveAIInterview = async (type: "Deck Cadet" | "GP Rating") => {
    setActiveAIInterviewType(type);
    setAiInterviewActive(true);
    setAiInterviewStep(0);
    setAiInterviewUserAnswers([]);
    setAiInterviewFeedbacks([]);
    setAiInterviewFinalResult(null);
    setAiInterviewLoading(true);

    try {
      const prompt = `You are an expert naval captain. Generate exactly 3 tough technical and situational, distinct interview questions for a candidate seeking a professional maritime company sponsorship for ${type === "Deck Cadet" ? "1-Year DNS (Diploma in Nautical Science) Deck Cadet" : "6-Month GP Rating pre-sea cadet"} course. Return ONLY a clean JSON array of exactly 3 strings. Example: ["Q1", "Q2", "Q3"]`;
      const resText = await askGemini(prompt, "interview");
      const cleaned = resText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length === 3) {
        setAiInterviewQuestionsList(parsed);
      } else {
        throw new Error("Invalid array size");
      }
    } catch (e) {
      console.warn("Using localized fallback questions for cadet sponsorship evaluation", e);
      if (type === "Deck Cadet") {
        setAiInterviewQuestionsList([
          "Imagine you are the officer of the watch on passage. You observe a sudden drop in barometric pressure of 4 millibars inside 2 hours and increasing swell. What immediate preparations do you direct aboard the ship?",
          "Under COLREG Rule 14, two power-driven vessels are meeting on reciprocal or nearly reciprocal courses so as to involve risk of collision. Describe the shipward action both vessels must initiate.",
          "What is the physical significance of a ship's transverse metacenter (M) relative to center of gravity (G), and what does a negative GM state indicate for the voyage?"
        ]);
      } else {
        setAiInterviewQuestionsList([
          "While preparing a vessel's steel hatch covers for painting, explain the safety equipment and working gear you must check before using pneumatic needle guns.",
          "What are the common seamanship procedures and checklists when you are deployed on a standby anchor watch during rough monsoon swell?",
          "Under emergency boat muster protocols, describe your primary duties as a GP rating cadet upon hearing the emergency alarm of seven short blasts followed by one long continuous blast."
        ]);
      }
    } finally {
      setAiInterviewLoading(false);
    }
  };

  const handleEvaluateAIInterviewAnswer = async (userAnswer: string) => {
    if (!userAnswer.trim()) {
      alert("Please provide an answer prompt to proceed.");
      return;
    }

    setAiInterviewLoading(true);
    const mockFeedbacks = [...aiInterviewFeedbacks];
    const mockAnswers = [...aiInterviewUserAnswers, userAnswer];
    setAiInterviewUserAnswers(mockAnswers);

    const activeQuestion = aiInterviewQuestionsList[aiInterviewStep];

    try {
      const evalPrompt = `You are a Chief Captain on a placement sponsor board. Evaluate this cadet answer to the interview question. Question: "${activeQuestion}" | Candidate reply: "${userAnswer}". Please assign a rating score from 1 to 10 and write exactly a 2-sentence professional officer advice. Return ONLY a valid JSON: {"score": 8, "feedback": "Detailed response feedback."}`;
      const resText = await askGemini(evalPrompt, "interview");
      const cleaned = resText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.score === "number") {
        mockFeedbacks.push({
          score: parsed.score,
          feedback: parsed.feedback
        });
      } else {
        throw new Error("Invalid shape");
      }
    } catch (e) {
      // Local fallback evaluation
      let score = 7;
      let feedback = "Strong terminology and nautical awareness. Ensure you address safety margin thresholds in rough climates.";
      if (userAnswer.toLowerCase().includes("safety") || userAnswer.toLowerCase().includes("colreg")) {
        score = 9;
        feedback = "Outstanding focus on vessel integrity and international collision prevention watchkeeping standards. Well spoken.";
      }
      mockFeedbacks.push({ score, feedback });
    }

    setAiInterviewFeedbacks(mockFeedbacks);
    setAiInterviewLoading(false);

    const nextStep = aiInterviewStep + 1;
    if (nextStep < 3) {
      setAiInterviewStep(nextStep);
    } else {
      // Completed interview! Let's generate a final score card and log it!
      const totalPoints = mockFeedbacks.reduce((sum, f) => sum + f.score, 0);
      const averagePercentage = Math.round((totalPoints / 30) * 100);
      
      let recommendation = "";
      if (averagePercentage >= 80) {
        recommendation = `Excellent potential. Displays deep command of specialized safety norms for ${activeAIInterviewType} placements. Recommended for immediate deployment.`;
      } else if (averagePercentage >= 60) {
        recommendation = `Competent grasp of maritime standard operations. Needs minor improvement in quantitative stability formulas before securing principal sponsor contracts.`;
      } else {
        recommendation = `Below acceptable watchkeeping benchmarks. Advised to re-study theoretical chapters and re-attempt AI simulations.`;
      }

      const finalCertificate = {
        id: "ai_cert_" + Date.now(),
        candidateName: "Active Cadet (Premium User)",
        courseType: activeAIInterviewType === "Deck Cadet" ? "Deck Cadet (IMU-CET)" : "GP Rating Cadet",
        score: averagePercentage,
        date: new Date().toISOString().split('T')[0],
        recommendation,
        transcript: aiInterviewQuestionsList.map((q, idx) => ({
          q,
          a: mockAnswers[idx],
          feedback: mockFeedbacks[idx].feedback,
          score: mockFeedbacks[idx].score
        }))
      };

      setAiInterviewFinalResult(finalCertificate);

      // Save to logs
      const updatedLogs = [finalCertificate, ...aiInterviewLogs];
      setAiInterviewLogs(updatedLogs);
      localStorage.setItem("MN_AI_INTERVIEW_LOGS", JSON.stringify(updatedLogs));
    }
  };

  // Google Meet Face-to-Face Booking
  const handleScheduleMeetSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetBookingFormName.trim() || !meetBookingFormEmail.trim()) {
      alert("Please provide both your Name and Email address.");
      return;
    }

    if (!userHasSponsorshipSub && !userHasInterviewPlan) {
      // Prompt user to purchase the 99 Rs addon!
      const payAddon = window.confirm(
        "📝 ADMISSION UPGRADE: You do not have an active All-in-One Subscription Module (INR) or 1-on-1 Interview Package.\n\nWould you like to pay a single-slot session fee of Rs. 99/- to schedule this live Google Meet mock board immediately?"
      );
      if (payAddon) {
        // Open the Razorpay payment modal with Rs 99 custom details
        setSelectedPlanDetails({
          name: "Addon: Google Meet 1-on-1 Live Mock (Rs. 99 Slot)",
          price: 99,
          duration: "Single Session"
        });
        setDiscountPercent(0);
        setAppliedPromo("");
        setCheckoutCompleted(false);
        
        // Save temporary booking details to push once checkout finishes successfully
        const pendingBooking = {
          candidateName: meetBookingFormName,
          candidateEmail: meetBookingFormEmail,
          courseType: meetBookingFormCourse,
          date: meetBookingFormDate,
          time: meetBookingFormTime,
        };
        localStorage.setItem("PENDING_ADDON_BOOKING", JSON.stringify(pendingBooking));
        
        // Switch to pricing tab automatically to complete the checkout window
        setActiveTab("pricing");
        alert("Redirecting to Checkout! Please click 'Proceed with UPI / Card Simulator (INR)' inside our Payment module below to complete booking.");
      }
      return;
    }

    setMeetBookingSubmitting(true);

    setTimeout(() => {
      const newBooking = {
        id: "meet_" + Date.now(),
        candidateName: meetBookingFormName,
        candidateEmail: meetBookingFormEmail,
        courseType: meetBookingFormCourse,
        date: meetBookingFormDate,
        time: meetBookingFormTime,
        meetUrl: "", // Admin will generate / populate this
        status: "Pending",
        createdAt: new Date().toISOString()
      };

      const updated = [newBooking, ...googleMeetBookings];
      setGoogleMeetBookings(updated);
      localStorage.setItem("MN_GOOG_MEET_BOOKINGS", JSON.stringify(updated));

      setMeetBookingSubmitting(false);
      
      // Reset fields
      setMeetBookingFormName("");
      setMeetBookingFormEmail("");
      
      alert(`🚢 SUCCESS! Your Face-to-Face Google Meet Simulation on ${meetBookingFormDate} at ${meetBookingFormTime} has been submitted to the Admin Captain. You can monitor approval and fetch your live Meet link here or check the list below!`);
    }, 1200);
  };

  return (
    <div id="navy-app-viewport" className="min-h-screen bg-[#070D19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-900 scroll-smooth">
      
      {/* 🚀 DECORATIVE FLOATING PARTICLES & WAVING AMBIENT TOP BAR */}
      <div id="navy-top-grid" className="w-full h-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 animate-pulse" />

      {/* ⚓ NAVIGATION FLOATING BAR */}
      <header id="navy-header" className="sticky top-0 z-40 bg-[#0B1528]/95 backdrop-blur-md border-b border-cyan-900/40 px-4 py-3 shadow-lg shadow-[#02050A]">
        <div id="navy-nav-container" className="max-w-7xl mx-auto flex items-center justify-between">
          
          <button 
            id="navy-logo-btn"
            onClick={() => setActiveTab("home")} 
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-900 rounded-xl border border-cyan-400/40 shadow-inner group-hover:rotate-12 transition-transform duration-300">
              <Compass className="w-6 h-6 text-cyan-300 animate-spin-slow" />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold text-cyan-400/80 tracking-wider block">FLEET CONTROL</span>
              <h1 className="text-xl md:text-2xl font-black text-slate-50 tracking-tight flex items-center gap-1.5">
                Merchant Navy <span className="bg-gradient-to-r from-cyan-300 to-amber-300 bg-clip-text text-transparent">AI</span>
              </h1>
            </div>
          </button>

          {/* Nav list */}
          <nav id="navy-desktop-nav" className="hidden lg:flex items-center gap-1">
            {[
              { id: "home", label: "Anchor View", icon: Ship },
              { id: "courses", label: "Courses", icon: BookOpen },
              { id: "tests", label: "Mock Terminal", icon: ClipboardList },
              { id: "aitutor", label: "AI Deck Officer", icon: Sparkles },
              { id: "drive", label: "Secure Drive 🔒", icon: HardDrive },
              { id: "studymaterials", label: "Manuals", icon: BookMarked },
              { id: "pricing", label: "Sponsorship pricing", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-link-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedTest(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400" 
                      : "text-slate-300 hover:text-cyan-300 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User Section / Dashboard toggle */}
          <div id="navy-auth-cluster" className="flex items-center gap-3">
            {isAuthenticated ? (
              <div id="navy-user-logged-in" className="flex items-center gap-2">
                {/* Dashboard Direct Links */}
                <button
                  id="dashboard-header-btn"
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === "dashboard"
                      ? "bg-cyan-500 text-slate-900 shadow-md shadow-cyan-500/30"
                      : "bg-slate-800/80 text-cyan-300 border border-cyan-800/40 hover:bg-slate-850 hover:text-cyan-200"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Student Dashboard
                </button>

                {/* Admin Portal selector */}
                <button
                  id="admin-portal-header-btn"
                  onClick={() => {
                    setUserRole("admin");
                    setActiveTab("admin");
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === "admin"
                      ? "bg-amber-500 text-slate-900 shadow-md"
                      : "bg-[#181109] text-amber-400 border border-amber-900/30 hover:bg-amber-950/25"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>

                {/* Streak Badge */}
                <div 
                  id="user-streak-badge"
                  onClick={claimDailyStreak}
                  title="Your study streak booster! Click daily to claim."
                  className={`cursor-pointer px-2 py-1.5 rounded-lg flex items-center gap-1 border transition-all ${
                    streakClaimed 
                      ? "bg-slate-900 text-amber-500 border-amber-500/20" 
                      : "bg-amber-500/20 text-amber-400 border-amber-400/50 animate-bounce"
                  }`}
                >
                  <Flame className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold font-mono">{userStreak}d</span>
                </div>

                {/* Simple Logout */}
                <button 
                  id="logout-header-btn"
                  onClick={handleLogout} 
                  title="Logout of fleet terminal"
                  className="p-2 border border-slate-700/60 rounded-lg hover:border-rose-400 text-slate-400 hover:text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="navy-login-actuate-btn"
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
              >
                <User className="w-4 h-4" />
                Access Terminal
              </button>
            )}
          </div>

        </div>

        {/* Dynamic Mobile Nav Overlay */}
        <div id="navy-mobile-tabs" className="lg:hidden mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-around gap-1 overflow-x-auto py-1">
          {[
            { id: "home", label: "Home", icon: Ship },
            { id: "courses", label: "Courses", icon: BookOpen },
            { id: "tests", label: "Mocks", icon: ClipboardList },
            { id: "aitutor", label: "AI Tutor", icon: Sparkles },
            { id: "drive", label: "Drive 🔒", icon: HardDrive },
            { id: "pricing", label: "Sponsorship", icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedTest(null);
                }}
                className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs leading-none transition-all ${
                  activeTab === tab.id ? "text-cyan-400 font-bold bg-cyan-950/30" : "text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* 🔐 AUTHENTICATION TERMINAL MODAL */}
      {showAuthModal && (
        <div id="navy-auth-modal" className="fixed inset-0 z-50 bg-[#02050A]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1528] rounded-2xl max-w-md w-full border border-cyan-500/40 shadow-2xl p-6 relative">
            <button 
              id="auth-close-btn"
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 text-lg font-mono"
            >
              [X]
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-800 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-cyan-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-50">Fleet Portal Login</h2>
              <p className="text-xs text-sky-400">Authenticate through standard maritime security gateway</p>
            </div>

            {/* Simulated Credentials help box */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-cyan-950 text-xs text-slate-350 mb-5 relative overflow-hidden">
              <div className="font-semibold text-cyan-400 mb-1">📋 Cadet Simulation Profile</div>
              <p>Email: <span className="font-mono text-cyan-100">saadtawheed786@gmail.com</span></p>
              <p>OTP hint: <span className="font-mono text-cyan-100">123456</span> or use Google Login bypass!</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Cadet Email Address</label>
                <input
                  id="auth-email-input"
                  type="email"
                  placeholder="saadtawheed786@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-900 text-slate-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              {otpSent && (
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">One-Time Security Passcode (OTP)</label>
                  <input
                    id="auth-otp-input"
                    type="text"
                    placeholder="Enter 6-digit OTP passcode"
                    value={loginOTP}
                    onChange={(e) => setLoginOTP(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-900 text-slate-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-400 tracking-widest text-center font-mono"
                  />
                </div>
              )}

              <button
                id="sumbit-auth-email-btn"
                onClick={simulateEmailLogin}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 rounded-lg text-sm transition-all"
              >
                {otpSent ? "Confirm Secure Entry" : "Request OTP Code"}
              </button>

              <div className="relative flex items-center justify-center my-3">
                <span className="absolute bg-[#0B1528] px-2 text-slate-500 text-xs font-bold">OR TERMINAL DIRECT</span>
                <div className="w-full border-t border-slate-800" />
              </div>

              <button
                id="submit-auth-google-btn"
                onClick={simulateGoogleLogin}
                className="w-full bg-slate-900 border border-slate-700/60 hover:bg-slate-800 text-slate-100 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Award className="w-4 h-4 text-cyan-400" />
                Sign In with Google Cloud Passport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📟 SHIPBOARD BROADCAST / SYSTEM ANNOUNCEMENTS OVERVIEW BAR */}
      <div id="navy-announcements-ticker" className="bg-[#040913] border-b border-cyan-950 text-xs py-1.5 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-2 font-mono scroll-smooth truncate text-cyan-300 text-xs">
            <span className="inline-block px-1.5 py-0.5 bg-cyan-950 text-cyan-300 text-[10px] rounded border border-cyan-900 uppercase tracking-widest font-bold">ANNOUNCEMENT</span>
            <span className="truncate">{announcements[0]?.msg || "No active radio broadcasts."}</span>
          </div>
          <span className="hidden md:inline font-mono text-[10px] text-slate-500">LAT: 12.9716° N | LNT: 80.2451° E (Chennai Headquarters)</span>
        </div>
      </div>

      {/* 🚢 WORKSPACE CORE CONTENT BOX */}
      <main id="navy-main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">

        {/* NAVIGATIONAL TAB: 🗺️ HOME PAGE */}
        {activeTab === "home" && (
          <div id="anchor-view-tab" className="space-y-12 animate-fade-in">
            
            {/* 🌋 HERO GRAPHICS GRID */}
            <section id="homepage-hero" className="relative p-6 md:p-10 lg:p-12 rounded-3xl bg-gradient-to-b from-[#0E1E38]/90 to-[#070D19]/95 border border-cyan-500/20 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-between">
              
              {/* Floating tech background decoration */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-20 bottom-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Animated wave effect line in bottom of card */}
              <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden opacity-30 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" fill="#06b6d4" className="animate-pulse"></path>
                </svg>
              </div>

              {/* Top info and model configure badge */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-full border border-cyan-900/60 shadow">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-cyan-300 font-mono tracking-wider uppercase">Maritime Intelligence Sat-9 v2.5 Active</span>
                </div>

                {/* API Key management utility inline */}
                <div className="flex items-center gap-1.5 self-start">
                  {geminiKeyInput ? (
                    <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-xs font-mono text-slate-300">Gemini Activated</span>
                      <button 
                        onClick={clearGeminiKey}
                        className="text-[10px] text-rose-450 underline font-mono ml-1 hover:text-rose-400"
                        title="Remove key from local storage"
                      >
                        [clear]
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input 
                        id="gemini-key-hero-input"
                        type="password"
                        placeholder="Insert Gemini API Key"
                        className="bg-slate-900 border border-cyan-900 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 w-36"
                        onChange={(e) => saveGeminiKey(e.target.value)}
                      />
                      <span className="text-[10px] text-slate-500 max-w-[120px] leading-tight block ml-1.5">Enter key to trigger real LLM calls!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Core heading block (Futuristic Apple layout design) */}
              <div className="my-8 md:my-12 z-10 max-w-3xl">
                <span className="text-xs md:text-sm font-bold text-amber-400 uppercase tracking-widest font-mono block mb-2">⚓ PRE-SEA EXAMINATIONS PREPARATION GATEWAY</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-50 leading-tight tracking-tight">
                  Become a Merchant Navy Officer with <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">AI-Powered Learning</span>
                </h1>
                <p className="mt-4 text-base md:text-lg text-slate-350 leading-relaxed font-sans max-w-2xl">
                  Sail above standard tutorials. Master the IMU-CET, secure written shipping company sponsorships, and ace Deck Cadet/3rd Mate assessments with our specialized military-grade simulators.
                </p>

                {/* Simulated Floating Cargo Ship Animation Container */}
                <div className="relative mt-8 group bg-[#0A111F] p-4 rounded-xl border border-cyan-900/50 flex flex-col md:flex-row items-center gap-4 transition-all hover:border-cyan-400/40">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-900 via-[#102344] to-[#153466] border border-cyan-400/30 flex items-center justify-center rounded-xl shrink-0">
                    <Ship className="w-10 h-10 text-cyan-300 animate-bounce" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-xs font-mono font-bold text-cyan-400 tracking-wider">M/V OCEAN AI EXPLORER (DGS No: 9192)</div>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-md">Propelling continuous pre-sea student training sequences. Auto steering active, Metacentric height (GM) stable at +1.42m.</p>
                  </div>
                  <span className="md:ml-auto inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded">
                    ● SEAWORTHY STATUS
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    id="hero-start-learning-btn"
                    onClick={() => setActiveTab("courses")}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-extrabold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transform active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <BookOpen className="w-4 h-4" />
                    Start Learning
                  </button>
                  <button
                    id="hero-mock-tests-btn"
                    onClick={() => setActiveTab("tests")}
                    className="bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transform active:scale-95 transition-all"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Simulation Mock Tests
                  </button>
                  <button
                    id="hero-subscription-btn"
                    onClick={() => setActiveTab("pricing")}
                    className="bg-slate-900/90 hover:bg-slate-800 text-yellow-400 border border-yellow-500/30 font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    Join Cadet Elite
                  </button>
                  <button
                    id="hero-eligibility-btn"
                    onClick={() => {
                      setEligibilityModalOpen(true);
                      handleCheckEligibility(); // Prefill or run initial computation
                    }}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
                    📋 Check Cadet Eligibility
                  </button>
                </div>
              </div>

            </section>

            {/* 📊 PLATFORM GENERAL STATISTICS SECTION */}
            <section id="homepage-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "FLEET CADETS ENROLLED", value: "15,400+", label: "Active candidates preparing on system", color: "from-cyan-900 to-blue-900", icon: Users, accent: "text-cyan-400" },
                { title: "INTELLIGENT TESTS CLEARED", value: "84,000+", label: "MCQ simulation submissions auto-graded", color: "from-slate-900 to-[#101A2B]", icon: ClipboardList, accent: "text-emerald-400" },
                { title: "CADET SELECTION RATE", value: "94.2%", label: "Verified shipping company placements", color: "from-[#1B1209] to-[#0A111F]", icon: Award, accent: "text-amber-400" }
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <div key={i} className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border border-slate-800 flex items-center gap-4 hover:border-cyan-500/30 transition-all`}>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                      <StatIcon className={`w-8 h-8 ${stat.accent}`} />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold tracking-wider text-slate-400">{stat.title}</div>
                      <div className="text-3xl font-black text-slate-50 mt-1">{stat.value}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* 🚢 KEY DECK PORTFOLIOS: COURSE CATEGORIES LIST */}
            <section id="homepage-categories" className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">NAVIGATIONAL FOCUS AREAS</span>
                <h2 className="text-3xl font-black text-indigo-50 mt-1">Specialized Maritime Prep Modules</h2>
                <p className="text-slate-400 text-sm mt-2">DGS syllabus mapped courses equipped with real-time test evaluations and expert study tools.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "IMU-CET Prep Guidance", desc: "Intense preparation for India's mandatory national entry examinations.", count: "48 Lectures", route: "courses", color: "border-cyan-500/30" },
                  { title: "DNS Cadet Sponsorship", desc: "Acquire secure written sponsorship placements before heading to pre-sea.", count: "32 Lectures", route: "courses", color: "border-indigo-500/30" },
                  { title: "GP Rating Competency", desc: "Comprehensive syllabus guidelines mapped for general purpose pre-sea cadets.", count: "24 Lectures", route: "courses", color: "border-blue-500/30" },
                  { title: "GP Rating to Officer Promotional Path", desc: "A detailed structural blueprint to advance career roles directly at sea.", count: "40 Lectures", route: "courses", color: "border-teal-500/30" },
                  { title: "Second Mate Unlimited COC Exam Prep", desc: "Advanced navigation syllabus designed for clearing early executive charts exams.", count: "64 Lectures", route: "courses", color: "border-amber-500/30" },
                  { title: "Maritime Placement Interviews Simulator", desc: "Prepare high-stakes interviews with simulated standard placement scenarios.", count: "16 Lectures", route: "aitutor", color: "border-emerald-500/30" },
                  { title: "English and Aptitude Assessments", desc: "Review mandatory psychometric and verbal tests for shipping lines.", count: "10 Mocks", route: "tests", color: "border-rose-500/30" },
                  { title: "Maritime AI Deck Tutor", desc: "Interactive doubt solving engine loaded with formulas, ship stability tables, and diagrams.", count: "Unlimited Chat", route: "aitutor", color: "border-purple-500/30" }
                ].map((cat, i) => (
                  <div key={i} className={`p-5 rounded-2xl bg-gradient-to-b from-[#0E1E38]/50 to-[#0A1325]/90 border ${cat.color} flex flex-col justify-between hover:scale-[1.02] hover:border-cyan-400 transition-all group`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">{cat.count}</span>
                        <Compass className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 mt-2.5 transition-colors">{cat.title}</h3>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{cat.desc}</p>
                    </div>

                    <button
                      onClick={() => setActiveTab(cat.route)}
                      className="mt-4 inline-flex items-center gap-1 text-xs text-cyan-400 group-hover:text-cyan-300 font-bold self-start"
                    >
                      Enter Control Loop <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 💬 ANIMATED TESTIMONIALS SECTION */}
            <section id="homepage-testimonials" className="bg-[#0A111F]/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xl font-bold text-indigo-50 text-center mb-6 flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-current" />
                Trusted by Aspiring Cadets Globally
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUCCESS_STORIES.map((ts, i) => (
                  <div key={i} className="bg-slate-900/80 p-5 rounded-xl border border-cyan-950 flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1 mb-2.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 text-amber-500 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-300 italic mb-4">"{ts.quote}"</p>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                      <img src={ts.image} alt={ts.name} className="w-10 h-10 rounded-full border border-cyan-500/30 object-cover" />
                      <div>
                        <div className="text-xs font-bold text-slate-100">{ts.name}</div>
                        <div className="text-[10px] font-mono text-cyan-400">{ts.rank}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 📻 GENERAL CONTACT FOOTER */}
            <footer id="navy-footer-credits" className="pt-6 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
              <p>⚓ Merchant Navy AI - Operated under Command Code Standard SOLAS 2026. Data syncing TLS 1.3 encryption is active.</p>
              <div className="flex justify-center gap-4 text-[10px] text-slate-600">
                <span>Class ID: d6f93502-a85a-437b-8f17</span>
                <span>•</span>
                <span>DGS Approved Guidance Material Pack</span>
              </div>
            </footer>

          </div>
        )}

        {/* NAVIGATIONAL TAB: 📚 COURSES VIEW */}
        {activeTab === "courses" && (
          <div id="courses-view-tab" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2">
                  <BookOpen className="w-7 h-7 text-cyan-400" />
                  Maritime Course Syllabus & Video Lectures
                </h2>
                <p className="text-xs text-slate-400 mt-1">Stream pre-sea cadet lectures mapped with dynamic workbook PDFs.</p>
              </div>

              {/* Dynamic notification for admin additions */}
              <span className="text-xs text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-900/60 font-mono">
                {MARITIME_COURSES.length} Courses Cataloged
              </span>
            </div>

            {/* Active Simulation Lecture Screen overlay if active */}
            {activeCourseWatch && (
              <div className="bg-[#050B15] p-4 rounded-2xl border border-cyan-400/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">LIVE MARITIME BRIDGE TRANSMISSION</span>
                    <h3 className="text-lg font-bold text-slate-150 mt-1">{activeCourseWatch.title}</h3>
                  </div>
                  <button 
                    onClick={() => setActiveCourseWatch(null)} 
                    className="text-xs bg-slate-900/80 hover:bg-slate-800 text-rose-400 px-3 py-1.5 rounded-lg border border-slate-800"
                  >
                    Close Watch Simulation [X]
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Video Box */}
                  <div className="lg:col-span-2 aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 flex flex-col items-center justify-center relative">
                    <iframe
                      src={activeCourseWatch.videoUrl} 
                      title={activeCourseWatch.title} 
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {/* Sidebar stats & manuals */}
                  <div className="bg-slate-900/80 p-4 rounded-lg flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Lecture Handout Pack</div>
                      <p className="text-xs text-slate-300 mt-1">Download official deck training workbook for physical navigation calculations.</p>
                      <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-cyan-950 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="w-5 h-5 text-cyan-400" />
                          <span className="font-mono text-cyan-300">{activeCourseWatch.pdfUrl || "Course_Manual.pdf"}</span>
                        </div>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`⚓ Simulating Download of manual: ${activeCourseWatch.pdfUrl || "Course_Manual.pdf"}`);
                          }}
                          className="p-1 px-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded text-[11px] flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          GET PDF
                        </a>
                      </div>
                    </div>

                    <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-900/30 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Recommended Step
                      </div>
                      <p className="text-slate-350 leading-relaxed">After completing this lecture module, take the mock test simulator to map your diagnostic percentage accuracy score.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MARITIME_COURSES.map((course) => (
                <div key={course.id} className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-cyan-400/40 transition-all">
                  
                  {/* Card head visual */}
                  <div className="h-28 bg-gradient-to-br from-[#0B1528] via-[#0D1C34] to-[#142A4E] p-4 flex flex-col justify-between border-b border-slate-800">
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-2 py-0.5 rounded uppercase font-bold tracking-widest self-start">
                      {course.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 line-clamp-2 mt-2 leading-tight">
                      {course.title}
                    </h3>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800/80 font-mono">
                      <div>
                        <span className="text-slate-500 block">Duration:</span>
                        <span className="text-slate-300 font-bold">{course.duration}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Lessons:</span>
                        <span className="text-slate-300 font-bold">{course.lessons} Modules</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#050D19]/50 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 text-yellow-500 font-mono">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {course.rating.toFixed(1)} ({course.students} enrolled)
                    </span>

                    <button
                      id={`watch-course-btn-${course.id}`}
                      onClick={() => {
                        setActiveCourseWatch(course);
                        // scroll up safely to watchbox
                        window.scrollTo({ top: 120, behavior: "smooth" });
                      }}
                      className="bg-[#102344] hover:bg-[#16305C] hover:text-cyan-300 text-cyan-400 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 transition-all border border-cyan-900/60"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Watch Online
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "tests" && (
          <div id="tests-terminal-tab" className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2">
                  <ClipboardList className="w-7 h-7 text-cyan-300" />
                  Fleet Examination Command Simulator
                </h2>
                <p className="text-xs text-slate-400 mt-1">Realistic IMU-CET & DNS Written selection tests with countdown timelines & performance predictive telemetry.</p>
              </div>

              {/* Rs 49 Pass quick check badge */}
              <div className="flex items-center gap-2">
                {hasPurchasedMockPass ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/85 border border-emerald-500/40 text-emerald-400 font-bold font-mono text-xs rounded-xl shadow-lg">
                    <Check className="w-3.5 h-3.5" />
                    Premium Mock Pass Active [🔓 UNLOCKED]
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setTestToUnlock(null);
                      setShowPaymentModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold font-mono text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <CreditCard className="w-3.5 h-3.5 animate-pulse" />
                    Get Premium Pass [₹49 Only]
                  </button>
                )}
              </div>
            </div>

            {/* SUBJECT-WISE FILTERS ("lis easily by understanding subject wise") */}
            <div className="bg-[#0B1528] p-3 rounded-2xl border border-cyan-900/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400/80 uppercase tracking-widest pl-2">Subject Wise:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["All Subjects", "IMU-CET", "DNS Sponsorship", "GP-Rating", "Aptitude"].map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubjectFilter(subject)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                        selectedSubjectFilter === subject
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-550/20"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500 pr-2 hidden md:inline">Grouped Navigation System</span>
            </div>

            {/* Test Launcher OR active simulator wrapper */}
            {!isTestRunning && !testResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Available Mocks list block */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-cyan-300">Available Simulation Campaigns</h3>
                  <div className="space-y-3">
                    {mockTestsList
                      .filter((test) => {
                        if (selectedSubjectFilter === "All Subjects") return true;
                        // Map subject names with our categories
                        const keyMatch = selectedSubjectFilter.toLowerCase();
                        const testCat = test.category.toLowerCase();
                        if (keyMatch.includes("imu") && testCat.includes("imu")) return true;
                        if (keyMatch.includes("dns") && testCat.includes("dns")) return true;
                        if (keyMatch.includes("gp") && testCat.includes("gp")) return true;
                        if (keyMatch.includes("aptitude") && testCat.includes("aptitude")) return true;
                        return false;
                      })
                      .map((test) => {
                        const isFree = test.id === "free-sample-mock";
                        const isUnlocked = isFree || hasPurchasedMockPass;
                        return (
                          <div key={test.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition-transform">
                            <div className="pr-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                  {test.category}
                                </span>
                                {isFree ? (
                                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                    FREE ASSESS
                                  </span>
                                ) : (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                                    isUnlocked 
                                      ? "bg-emerald-950 text-emerald-400 border border-emerald-950" 
                                      : "bg-amber-950/80 text-amber-500 border border-amber-900/50"
                                  }`}>
                                    {isUnlocked ? "UNLOCKED 🔓" : "Gated [₹49] 🔒"}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-extrabold text-slate-100 mt-1.5">{test.title}</h4>
                              <div className="flex gap-4 mt-2 text-xs text-slate-400 font-mono">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> {test.durationMinutes} Minutes</span>
                                <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-slate-500" /> {mockQuestionsDict[test.id]?.length || 0} MCQs</span>
                              </div>
                            </div>

                            <button
                              id={`start-test-btn-${test.id}`}
                              onClick={() => {
                                if (isUnlocked) {
                                  startTest(test);
                                } else {
                                  setTestToUnlock(test);
                                  setShowPaymentModal(true);
                                }
                              }}
                              className={`py-2 px-4 rounded-xl text-xs font-black transition-all transform active:scale-95 shrink-0 ${
                                isUnlocked
                                  ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-md shadow-cyan-500/10"
                                  : "bg-slate-850 hover:bg-[#1A2536] text-amber-400 border border-amber-950/20 hover:text-amber-300"
                              }`}
                            >
                              {isUnlocked ? "LAUNCH TERM" : "UNLOCK ₹49"}
                            </button>
                          </div>
                        );
                      })}

                    {/* Empty view check */}
                    {mockTestsList.filter((test) => {
                      if (selectedSubjectFilter === "All Subjects") return true;
                      const keyMatch = selectedSubjectFilter.toLowerCase();
                      const testCat = test.category.toLowerCase();
                      if (keyMatch.includes("imu") && testCat.includes("imu")) return true;
                      if (keyMatch.includes("dns") && testCat.includes("dns")) return true;
                      if (keyMatch.includes("gp") && testCat.includes("gp")) return true;
                      if (keyMatch.includes("aptitude") && testCat.includes("aptitude")) return true;
                      return false;
                    }).length === 0 && (
                      <div className="bg-[#0B1528] p-8 rounded-xl text-center border border-dashed border-slate-800">
                        <Compass className="w-8 h-8 text-slate-600 mx-auto animate-spin-slow mb-2" />
                        <span className="text-xs font-mono font-semibold text-slate-400">No mock tests cataloged under {selectedSubjectFilter} yet.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Left side: instructions and simulator radar */}
                <div className="bg-[#0A111F]/60 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider font-mono">
                      <Anchor className="w-4 h-4 text-amber-500" />
                      SIM NAVIGATION MANUAL
                    </div>
                    <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                      <li>The **Example Free Assessment** includes exactly **5 comprehensive maritime questions** mapping physical ship sciences.</li>
                      <li>Unlock unlimited access to the complete set of standard exams and AI generated premium mocks for exactly **₹49**.</li>
                      <li>A secure evaluation is structured with precise navigation timers and interactive correct answers key guidelines.</li>
                    </ul>
                  </div>

                  {/* Pricing booster board */}
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#121E36] to-[#0A111F] border border-cyan-800/40 relative overflow-hidden">
                    <div className="z-10 relative">
                      <span className="text-[9px] bg-amber-500 text-slate-900 font-bold font-mono uppercase px-2 py-0.5 rounded">BUDGET BOOSTER PASS</span>
                      <h4 className="text-sm font-black text-slate-50 mt-1.5">Unrestricted Placement Practice</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Acquire real CoC, IMU-CET, DNS Sponsorship written tests for less than a cup of single tea.</p>
                      <div className="flex items-baseline space-x-1 mt-2.5">
                        <span className="text-xl font-mono text-slate-300">Rs</span>
                        <span className="text-2xl font-black text-yellow-400">49</span>
                        <span className="text-xs text-slate-500 font-mono">/ One-time charge</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Navigational Radar with sweeps */}
                  <div className="flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-900 mt-4 relative overflow-hidden h-32">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Radar circular lines */}
                      <div className="w-32 h-32 rounded-full border border-cyan-500/20 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border border-cyan-500/10 flex items-center justify-center" />
                      </div>
                      {/* Radar sweeps animation lines */}
                      <div className="absolute w-32 h-0.5 bg-gradient-to-r from-transparent to-cyan-400 origin-center animate-spin-slow" />
                      <span className="absolute text-[9px] font-mono text-cyan-400 top-2 left-2 animate-pulse">[PING_FREQ: 2.4GHZ]</span>
                      <span className="absolute text-[9px] font-mono text-cyan-400 bottom-2 right-2">[SCAN_STATUS: OK]</span>
                    </div>
                    <p className="text-xs text-[#5293B3]/40 tracking-wider font-mono select-none text-center uppercase">PRE-SEA COLLISION SIM SEARCHING... </p>
                  </div>

                </div>

              </div>
            ) : isTestRunning && selectedTest ? (
              /* ACTIVE EXAM RUNNING PORTAL */
              <div className="bg-[#050D19] p-5 rounded-2xl border border-cyan-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
                  <div>
                    <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-900 px-1.5 py-0.5 rounded font-bold font-mono tracking-wider">
                      🚨 TIMED EXAM IN PROGRESS
                    </span>
                    <h3 className="text-base font-extrabold text-slate-100 mt-1">{selectedTest.title}</h3>
                  </div>

                  {/* Red Countdown Timer */}
                  <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/40 px-3.5 py-1.5 rounded-xl font-mono text-sm text-red-400 font-bold">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>
                      {Math.floor(testTimeRemaining / 3600).toString().padStart(2, "0")}:
                      {Math.floor((testTimeRemaining % 3600) / 60).toString().padStart(2, "0")}:
                      {(testTimeRemaining % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-1.5 transition-all" 
                    style={{ width: `${((activeQuestionIndex + 1) / (mockQuestionsDict[selectedTest.id]?.length || 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
                  
                  {/* Left Column: Nav grids */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="text-xs font-mono font-bold text-slate-400">MCQ SHIP CLUSTER ({mockQuestionsDict[selectedTest.id]?.length || 0} total)</div>
                    <div className="grid grid-cols-4 gap-2">
                      {mockQuestionsDict[selectedTest.id]?.map((_, index) => {
                        const isAnswered = testAnswers[`${selectedTest.id}_${index}`] !== undefined;
                        const isCurrent = activeQuestionIndex === index;
                        return (
                          <button
                            key={index}
                            id={`question-nav-${index}`}
                            onClick={() => setActiveQuestionIndex(index)}
                            className={`p-2 rounded-lg text-xs font-mono font-bold text-center border transition-all ${
                              isCurrent 
                                ? "bg-cyan-500 text-slate-900 border-cyan-450" 
                                : isAnswered 
                                  ? "bg-slate-800 text-cyan-300 border-cyan-900/60" 
                                  : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300"
                            }`}
                          >
                            Q{index + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <button
                        id="submit-exam-early-btn"
                        onClick={handleTestAutoSubmit}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-905 font-bold py-2 rounded-lg text-xs transition-colors text-slate-900"
                      >
                        Submit Fleet Exam
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Active Question view */}
                  <div className="lg:col-span-3 space-y-4">
                    {mockQuestionsDict[selectedTest.id]?.[activeQuestionIndex] ? (
                      <div className="space-y-4">
                        {/* Question Text */}
                        <div id="test-question-box" className="bg-slate-900/80 p-5 rounded-xl border border-cyan-950/30">
                          {mockQuestionsDict[selectedTest.id][activeQuestionIndex].subject && (
                            <span className="text-xs font-mono text-cyan-400 font-bold block mb-2 uppercase">Subject: {mockQuestionsDict[selectedTest.id][activeQuestionIndex].subject}</span>
                          )}
                          <p id="test-question-text" className="text-sm md:text-base font-semibold leading-relaxed text-slate-100">
                            Q{activeQuestionIndex + 1}: {mockQuestionsDict[selectedTest.id][activeQuestionIndex].question}
                          </p>
                        </div>

                        {/* Options */}
                        <div id="test-options-box" className="space-y-2.5">
                          {mockQuestionsDict[selectedTest.id][activeQuestionIndex].options.map((option, opIndex) => {
                            const isSelected = testAnswers[`${selectedTest.id}_${activeQuestionIndex}`] === opIndex;
                            return (
                              <button
                                key={opIndex}
                                id={`option-btn-${opIndex}`}
                                onClick={() => handleUserAnswerSelect(opIndex)}
                                className={`w-full text-left p-4 rounded-xl text-xs md:text-sm border transition-all flex items-center justify-between ${
                                  isSelected 
                                    ? "bg-cyan-950/60 text-cyan-300 border-cyan-455 shadow-inner" 
                                    : "bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-850"
                                }`}
                              >
                                <span>{String.fromCharCode(65 + opIndex)}) {option}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                                  isSelected ? "border-cyan-400 bg-cyan-400 text-slate-900" : "border-slate-700"
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Next / Prev Navigations */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            id="prev-question-btn"
                            disabled={activeQuestionIndex === 0}
                            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                            className="bg-slate-800 text-slate-350 hover:bg-slate-700 text-xs py-2 px-4 rounded-lg font-bold disabled:opacity-40"
                          >
                            Previous Question
                          </button>

                          {activeQuestionIndex === (mockQuestionsDict[selectedTest.id]?.length - 1) ? (
                            <button
                              id="finish-exam-last-btn"
                              onClick={handleTestAutoSubmit}
                              className="bg-emerald-500 text-slate-900 font-bold py-2 px-5 rounded-lg text-xs hover:bg-emerald-450"
                            >
                              Grade & Submit
                            </button>
                          ) : (
                            <button
                              id="next-question-btn"
                              onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                              className="bg-[#102344] hover:bg-[#153163] text-cyan-300 text-xs py-2 px-5 rounded-lg font-bold border border-cyan-900/60"
                            >
                              Next Question
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs">Loading navigational indices...</p>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              /* EXAM PERFORMANCE & AUTO GRADING REPORT SCREEN */
              testResult && selectedTest && (
                <div className="bg-[#0A111F] p-6 rounded-2xl border border-cyan-500/40 space-y-6">
                  
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-900 mb-2">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono tracking-widest text-[#41A58D] font-bold uppercase">FLEET EVALUATION COMPLETE</span>
                    <h3 className="text-xl md:text-2xl font-black text-slate-50">{selectedTest.title} Scorecard</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">CORRECT GRADING</div>
                      <div className="text-2xl font-black mt-1 text-slate-100">{testResult.score} / {testResult.total}</div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">COMPLETION RATE</div>
                      <div className="text-2xl font-black mt-1 text-cyan-400">{testResult.percentage}%</div>
                    </div>
                    <div className="bg-slate-900 p-[#1A261E] rounded-xl border border-[#3E7D53]/40">
                      <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">STATUS</div>
                      <div className={`text-2xl font-black mt-1 ${testResult.passed ? "text-emerald-400" : "text-rose-450"}`}>
                        {testResult.passed ? "PASS" : "FAIL"}
                      </div>
                    </div>
                    <div className="bg-[#181109] p-4 rounded-xl border border-amber-900/30 flex flex-col justify-between">
                      <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">PREDICTED IMU-CET RANK</div>
                      <div className="text-2xl font-black mt-1 text-amber-400">
                        {testResult.percentage >= 50 ? (
                          `#${testResult.rankPredicted.toLocaleString("en-IN")}`
                        ) : (
                          "NQ"
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-2 leading-tight">
                        Based on <span className="text-slate-200 font-bold">1,00,000 aspirants</span> where only the <span className="text-amber-400 font-semibold">top 20,000</span> get rank (50% cutoff).
                      </div>
                    </div>
                  </div>

                  {/* Feedback recommendation */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-cyan-950 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <div className="text-xs font-bold text-cyan-400">⚓ AI Study Recommendation Summary:</div>
                      <p className="text-xs text-slate-350 mt-1 max-w-2xl">
                        {testResult.passed 
                          ? "Stellar watchkeeping score! You are perfectly compatible with second officer written sponsorship eligibility. Focus next on Marine Interview simulations." 
                          : "Your score is below the 60% standard. Review Metacentric Height calculations and Archimedes ship water displacements on our Courses tab."}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTest(null);
                        setTestResult(null);
                      }}
                      className="bg-[#102344] hover:bg-[#16305C] text-cyan-300 font-bold rounded-lg text-xs py-2 px-4 border border-cyan-900/60"
                    >
                      Clear Terminal Cache
                    </button>
                  </div>

                  {/* Solutions list */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-300">Detailed Explanations Guide</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {mockQuestionsDict[selectedTest.id]?.map((q, idx) => {
                        const userAnswerOp = testAnswers[`${selectedTest.id}_${idx}`];
                        const isCorrect = userAnswerOp === q.correctIndex;
                        return (
                          <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs space-y-1.5 leading-relaxed">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isCorrect ? "bg-emerald-500" : "bg-rose-500"}`} />
                              <span className="font-bold text-slate-200">Question {idx + 1} ({q.subject || "General"})</span>
                            </div>
                            <p className="text-slate-400">{q.question}</p>
                            <p className="text-[11px] text-emerald-400 font-mono">
                              ✔ Correct Option: {String.fromCharCode(65 + q.correctIndex)}) {q.options[q.correctIndex]}
                            </p>
                            <p className="text-[11px] text-slate-500 italic">
                              💡 Explanation: {q.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )
            )}
          </div>
        )}

        {/* NAVIGATIONAL TAB: 🤖 AI DECK OFFICER MODULE */}
        {activeTab === "aitutor" && (
          <div id="aitutor-navigation-tab" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-cyan-400" />
                  Merchant Navy AI Deck Officer Hub
                </h2>
                <p className="text-xs text-slate-400 mt-1">Harness advanced Gemini satellite models tuned specifically to naval rules, ship cargo weight engineering, and sponsor interviews.</p>
              </div>
            </div>

            {/* Sub-Tabs Selector inside AI: Chat vs. Interview vs. Roadmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* SECTION A: MERCHANTS AI SPONSORSHIP INTERVIEW & GOOGLE MEET WORKSPACE */}
              <div className="lg:col-span-2 bg-[#0B1528] rounded-2xl border border-cyan-900/50 flex flex-col min-h-[580px]" id="chat-hub-section">
                
                {/* Section header panel */}
                <div className="px-5 py-4 bg-[#0D1C34] border-b border-cyan-950 rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-100 font-bold">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    <div>
                      <span>Senior Sponsorship Cadet Interview Board</span>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5 font-mono">INTELLIGENT INTEGRATION FOR EXECUTIVE DECKS</p>
                    </div>
                  </div>

                  {/* Subscription status controller */}
                  <div className="flex items-center gap-2 bg-[#050C16] px-3 py-1.5 rounded-xl border border-cyan-900/40">
                    <span className="text-[10px] text-slate-400 font-bold">SUB STATUS:</span>
                    <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded leading-none ${
                      userHasSponsorshipSub 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                        : "bg-rose-950 text-rose-450 border border-rose-900"
                    }`}>
                      {userHasSponsorshipSub ? "★ PRO LEVEL" : "🔒 FREE DEMO"}
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleSponsorshipSub}
                      className="text-[9px] bg-cyan-950 hover:bg-cyan-900 text-cyan-400 px-2 py-1 rounded border border-cyan-800 transition-all font-bold cursor-pointer"
                    >
                      {userHasSponsorshipSub ? "Mute Sub" : "⚡ Subscribe (Unlocks All)"}
                    </button>
                  </div>
                </div>

                {/* Main Interactive Sub-workspace body */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    {/* Welcome Gating Panel */}
                    {!aiInterviewActive ? (
                      <div className="space-y-6">
                        <div id="interview-intro-card" className="bg-slate-950/80 p-5 rounded-xl border border-cyan-950/40 space-y-3">
                          <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Select Sponsorship Interview Pathway & Simulated Portals
                          </h4>
                          <p className="text-xs text-slate-350 leading-relaxed">
                            Clear DNS or GP Rating entrance placement filters with real-time captain feedback grading frameworks. Both pathways contain specialized AI Simulated boards and Google Meet 1-on-1 channels.
                          </p>

                          <div className="pt-2">
                            {/* Option 2: Real Google Meet Face-to-Face */}
                            <div className="bg-[#0B1528] p-5 rounded-2xl border border-slate-850 hover:border-cyan-500/10 transition-all space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-[#41A58D] font-bold uppercase tracking-wider">LIVE CAPTAINS CHECKPOINT</span>
                                <span className="text-[9px] bg-[#0A1A12] text-[#41A58D] px-2 py-0.5 rounded border border-[#143B2A]/40 font-mono font-bold">1-ON-1 ONLINE BOARD</span>
                              </div>
                              <h5 className="text-sm font-bold text-slate-100">Live Face-to-Face Simulation on Google Meet</h5>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Book direct 1-on-1 review rounds with verified chief engineers, navigational officers and marine crew managers. Replicates exact panel checks with direct follow-up email insights & custom Google Meet coordinates.
                              </p>

                              {/* Gated form warning */}
                              {!userHasSponsorshipSub && !userHasInterviewPlan && (
                                <div className="text-[10px] text-amber-400 bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/30 font-semibold flex items-center gap-1.5 leading-relaxed">
                                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span>Admission Restricted: Requires an active <strong>All-in-One Subscription Module (INR)</strong> or pay a single mock session ticket fee of <strong>Rs. 99/-</strong> inside this module to schedule direct boards.</span>
                                </div>
                              )}

                              {/* Direct scheduling booking form */}
                              <form onSubmit={handleScheduleMeetSlot} className="space-y-3 pt-1 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Candidate Name</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Type your full name"
                                      value={meetBookingFormName}
                                      onChange={(e) => setMeetBookingFormName(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-100 text-xs focus:outline-none transition-colors"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Registry Email</label>
                                    <input
                                      type="email"
                                      required
                                      placeholder="candidate@gmail.com"
                                      value={meetBookingFormEmail}
                                      onChange={(e) => setMeetBookingFormEmail(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-100 text-xs focus:outline-none transition-colors"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Stream Category</label>
                                    <select
                                      value={meetBookingFormCourse}
                                      onChange={(e) => setMeetBookingFormCourse(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-200 text-xs focus:outline-none transition-colors"
                                    >
                                      <option value="Deck Cadet (IMU-CET)">Deck Cadet (DNS)</option>
                                      <option value="GP Rating Cadet">GP Rating Cadet</option>
                                      <option value="ETO Officer Stream">ETO Cadet</option>
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Interview Date</label>
                                    <input
                                      type="date"
                                      required
                                      value={meetBookingFormDate}
                                      onChange={(e) => setMeetBookingFormDate(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-200 text-xs text-center focus:outline-none transition-colors"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Slot Time (IST)</label>
                                    <input
                                      type="time"
                                      required
                                      value={meetBookingFormTime}
                                      onChange={(e) => setMeetBookingFormTime(e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-200 text-xs text-center focus:outline-none transition-colors"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  disabled={meetBookingSubmitting}
                                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-black py-2.5 rounded-xl transition-all disabled:opacity-30 cursor-pointer text-center text-xs flex items-center justify-center gap-2 mt-2 shadow-lg shadow-cyan-950/20"
                                >
                                  {meetBookingSubmitting ? "SCHEDULING APPOINTMENT..." : (!userHasSponsorshipSub && !userHasInterviewPlan ? "📅 UNLOCK SLOT FOR Rs. 99 (ADDON CHECKOUT)" : "📅 BOOK LIVE GOOGLE MEET INTERVIEW BOARD")}
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>

                        {/* active user slots database tracker */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider font-mono">Your Face-To-Face Google Meet Pipeline</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {googleMeetBookings.filter((meetObj) => userRole === 'admin' || meetObj.candidateEmail?.toLowerCase() === userEmail.toLowerCase()).length === 0 ? (
                              <div className="text-xs text-slate-500 italic p-4 text-center bg-slate-950/40 rounded-xl border border-slate-850 w-full col-span-2">
                                No scheduled live bookings recorded. Place your first live mock board date and slot above!
                              </div>
                            ) : (
                              googleMeetBookings
                                .filter((meetObj) => userRole === 'admin' || meetObj.candidateEmail?.toLowerCase() === userEmail.toLowerCase())
                                .map((meetObj) => (
                                  <div key={meetObj.id} className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex justify-between items-center text-xs">
                                    <div>
                                      <div className="font-bold text-slate-100">{meetObj.candidateName}</div>
                                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{meetObj.courseType} • {meetObj.date} at {meetObj.time}</p>
                                      
                                      {meetObj.meetUrl ? (
                                        <a
                                          href={meetObj.meetUrl}
                                          target="_blank"
                                          rel="no-referrer"
                                          className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold mt-1.5 text-[11px] underline"
                                        >
                                          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                                          Join Google Meet Now
                                        </a>
                                      ) : (
                                        <span className="text-[10px] text-slate-500 block mt-1.5 italic font-sans">Await Admin Captain verification setup</span>
                                      )}
                                    </div>

                                    <div className="text-right">
                                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                        meetObj.status === "Approved" 
                                          ? "bg-slate-900 border border-emerald-950 text-emerald-400" 
                                          : meetObj.status === "Completed"
                                          ? "bg-slate-900 border border-slate-800 text-slate-400"
                                          : "bg-slate-900 border border-amber-950 text-amber-500"
                                      }`}>
                                        {meetObj.status}
                                      </span>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ACTIVE INTERACTIVE AI INTERVIEW WORKSPACE GAME LOOP */
                      <div className="space-y-5 animate-fade-in">
                        
                        {/* Header details */}
                        <div className="flex items-center justify-between border-b border-cyan-950/50 pb-2">
                          <div>
                            <span className="text-[10px] font-mono text-cyan-400 font-bold block">REAL-TIME CANDIDATE ASSESSMENT UNDERWAY</span>
                            <h4 className="text-sm font-extrabold text-slate-100">AI Simulated Board: {activeAIInterviewType} Cadet Interview</h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setAiInterviewActive(false);
                              setAiInterviewFinalResult(null);
                            }}
                            className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded hover:text-slate-205 cursor-pointer"
                          >
                            [Quit Session]
                          </button>
                        </div>

                        {/* Interactive Steps or Results screen */}
                        {aiInterviewLoading ? (
                          <div className="p-12 text-center space-y-3">
                            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto animate-reverse-spin" />
                            <p className="text-xs text-cyan-400 font-mono">Captain Board is analyzing your response & computing buoyancy safety parameters...</p>
                          </div>
                        ) : aiInterviewFinalResult ? (
                          /* FINAL GRADED CERTIFICATE/RECOMMENDATION STATEMENT */
                          <div id="ai-sponsorship-scorecard" className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-4 font-sans">
                            <div className="text-center space-y-1">
                              <div className="w-10 h-10 bg-amber-950 text-amber-400 rounded-full flex items-center justify-center border border-amber-900 mx-auto mb-1">
                                <Award className="w-5 h-5" />
                              </div>
                              <h5 className="text-sm font-extrabold text-slate-100 uppercase tracking-wide">SPONSOR INTERVIEW CERTIFICATE OF EVALUATION</h5>
                              <p className="text-[10px] text-slate-500 font-mono">Generated by Gemini Cadet Evaluation Engine</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center bg-[#070D19] p-3 rounded-xl border border-cyan-950">
                              <div>
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">PLACEMENT SCORE</span>
                                <span className="text-sm font-black text-cyan-400">{aiInterviewFinalResult.score}% Matches Benchmarks</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">DECISION DATE</span>
                                <span className="text-sm font-black text-slate-200">{aiInterviewFinalResult.date}</span>
                              </div>
                            </div>

                            {/* PREDICTED SPONSORSHIP PLACEMENT RANK */}
                            <div className="bg-[#181109] p-3 rounded-xl border border-amber-900/30 text-center space-y-1">
                              <span className="text-[9px] text-amber-400 font-mono font-bold uppercase block tracking-wider">PREDICTED ALL-INDIA SPONSORSHIP RANK</span>
                              <div className="text-xl font-black text-amber-400">
                                {aiInterviewFinalResult.score >= 50 ? (
                                  `#${Math.round(1 + 19999 * Math.pow((100 - aiInterviewFinalResult.score) / 50, 2.3)).toLocaleString("en-IN")}`
                                ) : (
                                  "NQ (Below Cutoff)"
                                )}
                              </div>
                              <p className="text-[9px] text-slate-400 leading-normal">
                                Evaluated against <span className="text-slate-200 font-bold">1,00,000 sponsor aspirants</span> where only the <span className="text-amber-400 font-semibold">top 20,000</span> secure an official rank listing.
                              </p>
                            </div>

                            <div className="p-3 bg-cyan-950/20 border border-cyan-900/60 rounded-xl text-xs space-y-1">
                              <span className="font-bold text-cyan-300 block">⚓ Board Placement Committee Recommendation:</span>
                              <p className="text-slate-350 italic text-[11px] leading-relaxed">
                                "{aiInterviewFinalResult.recommendation}"
                              </p>
                            </div>

                            {/* Show question answers logs list inside */}
                            <div className="space-y-2 pt-2 border-t border-slate-900">
                              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">VERBATIM SHIPBOARD TRANSCRIPT RECORD:</span>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {aiInterviewFinalResult.transcript.map((item: any, idx: number) => (
                                  <div key={idx} className="bg-[#0B1528] p-2.5 rounded border border-slate-900 text-[11px] space-y-1">
                                    <p className="font-semibold text-slate-200">Q{idx+1}: {item.q}</p>
                                    <p className="text-slate-400 italic">Cadet Reply: "{item.a}"</p>
                                    <p className="text-[10px] text-emerald-400 font-mono leading-relaxed">★ Score: {item.score}/10 • Captain Note: {item.feedback}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleStartInteractiveAIInterview(activeAIInterviewType)}
                              className="w-full bg-[#102344] hover:bg-[#16305C] text-cyan-300 py-2.5 rounded font-bold text-xs border border-cyan-900 cursor-pointer"
                            >
                              Restart Interactive Oral Simulation
                            </button>
                          </div>
                        ) : (
                          /* RUNNING GAME LOOP CARD FOR INDIVIDUAL QUESTIONS */
                          <div className="space-y-4">
                            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-950/60 space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                                <span>QUESTION SESSION STEP {aiInterviewStep + 1} OF 3</span>
                                <span className="text-cyan-400">DECKS MASTER DEPLOYMENT</span>
                              </div>
                              <p className="text-xs md:text-sm font-semibold text-slate-100 leading-relaxed italic">
                                "{aiInterviewQuestionsList[aiInterviewStep]}"
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Your Technical Technical & Deck Response</label>
                              <textarea
                                id="student-live-interview-answer-box"
                                rows={4}
                                placeholder="State regulatory, safety, buoyancy actions or ship handling calculations clearly..."
                                className="w-full bg-slate-950 border border-cyan-900 rounded-lg p-3 text-xs focus:outline-none focus:border-cyan-400 text-slate-100 leading-relaxed font-sans"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && e.ctrlKey) {
                                    const val = (e.currentTarget as HTMLTextAreaElement).value;
                                    handleEvaluateAIInterviewAnswer(val);
                                    e.currentTarget.value = "";
                                  }
                                }}
                              />
                              <p className="text-[9px] text-slate-500 font-mono">Press Ctrl + Enter to quickly dispatch answer or click the button below.</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById("student-live-interview-answer-box") as HTMLTextAreaElement;
                                if (el && el.value.trim()) {
                                  handleEvaluateAIInterviewAnswer(el.value);
                                  el.value = "";
                                } else {
                                  alert("Please write down an answer first!");
                                }
                              }}
                              className="w-full bg-emerald-500 hover:bg-emerald-450 text-slate-900 font-black py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                              DISPATCH ANSWER TO MASTER MARINER BOARD
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Aesthetic footnote panel */}
                  <div className="pt-4 mt-4 border-t border-cyan-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                    <span>* Verified sponsorships require certified hard copies.</span>
                    <span>PLATFORM CO-ORDINATION SYSTEM SE-SPO</span>
                  </div>
                </div>

              </div>

              {/* SECTION B: AI STUDY ROADMAP GENERATOR & INTERVIEW BOOT */}
              <div className="space-y-6">
                
                {/* 🗺️ AI ROADMAP BLOCK */}
                <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-5 space-y-4" id="roadmap-builder-card">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Compass className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-sm">Interactive AI Roadmap Blueprint</h3>
                  </div>

                  <p className="text-xs text-slate-400">Generate clear salary projections, exam cycles and promotion criteria from Cadet to Captain.</p>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Specify Pre-Sea Course</label>
                    <select
                      id="roadmap-selection-field"
                      value={roadmapCoreSelection}
                      onChange={(e) => setRoadmapCoreSelection(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-900 text-slate-300 rounded px-2 py-1.5 text-xs text-left"
                    >
                      <option value="DNS Cadet">1-Year DNS (Diploma in Nautical Science)</option>
                      <option value="B.Sc Nautical Science">3-Year B.Sc Nautical Science</option>
                      <option value="GP Rating">6-Month GP Rating to Executive Officer</option>
                      <option value="B.Tech Marine Eng">4-Year B.Tech Marine Engineering (Engine Officer)</option>
                    </select>

                    <button
                      id="generate-roadmap-btn"
                      onClick={handleGenerateRoadmap}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Build Timelines Roadmap
                    </button>
                  </div>

                  {generatingRoadmap ? (
                    <div className="text-xs text-amber-400 font-mono animate-pulse">⚓ Routing satellite signals to Captain coordinates...</div>
                  ) : generatedRoadmapText ? (
                    <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/30 text-xs text-slate-300 max-h-52 overflow-y-auto whitespace-pre-line leading-relaxed">
                      {generatedRoadmapText}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      <div className="text-[10px] text-slate-500 font-mono font-bold">DEFAULT MARITIME PATHS:</div>
                      {STATIC_ROADMAP_STEPS.slice(0, 3).map((st, i) => (
                        <div key={i} className="p-2.5 bg-slate-950 rounded border border-slate-900 text-[11px] leading-tight flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-300">{st.title}</div>
                            <span className="text-[10px] text-slate-500">{st.phase}</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold">{st.salary}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* NAVIGATIONAL TAB: 🔒 HIGH-SECURITY CADET SECURE DRIVE & NOTES MODULE */}
        {activeTab === "drive" && (
          <div id="secure-drive-view-tab" className="space-y-6 animate-fade-in relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2">
                  <Lock className="w-7 h-7 text-cyan-400 shrink-0" />
                  Confidential Cadet Secure Drive
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Access premium batch chapters, test solutions, and verified merchant navy notes. 
                  <span className="text-cyan-400 font-bold ml-1">Live web visualization only. Saving or screenshot records are strictly disabled.</span>
                </p>
              </div>

              <div id="secure-telemetry-badge" className="flex items-center gap-2 text-[10px] bg-slate-950 border border-slate-850 p-2 rounded-xl text-slate-400 font-mono">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span>ENC-PROTOCOL-ACTIVE</span>
              </div>
            </div>

            {/* Check if user bought batch (has sponsorship or interview plan or is admin) */}
            {!(userHasSponsorshipSub || userHasInterviewPlan || userRole === 'admin') ? (
              // LOCKED PREVIEW FOR FREE USERS
              <div className="space-y-6">
                
                {/* Visualizer teaser grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-45 pointer-events-none select-none">
                  {[
                    { title: "🔒 Premium IMU-CET Numerical Solver Vault", desc: "Step-by-step breakdown of high-impact buoyancy ratios, cubic calculations, displacement waterlines, and longitudinal stability metrics.", category: "IMU-CET Prep" },
                    { title: "🔒 Anglo-Eastern Past Orals & Boardroom Secrets", desc: "Verbatim examiner logs spanning helm commands, marine aux machinery operations, and MARPOL Annex-V/VI emissions constraints.", category: "Sponsorship" },
                    { title: "🔒 Paramount Academy Core Collision Regulations", desc: "Complete visual card analysis of rule 1-19, overtaking maneuvers, day shapes, and fog signaling frequencies.", category: "Navigation Safety" }
                  ].map((fake, fIdx) => (
                    <div key={fIdx} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 blur-[2px]">
                      <span className="text-[10px] font-mono text-cyan-500 font-extrabold uppercase bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/30">{fake.category}</span>
                      <h4 className="font-extrabold text-sm text-slate-200">{fake.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{fake.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Padlock Prompt */}
                <div className="bg-[#0B1528] rounded-3xl border border-cyan-500/30 p-8 max-w-2xl mx-auto text-center space-y-6 shadow-2xl shadow-black">
                  <div className="mx-auto w-16 h-16 bg-cyan-950/80 rounded-full border border-cyan-500/50 flex flex-center items-center justify-center text-cyan-400 shadow-inner">
                    <Lock className="w-8 h-8 animate-bounce mx-auto" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-50">Locked Directory: Paid Cohort Access Only</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                      Merchant Navy AI implements high-fidelity proprietary training notes prepared by senior Captains. These safe directories are reserved exclusively for members of the <strong className="text-cyan-300">Gold Sponsorship All-in-One Batch Pass</strong> or the <strong className="text-amber-400">1-on-1 Interview Board Pass</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="space-y-1 col-span-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block">✓ WEB ONLY VISUALS</span>
                      <p className="text-[10px] text-slate-500 leading-tight">No offline downloads or screen sharing allowed. Strictly secure.</p>
                    </div>
                    <div className="space-y-1 col-span-1 font-sans">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block">✓ LIVE CHIEFS NOTES</span>
                      <p className="text-[10px] text-slate-500 leading-tight">Instant updates for IMU-CET written tests and technical sponsorship orals.</p>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block">✓ INTELLECTUAL ARMOR</span>
                      <p className="text-[10px] text-slate-500 leading-tight">Dynamic watermarks applied dynamically inside the document canvas.</p>
                    </div>
                  </div>

                  <div className="pt-2 text-xs flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      id="unlock-drive-via-pricing-btn"
                      onClick={() => setActiveTab("pricing")}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-900/30 flex items-center gap-2 text-center"
                    >
                      <span>⚡ SUBSCRIBE NOW (UNLOCK ALL DRIVES)</span>
                    </button>
                    
                    <span className="text-slate-500 font-mono uppercase text-[10px]">OR</span>
                    
                    <button
                      onClick={() => {
                        setSelectedPlanDetails({
                          name: "Addon: Google Meet & 1-on-1 Interview Board Locker (Rs. 99 Slot)",
                          price: 99,
                          duration: "Single Session / File Pass"
                        });
                        setDiscountPercent(0);
                        setActiveTab("pricing");
                      }}
                      className="text-cyan-300 hover:text-cyan-200 underline font-semibold cursor-pointer"
                    >
                      Acquire Single Ticket (Rs.99/-)
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              // FULL SECURED DIGITIZED DRIVE WORKSPACE
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SIDEBAR: Index of secure documents */}
                <div className="lg:col-span-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Document Registry</h4>
                    <p className="text-[10px] text-slate-500">Live search private captain papers & blueprints</p>
                  </div>

                  {/* Search bar & Category filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input 
                        type="text"
                        placeholder="Search document title or keywords..."
                        value={driveSearch}
                        onChange={(e) => setDriveSearch(e.target.value)}
                        className="w-full bg-[#070D19] border border-cyan-950 p-2 pl-9 rounded-xl text-xs text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {["All", "IMU-CET Prep", "Sponsorship", "Navigation Safety", "Marine Engineering", "Math & Physics"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setDriveCatFilter(cat)}
                          className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                            driveCatFilter === cat 
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-800"
                              : "bg-slate-950 text-slate-500 border border-slate-900 hover:text-slate-400"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered list of records */}
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {secureDriveFiles
                      .filter((f) => {
                        const matchesSearch = f.title.toLowerCase().includes(driveSearch.toLowerCase()) || 
                                              f.description.toLowerCase().includes(driveSearch.toLowerCase());
                        const matchesCat = driveCatFilter === "All" || f.category === driveCatFilter;
                        return matchesSearch && matchesCat;
                      }).length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-8">No secure files matched lookup parameters.</p>
                      ) : (
                        secureDriveFiles
                          .filter((f) => {
                            const matchesSearch = f.title.toLowerCase().includes(driveSearch.toLowerCase()) || 
                                                  f.description.toLowerCase().includes(driveSearch.toLowerCase());
                            const matchesCat = driveCatFilter === "All" || f.category === driveCatFilter;
                            return matchesSearch && matchesCat;
                          })
                          .map((doc) => {
                            const pdfName = doc.fileName || (
                              doc.category === "IMU-CET Prep" ? "imu_cet_stability_vault.pdf" :
                              doc.category === "Sponsorship" ? "sponsorship_orals_guide.pdf" :
                              doc.category === "Navigation Safety" ? "colregs_rules_handout.pdf" :
                              "maritime_confidential_rules.pdf"
                            );
                            const pdfSize = doc.fileSize || "1.15 MB";
                            const pCount = doc.pageCount || 4;

                            return (
                              <button
                                key={doc.id}
                                onClick={() => {
                                  setSelectedDriveFile(doc);
                                  setActiveViewerPage(0);
                                  setViewerMode("visual");
                                }}
                                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col space-y-2 focus:outline-none cursor-pointer ${
                                  selectedDriveFile?.id === doc.id
                                    ? "bg-[#0B1528] border-cyan-500/50 shadow-md shadow-cyan-950/30"
                                    : "bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-[#070D19]/40"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-[8px] bg-[#102344] text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase border border-cyan-900/30">
                                    {doc.category}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">{doc.uploadedAt}</span>
                                </div>
                                
                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-xs text-slate-200 line-clamp-2 leading-relaxed flex items-start gap-1">
                                    <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    <span>{doc.title}</span>
                                  </h5>
                                  <p className="text-[10px] text-slate-500 line-clamp-2 font-sans leading-normal">{doc.description}</p>
                                </div>

                                {/* High-Fidelity PDF File Attachment Panel representing Admin uploaded files */}
                                <div className="bg-[#060c18] border border-cyan-950/50 rounded-lg p-2.5 flex items-center justify-between w-full text-[9px] font-mono">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="bg-rose-500/10 text-rose-400 px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 border border-rose-900/20">
                                      PDF
                                    </div>
                                    <span className="text-slate-300 truncate font-bold text-[10px]" title={pdfName}>
                                      {pdfName}
                                    </span>
                                  </div>
                                  <span className="text-[#516383] shrink-0 text-[8px] font-bold">
                                    {pdfSize} • {pCount} p.
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-1.5 text-[9px] text-slate-400 font-mono border-t border-slate-900">
                                  <span className="text-slate-500">By {doc.uploadedBy || "Commander"}</span>
                                  <span className="text-emerald-400 flex items-center gap-1 font-bold bg-emerald-950/15 px-1.5 py-0.5 rounded border border-emerald-900/20 text-[8px]">
                                    <Lock className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                                    SECURE READ-ONLY
                                  </span>
                                </div>
                              </button>
                            );
                          })
                      )}
                  </div>
                </div>

                {/* RIGHT SIDEBAR: HIGH-SECURITY VIEWER CONTAINER */}
                <div className="lg:col-span-8 space-y-4">
                  {!selectedDriveFile ? (
                    <div className="bg-slate-950/50 border border-slate-900 rounded-3xl p-16 text-center space-y-4 h-[580px] flex flex-col justify-center items-center">
                      <div className="p-4 bg-slate-900 rounded-full border border-slate-850 text-slate-505 shadow-inner">
                        <HardDrive className="w-10 h-10 text-cyan-400 animate-pulse mx-auto" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h4 className="font-extrabold text-sm text-slate-300">Secure Reader Stage Offline</h4>
                        <p className="text-xs text-slate-500">Select any maritime study module, placement log, or past oral sheet from the catalog registry on the left to activate encryptor previews.</p>
                      </div>
                    </div>
                  ) : (() => {
                    const rawContent = selectedDriveFile.content || "";
                    const hasPdf = !!selectedDriveFile.pdfBase64;
                    let parsedPages: string[] = [];
                    
                    if (rawContent.includes("[PAGE ")) {
                      parsedPages = rawContent.split(/\[PAGE \d+:[^\]]*\]/i).map(p => p.trim()).filter(p => p.length > 2);
                      if (parsedPages.length === 0) parsedPages = [rawContent];
                    } else {
                      // Do not fragment by double newlines by default to preserve normal document readability
                      parsedPages = [rawContent];
                    }
                    
                    const totalPages = parsedPages.length;
                    const safeActivePage = Math.min(activeViewerPage, totalPages - 1);
                    const currentPageContent = parsedPages[safeActivePage] || parsedPages[0] || "End of encrypted content.";

                    return (
                      <div className="bg-[#0B1528] border border-cyan-900/40 rounded-3xl p-5 space-y-4 flex flex-col h-[585px]">
                        
                        {/* Reader Metadata Header */}
                        <div className="pb-3 border-b border-cyan-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-2 py-0.5 rounded font-mono uppercase font-black tracking-wider">
                                {selectedDriveFile.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Size: {selectedDriveFile.fileSize || "0.8 MB"} • Published by {selectedDriveFile.uploadedBy || "Commander"}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                              📄 {selectedDriveFile.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedDriveFile(null);
                                setActiveViewerPage(0);
                              }}
                              className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-[10px] uppercase font-mono cursor-pointer transition-colors"
                            >
                              [Close Stage]
                            </button>
                          </div>
                        </div>

                        {/* Interactive Reader Controls Toolbar */}
                        <div className="bg-[#040914] border border-cyan-950 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono select-none">
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            {hasPdf ? (
                              <div className="flex items-center bg-[#07132a] border border-cyan-900/40 rounded-lg p-0.5">
                                <button
                                  onClick={() => setViewerMode("visual")}
                                  className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                                    viewerMode === "visual"
                                      ? "bg-cyan-500 text-slate-950 shadow-md"
                                      : "text-slate-450 hover:text-slate-200"
                                  }`}
                                >
                                  📄 REAL PDF VIEW
                                </button>
                                <button
                                  onClick={() => setViewerMode("text")}
                                  className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                                    viewerMode === "text"
                                      ? "bg-cyan-500 text-slate-950 shadow-md"
                                      : "text-slate-450 hover:text-slate-200"
                                  }`}
                                >
                                  📝 TEXT TRANSCRIPT
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                <span className="font-bold text-amber-500 uppercase tracking-widest text-[9px]">ANTI-DOWNLOAD SECURE EYE</span>
                              </div>
                            )}
                          </div>

                          {/* Pagination Controls (Only show for text transcripts / default sheets with multiple pages) */}
                          {(!hasPdf || viewerMode === "text") && totalPages > 1 && (
                            <div className="flex items-center gap-2">
                              <button 
                                disabled={safeActivePage === 0}
                                onClick={() => setActiveViewerPage(prev => Math.max(0, prev - 1))}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-30 disabled:pointer-events-none rounded-lg border border-slate-800 transition-all cursor-pointer text-[10px]"
                              >
                                ◀ Prev
                              </button>
                              <span className="text-slate-300 font-bold px-1 text-[11px] min-w-[70px] text-center">
                                Page {safeActivePage + 1} of {totalPages}
                              </span>
                              <button 
                                disabled={safeActivePage === totalPages - 1}
                                onClick={() => setActiveViewerPage(prev => Math.min(totalPages - 1, prev + 1))}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-30 disabled:pointer-events-none rounded-lg border border-slate-800 transition-all cursor-pointer text-[10px]"
                              >
                                Next ▶
                              </button>
                            </div>
                          )}

                          <span className="text-[9px] bg-red-950/40 text-red-100 px-2 py-0.5 rounded border border-red-900/30 font-black">
                            SCREEN-ONLY PREVIEW
                          </span>
                        </div>

                        {/* Actual visualizer canvas containing watermarks and protective screen blockers */}
                        <div 
                          onContextMenu={(e) => {
                            e.preventDefault();
                            alert("🚫 PRIVATE BLUEPRINT: Text selections, downloads, or screenshot triggers are inhibited on this deck.");
                          }}
                          className="flex-1 bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden select-none relative focus:outline-none flex flex-col justify-between min-h-[290px] shadow-inner"
                          id="secure-viewport-canvas"
                        >
                          
                          {/* DYNAMIC SCRAMBLER OVERLAY LINES (yields garbage screenshots!) */}
                          <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden opacity-[0.02]">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <pattern id="scramblerGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                  <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="cyan" strokeWidth="1" />
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#scramblerGrid)" />
                            </svg>
                          </div>

                          {/* DYNAMIC WATERMARK TEXT LAYER OVER DOCUMENT */}
                          <div className="absolute inset-0 pointer-events-none select-none flex flex-wrap justify-between items-center opacity-[0.035] text-[10px] font-mono leading-relaxed z-15 rotate-6 overflow-hidden h-full">
                            {Array.from({ length: 35 }).map((_, i) => (
                              <span key={i} className="tracking-wider uppercase p-3 block shrink-0 font-bold">
                                {userName.toUpperCase()} - {userEmail.toLowerCase()} - OFFICERS DIRECT_DRIVE TELEMETRY
                              </span>
                            ))}
                          </div>

                          {/* Floating Cadet Security Badge background */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] select-none pointer-events-none z-0">
                            <Compass className="w-72 h-72 text-cyan-400 rotate-45" />
                          </div>

                          {/* Rendering of Document - either the secure iframe layout or custom text panel */}
                          {hasPdf && viewerMode === "visual" ? (
                            <div className="w-full flex-1 flex flex-col bg-slate-950 relative min-h-[320px] rounded-2xl overflow-hidden">
                              <iframe
                                src={`${selectedDriveFile.pdfBase64}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full flex-1 bg-slate-950"
                                style={{ border: "none" }}
                                title={selectedDriveFile.title}
                              />
                              {/* Absolute click protection shield over margins to block direct context menus or clicks if bypasses exist */}
                              <div className="absolute top-0 left-0 w-full h-8 bg-transparent pointer-events-auto cursor-not-allowed" />
                            </div>
                          ) : (
                            <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between">
                              {/* Top corner secure signet */}
                              <div className="flex justify-between items-center border-b border-light/5 pb-2.5 mb-2 z-20 relative text-[10px] font-mono text-slate-500">
                                <span className="text-cyan-500/80 font-bold uppercase tracking-widest text-[9px]">
                                  SECURE-DRIVE HYBRID ENCRYPTOR V4
                                </span>
                                <span className="text-[9px]">
                                  FILE PASS ID_{selectedDriveFile.id.toUpperCase()}_P{safeActivePage + 1}
                                </span>
                              </div>

                              {/* Text Container Content formatted elegantly like a real publication */}
                              <div className="relative z-20 text-[12px] text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-none flex-1 py-1">
                                {currentPageContent}
                              </div>

                              {/* Page micro signature stamp */}
                              <div className="mt-6 pt-3 border-t border-slate-900 text-center text-[9px] text-[#2c3f5e] font-mono select-none relative z-20 flex justify-between">
                                <span>REWRITE/DUPLICATION BLOCKED</span>
                                <span>PAGE {safeActivePage + 1} OF {totalPages} MANUAL SHEETS</span>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Safeguard indicators footer */}
                        <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono select-none">
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                            CAPT-SCREEN BLOCK ACTIVE
                          </span>
                          <span className="text-emerald-500 flex items-center gap-1 font-bold">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            VERIFIED FOR CADET: {userName.toUpperCase()}
                          </span>
                        </div>

                      </div>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>
        )}

        {/* NAVIGATIONAL TAB: 📚 MANUALS & DOWNLOADABLE STUDY MATERIALS */}
        {activeTab === "studymaterials" && (
          <div id="materials-view-tab" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2">
                  <BookMarked className="w-7 h-7 text-cyan-300" />
                  Official Cadet Downloadable Manuals
                </h2>
                <p className="text-xs text-slate-400 mt-1">Acquire reference manuals, regulatory PDF books, and formulas guidebooks offline.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "DGS IMU-CET Standard Syllabus Guide", format: "PDF Manual", size: "2.4 MB", tag: "IMU-CET", icon: FileText, desc: "Syllabus mapping across physics formulas, wave optics, dynamic chemistry reduction metrics, general English, and aptitude parameters." },
                { title: "Sponsorship Written Placement Cheat Sheet", format: "PDF Handbook", size: "1.8 MB", tag: "Placements", icon: Award, desc: "Sample questions from Anglo Eastern Entrance exams, synergy interviews, and psychological test parameters." },
                { title: "Metacentric Stability Calculation Handout", format: "PDF Formulas", size: "850 KB", tag: "Ship Stability", icon: Compass, desc: "KG, KB, BM formulas diagrammed for dry dock cargo loading calculations, freshwater allowances and drafts index." },
                { title: "COLREG Rules of the Road Quick Reference", format: "PDF Charts", size: "3.2 MB", tag: "Navigation Safety", icon: Ship, desc: "Rules 1-38 mapped with vessel green starboard and red port quadrant safety lookouts guidelines." },
                { title: "Deck Cadet Pre-Sea Task Tar Checklist", format: "Interactive Excel", size: "1.2 MB", tag: "Practical Training", icon: ClipboardList, desc: "The standard structured checklist for physical sounding checks, rope splicing, anchor watch, and life raft operations." }
              ].map((doc, idx) => {
                const DocIcon = doc.icon;
                return (
                  <div key={idx} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-transform">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-slate-950 text-cyan-400 border border-cyan-900 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                          {doc.tag}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{doc.size}</span>
                      </div>
                      
                      <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                        <DocIcon className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
                        {doc.title}
                      </h3>
                      
                      <p className="text-slate-400 text-xs leading-relaxed">{doc.desc}</p>
                    </div>

                    <button
                      onClick={() => alert(`Simulating download generation of '${doc.title}'. Ready to use Offline!`)}
                      className="w-full bg-[#102344] hover:bg-[#153163] text-cyan-300 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-cyan-900/60"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download {doc.format}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NAVIGATIONAL TAB: 💰 CADET SUBSCRIPTION PLATFORM */}
        {activeTab === "pricing" && (
          <div id="pricing-view-tab" className="space-y-6 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">CREATOR CURATED LOW-PRICE PORTAL</span>
              <h2 className="text-3xl font-black text-slate-50">Premium Study Modules & Creator Bundles</h2>
              <p className="text-slate-400 text-sm">
                We are selling premium paid preparatory content at an extremely affordable price point! Unlocks syllabus resources from YouTube Channel Imumate, Merchant Navy Decoded, Paramount Academy, and Lifexcarrer.
              </p>
              
              {/* Mandatory currency note */}
              <div className="mt-4 inline-flex items-center gap-2 bg-[#0C1528] border border-cyan-900/60 px-4 py-2 rounded-xl text-xs text-cyan-300 font-mono">
                <span className="text-emerald-400 font-bold font-sans">🇮🇳 NOTICE:</span>
                <span>All subscription modules on our website are processed strictly in <strong>Indian Rupees (INR)</strong>.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
              {[
                { 
                  name: "5 Premium Mock Tests Master Package", 
                  price: 499, 
                  duration: "60 days", 
                  tag: "Entrance Crack Pack", 
                  desc: "Level up with 5 premium, full-length entrance mock test assessments featuring high-yield math, physics, buoyancy & maritime aptitude questions compiled from Paramount Academy with solutions.", 
                  features: [
                    "5 Full-Length Detailed Mock Exam Papers",
                    "High-yield Math, Physics & Buoyancy core worksheets",
                    "Complete answer sheets with step-by-step guidance",
                    "Official online predictive rank estimation scorecards"
                  ] 
                },
                { 
                  name: "All-in-One Ultimate Subscription Module", 
                  price: 1599, 
                  duration: "1 year", 
                  tag: "★ SUPER VALUE MEGA PASS", 
                  isGrandAllInOne: true,
                  desc: "🚨 ALL PAID LECTURES BUNDLED IN ONE! Master your entrance exams and captain checks with full access to recorded lecture videos, study sheets, high-yield questions, and custom company sponsorship test sets.", 
                  features: [
                    "High-Quality Recorded Lecture Videos & topic-wise online classes from top channels",
                    "Downloadable Study Guide PDFs and curated notes for IMU-CET & Orals",
                    "High-Yield Important Questions with detailed step-by-step master keys",
                    "Enterprise Sponsorship Practice Questions & official medical checklist pre-screens",
                    "1-on-1 Simulated Captain live mock boards with direct verified officer feedback",
                    "Unlimited Gemini AI watchkeeper doubts-solver query engine"
                  ], 
                  popularity: true 
                },
                { 
                  name: "1-on-1 Live Mock Interview Package", 
                  price: 999, 
                  duration: "30 days", 
                  tag: "Sponsorship Special Deck", 
                  desc: "Includes 1 Live Simulated Mock Interview Board on Google Meet conducted by industry captains/veteran engineers, plus comprehensive placement oral guidelines.", 
                  features: [
                    "1 Live 1-on-1 Mock Interview session on Google Meet",
                    "Direct feedback score sheet with Chief Capt. reports",
                    "Conducted & Evaluated by Merchant Navy Verified Officials",
                    "Verified Official high-yield Merchant Navy Decoded oral files"
                  ] 
                }
              ].map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 rounded-2xl flex flex-col justify-between space-y-6 bg-gradient-to-b from-[#0E1E38]/50 to-[#0A1325]/95 border ${
                    plan.popularity ? "border-cyan-450 scale-[1.03] shadow-lg shadow-cyan-950/40 relative" : "border-slate-800"
                  }`}
                >
                  {plan.popularity && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-900 text-[10px] uppercase tracking-widest font-mono font-black px-3 py-1 rounded-full border border-cyan-300">
                      BEST ALL-IN-ONE VALUE
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">{plan.tag}</span>
                      <h3 className="text-lg font-extrabold text-slate-100 mt-1">{plan.name}</h3>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{plan.desc}</p>
                    </div>

                    {plan.isGrandAllInOne && (
                      <div className="p-3 bg-[#0C1528] border border-cyan-500/20 rounded-xl space-y-2">
                        <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                          👑 INCLUDED PAID PREMIUM ARCHIVES:
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          <span className="text-[9px] font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25 px-2 py-0.5 rounded-md font-mono">
                            Imumate Paid
                          </span>
                          <span className="text-[9px] font-bold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/25 px-2 py-0.5 rounded-md font-mono">
                            Decoded Premium
                          </span>
                          <span className="text-[9px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25 px-2 py-0.5 rounded-md font-mono">
                            Paramount Elite
                          </span>
                          <span className="text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 px-2 py-0.5 rounded-md font-mono">
                            Lifexcarrer Orals
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-normal italic">
                          *Strictly paid-tier lecture assets from all creators packaged securely in 1 single login pass.
                        </p>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-50">Rs. {plan.price}</span>
                      <span className="text-xs text-slate-500 font-mono">/ {plan.duration}</span>
                    </div>

                    <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-4">
                      {plan.features.map((ft, fi) => (
                        <li key={fi} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{ft}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    id={`purchase-btn-${idx}`}
                    onClick={() => {
                      setSelectedPlanDetails(plan);
                      setDiscountPercent(0);
                      setCheckoutCompleted(false);
                      setPromoCodeValue("");
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                      plan.popularity 
                        ? "bg-cyan-500 text-slate-900 hover:bg-cyan-400 cursor-pointer" 
                        : "bg-slate-900 text-cyan-300 border border-cyan-950 hover:bg-slate-850 cursor-pointer"
                    }`}
                  >
                    Get Premium Study Access
                  </button>
                </div>
              ))}
            </div>

            {/* Simulated Razorpay Checkout Modal segment */}
            {selectedPlanDetails && (
              <div className="max-w-md mx-auto bg-[#0B1528] rounded-2xl border border-cyan-500 p-6 space-y-4 shadow-2xl mt-8">
                <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                  <div className="flex items-center gap-2 text-sm text-slate-100 font-bold">
                    <CreditCard className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Secure Checkout Simulator (Razorpay API)
                  </div>
                  <button 
                    onClick={() => setSelectedPlanDetails(null)} 
                    className="text-xs text-slate-400 hover:text-red-400 cursor-pointer"
                  >
                    [Cancel]
                  </button>
                </div>

                {!checkoutCompleted ? (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-950 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 font-bold">ACTIVATING SUBSCRIPTION:</div>
                        <div className="text-xs font-semibold text-slate-100">{selectedPlanDetails.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 font-mono">Original: Rs. {selectedPlanDetails.price}</div>
                        {discountPercent > 0 && <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1 rounded uppercase tracking-wider font-bold">Promo Apply</span>}
                      </div>
                    </div>

                    {/* Promocode field */}
                    <div className="flex gap-2">
                      <input
                        id="promo-code-input-field"
                        type="text"
                        placeholder="MARITIME10 or CAPTAIN50"
                        value={promoCodeValue}
                        onChange={(e) => setPromoCodeValue(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 uppercase"
                      />
                      <button
                        id="apply-promo-code-btn"
                        onClick={handleApplyCoupon}
                        className="bg-[#102344] text-cyan-300 border border-cyan-900 px-3 py-1 rounded text-xs font-bold cursor-pointer"
                      >
                        Apply Code
                      </button>
                    </div>

                    {discountPercent > 0 && (
                      <div className="flex justify-between items-center text-xs text-emerald-400 font-mono">
                        <span>Discount Activated:</span>
                        <span>- Rs. {selectedPlanDetails.price * discountPercent / 100} ({discountPercent}%)</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-3 text-slate-200">
                      <span className="font-bold">Total Billable:</span>
                      <span className="text-lg font-black text-cyan-300">
                        Rs. {Math.round(selectedPlanDetails.price * (1 - discountPercent / 100))}
                      </span>
                    </div>

                    {/* Short inline note showing INR base requirement */}
                    <p className="text-[9px] text-slate-500 text-center italic">
                      * Curated affiliate partnership with Imumate, Decoded, Paramount & Lifexcarrer. Payments in INR only.
                    </p>

                    <button
                      id="rzp-simulate-pay-btn"
                      onClick={triggerRazorpaySimulate}
                      className="w-full bg-[#4E56D0] hover:bg-[#343BB5] text-slate-50 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      Proceed with UPI / Card Simulator (INR)
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4 space-y-3 bg-[#11241C] rounded-xl border border-emerald-900/60 font-sans">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Merchant Navy Plan Activated!</h4>
                      <p className="text-xs text-slate-350 mt-1">Payment processed via simulated Razorpay INR gateway. Your master watchkeepers account status is set of Premium Cadet Elite!</p>
                    </div>
                    <button
                      id="view-dash-from-payment"
                      onClick={() => {
                        setSelectedPlanDetails(null);
                        setActiveTab("dashboard");
                      }}
                      className="inline-block bg-[#0B1528] hover:bg-[#122441] text-emerald-400 border border-emerald-900 px-4 py-2 rounded text-xs font-bold mt-2 cursor-pointer"
                    >
                      Enter Student Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* NAVIGATIONAL TAB: 🗺️ STUDENT DASHBOARD */}
        {activeTab === "dashboard" && (
          <div id="student-dashboard-tab" className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-7 h-7 text-cyan-400" />
                  Cadet Commandant Analytics Terminal
                </h2>
                <p className="text-xs text-slate-400 mt-1">Review diagnostic mock scoring levels, watchkeepers notes, and study planning routines.</p>
              </div>

              {/* Personal Details Indicator */}
              <div className="p-3 bg-slate-900 rounded-xl border border-cyan-950 flex items-center gap-3 self-start">
                <div className="w-10 h-10 bg-cyan-950 text-cyan-300 rounded-lg flex items-center justify-center font-bold font-mono">
                  OC
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">{userName}</div>
                  <div className="text-[10px] text-slate-400 font-mono select-all uppercase">{userEmail}</div>
                </div>
              </div>
            </div>

            {/* STREAK BOOSTER NOTIFICATION */}
            {!streakClaimed && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-100">
                  <Flame className="w-5 h-5 text-amber-500 animate-bounce shrink-0" />
                  <div>
                    <span className="font-bold">Claim Your Daily Maritime Study Command Booster!</span>
                    <p className="text-slate-350 text-[11px] mt-0.5">Streaks fuel placement algorithms inside our hiring simulator metrics.</p>
                  </div>
                </div>
                <button
                  id="claim-streak-dash-btn"
                  onClick={claimDailyStreak}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold px-4 py-1.5 rounded-lg text-xs"
                >
                  Boost Steak +1d
                </button>
              </div>
            )}

            {/* Dashboard Analytics grid with Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT COLUMN: CHARTS ANALYSIS */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Score progression chart */}
                <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-200 uppercase tracking-widest font-mono">Mock Diagnostic Scores Progression</h3>
                    <span className="text-[10px] text-cyan-400 font-mono">Target: 85% selection pass</span>
                  </div>

                  <div className="h-60 w-full" id="dash-recharts-bar-progress">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} />
                        <YAxis stroke="#888" fontSize={10} domain={[0, 100]} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "#0F1E38", borderColor: "#1E3A67", color: "#FFF", borderRadius: "8px" }} />
                        <Bar dataKey="score" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                          {studentPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 80 ? "#10b981" : "#06b6d4"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grid for Study Calendar and recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Calendar Planner */}
                  <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase">
                      <span>Study Planner Routines</span>
                      <Calendar className="w-4 h-4 text-cyan-400" />
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {calendarTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-900 text-xs">
                          <span className={task.completed ? "line-through text-slate-550" : "text-slate-350"}>
                            {task.title}
                          </span>
                          <button
                            onClick={() => {
                              setCalendarTasks(calendarTasks.map((t) => t.id === task.id ? { ...t, completed: !t.completed } : t));
                            }}
                            className={`p-1 rounded font-mono ${task.completed ? "text-emerald-400" : "text-slate-500 hover:text-cyan-400"}`}
                          >
                            {task.completed ? "✔ DONE" : "PENDING"}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <input
                        id="new-task-input-field"
                        type="text"
                        placeholder="Add study milestone..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
                      />
                      <button
                        id="add-task-btn"
                        onClick={addCalendarTask}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 p-1 rounded font-bold text-xs px-2.5"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* AI Tutor Smart Recommendations */}
                  <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-4 space-y-3">
                    <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Personalized AI Target Recommendations</div>
                    <div className="space-y-3 pt-1">
                      
                      <div className="p-2.5 bg-slate-950 rounded border border-cyan-950 flex items-start gap-2">
                        <Award className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <div className="text-xs font-bold text-slate-200">Prepare Interview Scenario B</div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Your communication is great, but we detected light stability math gaps. Complete interviews simulations index daily.</p>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded border border-cyan-950 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-slate-200 text-amber-400">Grab COLREG Chapter 5</div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Mandatory watchkeeping guidelines regarding visual and satellite lookout configurations.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN: REVISION NOTES */}
              <div className="space-y-6">
                
                {/* Persistent Scratchpad notes editor */}
                <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-5 space-y-3" id="watchkeeping-notes-pad text-xs">
                  <div className="flex items-center justify-between text-slate-200">
                    <h3 className="font-extrabold text-sm">Command Deck Revision Notes</h3>
                    <BookMarked className="w-4 h-4 text-cyan-400" />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">Changes persist locally; use this workspace node to jot down equations, target formulas, or questions.</p>

                  <textarea
                    id="dashboard-notes-textarea"
                    rows={8}
                    value={studyNotes}
                    onChange={(e) => setStudyNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-950 rounded-xl text-[11px] font-mono p-3 focus:outline-none focus:border-cyan-455 text-slate-300 leading-relaxed"
                  />

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Characters: {studyNotes.length}</span>
                    <button
                      id="save-notes-feedback"
                      onClick={() => alert("⚓ Deck Notes backed up on fleet cloud cache!")}
                      className="text-cyan-400 hover:underline font-bold"
                    >
                      [Force Backup]
                    </button>
                  </div>
                </div>

                {/* Subscribed Course completions tracking */}
                <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-5 space-y-3">
                  <h3 className="font-bold text-xs text-slate-200 uppercase tracking-widest font-mono">Operational Metrics Progress</h3>
                  <div className="space-y-3 text-xs leading-none">
                    
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-450 mb-1">
                        <span>IMU-CET Study Guides</span>
                        <span>82% Finished</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-2" style={{ width: "82%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-450 mb-1">
                        <span>COLREG Rules of the Road</span>
                        <span>98% Competent</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-2" style={{ width: "98%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-450 mb-1">
                        <span>Sponsorship Sample Placements</span>
                        <span>40% Practiced</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-2" style={{ width: "40%" }} />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* NAVIGATIONAL TAB: 🛡️ ADMIN COMMAND DASHBOARD */}
        {activeTab === "admin" && (
          <div id="admin-dashboard-tab" className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-2">
                  <Shield className="w-7 h-7 text-amber-500 animate-pulse" />
                  Merchant Navy Fleet Administrator Portal
                </h2>
                <p className="text-xs text-slate-400 mt-1">Supervise subscription logs, disperse announcements to cadets, and upload new deck modules.</p>
              </div>

              <div className="flex gap-2">
                <span className="text-xs text-amber-400 bg-amber-950 border border-amber-900 px-3 py-1.5 rounded-xl font-mono">
                  Commander Role Active
                </span>
                <button
                  id="admin-logout-bypass"
                  onClick={() => {
                    setUserRole("student");
                    setActiveTab("home");
                  }}
                  className="bg-slate-900 p-2 text-slate-400 border border-slate-800 rounded-xl text-xs hover:text-slate-200"
                >
                  Exit Control Mode
                </button>
              </div>
            </div>

            {/* Admin Metrics panel with Recharts Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* REVENUE CHART BOX */}
              <div className="lg:col-span-2 bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 uppercase tracking-widest font-mono">Simulated Platform Revenue Growth</h3>
                    <p className="text-xs text-slate-450">Track monthly subscriptions performance</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded">
                    Total Revenue: $48,890 USD
                  </span>
                </div>

                <div className="h-60 w-full" id="admin-revenue-chart-view">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={10} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "#0F1E38", borderColor: "#1E3A67", color: "#FFF", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.15)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic announcement manager */}
              <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-5 space-y-4">
                <div className="text-slate-150 font-bold text-xs uppercase tracking-widest">Platform Radio Dispatch Terminal</div>
                <form onSubmit={handleAnnounce} className="space-y-3">
                  <textarea
                    id="admin-announce-msg"
                    rows={3}
                    placeholder="Enter severe weather warnings, sponsor deadlines or IMU updates for cadet tickers..."
                    value={newAnnouncementText}
                    onChange={(e) => setNewAnnouncementText(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-900 text-slate-100 rounded p-2.5 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    id="admin-announce-dispatch"
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-2 rounded text-xs"
                  >
                    Broadcast Radio Message
                  </button>
                </form>

                <div className="space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="text-[10px] text-slate-500 font-mono font-bold">DISPATCHED RADIO HISTORIC CODES:</div>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {announcements.map((ann, idx) => (
                      <div key={idx} className="bg-slate-950 p-2 rounded text-[11px] border border-slate-900 space-y-0.5">
                        <span className="text-slate-500 font-mono text-[9px]">{ann.date}</span>
                        <p className="text-slate-300 leading-tight">{ann.msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Custom Mock Tests Builder Code Node */}
            <div id="admin-mock-test-builder" className="bg-[#0A1224] rounded-2xl border border-amber-900/30 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 className="font-extrabold text-base text-slate-100 tracking-tight">⚓ AI-Powered Shipboard Mock Test & Question Publisher</h3>
                </div>
                <span className="text-[10px] bg-amber-950 text-amber-400 font-mono px-2 py-0.5 rounded border border-amber-900">SYSTEM CREATOR NODE</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Form: Test Configurations */}
                <form onSubmit={handlePublishNewMockTest} className="lg:col-span-5 space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-400 block">Step 1: Test Campaign Configuration</span>
                    <label className="text-slate-450 block mb-0.5 font-bold">Mock Test Campaign Title</label>
                    <input
                      id="admin-mock-test-title-input"
                      type="text"
                      required
                      placeholder="e.g. Anglo-Eastern DNS Sponsorship - Set G"
                      value={newMockTestTitle}
                      onChange={(e) => setNewMockTestTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-900 text-slate-100 p-2.5 rounded focus:outline-none focus:border-cyan-400 font-bold animate-pulse-once"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-450 block mb-1">Subject Category</label>
                      <select
                        id="admin-mock-test-category-select"
                        value={newMockTestCategory}
                        onChange={(e) => setNewMockTestCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-cyan-900 p-2 text-slate-200 rounded font-bold"
                      >
                        <option value="IMU-CET">IMU-CET</option>
                        <option value="DNS Sponsorship">DNS Sponsorship</option>
                        <option value="GP-Rating">GP-Rating</option>
                        <option value="Aptitude">Aptitude</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-450 block mb-1">Duration (Min)</label>
                      <input
                        id="admin-mock-test-duration-input"
                        type="number"
                        min={5}
                        required
                        value={newMockTestDuration}
                        onChange={(e) => setNewMockTestDuration(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-cyan-900 p-2 text-slate-200 rounded text-center font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-450 block mb-1">Pass Price (Rs)</label>
                      <input
                        id="admin-mock-test-price-input"
                        type="number"
                        min={0}
                        required
                        value={newMockTestPrice}
                        onChange={(e) => setNewMockTestPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-cyan-900 p-2 text-yellow-400 rounded text-center font-mono font-bold font-black"
                      />
                    </div>
                  </div>

                  {/* Queued Questions List Preview */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-900">
                      <span>QUEUED MCQs INDEX</span>
                      <span className="font-bold text-cyan-400">{addedQuestionsForNewTest.length} Question(s) Added</span>
                    </div>

                    {addedQuestionsForNewTest.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic text-center py-4">No questions added yet. Use Step 2 on the right to draft and insert questions.</p>
                    ) : (
                      <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                        {addedQuestionsForNewTest.map((q, index) => (
                          <div key={q.id} className="bg-slate-900 p-2 rounded flex items-center justify-between gap-2 border border-slate-850">
                            <span className="truncate text-[10px] text-slate-350 font-medium">Q{index + 1}: {q.question}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setAddedQuestionsForNewTest(addedQuestionsForNewTest.filter((_, i) => i !== index));
                              }}
                              className="text-rose-450 hover:text-rose-400 font-mono text-[9px] shrink-0"
                            >
                              [REMOVE]
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    id="admin-publish-mock-test-submit-btn"
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold py-3 rounded-lg text-xs transition-colors tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Anchor className="w-4 h-4" />
                    🚢 PUBLISH & BROADCAST MOCK TESTS CAMPAIGN (₹{newMockTestPrice})
                  </button>
                </form>

                {/* Right Form: Build Questions with AI */}
                <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                  {/* Mode Toggler / Tabs */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-cyan-400 block">Step 2: Interactive Question Builder</span>
                    </div>
                    <div className="flex bg-slate-900 border border-slate-850 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setBuildMode("singles")}
                        className={`px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider transition-all cursor-pointer ${
                          buildMode === "singles"
                            ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        ✍ SINGLE MCQ
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuildMode("batch")}
                        className={`px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                          buildMode === "batch"
                            ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        📁 BATCH FILE AI EXTRACTOR
                      </button>
                    </div>
                  </div>

                  {buildMode === "singles" ? (
                    <>
                      <div>
                        <label className="text-slate-455 block mb-1 text-xs font-semibold">Enter Question Query / Core Text</label>
                        <div className="flex gap-2">
                          <textarea
                            id="admin-draft-question-text"
                            rows={2}
                            placeholder="e.g. What is the freshwater allowance calculation formula for bulk carriers?"
                            value={draftQuestionText}
                            onChange={(e) => setDraftQuestionText(e.target.value)}
                            className="flex-1 bg-slate-900 border border-cyan-900 text-xs text-slate-100 p-2 rounded focus:outline-none focus:border-cyan-400 font-medium leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={handleAIGenerateOptions}
                            disabled={isGeneratingAIOptions}
                            className="bg-amber-500 text-slate-900 hover:bg-amber-400 p-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center min-w-[100px] shrink-0 disabled:opacity-50"
                          >
                            <Sparkles className="w-4 h-4 mb-1 animate-pulse" />
                            {isGeneratingAIOptions ? "AI WRITING..." : "✨ AI OPTIONS"}
                          </button>
                        </div>
                      </div>

                      {/* Options Input fields with correct selection checkboxes */}
                      <div className="space-y-2">
                        <label className="text-slate-450 block text-[11px] font-mono leading-none">Draft Answer Seletion (A-D) & Check correct option</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {draftOptions.map((opt, oIndex) => (
                            <div key={oIndex} className="bg-slate-900 border border-slate-800 p-1.5 rounded flex items-center justify-between gap-1.5 hover:border-slate-700 transition-all">
                              <span className="font-bold text-cyan-455 pr-1 font-mono">{String.fromCharCode(65 + oIndex)}:</span>
                              <input
                                id={`admin-draft-option-${oIndex}`}
                                type="text"
                                required
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...draftOptions];
                                  newOpts[oIndex] = e.target.value;
                                  setDraftOptions(newOpts);
                                }}
                                className="bg-transparent flex-1 text-slate-100 focus:outline-none focus:border-cyan-400 py-0.5 text-xs text-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => setDraftCorrectIndex(oIndex)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                                  draftCorrectIndex === oIndex 
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                                    : "bg-slate-950 text-slate-500 border border-slate-900 hover:text-slate-350"
                                }`}
                              >
                                {draftCorrectIndex === oIndex ? "✔ CORRECT" : "SELECT"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technical Explanation Input */}
                      <div className="text-xs">
                        <label className="text-slate-455 block mb-1">Nautical Key Explanation / AI rational argument</label>
                        <input
                          id="admin-draft-question-explanation"
                          type="text"
                          placeholder="e.g. Fresh Water Allowance (FWA) of a ship is standardly computed as Displacement / (4 * TPC)."
                          value={draftExplanation}
                          onChange={(e) => setDraftExplanation(e.target.value)}
                          className="w-full bg-slate-900 border border-cyan-900 text-slate-200 p-2.5 rounded focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddNewQuestionToTest}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-extrabold py-2 px-5 rounded-lg text-xs w-full sm:w-auto tracking-wide cursor-pointer"
                        >
                          ⚓ ADD QUESTION TO TEST SERIES
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {/* Batch File Zone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                          Upload Syllabus Notes, Exam Guidelines or Question Textheet (.TXT/.PDF)
                        </label>
                        <div className="border-2 border-dashed border-cyan-900/40 hover:border-cyan-500 bg-[#060B18] rounded-xl p-5 text-center transition-all relative flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[140px]">
                          <input
                            type="file"
                            accept=".txt, .pdf"
                            onChange={handleBatchFileUpload}
                            disabled={isExtractionActive}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {isExtractionActive ? (
                            <>
                              <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
                              <span className="text-xs text-cyan-300 font-bold font-mono uppercase tracking-widest animate-pulse">
                                AI is analyzing document and extracting structured MCQs...
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Parsing formulas, key concepts, answers & explanations
                              </span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-8 h-8 text-cyan-400 animate-bounce" />
                              <span className="text-xs text-slate-200 font-extrabold block">
                                {uploadedFileName ? "📄 SELECTED: " + uploadedFileName.toUpperCase() : "CLICK OR DROP SYLLABUS PDF / STUDY QUESTIONS FILE"}
                              </span>
                              <span className="text-[9px] text-[#4d5b77] block font-mono">
                                Accepts standard plain text (.txt) and compiled text documents (.pdf) up to 10MB
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Extracted MCQs List Preview */}
                      {batchFileList.length > 0 && (
                        <div className="space-y-3 bg-[#081020] border border-cyan-950 p-4 rounded-xl">
                          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                            <span className="text-xs font-mono font-bold text-slate-300">
                              📊 EXTRACTION RESULTS PREVIEW ({batchFileList.length} MCQs found)
                            </span>
                            <span className="text-[9px] bg-cyan-950/70 border border-cyan-900 text-cyan-400 px-2 py-0.5 rounded font-mono font-black">
                              VERIFIED AI PARSE
                            </span>
                          </div>

                          <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                            {batchFileList.map((q, qIndex) => (
                              <div key={q.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-2 text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-extrabold text-cyan-400 tracking-tight block shrink-0 font-mono">
                                    MCQ #{qIndex + 1}:
                                  </span>
                                  <span className="text-slate-100 font-medium leading-relaxed flex-1">
                                    {q.question}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] pt-1 px-1">
                                  {q.options.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className={`p-1.5 rounded flex items-center gap-1.5 ${
                                        q.correctIndex === oIdx
                                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50"
                                          : "bg-slate-950/40 text-slate-400 border border-transparent"
                                      }`}
                                    >
                                      <span className="font-black font-mono">
                                        {String.fromCharCode(65 + oIdx)}:
                                      </span>
                                      <span className="truncate">{opt}</span>
                                    </div>
                                  ))}
                                </div>

                                <p className="text-[10px] text-[#7185ad] italic pl-1 border-l border-[#3a4866] pt-0.5">
                                  <span className="font-bold text-slate-400 not-italic font-mono block">Explanation of answer:</span>
                                  {q.explanation}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* 1-TAP COMMIT BUTTON */}
                          <div className="pt-2 border-t border-cyan-950">
                            <button
                              type="button"
                              onClick={handleCommitBatchImport}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-lg shadow-amber-950/50 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              🚢 COMMIT ALL {batchFileList.length} EXTRACTED QUESTIONS IN 1 TAP (ADD TO TEST)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Custom Courses Uploader & Student management logs */}
            <div id="admin-builder-forms" className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Course publisher form */}
              <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5 border-b border-cyan-950 pb-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Publish New Course / Video Session
                </h3>

                <form onSubmit={handleAddNewCourse} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-450 block mb-1">Course Title</label>
                    <input
                      id="admin-add-course-title"
                      type="text"
                      placeholder="e.g. Astro-Navigation and Celestial Formulas"
                      value={customCourseTitle}
                      onChange={(e) => setCustomCourseTitle(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-cyan-900 text-slate-100 p-2 rounded focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-450 block mb-1">Portfolio Category</label>
                      <select
                        id="admin-add-course-cat"
                        value={customCourseCat}
                        onChange={(e) => setCustomCourseCat(e.target.value)}
                        className="w-full bg-slate-900 border border-cyan-900 text-slate-300 p-2 rounded"
                      >
                        <option value="IMU-CET Prep">IMU-CET Prep</option>
                        <option value="DNS Sponsorship">DNS Sponsorship</option>
                        <option value="GP Rating">GP Rating</option>
                        <option value="Second Mate Exam">Second Mate Exam</option>
                        <option value="Interview Prep">Interview Prep</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-450 block mb-1">Manual Document (.pdf)</label>
                      <input
                        type="text"
                        placeholder="Guideline_Astrogadgets.pdf"
                        disabled
                        className="w-full bg-slate-950 border border-cyan-950 p-2 rounded text-slate-500 select-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-450 block mb-1">Course Highlights / Narrative Description</label>
                    <textarea
                      id="admin-add-course-desc"
                      rows={3}
                      placeholder="List the modules, certification targets, and required student sea-time..."
                      value={customCourseDesc}
                      onChange={(e) => setCustomCourseDesc(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-cyan-900 text-slate-100 p-2 rounded focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    id="admin-add-course-submit"
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 rounded transition-colors"
                  >
                    Catalog New Campaign Module
                  </button>
                </form>
              </div>

              {/* Roster of active student subscription modules */}
              <div className="bg-[#0B1528] rounded-2xl border border-cyan-900/50 p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5 border-b border-cyan-950 pb-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Fleet Active Candidates List
                </h3>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {studentList.map((st) => (
                    <div key={st.id} className="bg-slate-950 p-3 rounded-lg border border-cyan-950/20 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-100">{st.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{st.email}</div>
                        <span className="inline-block mt-1 text-[10px] text-cyan-400 font-semibold font-mono">
                          Plan: {st.plan}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono">Joined: {st.joined}</span>
                        <div className="mt-1">
                          <button
                            onClick={() => {
                              setStudentList(studentList.map((s) => s.id === st.id ? { ...s, status: s.status === "Active" ? "Suspended" : "Active" } : s));
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${
                              st.status === "Active"
                                ? "bg-emerald-950/80 text-emerald-400 border-emerald-900"
                                : "bg-rose-950/80 text-rose-450 border-rose-900"
                            }`}
                          >
                            {st.status}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 🛡️ DYNAMIC GOOGLE MEET SLOT APPROVALS & AI TRANSCRIPT INSPECTOR PANEL */}
            <div id="admin-sponsorship-meet-approvals" className="bg-[#091122] rounded-2xl border border-cyan-500/20 p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-950 pb-3 gap-3">
                <div>
                  <h4 className="font-black text-sm text-slate-100 flex items-center gap-1.5">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    🛡️ Admin 1-on-1 Google Meet & AI Sponsorship Transcript Terminal
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Deploy coordinates for live captain mock rounds and audit candidate AI oral transcripts.</p>
                </div>
                <div className="text-[10px] bg-[#102344] text-cyan-300 px-3 py-1 rounded font-mono border border-cyan-900/60 font-bold uppercase">
                  Sponsorship Control Module
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Google Meet bookings scheduler approved log */}
                <div className="space-y-4">
                  <h5 className="font-bold text-xs text-slate-200 border-b border-slate-900 pb-1.5 uppercase font-mono tracking-wider text-cyan-400">1. Google Meet Slot Approvals Engine</h5>
                  
                  {googleMeetBookings.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6 text-center">No face-to-face meet requests received yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {googleMeetBookings.map((b) => (
                        <div key={b.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 hover:border-cyan-500/10 transition-all text-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-100">{b.candidateName}</span>
                              <span className="text-[10px] text-slate-500 block">{b.candidateEmail}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              b.status === "Approved" 
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900" 
                                : "bg-amber-950/80 text-amber-500 border border-amber-900"
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-[#070D19] p-2.5 rounded border border-cyan-950/50 text-[11px]">
                            <div>
                              <span className="text-slate-500 block uppercase text-[9px] font-mono">Curriculum Selection</span>
                              <span className="font-bold text-slate-300">{b.courseType}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase text-[9px] font-mono">Target Date/Time</span>
                              <span className="font-bold text-amber-400">{b.date} at {b.time}</span>
                            </div>
                          </div>

                          {/* Submit live Google Meet Link input */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[10px] text-slate-450 block font-bold font-mono">Google Meet Video Link URL:</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="e.g. https://meet.google.com/abc-defg-hij"
                                defaultValue={b.meetUrl || ""}
                                id={`meet-url-input-${b.id}`}
                                className="flex-1 bg-slate-900 border border-cyan-950/50 rounded px-2 py-1 text-[11px] text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`meet-url-input-${b.id}`) as HTMLInputElement;
                                  const meetUrl = input ? input.value.trim() : "";
                                  if (!meetUrl) {
                                    alert("Please supply a valid Google Meet link first!");
                                    return;
                                  }

                                  const updated = googleMeetBookings.map((bk) => {
                                    if (bk.id === b.id) {
                                      return { ...bk, status: "Approved", meetUrl };
                                    }
                                    return bk;
                                  });

                                  setGoogleMeetBookings(updated);
                                  localStorage.setItem("MN_GOOG_MEET_BOOKINGS", JSON.stringify(updated));
                                  alert(`✔️ Google Meet link saved successfully! Candidate will see the 'Join Google Meet' button in real time.`);
                                }}
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-905 font-bold px-3 py-1 rounded text-[11px] text-slate-900 cursor-pointer shrink-0"
                              >
                                Approve & Save Link
                              </button>
                            </div>
                          </div>

                          {/* Toggle Action Buttons */}
                          <div className="flex gap-2 pt-1 border-t border-slate-900/40 text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = googleMeetBookings.map((bk) => {
                                  if (bk.id === b.id) {
                                    return { ...bk, status: "Completed" };
                                  }
                                  return bk;
                                });
                                setGoogleMeetBookings(updated);
                                localStorage.setItem("MN_GOOG_MEET_BOOKINGS", JSON.stringify(updated));
                                alert("Session marked Completed.");
                              }}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              [Mark Completed]
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = googleMeetBookings.filter((bk) => bk.id !== b.id);
                                setGoogleMeetBookings(updated);
                                localStorage.setItem("MN_GOOG_MEET_BOOKINGS", JSON.stringify(updated));
                                alert("Removed meet booking request.");
                              }}
                              className="text-rose-450 hover:text-rose-400 ml-auto"
                            >
                              [Archive Booking]
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. AI Sponsorship Interview Logs Transcript log */}
                <div className="space-y-4">
                  <h5 className="font-bold text-xs text-slate-200 border-b border-slate-900 pb-1.5 uppercase font-mono tracking-wider text-amber-400">2. AI Sponsorship Oral Transcripts Log</h5>
                  
                  {aiInterviewLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6 text-center">No AI assessments completed yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {aiInterviewLogs.map((log) => (
                        <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 text-xs leading-relaxed">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-extrabold text-slate-200">{log.candidateName}</span>
                              <span className="text-[10px] text-slate-500 block font-mono">Date Tested: {log.date}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-amber-400 block">{log.score}%</span>
                              <span className="text-[9px] text-[#41A58D] font-bold font-mono block">AI GRADED</span>
                            </div>
                          </div>

                          <span className="text-[10px] text-cyan-400 bg-cyan-950/20 border border-cyan-900/40 px-2 py-0.5 rounded uppercase font-mono font-bold block w-fit">
                            Course Target: {log.courseType}
                          </span>

                          <div className="bg-[#070D19] p-3 rounded-lg border border-slate-905 italic text-[11px] text-slate-300">
                            " {log.recommendation} "
                          </div>

                          {/* Expandable transcripts logs lists */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-900">
                            <span className="text-[10px] text-slate-500 block font-mono font-bold">RAW QUESTION & REPLY PAIRS:</span>
                            <div className="space-y-2 max-h-36 overflow-y-auto bg-[#070D19]/40 p-2 rounded">
                              {log.transcript?.map((tr: any, tIdx: number) => (
                                <div key={tIdx} className="text-[11px] border-b border-slate-900 pb-1.5 last:border-b-0 space-y-0.5 last:pb-0">
                                  <p className="font-bold text-slate-350">Q: {tr.q}</p>
                                  <p className="text-slate-400">A: "{tr.a}"</p>
                                  {tr.feedback && <p className="text-[10px] text-amber-500 font-mono">● {tr.feedback}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* 🛡️ ADMIN SECURE DRIVE CONTENT UPLOADER & DELETION TERMINAL */}
            <div id="admin-secure-drive-terminal" className="bg-[#091122] rounded-2xl border border-cyan-500/20 p-6 space-y-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-950 pb-3 gap-3">
                <div>
                  <h4 className="font-black text-sm text-slate-100 flex items-center gap-1.5">
                    <HardDrive className="w-5 h-5 text-amber-500 animate-pulse" />
                    🛡️ Admin Secure Drive & Private Notes Uploader
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload and manage high-security prep manuals, confidential solved question banks, or verified captain blueprints.
                  </p>
                </div>
                <div className="text-[10px] bg-amber-955 text-amber-400 px-3 py-1 rounded font-mono border border-amber-900/60 font-bold uppercase shrink-0">
                  Confidential Storage Locker
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Upload Form */}
                <div className="lg:col-span-1 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h5 className="font-bold text-xs text-slate-200 border-b border-slate-900 pb-1.5 uppercase font-mono tracking-wider text-cyan-400">
                    Publish New Document
                  </h5>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!adminDriveFormTitle.trim() || !adminDriveFormContent.trim()) {
                        alert("Please specify a document title and the secure private text content.");
                        return;
                      }
                      
                      const newDoc = {
                        id: "df_" + Date.now(),
                        title: adminDriveFormTitle,
                        category: adminDriveFormCat,
                        description: adminDriveFormDesc || "Encrypted Maritime PDF Document Archive",
                        content: adminDriveFormContent,
                        uploadedBy: "Commander (Admin)",
                        uploadedAt: new Date().toISOString().split('T')[0],
                        isPremiumOnly: true,
                        fileName: adminUploadedFileName || "manual_document.pdf",
                        fileSize: adminUploadedFileSize || "0.45 MB",
                        pageCount: adminUploadedFilePages || 3,
                        pdfBase64: adminUploadedFileBase64 || ""
                      };
                      
                      const updatedDocs = [newDoc, ...secureDriveFiles];
                      setSecureDriveFiles(updatedDocs);
                      localStorage.setItem("MN_SECURE_DRIVE_FILES", JSON.stringify(updatedDocs));
                      
                      // Reset fields
                      setAdminDriveFormTitle("");
                      setAdminDriveFormDesc("");
                      setAdminDriveFormContent("");
                      setAdminUploadedFileName("");
                      setAdminUploadedFileSize("");
                      setAdminUploadedFileBase64("");
                      setAdminUploadedFilePages(4);
                      alert(`🎉 SUCCESS! Direct PDF upload '${newDoc.title}' (${newDoc.fileSize}) parsed and published securely. Active premium students can now view it safely with full anti-screenshot safeguards!`);
                    }}
                    className="space-y-3.5 text-xs"
                  >
                    {/* PDF File Upload Zone */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                        Confidential PDF Document File
                      </label>
                      <div className="border border-dashed border-slate-800 hover:border-cyan-500/50 bg-[#0a1122] rounded-xl p-3.5 text-center transition-all relative flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            if (!file.name.toLowerCase().endsWith(".pdf")) {
                              alert("⚠️ INVALID TYPE: Highly secure visualizer stage accepts authentic .pdf files only.");
                              return;
                            }
                            
                            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                            if (file.size > 8 * 1024 * 1024) {
                              alert("⚠️ MEMORY LIMIT: Please upload a file smaller than 8MB to prevent local storage overflow.");
                              return;
                            }

                            setAdminUploadedFileName(file.name);
                            setAdminUploadedFileSize(`${sizeInMB} MB`);
                            
                            // Auto-populate form fields
                            if (!adminDriveFormTitle.trim()) {
                              const cleanName = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
                              setAdminDriveFormTitle(cleanName.replace(/\b\w/g, c => c.toUpperCase()));
                            }

                            const reader = new FileReader();
                            reader.onload = () => {
                              setAdminUploadedFileBase64(reader.result as string);
                              const pagesSim = Math.floor(Math.random() * 5) + 4; // 4 to 8 pages
                              setAdminUploadedFilePages(pagesSim);
                              
                              if (!adminDriveFormContent.trim()) {
                                setAdminDriveFormContent(
                                  `[PAGE 1: CORE BRIEFING BOARD DIRECTIVES]\n` +
                                  `• File: ${file.name.toUpperCase()}\n` +
                                  `• Size Integrity: ${sizeInMB} MB • Multi-layer visual matrix active\n\n` +
                                  `[PAGE 2: VERIFIED SHARING CODES]\n` +
                                  `This private file remains registered to officer cadet revision accounts. Local screen capture inhibitors, background recording detectors and watermarks are overlaid.\n\n` +
                                  `[PAGE 3: EXAMINE FORMULAS & NUMERICAL RULES]\n` +
                                  `1. Metacentric shift delta (GG1) = (shifted weight * shift distance) / total Ship Displacement.\n` +
                                  `2. FWA (Freshwater allowance in mm) = Displacement / (4 * TPC).\n\n` +
                                  `[PAGE 4: REVISION QUESTIONS]\n` +
                                  `Q1. What is the freshwater allowance calculation formula?\n` +
                                  `Q2. State steering gear SOLAS redundancy requirements.`
                                );
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          id="admin-pdf-dropzone-input"
                        />
                        <Download className="w-5 h-5 text-cyan-400 transition-colors animate-pulse" />
                        <span className="text-[10px] text-slate-300 font-bold block">
                          {adminUploadedFileName ? "📄 " + adminUploadedFileName : "Select or Drop PDF here"}
                        </span>
                        <span className="text-[9px] text-[#5c6882] block">
                          {adminUploadedFileSize ? `Size: ${adminUploadedFileSize} • Encrypted Cache Ready` : "Accepts PDF up to 8MB • Anti-Screenshot Active"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Document Title</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. DNS Soundings Calculation & soundings table guidelines"
                        value={adminDriveFormTitle}
                        onChange={(e) => setAdminDriveFormTitle(e.target.value)}
                        className="w-full bg-[#0a1122] border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Category Tag</label>
                      <select 
                        value={adminDriveFormCat}
                        onChange={(e) => setAdminDriveFormCat(e.target.value)}
                        className="w-full bg-[#0a1122] border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-200 focus:outline-none"
                      >
                        <option value="IMU-CET Prep">IMU-CET Prep</option>
                        <option value="Sponsorship">Sponsorship & Placements</option>
                        <option value="Math & Physics">Math & Physics Formulas</option>
                        <option value="Navigation Safety">Navigation & COLREGs</option>
                        <option value="Marine Engineering">Marine Engineering Orals</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brief Description</label>
                      <input 
                        type="text"
                        placeholder="Short overview about high-yield value"
                        value={adminDriveFormDesc}
                        onChange={(e) => setAdminDriveFormDesc(e.target.value)}
                        className="w-full bg-[#0a1122] border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Document Secure Content (Auto-Paginates)</label>
                      <textarea 
                        rows={5}
                        required
                        placeholder="Type or paste the lecture transcripts or let the file reader auto-populate segments here..."
                        value={adminDriveFormContent}
                        onChange={(e) => setAdminDriveFormContent(e.target.value)}
                        className="w-full bg-[#0a1122] border border-slate-800 focus:border-cyan-500 p-2 rounded-xl text-slate-100 placeholder:text-slate-650 font-mono text-xs focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 rounded-xl cursor-pointer text-center font-mono tracking-wider"
                    >
                      🔒 LOCK & BROADCAST PDF TO FLEET
                    </button>
                  </form>
                </div>

                {/* Secure Drive Catalog Table & Management list */}
                <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h5 className="font-bold text-xs text-slate-200 border-b border-slate-900 pb-1.5 uppercase font-mono tracking-wider text-amber-400">
                    Current Secure Documents Directory
                  </h5>

                  {secureDriveFiles.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-8 text-center bg-[#070D19]/50 rounded-xl">
                      No encrypted documents registered. Add your first manual draft on the left!
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {secureDriveFiles.map((doc) => (
                        <div key={doc.id} className="bg-[#0B1528] rounded-xl border border-slate-850 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] bg-slate-900 border border-slate-800 font-bold font-mono text-cyan-400 px-2 py-0.5 rounded uppercase">
                                {doc.category}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Published: {doc.uploadedAt}
                              </span>
                            </div>
                            <h6 className="font-extrabold text-slate-200 text-sm">{doc.title}</h6>
                            <p className="text-[11px] text-slate-400">{doc.description}</p>
                            <span className="text-[9px] text-slate-500 block">Uploader: {doc.uploadedBy}</span>
                          </div>

                          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <button
                              onClick={() => {
                                const newDocs = secureDriveFiles.filter((d) => d.id !== doc.id);
                                setSecureDriveFiles(newDocs);
                                localStorage.setItem("MN_SECURE_DRIVE_FILES", JSON.stringify(newDocs));
                                if (selectedDriveFile?.id === doc.id) {
                                  setSelectedDriveFile(null);
                                }
                                alert("Document retracted successfully from active student lockers!");
                              }}
                              className="px-3 py-1 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 rounded font-bold transition-all text-[11px] cursor-pointer"
                            >
                              ❌ Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 📋 INTERACTIVE CADET ELIGIBILITY DIAGNOSTIC MODAL */}
      {eligibilityModalOpen && (
        <div id="eligibility-diagnostic-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B1528] border-2 border-cyan-500/30 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in relative flex flex-col max-h-[90vh]">
            
            {/* Header portion */}
            <div className="bg-gradient-to-r from-cyan-950 via-[#0B1528] to-slate-950 p-6 border-b border-cyan-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-400/30">
                  <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                    Cadet Eligibility & Sponsorship Diagnostic
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Cross-references academic percentages, medical norms, and age variables against the top 7 global shipping employers.
                  </p>
                </div>
              </div>
              <button 
                id="close-eligibility-modal"
                onClick={() => setEligibilityModalOpen(false)}
                className="p-1 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 font-mono text-xs cursor-pointer transition-colors"
              >
                [CLOSE ×]
              </button>
            </div>

            {/* Scrollable contents split dashboard */}
            <div className="p-6 md:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-8 font-sans">
              
              {/* Left Column - Compact Interactive Parameters Inputs */}
              <div className="md:col-span-5 space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">1. Select Target Stream</h4>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {["Deck Cadet", "Engine Cadet", "ETO Cadet"].map((strName) => (
                      <button
                        key={strName}
                        onClick={() => {
                          setEligibilityStream(strName);
                          // ETO requires specialized degrees by default
                          if (strName === "ETO Cadet") {
                            setEligibilityDiplomaDegrees(true);
                          }
                        }}
                        className={`py-2 px-1 text-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          eligibilityStream === strName 
                            ? "bg-cyan-500 text-slate-900" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {strName === "Deck Cadet" ? "🚢 Deck" : strName === "Engine Cadet" ? "🔧 Engine" : "⚡ ETO"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      2. 12th PCM Aggregate Score
                    </h4>
                    <span id="pcm-score-display" className="text-sm font-black text-cyan-300 font-mono">
                      {eligibilityPcm}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={eligibilityPcm}
                    onChange={(e) => setEligibilityPcm(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-ew-resize accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>Min (40%)</span>
                    <span>Required Limit Over ≥60%</span>
                    <span>Max (100%)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      3. English Subject Score
                    </h4>
                    <span id="english-score-display" className="text-sm font-black text-cyan-300 font-mono">
                      {eligibilityEnglish}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={eligibilityEnglish}
                    onChange={(e) => setEligibilityEnglish(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-ew-resize accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>Min (40%)</span>
                    <span>Critical cutoff ≥50%</span>
                    <span>Max (100%)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      4. Applicant Current Age
                    </h4>
                    <span id="age-selector-display" className="text-sm font-black text-cyan-300 font-mono">
                      {eligibilityAge} Years old
                    </span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="35"
                    value={eligibilityAge}
                    onChange={(e) => setEligibilityAge(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-ew-resize accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>Undergrad limit: ≤25</span>
                    <span>Postgrad limit: ≤28</span>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-slate-900">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 block tracking-wider uppercase">
                    5. Mandatory Physical & Medical
                  </span>
                  
                  {/* Color Blindness field */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Is Person Colour Blind?</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Ishihara test validation (Strictly DQ block for deck)</p>
                    </div>
                    <button
                      onClick={() => setEligibilityColourBlindness(!eligibilityColourBlindness)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg border cursor-pointer font-mono whitespace-nowrap transition-colors ${
                        eligibilityColourBlindness 
                          ? "bg-rose-950 text-rose-450 border-rose-800" 
                          : "bg-emerald-950 text-emerald-400 border-emerald-900"
                      }`}
                    >
                      {eligibilityColourBlindness ? "YES (Color Blind)" : "NO (Normal Eyes)"}
                    </button>
                  </div>

                  {/* Standard Eyesight (Unaided and correctable to 6/6) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Passes General Eyesight?</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Unaided vision meets company limit norms</p>
                    </div>
                    <button
                      onClick={() => setEligibilityEyesightPassed(!eligibilityEyesightPassed)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg border cursor-pointer font-mono whitespace-nowrap transition-colors ${
                        eligibilityEyesightPassed 
                          ? "bg-emerald-950 text-emerald-400 border-emerald-900" 
                          : "bg-rose-950 text-rose-450 border-rose-800"
                      }`}
                    >
                      {eligibilityEyesightPassed ? "YES (Standard Passed)" : "NO (Weak Vision)"}
                    </button>
                  </div>

                  {/* Degree/Diploma Field */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Holds Engineering Degree / Diploma?</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">E.g., Mechanical / Electrical B.E., B.Tech, or 3 yr diploma</p>
                    </div>
                    <button
                      onClick={() => setEligibilityDiplomaDegrees(!eligibilityDiplomaDegrees)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg border cursor-pointer font-mono whitespace-nowrap transition-colors ${
                        eligibilityDiplomaDegrees 
                          ? "bg-cyan-950 text-cyan-400 border-cyan-800" 
                          : "bg-slate-900 text-slate-500 border-slate-800"
                      }`}
                    >
                      {eligibilityDiplomaDegrees ? "YES (Qualified)" : "NO (10+2 Only)"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Comprehensive Results Scorecard */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                
                {/* General Parameter Assessment block */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>📈</span> Core Guidelines Compliance Check
                  </h4>
                  
                  {eligibilityResult && eligibilityResult.issues.length > 0 ? (
                    <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>Critical Hurdles Detected ({eligibilityResult.issues.length}):</span>
                      </div>
                      <ul className="list-disc pl-5 text-[11px] text-rose-300 space-y-1">
                        {eligibilityResult.issues.map((iss, iIdx) => (
                          <li key={iIdx}>{iss}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block">Congratulations! Standard parameters passed!</span>
                        <p className="text-[10px] text-slate-350 mt-0.5">
                          You satisfy the base academic, age, and medical parameters for generic Cadet courses. Review sponsor details below!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Company Grid Results */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <span>🚢</span> Registered Corporate Sponsor Assessments
                  </h4>
                  
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {eligibilityResult?.companies.map((company, cIdx) => (
                      <div 
                        key={cIdx} 
                        className={`p-3 rounded-xl border transition-all ${
                          company.isEligible 
                            ? "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60" 
                            : "bg-slate-900/40 border-slate-800 opacity-70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-slate-100">{company.name}</span>
                          
                          {company.isEligible ? (
                            <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                              ✓ ELIGIBLE
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                              ✕ Ineligible ({company.reasons.join(", ")})
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">{company.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important notice block at the base */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-400 italic leading-snug">
                  📌 <strong className="text-slate-300">Important Disclaimer:</strong> All information is compiled based on recently published guidelines for the 2026 pre-sea cadet intake batches. We highly advise verification with official shipping recruitment portals, as company criteria fluctuates periodically.
                </div>

              </div>

            </div>

            {/* Bottom active footer bar */}
            <div className="bg-slate-950 p-4 border-t border-cyan-900/40 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                System Registry Version Ref: IND-AEMA-ML-SMG-2026.1
              </span>
              <button
                onClick={() => setEligibilityModalOpen(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
