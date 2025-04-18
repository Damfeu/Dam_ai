import { ragChat } from "@/lib/rag-chat";
import { aiUseChatAdapter } from "@upstash/rag-chat/nextjs";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        console.log("Appel API démarré...")
        const body = await req.json();
        console.log("Corps de la requête reçu:", JSON.stringify(body));
        
        const { messages, sessionId } = body;
        const lastMessage = messages[messages.length - 1].content;
        console.log("Dernier message:", lastMessage);
        
        const promptInFrench = `Réponds en français : ${lastMessage}`;
        console.log("Envoi du prompt à ragChat...");
        
        const response = await ragChat.chat(promptInFrench, {streaming: true, sessionId});
        console.log("Réponse reçue de ragChat:", response ? "OK" : "NULL");
        
        if(!response){
            console.log("Aucune réponse obtenue.");
            return new Response("Aucune réponse obtenue.", { status: 500 });
        }
        
        console.log("Adaptation de la réponse pour Next.js...");
        const adaptedResponse = aiUseChatAdapter(response);
        console.log("Réponse adaptée et renvoyée.");
        
        return adaptedResponse;
    } catch (error) {
        console.error("Erreur dans l'API:", error);
        return new Response("Une erreur est survenue.", { status: 500 });
    }
}