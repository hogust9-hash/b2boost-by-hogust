import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CATEGORIES = ['snacking', 'viennoiserie', 'pâtisserie', 'gamme américaine', 'traiteur', 'pain', 'autre'];

function guessCategory(name: string): string {
  const lower = name.toLowerCase();
  if (/sandwich|wrap|quiche|pizza|croque|salade|panini|burger/i.test(lower)) return 'snacking';
  if (/croissant|pain au chocolat|chocolatine|brioche|chausson/i.test(lower)) return 'viennoiserie';
  if (/cake|marbré|financier|quatre.?quarts|madele|canelé|sablé|biscuit|cookies/i.test(lower)) return 'gâteaux de voyage';
  if (/tarte|gâteau|éclair|macaron|mille.?feuille|mousse|fondant|brownie/i.test(lower)) return 'pâtisserie';
  if (/plateau|buffet|canapé|verrine|traiteur/i.test(lower)) return 'traiteur';
  if (/baguette|pain|campagne|seigle|complet|céréale/i.test(lower)) return 'pain';
  return 'autre';
}

function parseOffers(content: string): Array<{ name: string; category: string; description: string; price: number | null }> {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const offers: Array<{ name: string; category: string; description: string; price: number | null }> = [];

  for (const line of lines) {
    // Try patterns: "Name - 3.50€", "Name : 3,50 €", "Name    3.50", "Name (3€50)"
    const priceMatch = line.match(/^(.+?)[\s\-–—:]+(\d+[.,]\d{1,2})\s*€?\s*$/);
    const priceMatch2 = line.match(/^(.+?)\s+(\d+[.,]\d{1,2})\s*€?\s*$/);
    const priceMatch3 = line.match(/^(.+?)\((\d+)€(\d{1,2})\)/);

    let name = '';
    let price: number | null = null;

    if (priceMatch) {
      name = priceMatch[1].trim();
      price = parseFloat(priceMatch[2].replace(',', '.'));
    } else if (priceMatch3) {
      name = priceMatch3[1].trim();
      price = parseFloat(`${priceMatch3[2]}.${priceMatch3[3]}`);
    } else if (priceMatch2) {
      name = priceMatch2[1].trim();
      price = parseFloat(priceMatch2[2].replace(',', '.'));
    } else if (line.length > 3 && line.length < 80 && !line.match(/^\d/) && !line.match(/^(tel|fax|email|www|http|adresse|horaire)/i)) {
      name = line;
    }

    if (name && name.length > 2 && name.length < 80) {
      offers.push({
        name,
        category: guessCategory(name),
        description: '',
        price,
      });
    }
  }

  return offers;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, filename } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'No content provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const offers = parseOffers(content);

    return new Response(JSON.stringify({ offers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
