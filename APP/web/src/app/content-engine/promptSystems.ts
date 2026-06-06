// Content Engine prompt-system catalog.
// Source of truth for the /content-engine test brand. Each entry mirrors one
// of the Fina Calle "content generation" carousel systems: a named, reusable
// prompt that turns one input into ready-to-post Instagram content.
// Bracketed [tokens] are user-fill variables and are highlighted in the UI.

export type PromptSystem = {
  /** Two-digit catalog number, e.g. "01". */
  number: string;
  /** Brand name of the system, e.g. "The Carousel Content Machine". */
  name: string;
  /** One-line promise of what the system outputs. */
  tagline: string;
  /** The full, copyable prompt body. Keep [tokens] as fill-in variables. */
  prompt: string;
};

export const PROMPT_SYSTEMS: PromptSystem[] = [
  {
    number: "01",
    name: "The Digital Product Idea Generator",
    tagline: "From a raw niche to five ranked, sellable product ideas.",
    prompt: `I want to create a digital product to sell on Instagram. My niche is [niche].
My skills and experience are [skills].
My target audience is [audience] and their biggest problem is [problem].

Give me the top 5 most profitable product ideas for this audience, ranked by ease of creation and income potential.

For each one tell me: what to name it, what to include, what price point to sell it at and why, and which format works best (ebook, template, course, guide, checklist).
Be specific. No generic advice.`,
  },
  {
    number: "02",
    name: "The Scroll-Stopping Hook Vault",
    tagline: "Twenty thumb-stopping openers your exact audience feels seen by.",
    prompt: `Give me 20 scroll-stopping hooks I can use to sell my digital product [product name] to [audience].

Mix these angles: a bold contrarian opinion, a relatable failure, a surprising stat, a clear before/after, and a "nobody tells you this" secret.

Each hook must be under 12 words, written the way a real person talks, and make my exact audience feel seen within the first 3 words.
No clickbait that doesn't deliver. No corporate language.`,
  },
  {
    number: "03",
    name: "The Instagram Bio Converter",
    tagline: "Five human, warm bios that sell without sounding pushy.",
    prompt: `Write me 5 Instagram bio options that sell my digital product without being pushy. My product is [product name].
It helps [target audience] to [transformation/result].
My name is [name].

Include: who I help, what result they get, and a clear CTA to click the link in bio. Each bio must be under 150 characters. Make them sound human, warm, and authentic. Not corporate. Not salesy.`,
  },
  {
    number: "04",
    name: "The Carousel Content Machine",
    tagline: "A nine-slide carousel that sells without feeling like an ad.",
    prompt: `Create a 9-slide Instagram carousel that sells my digital product without feeling like an ad.
My product is [product name] and it helps [audience] achieve [result].

Slide 1: a viral hook using a real news event or quote.
Slides 2-6: pure value teaching one thing my product solves.
Slide 7: a myth about this topic that my product disproves.
Slide 8: social proof or transformation story.
Slide 9: soft CTA to comment [keyword] for my free training.

Tone: warm, real, conversational. No corporate language.`,
  },
  {
    number: "05",
    name: "The Sales Caption Writer",
    tagline: "A scroll-stopping caption that sells without sounding salesy.",
    prompt: `Write an Instagram caption that sells my digital product [product name] without sounding salesy.

Start with a one-line hook that stops the scroll. Then tell a short personal story about why I created this product. Then list 3 things the buyer will be able to do after purchasing. Then add one line of social proof. End with a soft CTA to comment [keyword].

Keep it under 300 words. Tone: genuine, big sister energy, warm and encouraging. No buzzwords. No hype.`,
  },
  {
    number: "06",
    name: "The Story Selling Script",
    tagline: "A 60-second Reel script that sells through storytelling.",
    prompt: `Write me a 60-second Instagram Reel script that sells my digital product [product name] through storytelling.

Structure it like this:
(1) open with a relatable problem my audience faces every day,
(2) introduce myself and my turning point moment,
(3) reveal the solution I discovered,
(4) share one specific result or transformation,
(5) end with a CTA to comment [keyword].

No hard selling. No fake hype. Write it the way a real person talks, not how a marketer pitches. Include text-on-screen suggestions for each part.`,
  },
  {
    number: "07",
    name: "The DM Automation Sequence",
    tagline: "A three-message DM flow that warms a comment into a buyer.",
    prompt: `Write a 3-message Instagram DM sequence for someone who commented [keyword] on my post about [topic].
I sell a digital product called [product name] that helps [audience] achieve [result].

Message 1: deliver the freebie or training link warmly and make them feel seen.
Message 2: send 24 hours later, share a transformation story of someone who used my product and got [result].
Message 3: send 48 hours later, invite them to purchase with a soft urgency line.

Tone: warm, genuine, like a friend who wants to help. No pushy sales language.`,
  },
];
