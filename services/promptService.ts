// Prompt Service
// Generates random reflection prompts and analyzes memory patterns locally
// No external API calls

const TOPICS = {
  work: ['work', 'job', 'office', 'project', 'meeting', 'deadline', 'career', 'busy'],
  family: ['family', 'mom', 'dad', 'sister', 'brother', 'kids', 'home', 'parents'],
  love: ['love', 'date', 'partner', 'relationship', 'heart', 'kiss', 'romantic'],
  nature: ['nature', 'park', 'tree', 'sun', 'rain', 'sky', 'beach', 'mountain', 'walk'],
  food: ['food', 'eat', 'dinner', 'lunch', 'breakfast', 'coffee', 'tea', 'restaurant', 'cook'],
  travel: ['travel', 'trip', 'flight', 'train', 'hotel', 'explore', 'vacation', 'journey'],
  growth: ['learn', 'study', 'read', 'book', 'grow', 'improve', 'challenge', 'goal']
};

const QUOTES = {
  Joyful: [
    "Happiness is not something ready made. It comes from your own actions.",
    "Let your joy burst forth like flowers in the spring.",
    "The most wasted of all days is one without laughter."
  ],
  Calm: [
    "Quiet the mind, and the soul will speak.",
    "Peace comes from within. Do not seek it without.",
    "Within you, there is a stillness and a sanctuary to which you can retreat at any time."
  ],
  Pensive: [
    "In silence, we find the answers we didn't know we sought.",
    "The unexamined life is not worth living.",
    "Reflection is the lamp of the heart."
  ],
  Dynamic: [
    "Life is a balance of holding on and letting go.",
    "The only way to make sense of change is to plunge into it.",
    "Action is the foundational key to all success."
  ],
  Sad: [
    "Tears are words that need to be written.",
    "Every storm runs out of rain.",
    "Healing takes courage, and we all have courage, even if we have to dig a little to find it."
  ]
};

const getTopic = (text: string) => {
  const lower = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPICS)) {
    if (keywords.some(k => lower.includes(k))) return topic;
  }
  return null;
};

export const getRandomPrompt = async () => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Slight delay
  const captions = [
    "A quiet moment of reflection, capturing the beauty of now.",
    "Time stands still in this memory, woven with light and shadow.",
    "A fleeting instant, preserved forever in the heart.",
    "The world moves on, but this feeling remains.",
    "Soft light and gentle thoughts fill this space.",
    "A pause in the journey to appreciate the view."
  ];
  return captions[Math.floor(Math.random() * captions.length)];
};

export const getMoodInsights = async (memories: { content: string, mood: string, date?: string }[]) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate analysis time

  if (memories.length === 0) {
    return {
      theme: "New Beginnings",
      insight: "Your journey is just starting.",
      digest: "The first pages of your story are waiting to be written. Embrace the blank canvas.",
      tags: ["#Start", "#New", "#Journey", "#Hope", "#Begin"],
      quote: "Every journey begins with a single step."
    };
  }

  // 1. Analyze Moods
  const moodCounts = memories.reduce((acc: any, m) => {
    acc[m.mood] = (acc[m.mood] || 0) + 1;
    return acc;
  }, {});
  const sortedMoods = Object.entries(moodCounts).sort((a: any, b: any) => b[1] - a[1]);
  const dominantMood = sortedMoods[0]?.[0] || "Mixed";

  // 2. Analyze Topics
  const topicCounts: Record<string, number> = {};
  memories.forEach(m => {
    const topic = getTopic(m.content);
    if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });
  const sortedTopics = Object.entries(topicCounts).sort((a: any, b: any) => b[1] - a[1]);
  const topTopic = sortedTopics[0]?.[0];

  // 3. Analyze Time (if available)
  let timeInsight = "";
  let weekendCount = 0;
  memories.forEach(m => {
    if (m.date) {
      const d = new Date(m.date);
      const day = d.getDay();
      if (day === 0 || day === 6) weekendCount++;
    }
  });
  const isWeekendVibe = weekendCount > memories.length / 2;

  // 4. Construct Digest
  let theme = "Evolving Journey";
  let insight = "Your path is unique and unfolding.";
  let digestParts = [];

  // Part 1: Mood Intro
  if (dominantMood === 'Joyful') {
    theme = "Radiant Days";
    insight = "Happiness flows through your recent moments.";
    digestParts.push("Laughter and light seem to follow you recently.");
  } else if (dominantMood === 'Calm') {
    theme = "Inner Peace";
    insight = "You are finding your center.";
    digestParts.push("A sense of tranquility pervades your memories.");
  } else if (dominantMood === 'Pensive') {
    theme = "Deep Thoughts";
    insight = "You are exploring the depths of your mind.";
    digestParts.push("Questions and contemplations weave through your days.");
  } else if (dominantMood === 'Sad') {
    theme = "Gentle Healing";
    insight = "It's okay to feel deeply.";
    digestParts.push("You've been navigating some heavy emotions lately.");
  } else {
    theme = "Colorful Mix";
    insight = "Life is a beautiful spectrum of emotions.";
    digestParts.push("Your recent days have been a rich tapestry of different feelings.");
  }

  // Part 2: Topic Connection
  if (topTopic) {
    if (topTopic === 'work') digestParts.push("Your professional life has been a significant focus, driving your energy.");
    if (topTopic === 'family') digestParts.push("Family connections are grounding you and providing warmth.");
    if (topTopic === 'love') digestParts.push("Romance or deep connection is highlighting your days.");
    if (topTopic === 'nature') digestParts.push("The natural world has been a source of comfort and inspiration.");
    if (topTopic === 'travel') digestParts.push("Adventure calls, and you are answering with exploration.");
    if (topTopic === 'food') digestParts.push("You've been savoring the flavors of life, quite literally.");
    if (topTopic === 'growth') digestParts.push("You are in a period of learning and self-improvement.");
  } else {
    digestParts.push("Various small moments are adding up to a bigger picture.");
  }

  // Part 3: Time/Advice
  if (isWeekendVibe) {
    digestParts.push("You seem to thrive most during your leisure time.");
  } else {
    digestParts.push("You are finding meaning in the daily rhythm of life.");
  }

  const digest = digestParts.join(" ");

  // 5. Generate Tags
  const tags = [`#${dominantMood}`];
  if (topTopic) tags.push(`#${topTopic.charAt(0).toUpperCase() + topTopic.slice(1)}`);
  if (isWeekendVibe) tags.push("#WeekendVibes");
  tags.push("#Life", "#Reflect");

  // 6. Select Quote
  const quoteList = QUOTES[dominantMood as keyof typeof QUOTES] || QUOTES['Dynamic'];
  const quote = quoteList[Math.floor(Math.random() * quoteList.length)];

  return {
    theme,
    insight,
    digest,
    tags: tags.slice(0, 4), // Limit to 4 tags
    quote
  };
};
