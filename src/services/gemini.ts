import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    throw new Error('No image data found in response');

  } catch (error) {
    console.error('Error generating image:', error);
    return `https://picsum.photos/seed/${Math.random()}/800/800`; // Return 1:1 placeholder
  }
}

export async function generateFourImages(prompt: string): Promise<string[]> {
  console.log(`Generating 4 images for prompt: ${prompt}`);
  const imagePromises = [
    generateImage(prompt),
    generateImage(prompt),
    generateImage(prompt),
    generateImage(prompt),
  ];
  return Promise.all(imagePromises);
}
