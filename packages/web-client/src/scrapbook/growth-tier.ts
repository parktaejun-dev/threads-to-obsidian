export interface GrowthMetric {
  value: number | null;
}

export interface GrowthInsightsData {
  overview: {
    followers: GrowthMetric;
    views: GrowthMetric;
    likes: GrowthMetric;
    replies: GrowthMetric;
    reposts: GrowthMetric;
  };
  posts: Array<{
    metrics: {
      views: GrowthMetric;
      likes: GrowthMetric;
      replies: GrowthMetric;
      reposts: GrowthMetric;
    };
  }>;
}

export type GrowthTierStr = "seed" | "sprout" | "quartz" | "amethyst" | "sapphire" | "emerald" | "diamond";
export type MedalTierStr = "iron" | "bronze" | "silver" | "gold" | "platinum";

export interface GrowthScoreResult {
  score: number;
  tier: GrowthTierStr;
  tierNameKr: string;
  tierNameEn: string;
}

export interface MedalResult {
  reach: MedalTierStr;
  community: MedalTierStr;
  engagement: MedalTierStr;
}

export interface HighlightResult {
  id: string;
  params: Record<string, string | number>;
  tone: "prestige" | "momentum" | "curiosity" | "default";
}

export function calculateGrowthScore(insights: GrowthInsightsData): GrowthScoreResult {
  const followers = insights.overview.followers.value ?? 0;
  const views = insights.overview.views.value ?? 0;
  const likes = insights.overview.likes.value ?? 0;
  const replies = insights.overview.replies.value ?? 0;
  const reposts = insights.overview.reposts.value ?? 0;

  const score = Math.floor(followers * 1.0 + views * 0.1 + (likes + replies + reposts) * 2.0);

  let tier: GrowthTierStr = "seed";
  let tierNameKr = "씨앗";
  let tierNameEn = "Seed";

  if (score >= 100000) {
    tier = "diamond";
    tierNameKr = "다이아몬드";
    tierNameEn = "Diamond";
  } else if (score >= 20000) {
    tier = "emerald";
    tierNameKr = "에메랄드";
    tierNameEn = "Emerald";
  } else if (score >= 5000) {
    tier = "sapphire";
    tierNameKr = "사파이어";
    tierNameEn = "Sapphire";
  } else if (score >= 1000) {
    tier = "amethyst";
    tierNameKr = "자수정";
    tierNameEn = "Amethyst";
  } else if (score >= 300) {
    tier = "quartz";
    tierNameKr = "수정";
    tierNameEn = "Quartz";
  } else if (score >= 100) {
    tier = "sprout";
    tierNameKr = "새싹";
    tierNameEn = "Sprout";
  }

  return { score, tier, tierNameKr, tierNameEn };
}

export function calculateMedals(insights: GrowthInsightsData): MedalResult {
  const views = insights.overview.views.value ?? 0;
  const followers = insights.overview.followers.value ?? 0;
  const engagementSum = (insights.overview.likes.value ?? 0) + (insights.overview.replies.value ?? 0) + (insights.overview.reposts.value ?? 0);

  const getReachTier = (v: number): MedalTierStr => {
    if (v >= 100000) return "platinum";
    if (v >= 10000) return "gold";
    if (v >= 1000) return "silver";
    if (v >= 100) return "bronze";
    return "iron";
  };

  const getCommunityTier = (v: number): MedalTierStr => {
    if (v >= 50000) return "platinum";
    if (v >= 5000) return "gold";
    if (v >= 500) return "silver";
    if (v >= 50) return "bronze";
    return "iron";
  };

  const getEngagementTier = (v: number): MedalTierStr => {
    if (v >= 10000) return "platinum";
    if (v >= 1000) return "gold";
    if (v >= 100) return "silver";
    if (v >= 10) return "bronze";
    return "iron";
  };

  return {
    reach: getReachTier(views),
    community: getCommunityTier(followers),
    engagement: getEngagementTier(engagementSum)
  };
}

export function selectHighlight(insights: GrowthInsightsData): HighlightResult {
  const posts = insights.posts;
  if (!posts || posts.length === 0) {
    return { id: "default", params: {}, tone: "default" };
  }

  // Calculate averages
  let totalViews = 0;
  let totalLikes = 0;
  let totalReplies = 0;
  let totalEngagements = 0;
  
  posts.forEach(post => {
    const v = post.metrics.views.value ?? 0;
    const l = post.metrics.likes.value ?? 0;
    const r = post.metrics.replies.value ?? 0;
    
    totalViews += v;
    totalLikes += l;
    totalReplies += r;
    totalEngagements += (l + r);
  });

  const avgViews = totalViews / posts.length;
  const avgReplies = totalReplies / posts.length;
  const avgEngageRate = totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;

  const candidates: HighlightResult[] = [];

  // Top post candidate
  const sortedByViews = [...posts].sort((a, b) => (b.metrics.views.value ?? 0) - (a.metrics.views.value ?? 0));
  const topPost = sortedByViews[0];
  if (topPost && (topPost.metrics.views.value ?? 0) > 0) {
    candidates.push({
      id: "top-post",
      params: { 
        views: topPost.metrics.views.value ?? 0, 
        likes: topPost.metrics.likes.value ?? 0 
      },
      tone: "prestige"
    });
  }

  // Reply magnet candidate
  const sortedByReplies = [...posts].sort((a, b) => (b.metrics.replies.value ?? 0) - (a.metrics.replies.value ?? 0));
  const topReplyPost = sortedByReplies[0];
  if (topReplyPost) {
    const replies = topReplyPost.metrics.replies.value ?? 0;
    if (replies >= 3 && avgReplies > 0 && replies >= avgReplies * 2) {
      candidates.push({
        id: "reply-magnet",
        params: { count: replies, multiplier: Math.floor(replies / Math.max(1, avgReplies)) },
        tone: "momentum"
      });
    }
  }

  // Reposted post candidate (replacing first-repost due to Phase 1 constraints)
  const sortedByReposts = [...posts].sort((a, b) => (b.metrics.reposts.value ?? 0) - (a.metrics.reposts.value ?? 0));
  const topRepostPost = sortedByReposts[0];
  if (topRepostPost) {
    const reposts = topRepostPost.metrics.reposts.value ?? 0;
    if (reposts > 0) {
      candidates.push({
        id: "reposted-post",
        params: { count: reposts },
        tone: "momentum"
      });
    }
  }

  // Engagement candidate
  const engageCandidates = posts.filter(p => {
    const v = p.metrics.views.value ?? 0;
    const e = (p.metrics.likes.value ?? 0) + (p.metrics.replies.value ?? 0);
    const r = v > 0 ? (e / v) * 100 : 0;
    return v >= 20 && r >= avgEngageRate * 2 && r > 0;
  }).sort((a, b) => {
    const va = a.metrics.views.value ?? 0;
    const ea = (a.metrics.likes.value ?? 0) + (a.metrics.replies.value ?? 0);
    const ra = va > 0 ? (ea / va) * 100 : 0;
    
    const vb = b.metrics.views.value ?? 0;
    const eb = (b.metrics.likes.value ?? 0) + (b.metrics.replies.value ?? 0);
    const rb = vb > 0 ? (eb / vb) * 100 : 0;
    return rb - ra; // higher rate first
  });

  if (engageCandidates.length > 0) {
    const bestEn = engageCandidates[0];
    const v = bestEn.metrics.views.value ?? 0;
    const e = (bestEn.metrics.likes.value ?? 0) + (bestEn.metrics.replies.value ?? 0);
    const rate = Math.floor((e / v) * 100);
    candidates.push({
      id: "high-engage",
      params: { rate },
      tone: "momentum"
    });
  }

  // Silent reach candidate
  const silentCandidates = posts.filter(p => {
    const v = p.metrics.views.value ?? 0;
    const l = p.metrics.likes.value ?? 0;
    return v >= avgViews * 3 && l <= 1 && v > 10;
  }).sort((a, b) => (b.metrics.views.value ?? 0) - (a.metrics.views.value ?? 0));

  if (silentCandidates.length > 0) {
    candidates.push({
      id: "silent-reach",
      params: { views: silentCandidates[0].metrics.views.value ?? 0 },
      tone: "curiosity"
    });
  }

  if (candidates.length === 0) {
    return { id: "default", params: {}, tone: "default" };
  }

  // 1. Prestige 2. Momentum 3. Curiosity
  const prestige = candidates.find(c => c.tone === "prestige");
  if (prestige) return prestige;
  
  const momentum = candidates.find(c => c.tone === "momentum");
  if (momentum) return momentum;

  const curiosity = candidates.find(c => c.tone === "curiosity");
  if (curiosity) return curiosity;

  return candidates[0];
}
