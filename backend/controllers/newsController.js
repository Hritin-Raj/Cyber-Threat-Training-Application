import Parser from "rss-parser";

const parser = new Parser();

// RSS feeds for cybersecurity news
const RSS_FEEDS = [
  { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News", category: "general" },
  { url: "https://krebsonsecurity.com/feed/", source: "Krebs on Security", category: "general" },
  { url: "https://www.darkreading.com/rss.xml", source: "Dark Reading", category: "general" },
  { url: "https://www.bleepingcomputer.com/feed/", source: "BleepingComputer", category: "malware" },
  { url: "https://threatpost.com/feed/", source: "Threatpost", category: "general" },
];

// Category keywords for auto-categorization
const CATEGORY_KEYWORDS = {
  phishing: ["phishing", "spear phishing", "whaling", "email scam", "social engineering"],
  malware: ["malware", "ransomware", "virus", "trojan", "botnet", "rootkit", "spyware"],
  privacy: ["privacy", "GDPR", "data breach", "data leak", "PII", "tracking", "surveillance"],
  network: ["network", "firewall", "VPN", "DDoS", "intrusion", "zero-day", "vulnerability", "exploit"],
};

const categorizeArticle = (title, summary) => {
  const text = (title + " " + summary).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }
  return "general";
};

// Cache for news articles
let newsCache = { articles: [], lastFetched: null };
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Fallback articles when feeds are unavailable
const FALLBACK_ARTICLES = [
  {
    id: "fallback-1",
    title: "Understanding the Latest Ransomware Trends in 2024",
    summary: "Ransomware attacks continue to evolve with new tactics targeting critical infrastructure. Learn how to protect your organization.",
    url: "https://www.cisa.gov/ransomware",
    source: "CISA",
    category: "malware",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
  },
  {
    id: "fallback-2",
    title: "How to Protect Yourself from Phishing Attacks",
    summary: "Phishing remains the #1 attack vector. This guide covers email analysis, URL inspection, and reporting suspicious messages.",
    url: "https://www.cisa.gov/phishing",
    source: "CISA",
    category: "phishing",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
  },
  {
    id: "fallback-3",
    title: "Zero-Trust Architecture: A Modern Security Framework",
    summary: "Organizations are adopting zero-trust models to combat insider threats and sophisticated breaches. Here's what you need to know.",
    url: "https://www.nist.gov/publications/zero-trust-architecture",
    source: "NIST",
    category: "network",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
  },
  {
    id: "fallback-4",
    title: "Data Privacy Regulations: GDPR, CCPA, and What Comes Next",
    summary: "Global privacy regulations are tightening. Understand your rights and what companies must do to protect your personal data.",
    url: "https://www.cisa.gov/privacy",
    source: "CISA",
    category: "privacy",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
  },
  {
    id: "fallback-5",
    title: "Supply Chain Attacks: The New Frontier of Cyber Warfare",
    summary: "From SolarWinds to XZ Utils, supply chain attacks are increasing. Learn how attackers compromise trusted software to reach their real targets.",
    url: "https://www.cisa.gov/supply-chain-compromise",
    source: "CISA",
    category: "network",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
  },
  {
    id: "fallback-6",
    title: "Password Security Best Practices for 2024",
    summary: "A comprehensive guide to creating strong passwords, using password managers, and implementing multi-factor authentication.",
    url: "https://www.cisa.gov/secure-our-world/use-strong-passwords",
    source: "CISA",
    category: "privacy",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
  },
  {
    id: "fallback-7",
    title: "AI-Powered Cyberattacks: What Security Teams Need to Know",
    summary: "Generative AI is enabling more sophisticated phishing, deepfakes, and automated attacks. Learn how defenders are fighting back.",
    url: "https://www.cisa.gov/ai",
    source: "CISA",
    category: "general",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
  },
  {
    id: "fallback-8",
    title: "Network Security Fundamentals: Firewalls, IDS, and More",
    summary: "A deep dive into network security controls, from traditional firewalls to modern SASE architectures and XDR platforms.",
    url: "https://www.cisa.gov/network-security",
    source: "CISA",
    category: "network",
    publishedAt: new Date().toISOString(),
    imageUrl: null,
  },
];

const fetchRSSFeed = async (feed) => {
  try {
    const feedData = await parser.parseURL(feed.url);
    return feedData.items.slice(0, 8).map((item, index) => {
      const summary = item.contentSnippet || item.summary || item.content?.replace(/<[^>]*>/g, "").slice(0, 200) || "";
      return {
        id: `${feed.source}-${index}-${Date.now()}`,
        title: item.title || "Untitled",
        summary: summary.slice(0, 300) + (summary.length > 300 ? "..." : ""),
        url: item.link || "#",
        source: feed.source,
        category: categorizeArticle(item.title || "", summary),
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        imageUrl: item.enclosure?.url || null,
      };
    });
  } catch (error) {
    console.log(`Failed to fetch ${feed.source}: ${error.message}`);
    return [];
  }
};

export const getNews = async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;

    // Check cache
    const now = Date.now();
    if (!newsCache.lastFetched || now - newsCache.lastFetched > CACHE_DURATION || newsCache.articles.length === 0) {
      // Fetch from RSS feeds
      const feedPromises = RSS_FEEDS.map((feed) => fetchRSSFeed(feed));
      const results = await Promise.allSettled(feedPromises);
      const allArticles = results
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value);

      if (allArticles.length > 0) {
        newsCache.articles = allArticles.sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        newsCache.lastFetched = now;
      } else {
        // Use fallback if all feeds fail
        newsCache.articles = FALLBACK_ARTICLES;
        newsCache.lastFetched = now;
      }
    }

    let articles = newsCache.articles;
    if (category && category !== "all") {
      articles = articles.filter((a) => a.category === category);
    }

    const start = (page - 1) * limit;
    const paginated = articles.slice(start, start + Number(limit));

    res.json({
      success: true,
      articles: paginated,
      total: articles.length,
      page: Number(page),
      pages: Math.ceil(articles.length / limit),
      cached: !!newsCache.lastFetched,
    });
  } catch (error) {
    console.error("News error:", error);
    // Return fallback articles on error
    res.json({
      success: true,
      articles: FALLBACK_ARTICLES,
      total: FALLBACK_ARTICLES.length,
      page: 1,
      pages: 1,
      cached: false,
    });
  }
};
