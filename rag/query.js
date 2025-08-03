import * as dotenv from 'dotenv';
dotenv.config();
import readlineSync from 'readline-sync';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const History = [];

async function transformQuery(question) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: question }]
      }
    ],
    config: {
      systemInstruction: `
You are a query rewriting expert for an insurance claim system. 
If the user provides a shorthand query with details like age, gender, procedure, location, or policy duration, 
expand it into a complete, standalone insurance-related question.

For example:
"46M, knee surgery, Pune, 3-month policy"
→ "A 46-year-old male with a 3-month-old Easy Health Policy in Pune needs knee surgery. 
Will the expenses be covered under the policy, and what clauses apply?"

Only output the rewritten question.
`,
    },
  });

  const rewritten =
    response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || question;

  return rewritten;
}

export async function chatting(question) {
  try {
    // Step 1: Rewrite query
    const queries = await transformQuery(question);

    // Step 2: Create embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "text-embedding-004",
    });

    const queryVector = await embeddings.embedQuery(queries);

    // Step 3: Search Pinecone
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 5,
      vector: queryVector,
      includeMetadata: true,
    });

    const context = searchResults.matches
      .map((match) => match.metadata.text)
      .join("\n\n---\n\n");

    // Step 4: Gemini for decision-making
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts:[{text:`
You are an insurance claim evaluator.

Context from the Easy Health Policy:
${context}

User Query:
${queries}

Task:
1. Identify key details from the query (age, procedure, location, policy duration).
2. Find relevant clauses from the above context (such as waiting periods or procedure coverage).
3. Decide whether the claim is Approved or Rejected.
4. Return a JSON object:
{
  "Decision": "Approved/Rejected",
  "Amount": <number or null>,
  "Justification": "Explain clearly, referencing the clause(s)."
}
`}],
        },
      ],
      config: {
        systemInstruction: `
You are an expert assistant for an insurance claim evaluation system.
Base your decision strictly on the provided context. 
If no relevant information is found, respond with:
"I could not find the answer in the provided document."
Be concise, factual, and avoid speculation.
        `,
      },
    });

    const answer =
      response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No response";

    console.log("\n✅ Answer:");
    console.log(answer);
    
    return answer;
  } catch (error) {
    console.error("Error in chatting function:", error);
    throw error;
  }
}

// async function main() {
//   while (true) {
//     const userProblem = readlineSync.question("Ask me anything--> ");
//     if (!userProblem) break;
//     await chatting(userProblem);
//   }
// }

// main();