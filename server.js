// Import dependencies
import express from 'express';
import path from 'path'; // Import the path module
import dotenv from 'dotenv';
dotenv.config();

// Correct static imports (remove the aforementioned lines and use these instead)
import { OpenAI } from 'openai';
import cors from 'cors';

// ... the rest of your server.js file


// Initialize Express
const app = express();

// Enable CORS for all routes
app.use(cors());


// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));
// Add a route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});


// Create an OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

// Endpoint for tarot reading
app.post("/bright-interpretation", async (req, res) => {
  console.log("Received a request for /bright-interpretation");
  try {
    const { cards, question } = req.body; // Retrieve the user's question from the request body
    const thread = await openai.beta.threads.create();
    const assistantId = "asst_OpSPevsLNuUbKeJ1StmJwuCb";

    // Construct the prompt
    // Construct the prompt with the user's question and the selected cards

    const prompt = `The user is feeling challenged. He said this:"${question}". Reframe it in a positive way! Use emojis to make it happier. Finish with a inspirational quote from a famous person that will support the bright perspective that you generated.`;

    // Pass in the prompt into the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
    });

    // Create a run to get the assistant response
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // Retrieve the run status
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Get the last assistant message
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessageForRun = messages.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant",
      )
      .pop();

    if (lastMessageForRun) {
      res.json({ interpretation: lastMessageForRun.content[0].text.value });
    } else {
      res.status(404).send("No interpretation found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
