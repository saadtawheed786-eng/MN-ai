export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  lessons: number;
  rating: number;
  students: number;
  description: string;
  pdfUrl?: string;
  videoUrl?: string;
}

export interface MockTest {
  id: string;
  title: string;
  category: "IMU-CET" | "DNS" | "GP-Rating" | "Aptitude";
  durationMinutes: number;
  totalQuestions: number;
}

export interface MockQuestion {
  id: string;
  subject?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const MARITIME_COURSES: Course[] = [
  {
    id: "imu-cet-prep",
    title: "IMU-CET Ultimate Preparation Masterclass",
    category: "IMU-CET Prep",
    duration: "12 Weeks",
    lessons: 48,
    rating: 4.9,
    students: 1240,
    description: "Thorough preparation covering Math, Physics, Chemistry, English, and General Aptitude following the exact IMU examination syllabus.",
    pdfUrl: "IMU_CET_Syllabus_Guide.pdf",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "dns-sponsorship",
    title: "DNS Sponsorship Selection Program",
    category: "DNS Sponsorship",
    duration: "8 Weeks",
    lessons: 32,
    rating: 4.8,
    students: 850,
    description: "Prepare specifically for the tough DNS Sponsorship written examinations and medical requirements of top shipping companies.",
    pdfUrl: "Sponsorship_Prep_Deck_Cadet.pdf",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "gp-rating",
    title: "GP Rating & General Deck/Engine Training",
    category: "GP Rating",
    duration: "6 Weeks",
    lessons: 24,
    rating: 4.7,
    students: 620,
    description: "Master pre-sea deck and engine general tasks, shipboard safety, basic survival, and marine environment protection.",
    pdfUrl: "GP_Rating_Training_Handout.pdf",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "deck-cadet-roadmap",
    title: "GP Rating to Officer Promotional Blueprint",
    category: "GP to Officer",
    duration: "10 Weeks",
    lessons: 40,
    rating: 4.9,
    students: 430,
    description: "Complete guide on how to safely navigate career steps, gather sea-time, clear COC papers, and move from GP rating to Deck/Engine Officer.",
    pdfUrl: "GP_Rating_to_Officer_Blueprint.pdf",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "second-mate-coc",
    title: "Second Mate Function-3 CoC Prep Course",
    category: "Second Mate Exam",
    duration: "16 Weeks",
    lessons: 64,
    rating: 4.9,
    students: 310,
    description: "Advanced preparation for Second Mate (Foreign Going) Certificate of Competency including Chartwork, Terrestrial Navigation, and Meteorology.",
    pdfUrl: "Second_Mates_Chartwork_Formulas.pdf",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "maritime-interview-prep",
    title: "Shipping Company Interview Bootcamp",
    category: "Interview Prep",
    duration: "4 Weeks",
    lessons: 16,
    rating: 5.0,
    students: 1100,
    description: "Master mock interview simulations for Anglo Eastern, Synergy, Synergy Marine, Great Eastern, and Bernhard Schulte Shipmanagement.",
    pdfUrl: "Naval_Interviews_CheatSheet.pdf",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];

export const MOCK_TESTS: MockTest[] = [
  { id: "imucet-f1", title: "IMU-CET Full Mock Exam - Set A", category: "IMU-CET", durationMinutes: 180, totalQuestions: 6 },
  { id: "dns-spons-a", title: "Anglo-Eastern DNS Sponsorship Entrance Mock", category: "DNS Sponsorship" as any, durationMinutes: 120, totalQuestions: 6 },
  { id: "gp-assessment-1", title: "GP Rating Exit Practice Examination", category: "GP-Rating", durationMinutes: 60, totalQuestions: 5 },
  { id: "aptitude-english", title: "Maritime English & General Aptitude Test", category: "Aptitude", durationMinutes: 45, totalQuestions: 5 }
];

export const MOCK_QUESTIONS: Record<string, MockQuestion[]> = {
  "imucet-f1": [
    {
      id: "q_imu_1",
      subject: "Physics",
      question: "Which of the following describes Archimedes' principle representing floating vessels?",
      options: [
        "A floating body displaces a volume of fluid whose weight equals the weight of the body.",
        "A floating body sinks until the water pressure equals its structural tensile strength.",
        "A body submerged in a fluid experiences a downward force proportional to its gravity.",
        "Fluids exert cohesive horizontal pressures acting against the metacentric height list."
      ],
      correctIndex: 0,
      explanation: "Archimedes' law of buoyancy states that any body completely or partially submerged in a fluid is buoyed up by a force equal to the weight of the fluid displaced by the body. For a floating ship, it displaces water weight exactly equal to its own total weight."
    },
    {
      id: "q_imu_2",
      subject: "Math",
      question: "Evaluate the limit as x approaches 0 of sin(5x)/3x.",
      options: ["3/5", "5/3", "1", "15"],
      correctIndex: 1,
      explanation: "Using the standard limit limit(sin(kx)/kx) = 1 as x -> 0, we can rewrite sin(5x)/3x = (5/3) * (sin(5x)/5x), which yields 5/3 * 1 = 5/3."
    },
    {
      id: "q_imu_3",
      subject: "Chemistry",
      question: "Under standard conditions, which chemical anode is most commonly attached to steel hulls of cargo ships to prevent electrolysis corrosion?",
      options: [
        "Copper Electrodes",
        "Zinc Sacrificial Anodes",
        "Lead Plates",
        "Graphite Carbon Plates"
      ],
      correctIndex: 1,
      explanation: "Zinc has a lower standard reduction potential than Iron. Therefore, Zinc acts as a sacrificial anode, oxidizing to protect the ship's steel hull from galvanic marine corrosion."
    },
    {
      id: "q_imu_4",
      subject: "English",
      question: "Choose the correct sentence form: 'The vessel ______ departed the port before the typhoon struck.'",
      options: [
        "had already",
        "has already",
        "was already",
        "have already"
      ],
      correctIndex: 0,
      explanation: "This requires past perfect tense ('had already departed') because the departure occurred before another past event ('the typhoon struck')."
    },
    {
      id: "q_imu_5",
      subject: "General Knowledge",
      question: "What does the abbreviation 'VHF' stand for in marine vessel communications?",
      options: [
        "Vessel High Frequency",
        "Very High Frequency",
        "Velocity Harbor Fleet",
        "Visual Heading Finder"
      ],
      correctIndex: 1,
      explanation: "VHF stands for 'Very High Frequency', which operates on radio wavelengths between 30 MHz and 300 MHz, primarily used for maritime radio traffic, safety alerts, and bridge-to-bridge communications."
    },
    {
      id: "q_imu_6",
      subject: "Aptitude",
      question: "If a ship travels 180 nautical miles in 12 hours, what is its average speed in knots?",
      options: ["12 knots", "15 knots", "18 knots", "20 knots"],
      correctIndex: 1,
      explanation: "Speed in knots = Distance in nautical miles / Time in hours. Therefore, 180 / 12 = 15 knots."
    }
  ],
  "dns-spons-a": [
    {
      id: "q_dns_1",
      subject: "Maritime Safety",
      question: "Which of the following holds supreme authority on a commercial merchant vessel?",
      options: ["The Master / Captain", "The Chief Engineer", "The Operations Manager ashore", "The Second Mate Officer"],
      correctIndex: 0,
      explanation: "The Captain (Master) has overriding authority and absolute responsibility for shipboard operations, safety of life, protection of the marine environment, and cargo security."
    },
    {
      id: "q_dns_2",
      subject: "Applied Sciences",
      question: "When a bulk carrier sails from freshwater to saltwater, what happens to its draft?",
      options: ["The draft increases (sinks deeper)", "The draft decreases (rises higher)", "The draft remains exactly unchanged", "The vessel rolls immediately to starboard"],
      correctIndex: 1,
      explanation: "Saltwater has higher density than freshwater. Therefore, a smaller volume of saltwater is needed to produce the equivalent buoying force, which causes the vessel to rise slightly, decreasing its draft."
    },
    {
      id: "q_dns_3",
      subject: "Math",
      question: "Solve for x in the equation: log2(x) + log2(x - 2) = 3.",
      options: ["x = 2", "x = 4", "x = -2", "x = 8"],
      correctIndex: 1,
      explanation: "Combine using log laws: log2(x*(x - 2)) = 3 => x^2 - 2x = 2^3 => x^2 - 2x - 8 = 0 => (x - 4)(x + 2) = 0. Since log input must be positive, x = 4."
    },
    {
      id: "q_dns_4",
      subject: "Physics",
      question: "A force of 500 N is applied perpendicular to a point on a lever at 2 meters from the hinge. Calculate the generated torque.",
      options: ["250 N-m", "500 N-m", "1000 N-m", "2000 N-m"],
      correctIndex: 2,
      explanation: "Torque = Force * perpendicular distance = 500 N * 2 m = 1000 N-m."
    },
    {
      id: "q_dns_5",
      subject: "General Maritime",
      question: "Which of the following is correct regarding 'Port' and 'Starboard' directions?",
      options: [
        "Port is Left, Starboard is Right (when facing forward)",
        "Port is Right, Starboard is Left (when facing forward)",
        "Port is Front, Starboard is Rear",
        "Port is Deck, Starboard is Bilge"
      ],
      correctIndex: 0,
      explanation: "Portside corresponds to the left-hand side of a vessel facing forward, traditionally lit Red. Starboard is the right-hand side, traditionally lit Green."
    },
    {
      id: "q_dns_6",
      subject: "Mental Ability",
      question: "Complete the sequence: 3, 7, 15, 31, __?",
      options: ["45", "53", "63", "67"],
      correctIndex: 2,
      explanation: "The pattern is (x * 2) + 1. (31 * 2) + 1 = 63."
    }
  ],
  "gp-assessment-1": [
    {
      id: "q_gp_1",
      question: "What is the primary material used to fabricate safe, strong marine mooring ropes?",
      options: ["Polyester/Polypropylene", "Raw jute", "Coarse hemp", "Zinc fibers"],
      correctIndex: 0,
      explanation: "Synthetic fibers like Polypropylene, Nylon, and Polyester are preferred for mooring ropes because they possess high breaking strength, chemical resistance, buoyancy, and flexibility."
    },
    {
      id: "q_gp_2",
      question: "Which emergency alarm signal is sounded for standard 'Abandon Ship'?",
      options: [
        "Seven short rings followed by one long blast on ship's whistle",
        "continuous rapid tolling of ship bell for 30 seconds",
        "three brief blasts repeated intermittently",
        "One short blast followed by three minutes of silence"
      ],
      correctIndex: 0,
      explanation: "The general emergency alarm for abandonment consists of seven or more short blasts followed by one long blast on the ship's alarm bells and whistling system."
    }
  ],
  "aptitude-english": [
    {
      id: "q_apt_1",
      question: "Choose correct prepositions: The Officer in Charge of navigational watch is responsible _____ the Master _____ the safety of watchkeeping.",
      options: [
        "to, for",
        "for, to",
        "towards, about",
        "with, upon"
      ],
      correctIndex: 0,
      explanation: "The correct idiom is 'responsible to' a superior person, 'for' an action/duty. Thus: 'responsible to the Master for the safety...'"
    },
    {
      id: "q_apt_2",
      question: "If A and B can do a paint maintenance job on intermediate bulkheads in 6 days, and A alone can do it in 10 days, how long does B take alone?",
      options: ["12 days", "15 days", "18 days", "24 days"],
      correctIndex: 1,
      explanation: "1/A + 1/B = 1/6 => 1/10 + 1/B = 1/6 => 1/B = 1/6 - 1/10 = (5 - 3)/30 = 2/30 = 1/15. Thus B takes 15 days."
    }
  ]
};

export const SUCCESS_STORIES = [
  {
    name: "Subhashis Sen",
    rank: "Deck Cadet, Anglo-Eastern",
    image: "https://picsum.photos/100/100?random=1",
    rating: 5,
    quote: "Merchant Navy AI gave me exactly what I needed to clear the IMU-CET on my very first try. The personalized AI roadmaps are incredibly accurate!"
  },
  {
    name: "Karan Johar",
    rank: "Junior Officer, Great Eastern",
    image: "https://picsum.photos/100/100?random=2",
    rating: 5,
    quote: "The interactive chartwork preparation tool and the mock test auto-evaluation helped me find exactly where I was making mistakes in CoC exams."
  },
  {
    name: "Vikram Dev",
    rank: "Engine Cadet, BSM",
    image: "https://picsum.photos/100/100?random=3",
    rating: 5,
    quote: "I practiced Anglo Eastern DNS written preparations here. The Maritime Knowledge chat solved 50+ of my complex mechanical doubts with helpful diagrams!"
  }
];

export const STATIC_ROADMAP_STEPS = [
  {
    phase: "Phase 1: Foundation",
    title: "Sponsorship & IMU-CET Prep",
    timeline: "Age: 17-20",
    salary: "$0/mo (Awaiting)",
    requirements: "12th PCM > 60% standard",
    desc: "Clear IMU-CET Entrance Exam with top state rank and secure commercial corporate sponsorship from a DGS-approved shipping firm."
  },
  {
    phase: "Phase 2: Cadetship",
    title: "1-Year DNS / 4-Year B.Tech",
    timeline: "DNS Training (12 Months)",
    salary: "$350 - $600/month (Stipend)", // cadet standard stipend
    requirements: "Complete pre-sea institute training and board a vessel",
    desc: "Serve 18 months sea-time as structured deck cadet on board bulk tankers or gas carriers, compiling physical Tar Book records."
  },
  {
    phase: "Phase 3: Junior Officer",
    title: "Second Mate Unlimited",
    timeline: "Clear CoC Written & Orals",
    salary: "$1,800 - $3,500/month",
    requirements: "18 months sea time + valid Second Mate COC Certificate",
    desc: "Watch Keeping Officer responsible for safe bridge navigational watches, cargo operations, and deck preservation maintenance."
  },
  {
    phase: "Phase 4: Senior Officer",
    title: "Chief Officer Unlimited CoC",
    timeline: "Age: 25-28",
    salary: "$5,500 - $8,500/month",
    requirements: "Clear 1st Mate exams + 18 months Second Mate sea passage",
    desc: "Heads deck division, plans complete cargo loading / discharging operations, ship stability calculations, and oversees emergency response routines."
  },
  {
    phase: "Phase 5: Command",
    title: "Captain Unlimited Master Mariner",
    timeline: "Age: 30+",
    salary: "$10,500 - $16,000/month",
    requirements: "Clear Master Mariner exams + Chief Mate command experience",
    desc: "Assumes supreme master command of the commercial shipping vessel. Responsible for overall operations, crew safety, port relations, and charterer mandates."
  }
];
