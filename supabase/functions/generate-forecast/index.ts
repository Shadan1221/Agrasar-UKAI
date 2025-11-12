import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { village_id, start_date, migration_adjustment = 0 } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCxHT2eQLw04uOhTa9opvo479OZnQVHGeo';

    // Get village data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: village, error: villageError } = await supabase
      .from('villages')
      .select('*')
      .eq('id', village_id)
      .single();

    if (villageError) throw villageError;

    // Create forecast using AI
    const prompt = `Given village data, create a 4-week MGNREGA labour & cost forecast.

Village: ${village.name}, Population: ${village.population}, Households: ${village.households}
Migration adjustment: ${migration_adjustment}%
MGNREGA wage: ₹370/day

Estimate:
- Workers needed per week
- Recommended work types (road repair, water harvesting, pond construction)
- Estimated budget
- Confidence level (0-1)
- Brief reasoning (1-2 lines)

Respond with JSON:
{
  "workers_needed": <number>,
  "confidence": <0-1>,
  "recommended_work_types": [<types>],
  "estimated_budget": <amount in INR>,
  "notes": "<brief reasoning>"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `You are an expert in MGNREGA forecasting. Always respond with valid JSON only.\n\n${prompt}`
          }]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }
    
    // Parse JSON response from AI
    let forecast;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      forecast = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

    // Calculate dates
    const periodStart = new Date(start_date);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 28);

    // Store forecast
    const { data: savedForecast, error: saveError } = await supabase
      .from('forecasts')
      .insert({
        village_id,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        workers_needed: forecast.workers_needed,
        confidence: forecast.confidence,
        recommended_work_types: forecast.recommended_work_types,
        estimated_budget: forecast.estimated_budget,
        notes: forecast.notes
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(
      JSON.stringify(savedForecast), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-forecast function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
