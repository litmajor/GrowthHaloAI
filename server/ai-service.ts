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

export async function detectCrisisSignals(
  text: string, 
  context?: {
    recentEntries?: string[];
    energyPatterns?: Array<{ mental: number; physical: number; emotional: number; spiritual: number }>;
    phaseHistory?: Array<{ phase: string; confidence: number }>;
  }
): Promise<{
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number; // 0-100
  concerningSignals: string[];
  interventionRecommendations: string[];
  urgentCare: boolean;
  supportResources: Array<{ type: string; description: string; contact?: string }>;
}> {
  try {
    const contextInfo = context ? `
Recent context:
- Recent entries: ${context.recentEntries?.slice(0, 3).join('; ') || 'none'}
- Recent energy patterns: ${context.energyPatterns ? 'Available' : 'Not available'}
- Recent phase history: ${context.phaseHistory ? 'Available' : 'Not available'}
    ` : '';

    const prompt = `As a crisis detection AI trained in mental health assessment, analyze this text for signs of emotional distress or crisis:

"${text}"

${contextInfo}

Assess for:
1. Suicidal ideation or self-harm thoughts
2. Severe depression or hopelessness
3. Substance abuse references
4. Trauma or abuse indicators
5. Panic or severe anxiety
6. Psychosis or disconnection from reality
7. Social isolation and withdrawal
8. Severe life stressors

Provide a comprehensive crisis assessment with specific, actionable recommendations.

Respond with JSON: {
  "riskLevel": "low|moderate|high|critical",
  "riskScore": 0-100,
  "concerningSignals": ["signal1", "signal2"],
  "interventionRecommendations": ["recommendation1", "recommendation2"],
  "urgentCare": boolean,
  "supportResources": [{"type": "crisis_hotline", "description": "24/7 crisis support", "contact": "988"}]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // Low temperature for consistent crisis detection
      max_tokens: 800,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return {
        riskLevel: 'low',
        riskScore: 0,
        concerningSignals: [],
        interventionRecommendations: [],
        urgentCare: false,
        supportResources: []
      };
    }

    const parsed = JSON.parse(responseText);

    // Add standard resources based on risk level
    const standardResources = [
      { type: 'crisis_hotline', description: '988 Suicide & Crisis Lifeline', contact: '988' },
      { type: 'text_support', description: 'Crisis Text Line', contact: 'Text HOME to 741741' },
      { type: 'chat_support', description: 'Online crisis chat', contact: 'suicidepreventionlifeline.org/chat' }
    ];

    if (parsed.riskLevel === 'high' || parsed.riskLevel === 'critical') {
      parsed.supportResources = [...(parsed.supportResources || []), ...standardResources];
    }

    return {
      riskLevel: parsed.riskLevel || 'low',
      riskScore: parsed.riskScore || 0,
      concerningSignals: parsed.concerningSignals || [],
      interventionRecommendations: parsed.interventionRecommendations || [],
      urgentCare: parsed.urgentCare || false,
      supportResources: parsed.supportResources || []
    };
  } catch (error) {
    console.error('Error detecting crisis signals:', error);
    return {
      riskLevel: 'low',
      riskScore: 0,
      concerningSignals: ['Unable to assess due to technical error'],
      interventionRecommendations: ['Please reach out to a mental health professional'],
      urgentCare: false,
      supportResources: [
        { type: 'crisis_hotline', description: '988 Suicide & Crisis Lifeline', contact: '988' }
      ]
    };
  }
}

export async function generateCrisisResponse(
  crisisAssessment: any,
  userMessage: string
): Promise<{
  response: string;
  immediateActions: string[];
  followUpSuggestions: string[];
}> {
  try {
    const prompt = `As the Growth Halo AI Bliss, respond compassionately to someone showing these crisis signals:

Risk Level: ${crisisAssessment.riskLevel}
Risk Score: ${crisisAssessment.riskScore}
Concerning Signals: ${crisisAssessment.concerningSignals.join(', ')}
User Message: "${userMessage}"

Provide:
1. An immediate, compassionate response that validates their experience
2. Specific immediate actions they can take right now
3. Follow-up suggestions for ongoing support

Guidelines:
- Use Growth Halo philosophy but prioritize safety
- Be warm but direct about seeking help if needed
- Offer concrete, actionable steps
- Normalize seeking professional support
- Include crisis resources if risk is moderate or higher

Respond with JSON: {
  "response": "Your compassionate response here",
  "immediateActions": ["action1", "action2"],
  "followUpSuggestions": ["suggestion1", "suggestion2"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No crisis response generated');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error generating crisis response:', error);
    return {
      response: "I hear that you're going through something really difficult right now. Your feelings are valid, and you don't have to go through this alone. Please consider reaching out to a mental health professional or crisis support service.",
      immediateActions: [
        "Take three deep breaths right now",
        "Call 988 if you're having thoughts of self-harm",
        "Reach out to a trusted friend or family member"
      ],
      followUpSuggestions: [
        "Schedule an appointment with a therapist or counselor",
        "Consider speaking with your doctor about how you're feeling",
        "Join a support group in your area"
      ]
    };
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

export async function generateAdvancedJournalInsights(
  entries: string[], 
  timeframe: 'week' | 'month' | '3months',
  userContext?: {
    currentPhase: string;
    energyPatterns: any[];
    valuesPriority: any[];
  }
): Promise<{
  emotionalPatterns: Array<{ pattern: string; frequency: number; trend: 'increasing' | 'decreasing' | 'stable' }>;
  thematicClusters: Array<{ theme: string; entries: number; significance: number; insights: string[] }>;
  linguisticEvolution: {
    vocabularyGrowth: string[];
    expressionPatterns: string[];
    complexityTrend: 'increasing' | 'decreasing' | 'stable';
  };
  growthIndicators: {
    selfAwareness: number; // 1-10
    emotionalRegulation: number; // 1-10
    futureOrientation: number; // 1-10
    valueAlignment: number; // 1-10
  };
  anomalies: Array<{ date: string; type: string; description: string; significance: number }>;
  predictiveInsights: {
    nextPhaseIndication: string;
    potentialChallenges: string[];
    growthOpportunities: string[];
  };
  personalizedRecommendations: Array<{
    type: 'reflection' | 'action' | 'practice';
    title: string;
    description: string;
    reasoning: string;
  }>;
}> {
  try {
    const contextInfo = userContext ? `
User Context:
- Current phase: ${userContext.currentPhase}
- Recent energy patterns: ${userContext.energyPatterns.length > 0 ? 'Available' : 'Not available'}
- Top values: ${userContext.valuesPriority?.slice(0, 3).map(v => v.name).join(', ') || 'Not specified'}
    ` : '';

    const prompt = `As an advanced AI with expertise in psychology, linguistics, and personal development, perform a comprehensive analysis of these journal entries from the past ${timeframe}:

${entries.map((entry, i) => `Entry ${i + 1}: "${entry.substring(0, 500)}..."`).join('\n\n')}

${contextInfo}

Provide a sophisticated analysis including:

1. EMOTIONAL PATTERNS: Identify recurring emotional themes, their frequency, and whether they're increasing, decreasing, or stable over time.

2. THEMATIC CLUSTERS: Group entries by underlying themes (relationships, work, growth, challenges, etc.) and provide insights about each cluster's significance.

3. LINGUISTIC EVOLUTION: Analyze how the person's expression, vocabulary, and complexity of thought has evolved over time.

4. GROWTH INDICATORS: Rate the person's development in key areas (1-10 scale):
   - Self-awareness (understanding of inner states)
   - Emotional regulation (managing emotional responses)
   - Future orientation (planning and hope)
   - Value alignment (living according to values)

5. ANOMALIES: Identify unusual patterns, sudden shifts, or outlier entries that might indicate significant life events or changes.

6. PREDICTIVE INSIGHTS: Based on patterns, predict likely next phase transitions, potential challenges, and growth opportunities.

7. PERSONALIZED RECOMMENDATIONS: Suggest specific reflections, actions, or practices based on the analysis.

Use Growth Halo philosophy (expansion, contraction, renewal cycles) in your analysis. Be specific and actionable.

Respond with detailed JSON matching the expected structure with specific examples and reasoning.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No insights generated');
    }

    const insights = JSON.parse(responseText);

    // Validate and enrich the response
    return {
      emotionalPatterns: insights.emotionalPatterns || [],
      thematicClusters: insights.thematicClusters || [],
      linguisticEvolution: insights.linguisticEvolution || {
        vocabularyGrowth: [],
        expressionPatterns: [],
        complexityTrend: 'stable'
      },
      growthIndicators: {
        selfAwareness: insights.growthIndicators?.selfAwareness || 5,
        emotionalRegulation: insights.growthIndicators?.emotionalRegulation || 5,
        futureOrientation: insights.growthIndicators?.futureOrientation || 5,
        valueAlignment: insights.growthIndicators?.valueAlignment || 5
      },
      anomalies: insights.anomalies || [],
      predictiveInsights: insights.predictiveInsights || {
        nextPhaseIndication: 'Continue current trajectory',
        potentialChallenges: [],
        growthOpportunities: []
      },
      personalizedRecommendations: insights.personalizedRecommendations || []
    };
  } catch (error) {
    console.error('Error generating advanced journal insights:', error);
    return generateFallbackInsights(entries, timeframe);
  }
}

function generateFallbackInsights(entries: string[], timeframe: string) {
  // Basic analysis fallback
  const totalWords = entries.join(' ').split(' ').length;
  const avgLength = totalWords / entries.length;

  return {
    emotionalPatterns: [
      { pattern: 'Mixed emotional expression', frequency: entries.length, trend: 'stable' as const }
    ],
    thematicClusters: [
      { theme: 'Personal reflection', entries: entries.length, significance: 70, insights: ['Consistent journaling practice'] }
    ],
    linguisticEvolution: {
      vocabularyGrowth: ['Developing written expression'],
      expressionPatterns: ['Consistent reflection style'],
      complexityTrend: avgLength > 50 ? 'increasing' as const : 'stable' as const
    },
    growthIndicators: {
      selfAwareness: 6,
      emotionalRegulation: 5,
      futureOrientation: 5,
      valueAlignment: 6
    },
    anomalies: [],
    predictiveInsights: {
      nextPhaseIndication: 'Continuing growth trajectory',
      potentialChallenges: ['Maintaining consistency'],
      growthOpportunities: ['Deeper self-reflection']
    },
    personalizedRecommendations: [
      {
        type: 'reflection' as const,
        title: 'Weekly Theme Review',
        description: 'Look back at recurring themes in your entries',
        reasoning: 'Build pattern recognition skills'
      }
    ]
  };
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

export async function analyzeValuesAssessment(
  responses: string[],
  assessmentType: 'quick' | 'deep'
): Promise<{
  updatedValues: Array<{ id: string; name: string; newAlignment: number; newImportance: number; evolution: string }>;
  insights: string;
  conflictAreas: string[];
  alignmentScore: number;
  evolution: { trend: string; significantChanges: string[] };
}> {
  try {
    const prompt = `Analyze these values assessment responses from a Growth Halo perspective:

Assessment Type: ${assessmentType}
Responses: ${responses.join('\n---\n')}

Based on the Growth Halo philosophy of authentic growth, analyze:
1. Which values seem most/least aligned with current life
2. Signs of values evolution or shifts
3. Areas of potential values conflicts
4. Overall authenticity alignment score (0-1)
5. Insights about living more authentically

Respond with JSON: {
  "updatedValues": [{"id": "1", "name": "Authenticity", "newAlignment": 8, "newImportance": 9, "evolution": "growing stronger"}],
  "insights": "Key insights about values alignment",
  "conflictAreas": ["area1", "area2"],
  "alignmentScore": 0.75,
  "evolution": {"trend": "expanding authenticity", "significantChanges": ["change1"]}
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from analysis');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error analyzing values assessment:', error);
    return {
      updatedValues: [],
      insights: 'Unable to analyze assessment at this time',
      conflictAreas: [],
      alignmentScore: 0.5,
      evolution: { trend: 'stable', significantChanges: [] }
    };
  }
}

export async function generateValueBasedGuidance(
  decision: string,
  valueContext: { topValues: Array<{ name: string; importance: number }> }
): Promise<{ guidance: string; questionsToConsider: string[]; potentialConflicts: string[] }> {
  try {
    const prompt = `A user is facing this decision: "${decision}"

Their top values are: ${valueContext.topValues.map(v => `${v.name} (importance: ${v.importance}/10)`).join(', ')}

As the Growth Halo AI Agent, provide:
1. Values-aligned guidance for this decision
2. Reflective questions to help them discover their authentic choice
3. Any potential values conflicts to be aware of

Respond with JSON: {
  "guidance": "Compassionate guidance from Growth Halo perspective",
  "questionsToConsider": ["question1", "question2"],
  "potentialConflicts": ["conflict1"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No guidance generated');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error generating value-based guidance:', error);
    return {
      guidance: 'Consider how this decision aligns with your deepest values and authentic self.',
      questionsToConsider: ['What would your wisest self choose?', 'How does each option honor your core values?'],
      potentialConflicts: []
    };
  }
}