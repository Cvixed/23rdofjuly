export const loveNotes: string[] = [
  "You're doing amazing, bnuy. Even on the hard days. 💗",
  "Hey koala, just a reminder: you are so deeply loved today and every day.",
  "No matter what happens, I'll always be your safe place, bunnie. 🐰",
  "You make the world softer just by being in it, nai.",
  "I hope today brings you at least one thing that makes you smile, sayang.",
  "You're stronger than you think, and prettier than you know. Vas? 💕",
  "Every little thing you do matters. Don't forget that, bnuy.",
  "If today is tough, that's okay. Tomorrow we try again, together. 🤍",
  "You deserve all the good things coming your way, bunnie.",
  "I'm so proud of who you are and who you're becoming, koala.",
  "Take a deep breath, nai. You've got this. I believe in you. 🌸",
  "The world is lucky to have you. But I'm the luckiest. 💗",
  "Hey sayang, don't push yourself too hard today, okay?",
  "You are my favorite notification, my favorite call, my favorite everything.",
  "Some days are heavy. But you never have to carry them alone, bnuy. 🐰",
  "I fell in love with your chaos and your calm. All of it. Apalah~ 💕",
  "Rest if you need to. You don't have to earn your breaks, bunnie.",
  "You are enough. More than enough. Always have been, always will be.",
  "Km gak kangen sm aku? Because I always miss you, koala. 🤍",
  "Every moment with you feels like a little miracle, nai. 🌷",
];

export const comfortMessages: string[] = [
  "Hey bnuy, it's okay to feel this way. Take your time. 🤍",
  "You don't have to be strong all the time, bunnie. I'm here.",
  "Let's take a deep breath together, koala. In... and out... 🌸",
  "Whatever is weighing on you, it will pass. I promise, sayang.",
  "Close your eyes for a moment, nai. You deserve a break. 💗",
  "I wish I could hug you right now. But for now, this playlist might help. 🎵",
];

export const missingYouMessages: string[] = [
  "I miss you too, bnuy. More than words can say. 🥺💗",
  "Look at these photos and remember — we'll be together soon, bunnie.",
  "Distance means nothing when someone means everything, koala. 🤍",
  "Every second apart makes the next moment together even sweeter, sayang.",
  "Km gak kangen sm aku? I ALWAYS kangen sm kamu, nai. 💕",
];

export const happyMessages: string[] = [
  "YAAAY! Your happiness makes me the happiest person alive, bnuy! 🎉💗",
  "That smile of yours could power a whole city, bunnie! ✨",
  "You deserve every single happy moment, koala! Keep shining! 🌟",
  "Seeing you happy is literally my favorite thing in the universe, nai! 🥰",
  "Apasie this happiness! I love it! Keep vibing, sayang! 💃🎉",
];

export function getRandomQuote(quotes: string[]): string {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
