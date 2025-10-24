// netlify/functions/recipe.js
// This runs on Netlify's server, not in the browser!
exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }
    try {
        // Get API key from environment variable (secure!)
        const API_KEY = process.env.GROQ_API_KEY;
        
        // Parse incoming request
        const body = JSON.parse(event.body);
        const { dishName, useHinglish } = body;

        // Prepare prompt
        let prompt = `Generate a detailed recipe for ${dishName}.`;
        if (useHinglish) {
            prompt += ` Use Hinglish (Hindi + English mix).`;
        }
        prompt += `
        Format:
        - Recipe Name as heading
        - Prep Time, Cook Time, Serves
        - ## Ingredients (with quantities)
        - ## Instructions (numbered steps)
        `;

        // Call Groq API (server-side, key is hidden)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional chef."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const data = await response.json();

        // Return response to frontend
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate recipe' })
        };
    }
};
