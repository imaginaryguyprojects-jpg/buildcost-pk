import SharedDocumentClient from "./SharedDocumentClient";

export function generateStaticParams() {
  return [{ token: "default" }];
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const resolved = await params;
  return <SharedDocumentClient token={resolved?.token} />;
}
