import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const currentTimestamp = new Date().toISOString();

        const prompt = 
            `Generate a list of message suggestions related to feedback or chat interactions. Each message should be formatted as an object in an array, with each object containing:
            - 'id': A unique identifier for each message.
            - 'content': The message text, aiming for friendly and encouraging feedback or support-oriented phrases.
        
            Ensure that the messages differ on each request by using slight variations, phrases, or topics.

            Example:
            [
                { "id": 1, "content": "We’d love to hear your thoughts on our service! Please share your feedback." },
                { "id": 2, "content": "How can we assist you today? Our team is here to help!" },
                { "id": 3, "content": "Thank you for chatting with us! If you have further questions, feel free to reach out." }
            ]

            Timestamp for uniqueness: ${currentTimestamp}

            Please provide at least 3 message suggestions focusing on feedback requests and chat support.
            Add variety in tone and content on each generation.`;

              const result = await model.generateContent(prompt);

              const candidates = (result as any).response?.candidates;

              if (!candidates || !candidates[0]?.content?.parts[0]?.text) {

                  return Response.json(
                      {
                          success: false,
                          message: 'No message suggestions generated.'
                      },
                      { status: 500 }
                  );
              }

              const messageArrayText = candidates[0].content.parts[0].text;
      
              const cleanText = messageArrayText.replace(/```json|```/g, '').trim();
              const messageArray = JSON.parse(cleanText);
      
              return Response.json(
                  {
                      success: true,
                      messages: messageArray
                  },
                  { status: 200 }
              );
      

    } catch (error) {
        console.error('Error while generating message suggestions:', error);
        return Response.json(
            {
                success: false,
                message: 'Error while generating message suggestions'
            },
            {
                status: 500
            }
        );
    }
}
