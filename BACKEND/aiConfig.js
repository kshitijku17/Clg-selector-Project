// aiConfig.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); 
const Groq = require('groq-sdk'); 

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PRE_PROMPT = `
You are an unbiased B.Tech college counselor.

Rules:
- All colleges are in India.
- U.K. means Uttarakhand, not United Kingdom.
- H.P. means Himachal Pradesh.
- J&K means Jammu & Kashmir.
- All fees are in INR.
- Do NOT mention or repeat:
  College Name, Location, Fees, Placement, Rankings or Statistics.
- Never invent facts.
- If unsure, skip the information.
- Return ONLY valid HTML.
- No Markdown.
- Keep the response between 100-150 words.

Generate ONLY these sections:

<p><strong>Overview:</strong> Write 2-3 sentences describing the college's academic environment and learning experience.</p>

<p><strong>Who Should Choose This College?</strong> Explain what type of B.Tech students would benefit most from studying here.</p>

<p><strong>AI Recommendation:</strong> Explain why this college matches the student's selected preferences. Do not mention fees, placement, location or rankings.</p>

<p><strong>Official Website:</strong>
<a href="OFFICIAL_WEBSITE" target="_blank" rel="noopener noreferrer">
Visit Official Website
</a>
</p>

If you know the official website, use it.
Otherwise use:
https://www.google.com/search?q=official+website+of+COLLEGE_NAME

Return ONLY valid HTML.
`;

async function getCollegeInsights(college) {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: PRE_PROMPT },
                { role: "user",content: `
                Student Course: B.Tech
                Recommended College:
                ${JSON.stringify(college)}
                Generate the HTML exactly as instructed in the system prompt.
                `}
            ],
           model: "openai/gpt-oss-120b", 
            temperature: 0
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Groq AI Generation Error:", error);
        return "<p><strong>Could not load AI insights. Please refresh the page.</strong></p>";
    }
}

module.exports = { getCollegeInsights };