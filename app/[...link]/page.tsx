import { cookies } from "next/headers";
import Chat from "../components/Chat";
import { redis } from "@/lib/redis";
import { ragChat } from "@/lib/rag-chat";

interface PageProps {
  params: {
    link: string[];
  };
}

function reconstructUrl({ url }: { url: string[] }) {
  const decodedComponents = url.map((component) =>
    decodeURIComponent(component)
  );
  return decodedComponents.join("/");
}

export default async function Page({ params }: PageProps) {
  // Attendre à la fois cookies et params.link
  const cookiesInstance = await cookies();
  const sessionCookies = cookiesInstance.get("sessionId")?.value;
  
  // Attendre params avant d'utiliser ses propriétés
  const paramsObj = await params;
  const linkArray = paramsObj.link;
  
  const decodedLink = reconstructUrl({ url: linkArray });
  
  const sessionId = (decodedLink + "__" + sessionCookies).replace(/\//g, "");
  
  const isAlreadyIndexed = await redis.sismember("indexed-urls", decodedLink);
  if (!isAlreadyIndexed) {
    console.log("Indexation en cours...");
    await ragChat.context.add({
      type: "html",
      source: decodedLink,
      config: { chunkOverlap: 50, chunkSize: 200 },
    });
    await redis.sadd("indexed-urls", decodedLink);
  }
  
  const initialMessages = await ragChat.history.getMessages({
    amount: 10,
    sessionId,
  });
  
  return (
    <Chat
      decodedLink={decodedLink}
      sessionId={sessionId}
      initialMessages={initialMessages}
    />
  );
}