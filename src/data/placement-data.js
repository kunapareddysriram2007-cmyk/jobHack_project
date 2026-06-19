const SKILLS_CATALOG = [
  { id: "html-css", label: "HTML and CSS", category: "Frontend" },
  { id: "javascript", label: "JavaScript", category: "Frontend" },
  { id: "react", label: "React", category: "Frameworks" },
  { id: "testing", label: "Testing", category: "Quality" },
  { id: "communication", label: "Communication", category: "Career" },
  { id: "performance", label: "Performance", category: "Optimization" },
  { id: "api-integration", label: "API Integration", category: "Engineering" },
  { id: "git-github", label: "Git and GitHub", category: "Workflow" },
  { id: "accessibility", label: "Accessibility", category: "Frontend" },
  { id: "ui-design", label: "UI Design", category: "Design" },
  { id: "figma", label: "Figma", category: "Design" },
  { id: "aptitude", label: "Aptitude", category: "Placement" },
  { id: "dsa", label: "DSA", category: "Placement" }
];

const CAREER_TRACKS = [
  {
    id: "frontend-development",
    label: "Frontend Development",
    targetRoles: ["Frontend Developer", "Web Developer", "UI Engineer"],
    coreSkillIds: ["html-css", "javascript", "react", "testing", "git-github", "communication"],
    roadmap: [
      {
        title: "Stay eligible for the right drives",
        copy: "Keep your profile, CGPA, branch, and target role accurate so you can filter openings quickly."
      },
      {
        title: "Track each application with a next action",
        copy: "Move every role into the pipeline with a real deadline, resume version, and follow-up date."
      },
      {
        title: "Build proof for the missing skills",
        copy: "Turn weak frontend skills into portfolio work, certificates, and interview-ready examples."
      }
    ]
  },
  {
    id: "ui-experience",
    label: "UI and Experience",
    targetRoles: ["UI Developer", "Product Designer", "Experience Designer"],
    coreSkillIds: ["ui-design", "figma", "html-css", "communication", "accessibility", "react"],
    roadmap: [
      {
        title: "Clarify your design profile",
        copy: "Align your target role, location, and portfolio proof with the type of UI work you want."
      },
      {
        title: "Prepare for case-study discussion",
        copy: "Track interview rounds, portfolio versions, and product-thinking notes inside the same workspace."
      },
      {
        title: "Close demand-heavy gaps",
        copy: "Prioritize accessibility, responsive UI, and design-to-code execution if they appear across matching jobs."
      }
    ]
  },
  {
    id: "web-performance",
    label: "Web Performance",
    targetRoles: ["Performance Engineer", "Frontend Developer", "Web Optimization Analyst"],
    coreSkillIds: ["javascript", "performance", "testing", "api-integration", "accessibility", "communication"],
    roadmap: [
      {
        title: "Measure real delivery skills",
        copy: "Track proof for debugging, profiling, and performance-focused frontend work instead of generic readiness scores."
      },
      {
        title: "Handle hiring checkpoints early",
        copy: "Use the planner for aptitude, coding rounds, and interview follow-ups attached to each application."
      },
      {
        title: "Show impact with proof",
        copy: "Add projects, certificates, and practice proof that demonstrate speed, reliability, and measurable improvements."
      }
    ]
  }
];

const JOBS_CATALOG = [
  {
    id: "job-frontend-1",
    company: "Northstar Labs",
    title: "Front-End Intern",
    roleType: "internship",
    location: "Remote",
    salaryOrStipend: "INR 25,000/month",
    deadline: "2026-06-09",
    source: "Campus drive",
    jobUrl: "https://example.com/jobs/northstar-frontend-intern",
    careerTrackId: "frontend-development",
    eligibleBranches: ["CSE", "IT", "ECE"],
    minCgpa: 7.0,
    maxBacklogs: 0,
    summary: "Support dashboard features, responsive UI fixes, and frontend testing in a product team.",
    requiredSkillIds: ["html-css", "javascript", "react", "git-github"],
    preferredSkillIds: ["testing", "communication", "accessibility"]
  },
  {
    id: "job-frontend-2",
    company: "PulseStack",
    title: "Junior Web Developer",
    roleType: "full-time",
    location: "Bengaluru",
    salaryOrStipend: "INR 5.8 LPA",
    deadline: "2026-06-13",
    source: "Job board",
    jobUrl: "https://example.com/jobs/pulsestack-junior-web-developer",
    careerTrackId: "frontend-development",
    eligibleBranches: ["CSE", "IT", "EEE", "ECE"],
    minCgpa: 6.8,
    maxBacklogs: 1,
    summary: "Ship production UI work, work with APIs, and support reusable component delivery.",
    requiredSkillIds: ["html-css", "javascript", "react", "api-integration"],
    preferredSkillIds: ["testing", "communication", "git-github"]
  },
  {
    id: "job-frontend-3",
    company: "CampusGrid",
    title: "UI Engineer Trainee",
    roleType: "internship",
    location: "Hyderabad",
    salaryOrStipend: "INR 18,000/month",
    deadline: "2026-06-18",
    source: "Referral",
    jobUrl: "https://example.com/jobs/campusgrid-ui-engineer-trainee",
    careerTrackId: "frontend-development",
    eligibleBranches: ["CSE", "IT"],
    minCgpa: 7.2,
    maxBacklogs: 0,
    summary: "Work on polished student-facing interfaces, component cleanup, and accessibility fixes.",
    requiredSkillIds: ["html-css", "javascript", "react"],
    preferredSkillIds: ["accessibility", "testing", "communication"]
  },
  {
    id: "job-ui-1",
    company: "Orbit Campus",
    title: "UI Developer Trainee",
    roleType: "internship",
    location: "Hybrid",
    salaryOrStipend: "INR 20,000/month",
    deadline: "2026-06-12",
    source: "Campus drive",
    jobUrl: "https://example.com/jobs/orbit-campus-ui-trainee",
    careerTrackId: "ui-experience",
    eligibleBranches: ["CSE", "IT", "ECE", "Design"],
    minCgpa: 6.5,
    maxBacklogs: 0,
    summary: "Create responsive layouts, contribute to design implementation, and document UI decisions.",
    requiredSkillIds: ["ui-design", "figma", "html-css"],
    preferredSkillIds: ["react", "communication", "accessibility"]
  },
  {
    id: "job-ui-2",
    company: "MergeWorks",
    title: "Product Web Associate",
    roleType: "full-time",
    location: "Hyderabad",
    salaryOrStipend: "INR 6.2 LPA",
    deadline: "2026-06-19",
    source: "Referral",
    jobUrl: "https://example.com/jobs/mergeworks-product-web-associate",
    careerTrackId: "ui-experience",
    eligibleBranches: ["CSE", "IT", "ECE", "Design"],
    minCgpa: 7.0,
    maxBacklogs: 1,
    summary: "Own web quality, support content launches, and collaborate with product and design teams.",
    requiredSkillIds: ["ui-design", "communication", "html-css", "accessibility"],
    preferredSkillIds: ["react", "figma", "testing"]
  },
  {
    id: "job-ui-3",
    company: "CreateFlow",
    title: "Experience Design Intern",
    roleType: "internship",
    location: "Remote",
    salaryOrStipend: "INR 22,000/month",
    deadline: "2026-06-23",
    source: "Job board",
    jobUrl: "https://example.com/jobs/createflow-experience-design-intern",
    careerTrackId: "ui-experience",
    eligibleBranches: ["CSE", "IT", "Design"],
    minCgpa: 6.8,
    maxBacklogs: 0,
    summary: "Support design systems, accessibility reviews, and experience documentation for growth products.",
    requiredSkillIds: ["figma", "ui-design", "communication"],
    preferredSkillIds: ["accessibility", "html-css", "react"]
  },
  {
    id: "job-performance-1",
    company: "FrameRail",
    title: "Performance UI Associate",
    roleType: "full-time",
    location: "Remote",
    salaryOrStipend: "INR 7.1 LPA",
    deadline: "2026-06-16",
    source: "Job board",
    jobUrl: "https://example.com/jobs/framerail-performance-ui-associate",
    careerTrackId: "web-performance",
    eligibleBranches: ["CSE", "IT", "ECE"],
    minCgpa: 7.0,
    maxBacklogs: 0,
    summary: "Improve speed, reliability, and frontend performance for customer-facing web surfaces.",
    requiredSkillIds: ["javascript", "performance", "testing"],
    preferredSkillIds: ["react", "accessibility", "communication"]
  },
  {
    id: "job-performance-2",
    company: "Lattice Metrics",
    title: "Web Optimization Analyst",
    roleType: "full-time",
    location: "Pune",
    salaryOrStipend: "INR 6.8 LPA",
    deadline: "2026-06-24",
    source: "Campus drive",
    jobUrl: "https://example.com/jobs/lattice-metrics-web-optimization-analyst",
    careerTrackId: "web-performance",
    eligibleBranches: ["CSE", "IT", "ECE", "EEE"],
    minCgpa: 6.7,
    maxBacklogs: 1,
    summary: "Track web vitals, optimize resource loading, and support frontend engineering with measurable improvements.",
    requiredSkillIds: ["performance", "javascript", "api-integration"],
    preferredSkillIds: ["testing", "communication", "dsa"]
  },
  {
    id: "job-performance-3",
    company: "SpeedCanvas",
    title: "Frontend Reliability Intern",
    roleType: "internship",
    location: "Bengaluru",
    salaryOrStipend: "INR 24,000/month",
    deadline: "2026-06-27",
    source: "Referral",
    jobUrl: "https://example.com/jobs/speedcanvas-frontend-reliability-intern",
    careerTrackId: "web-performance",
    eligibleBranches: ["CSE", "IT", "ECE"],
    minCgpa: 7.1,
    maxBacklogs: 0,
    summary: "Support test reliability, debugging, and performance profiling for production UI journeys.",
    requiredSkillIds: ["testing", "performance", "javascript"],
    preferredSkillIds: ["react", "communication", "git-github"]
  }
];

const RESOURCES_CATALOG = [
  {
    id: "resource-js-foundations",
    title: "Modern JavaScript Foundations",
    provider: "SkillSprint Academy",
    type: "course",
    difficulty: "Beginner",
    duration: "3 weeks",
    skillTags: ["javascript", "git-github"],
    careerTrackIds: ["frontend-development", "web-performance"],
    url: "https://example.com/resources/modern-javascript-foundations"
  },
  {
    id: "resource-react-interfaces",
    title: "React Interfaces for Product Teams",
    provider: "SkillSprint Academy",
    type: "course",
    difficulty: "Intermediate",
    duration: "2 weeks",
    skillTags: ["react", "html-css", "api-integration"],
    careerTrackIds: ["frontend-development"],
    url: "https://example.com/resources/react-interfaces"
  },
  {
    id: "resource-accessibility-audit",
    title: "Accessibility Audit Workshop",
    provider: "CreateLab",
    type: "workshop",
    difficulty: "Intermediate",
    duration: "5 days",
    skillTags: ["accessibility", "html-css", "communication"],
    careerTrackIds: ["frontend-development", "ui-experience", "web-performance"],
    url: "https://example.com/resources/accessibility-audit"
  },
  {
    id: "resource-figma-to-code",
    title: "Figma to Code Workflow",
    provider: "CreateLab",
    type: "course",
    difficulty: "Intermediate",
    duration: "2 weeks",
    skillTags: ["figma", "ui-design", "html-css"],
    careerTrackIds: ["ui-experience"],
    url: "https://example.com/resources/figma-to-code"
  },
  {
    id: "resource-ui-case-study",
    title: "UI Case Study Practice Pack",
    provider: "CreateLab",
    type: "practice",
    difficulty: "Intermediate",
    duration: "1 week",
    skillTags: ["communication", "ui-design", "figma"],
    careerTrackIds: ["ui-experience"],
    url: "https://example.com/resources/ui-case-study-pack"
  },
  {
    id: "resource-web-vitals",
    title: "Core Web Vitals Lab",
    provider: "LaunchPad Academy",
    type: "lab",
    difficulty: "Intermediate",
    duration: "10 days",
    skillTags: ["performance", "testing", "javascript"],
    careerTrackIds: ["web-performance"],
    url: "https://example.com/resources/core-web-vitals-lab"
  },
  {
    id: "resource-api-debugging",
    title: "Frontend API Debugging Drills",
    provider: "LaunchPad Academy",
    type: "practice",
    difficulty: "Intermediate",
    duration: "1 week",
    skillTags: ["api-integration", "javascript", "testing"],
    careerTrackIds: ["frontend-development", "web-performance"],
    url: "https://example.com/resources/api-debugging-drills"
  },
  {
    id: "resource-placement-aptitude",
    title: "Campus Aptitude Revision Plan",
    provider: "Placement Sprint",
    type: "practice",
    difficulty: "Beginner",
    duration: "2 weeks",
    skillTags: ["aptitude", "dsa", "communication"],
    careerTrackIds: ["frontend-development", "ui-experience", "web-performance"],
    url: "https://example.com/resources/campus-aptitude-revision"
  }
];

const HOME_SIGNALS = [
  "Check eligibility before you waste time on drives you cannot clear.",
  "Track every application with a deadline, next action, resume version, and interview round notes.",
  "See which skills the market keeps asking for and where your current profile is still weak.",
  "Attach proof like projects, certificates, coding practice, and mock interviews to the skills that matter."
];

export {
  CAREER_TRACKS,
  HOME_SIGNALS,
  JOBS_CATALOG,
  RESOURCES_CATALOG,
  SKILLS_CATALOG
};
