import ProjectDetailClient from "./ProjectDetailClient";

export function generateStaticParams() {
  return [{ id: "default" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <ProjectDetailClient id={resolved?.id} />;
}
