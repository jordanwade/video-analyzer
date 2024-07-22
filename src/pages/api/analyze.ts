import { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getYouTubeVideoId = (url: string) => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
};

const analyzeText = async (text: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a software engineering hiring manager assistant. Your task is to analyze the provided developer presentation transcript. Evaluate the developer based on coding knowledge, problem-solving skills, communication skills, and overall project understanding. Provide scores for each category and give constructive feedback.',
      },
      {
        role: 'user',
        content: `Analyze the following text: ${text}`,
      },
    ],
  });

  return response.choices[0].message.content;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { url } = req.body;

    try {
      const videoId = getYouTubeVideoId(url);

      const transcript = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcript || transcript.length === 0) {
        throw new Error('Transcript not found');
      }

      const transcriptText = transcript
        .map((item: { text: string }) => item.text)
        .join(' ');
      console.log(transcriptText);
      const analysis = await analyzeText(transcriptText);

      res.status(200).json({ analysis });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
