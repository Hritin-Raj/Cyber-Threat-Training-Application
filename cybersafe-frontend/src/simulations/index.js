// Registry of all 12 visual simulations
import PhishingEmailAnalyzer   from "./beginner/PhishingEmailAnalyzer";
import PasswordStrengthBuilder from "./beginner/PasswordStrengthBuilder";
import SafeWebsiteDetector     from "./beginner/SafeWebsiteDetector";
import SocialEngineeringChat   from "./intermediate/SocialEngineeringChat";
import MalwareDownloadTrap     from "./intermediate/MalwareDownloadTrap";
import PermissionAbuseDetector from "./intermediate/PermissionAbuseDetector";
import NetworkTrafficMonitor   from "./advanced/NetworkTrafficMonitor";
import FakeBankingPortal       from "./advanced/FakeBankingPortal";
import RansomwareSimulation    from "./advanced/RansomwareSimulation";
import LiveAttackResponse      from "./pro/LiveAttackResponse";
import PhishingCampaignAnalysis from "./pro/PhishingCampaignAnalysis";
import InsiderThreatDetection  from "./pro/InsiderThreatDetection";

export const VISUAL_SIMULATIONS = [
  // ── BEGINNER ──────────────────────────────────────────────────────────────
  {
    id:          "phishing-email-analyzer",
    component:   PhishingEmailAnalyzer,
    title:       "Phishing Email Analyzer",
    description: "Dissect a realistic phishing email and flag every suspicious element before the victim clicks.",
    level:       "beginner",
    category:    "Phishing",
    icon:        "📧",
    timeLimit:   300,
    maxScore:    100,
    xp:          100,
    tags:        ["phishing", "email", "social engineering"],
  },
  {
    id:          "password-strength-builder",
    component:   PasswordStrengthBuilder,
    title:       "Password Strength Builder",
    description: "Build the strongest password possible using a live strength meter and crack-time estimation.",
    level:       "beginner",
    category:    "Password Security",
    icon:        "🔐",
    timeLimit:   300,
    maxScore:    100,
    xp:          100,
    tags:        ["password", "authentication", "brute force"],
  },
  {
    id:          "safe-website-detector",
    component:   SafeWebsiteDetector,
    title:       "Safe vs Unsafe Website Detector",
    description: "Examine browser mockups to determine which sites are legitimate and which are phishing clones.",
    level:       "beginner",
    category:    "Web Security",
    icon:        "🌐",
    timeLimit:   300,
    maxScore:    100,
    xp:          100,
    tags:        ["url", "https", "phishing", "browser"],
  },
  // ── INTERMEDIATE ──────────────────────────────────────────────────────────
  {
    id:          "social-engineering-chat",
    component:   SocialEngineeringChat,
    title:       "Social Engineering Chat",
    description: "A branching chat conversation with an attacker posing as IT support. Every choice has consequences.",
    level:       "intermediate",
    category:    "Social Engineering",
    icon:        "💬",
    timeLimit:   300,
    maxScore:    100,
    xp:          120,
    tags:        ["social engineering", "vishing", "pretexting"],
  },
  {
    id:          "malware-download-trap",
    component:   MalwareDownloadTrap,
    title:       "Malware Download Trap",
    description: "Evaluate 5 suspicious files and decide to Download, Scan First, or Ignore each one.",
    level:       "intermediate",
    category:    "Malware",
    icon:        "📥",
    timeLimit:   300,
    maxScore:    100,
    xp:          120,
    tags:        ["malware", "downloads", "file safety"],
  },
  {
    id:          "permission-abuse-detector",
    component:   PermissionAbuseDetector,
    title:       "Permission Abuse Detector",
    description: "Review mobile app permission requests and identify which apps are asking for too much.",
    level:       "intermediate",
    category:    "Privacy",
    icon:        "🧾",
    timeLimit:   300,
    maxScore:    100,
    xp:          120,
    tags:        ["permissions", "privacy", "mobile security"],
  },
  // ── ADVANCED ──────────────────────────────────────────────────────────────
  {
    id:          "network-traffic-monitor",
    component:   NetworkTrafficMonitor,
    title:       "Network Traffic Monitor",
    description: "Analyze live-streaming network packets and flag anomalies before the attacker completes the kill chain.",
    level:       "advanced",
    category:    "Network Security",
    icon:        "🖥️",
    timeLimit:   300,
    maxScore:    100,
    xp:          150,
    tags:        ["network", "intrusion detection", "packets", "C2"],
  },
  {
    id:          "fake-banking-portal",
    component:   FakeBankingPortal,
    title:       "Fake Banking Portal Detection",
    description: "Inspect a convincing banking website clone — find all 6 hidden red flags before submitting credentials.",
    level:       "advanced",
    category:    "Phishing",
    icon:        "🏦",
    timeLimit:   300,
    maxScore:    100,
    xp:          150,
    tags:        ["phishing", "banking", "HTTPS", "certificates"],
  },
  {
    id:          "ransomware-simulation",
    component:   RansomwareSimulation,
    title:       "Ransomware Attack Simulation",
    description: "Files are being encrypted in real time — choose the correct emergency response actions to contain the damage.",
    level:       "advanced",
    category:    "Malware",
    icon:        "🧬",
    timeLimit:   300,
    maxScore:    100,
    xp:          150,
    tags:        ["ransomware", "incident response", "containment"],
  },
  // ── PRO ───────────────────────────────────────────────────────────────────
  {
    id:          "live-attack-response",
    component:   LiveAttackResponse,
    title:       "Live Attack Response — SOC Dashboard",
    description: "A full APT attack unfolds on your SIEM. Triage alerts and respond with the correct containment actions under time pressure.",
    level:       "pro",
    category:    "Incident Response",
    icon:        "🧑‍💻",
    timeLimit:   300,
    maxScore:    100,
    xp:          200,
    tags:        ["SOC", "SIEM", "APT", "incident response"],
  },
  {
    id:          "phishing-campaign-analysis",
    component:   PhishingCampaignAnalysis,
    title:       "Phishing Campaign Analysis",
    description: "Analyze 8 corporate emails using header data (SPF, DKIM, DMARC, IPs). Classify each as phishing or legitimate.",
    level:       "pro",
    category:    "Phishing",
    icon:        "🛰️",
    timeLimit:   300,
    maxScore:    100,
    xp:          200,
    tags:        ["phishing", "email headers", "SPF", "DKIM", "threat hunting"],
  },
  {
    id:          "insider-threat-detection",
    component:   InsiderThreatDetection,
    title:       "Insider Threat Detection",
    description: "Review 6 employees' full activity logs and identify which ones are insider threats — no automated flags.",
    level:       "pro",
    category:    "Threat Intelligence",
    icon:        "🔍",
    timeLimit:   300,
    maxScore:    100,
    xp:          200,
    tags:        ["insider threat", "UEBA", "data exfiltration", "forensics"],
  },
];

export const LEVELS_ORDER = ["beginner", "intermediate", "advanced", "pro"];

export const LEVEL_META = {
  beginner:     { label: "Beginner",     color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: "🟢" },
  intermediate: { label: "Intermediate", color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    icon: "🟡" },
  advanced:     { label: "Advanced",     color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20",  icon: "🔴" },
  pro:          { label: "Pro",          color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   icon: "⚫" },
};

export const getSimById = (id) => VISUAL_SIMULATIONS.find((s) => s.id === id);
