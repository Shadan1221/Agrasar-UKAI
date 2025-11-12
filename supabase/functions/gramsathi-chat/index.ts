import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Language mapping for system prompt
    const languageNames: Record<string, string> = {
      'en': 'English',
      'hi': 'हिन्दी (Hindi)',
      'as': 'Assamese',
      'bn': 'Bengali',
      'brx': 'Bodo',
      'doi': 'Dogri',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ks': 'Kashmiri',
      'kok': 'Konkani',
      'mai': 'Maithili',
      'ml': 'Malayalam',
      'mr': 'Marathi',
      'mni': 'Meitei',
      'ne': 'Nepali',
      'or': 'Odia',
      'pa': 'Punjabi',
      'sa': 'Sanskrit',
      'sat': 'Santali',
      'sd': 'Sindhi',
      'ta': 'Tamil',
      'te': 'Telugu',
      'ur': 'Urdu'
    };

    const selectedLanguage = languageNames[language] || 'English';

    // System prompt for GramSathi - culturally aware, multilingual assistant
    const systemPrompt = `You are GramSathi - a trustworthy, respectful, and culturally-aware AI assistant for rural development in India.

IMPORTANT: Respond ONLY in ${selectedLanguage} language. Do not mix languages unless explicitly asked.

Your roles:
1. Provide information about MGNREGA and rural schemes
2. Help citizens apply for jobs
3. Receive infrastructure issue reports
4. Provide application status updates
5. Guide about rural development programs

Important guidelines:
- Keep answers brief and clear (2-3 sentences)
- Use respectful language appropriate for rural communities
- When you don't have complete information, suggest contacting a human officer
- Ask for consent before collecting personal information
- Confirm location for photo reports

MGNREGA rates (2025-26):
- Daily wage: ₹370
- Typical employment days: 100 days/year

Always maintain a helpful, polite, and culturally sensitive tone.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: generatedText }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in gramsathi-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
