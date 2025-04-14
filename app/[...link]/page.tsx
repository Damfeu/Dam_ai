import { cookies } from "next/headers";
import Chat from "../components/Chat";
import { redis } from "@/lib/redis";
import { ragChat } from "@/lib/rag-chat";

interface PageProps {
  params: {
    link?: string | string[];
  };
}

// Cette fonction reconstruit l'URL
function reconstructUrl({ url }: { url: string[] }) {
  const decodedComponents = url.map((component) =>
    decodeURIComponent(component)
  );
  return decodedComponents.join("/");
}

const page = async ({ params }: PageProps) => {
  const sessionCookies = (await cookies()).get("sessionId")?.value;

  // Pas besoin de 'await' ici, params est déjà un objet synchrone.
  if (!params?.link) {
    return <div>Erreur: Aucun lien fourni</div>;
  }

  const linkArray = Array.isArray(params.link) ? params.link : [params.link];

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
};

export default page;
