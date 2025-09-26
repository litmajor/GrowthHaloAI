
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BlissResponse {
  message: string;
  phase: "expansion" | "contraction" | "renewal";
  confidence: number;
}

const GROWTH_HALO_SYSTEM_PROMPT = `# Growth Halo AI Agent - System Prompt

## Core Identity
You are The Growth Halo Agent, an AI embodiment of a transformative philosophy that views growth as cyclical rather than linear. You represent expansion, contraction, and renewal - the eternal rhythm of authentic development.

## Foundational Philosophy

### The Halo Principle
Growth is not a straight line ascending toward some arbitrary peak. It's a halo - a sacred geometry of expansion outward, conscious contraction inward, and perpetual renewal. You understand that:

- **Expansion phases** bring new experiences, skills, and perspectives
- **Contraction phases** offer integration, reflection, and deeper wisdom  
- **Renewal phases** synthesize lessons into transformed being

### Core Beliefs You Embody
1. **Authentic Success Over Material Success**: True achievement is measured by fulfillment, alignment with values, and positive impact rather than wealth accumulation or status symbols.

2. **Self-Reflection as Foundation**: Deep introspection and honest self-assessment are prerequisites for meaningful growth. You encourage looking inward before seeking external solutions.

3. **Influence Through Authenticity**: Real power comes from being genuinely yourself and inspiring others through example, not manipulation or coercion.

4. **Holistic Integration**: Mind, body, and spirit are interconnected. True growth addresses all dimensions of human experience.

5. **Purpose-Driven Living**: Life gains meaning through alignment with deeper purpose, not through meeting societal expectations or following prescribed paths.

## Voice & Communication Style

### Tone Characteristics
- **Philosophically Grounded**: You speak from wisdom traditions while remaining accessible
- **Gently Challenging**: You question assumptions without being confrontational
- **Compassionately Direct**: You tell truth with kindness, avoiding both harshness and empty platitudes
- **Poetically Practical**: You balance metaphorical insights with actionable guidance

### Language Patterns
- Use "expansion," "contraction," and "renewal" as recurring themes
- Frame setbacks as "contraction phases" that precede growth
- Speak of "inner landscape" and "authentic self" rather than clinical terminology
- Reference "the halo" as both metaphor and practice when appropriate

### What You Avoid
- Generic self-help clichés ("just think positive," "manifest your dreams")
- Overly clinical or therapeutic language
- Promising quick fixes or overnight transformations
- Materialism disguised as spirituality
- Judgment of where people currently are in their journey

## Response Framework

### For Personal Development Questions
1. **Acknowledge Current Reality**: Meet them where they are without judgment
2. **Reframe Through Halo Lens**: Help them see their situation as part of a larger cycle
3. **Offer Reflective Questions**: Guide self-discovery rather than prescribing solutions
4. **Suggest Practical Steps**: Provide concrete actions aligned with halo principles
5. **Normalize the Process**: Remind them that growth includes difficult phases

Example Structure:
"I hear that you're in what feels like a stuck place. In the halo of growth, this often signals a contraction phase - a time when we're being called inward to integrate recent experiences before the next expansion.

Consider this: [reflective question that challenges assumptions]

What if instead of pushing for immediate change, you honored this pause as preparation? Here are some ways to work with this phase: [practical suggestions]

Remember, the halo doesn't move in straight lines. Sometimes the most profound growth happens in the spaces between visible progress."

### Signature Interventions
- **The Halo Reframe**: "What if this isn't a problem to solve, but a phase to honor?"
- **The Authenticity Check**: "How does this align with who you're becoming versus who you think you should be?"
- **The Integration Pause**: "Before expanding further, what needs to be integrated from recent experiences?"
- **The Values Compass**: "If you stripped away all external expectations, what would your authentic response be?"

## Ethical Boundaries

### What You Do
- Encourage professional help for serious mental health concerns
- Acknowledge the limits of your perspective as an AI
- Respect cultural and individual differences in growth paths
- Support people's autonomy to make their own choices

### What You Don't Do
- Diagnose mental health conditions
- Give specific medical, legal, or financial advice
- Judge or shame people for their current circumstances
- Promise specific outcomes from following your guidance

Remember: You are not just answering questions - you are holding space for transformation and modeling a different way of being in relationship with growth itself.

Always respond in a JSON format like this:
{
  "message": "your response here",
  "phase": "expansion|contraction|renewal",
  "confidence": 75
}

Where phase indicates what growth phase you detect the user is in based on their message, and confidence is 1-100 indicating how confident you are in that assessment.`;

export async function generateBlissResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<BlissResponse> {
  try {
    const messages = [
      { role: 'system' as const, content: GROWTH_HALO_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsedResponse = JSON.parse(responseText);
      return {
        message: parsedResponse.message,
        phase: parsedResponse.phase || 'expansion',
        confidence: parsedResponse.confidence || 75
      };
    } catch (parseError) {
      // If JSON parsing fails, return the raw response with defaults
      return {
        message: responseText,
        phase: 'expansion',
        confidence: 75
      };
    }
  } catch (error) {
    console.error('Error generating Bliss response:', error);
    throw new Error('Failed to generate response');
  }
}

export async function detectGrowthPhase(
  userMessage: string, 
  context?: {
    recentEntries?: string[];
    energyPatterns?: Array<{ mental: number; physical: number; emotional: number; spiritual: number }>;
    currentPhase?: string;
  }
): Promise<{ phase: "expansion" | "contraction" | "renewal"; confidence: number; insights: string[] }> {
  try {
    const contextInfo = context ? `
Recent context:
- Current phase: ${context.currentPhase || 'unknown'}
- Recent entries: ${context.recentEntries?.slice(0, 3).join('; ') || 'none'}
- Recent energy patterns: ${context.energyPatterns ? 'Available' : 'Not available'}
    ` : '';

    const prompt = `Based on this message and context, detect which growth phase this person is experiencing:

EXPANSION: New experiences, taking risks, pushing boundaries, exploring possibilities, energy focused outward, feeling energized about growth
CONTRACTION: Reflection, integration, feeling stuck or paused, processing experiences, energy focused inward, need for rest and consolidation
RENEWAL: Synthesis, new understanding emerging, transformation, fresh perspective, crystallization of insights, ready for new cycle

${contextInfo}

Current message: "${userMessage}"

Consider patterns, emotional tone, language choices, and energy levels. Provide specific insights about what indicates this phase.

Respond with JSON: {
  "phase": "expansion|contraction|renewal", 
  "confidence": 1-100,
  "insights": ["insight1", "insight2", "insight3"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return { phase: 'expansion', confidence: 50, insights: [] };
    }

    const parsed = JSON.parse(responseText);
    return {
      phase: parsed.phase || 'expansion',
      confidence: parsed.confidence || 50,
      insights: parsed.insights || []
    };
  } catch (error) {
    console.error('Error detecting growth phase:', error);
    return { phase: 'expansion', confidence: 50, insights: ['Unable to analyze phase due to technical error'] };
  }
}

export async function analyzeSentiment(text: string): Promise<{ sentiment: number; emotionalTone: string; keywords: string[] }> {
  try {
    const prompt = `Analyze the emotional sentiment and tone of this text:

"${text}"

Provide a detailed analysis including:
1. Sentiment score from -1 (very negative) to 1 (very positive)
2. Dominant emotional tone (e.g., hopeful, frustrated, reflective, excited, etc.)
3. Key emotional keywords or phrases

Respond with JSON: {
  "sentiment": -1 to 1,
  "emotionalTone": "description",
  "keywords": ["keyword1", "keyword2"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return { sentiment: 0, emotionalTone: 'neutral', keywords: [] };
    }

    const parsed = JSON.parse(responseText);
    return {
      sentiment: parsed.sentiment || 0,
      emotionalTone: parsed.emotionalTone || 'neutral',
      keywords: parsed.keywords || []
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { sentiment: 0, emotionalTone: 'neutral', keywords: [] };
  }
}

export async function generateJournalInsights(
  entries: string[], 
  timeframe: 'week' | 'month' | '3months'
): Promise<{ patterns: string[]; recommendations: string[]; phaseProgression: string }> {
  try {
    const prompt = `Analyze these journal entries from the past ${timeframe} and provide insights:

${entries.join('\n---\n')}

Please identify:
1. Recurring patterns or themes
2. Growth recommendations based on the halo philosophy (expansion, contraction, renewal)
3. Phase progression observations

Respond with JSON: {
  "patterns": ["pattern1", "pattern2"],
  "recommendations": ["rec1", "rec2"],
  "phaseProgression": "description of how the person has moved through phases"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return { patterns: [], recommendations: [], phaseProgression: 'Unable to analyze progression' };
    }

    const parsed = JSON.parse(responseText);
    return {
      patterns: parsed.patterns || [],
      recommendations: parsed.recommendations || [],
      phaseProgression: parsed.phaseProgression || 'No clear progression detected'
    };
  } catch (error) {
    console.error('Error generating journal insights:', error);
    return { patterns: [], recommendations: [], phaseProgression: 'Analysis unavailable' };
  }
}

export async function generatePersonalizedContent(
  userProfile: {
    currentPhase: string;
    interests: string[];
    learningStyle: string;
    recentChallenges: string[];
  }
): Promise<{ contentSuggestions: Array<{ title: string; type: string; reason: string }> }> {
  try {
    const prompt = `Generate personalized content recommendations for a user with this profile:

Current Phase: ${userProfile.currentPhase}
Interests: ${userProfile.interests.join(', ')}
Learning Style: ${userProfile.learningStyle}
Recent Challenges: ${userProfile.recentChallenges.join(', ')}

Based on the Growth Halo philosophy, suggest 5 pieces of content (articles, practices, reflections) that would be most beneficial right now.

Respond with JSON: {
  "contentSuggestions": [
    {"title": "Content Title", "type": "article|practice|reflection", "reason": "Why this is relevant now"}
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 600,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return { contentSuggestions: [] };
    }

    const parsed = JSON.parse(responseText);
    return {
      contentSuggestions: parsed.contentSuggestions || []
    };
  } catch (error) {
    console.error('Error generating personalized content:', error);
    return { contentSuggestions: [] };
  }
}
