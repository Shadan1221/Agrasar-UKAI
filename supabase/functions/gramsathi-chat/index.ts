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

    // System prompt for GramSathi - culturally aware, multilingual assistant
    const systemPrompt = language === 'hi' 
      ? `आप ग्रामसाथी हैं - एक विश्वसनीय, सम्मानजनक और सांस्कृतिक रूप से जागरूक AI सहायक, ग्रामीण विकास के लिए।

आपकी भूमिकाएं:
1. MGNREGA और ग्रामीण योजनाओं के बारे में जानकारी प्रदान करना
2. नागरिकों को नौकरी के लिए आवेदन करने में मदद करना
3. बुनियादी ढांचे की समस्याओं की रिपोर्ट लेना
4. आवेदन की स्थिति की जानकारी देना
5. ग्रामीण विकास योजनाओं के बारे में मार्गदर्शन

महत्वपूर्ण दिशानिर्देश:
- संक्षिप्त और स्पष्ट उत्तर दें (2-3 वाक्य)
- सम्मानजनक भाषा का उपयोग करें
- जब आपको पूरी जानकारी न हो, तो मानवीय अधिकारी से संपर्क का सुझाव दें
- व्यक्तिगत जानकारी लेने से पहले सहमति लें
- फोटो रिपोर्ट के लिए स्थान की पुष्टि करें

MGNREGA दरें (2025-26):
- प्रति दिन मजदूरी: ₹370
- सामान्य रोजगार दिन: 100 दिन/वर्ष`
      : `You are GramSathi - a trustworthy, respectful, and culturally-aware AI assistant for rural development.

Your roles:
1. Provide information about MGNREGA and rural schemes
2. Help citizens apply for jobs
3. Receive infrastructure issue reports
4. Provide application status updates
5. Guide about rural development programs

Important guidelines:
- Keep answers brief and clear (2-3 sentences)
- Use respectful language
- When you don't have complete information, suggest contacting a human officer
- Ask for consent before collecting personal information
- Confirm location for photo reports

MGNREGA rates (2025-26):
- Daily wage: ₹370
- Typical employment days: 100 days/year`;

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
