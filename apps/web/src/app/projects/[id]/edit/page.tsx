import ProjectEditClient from "./ProjectEditClient";

export function generateStaticParams() {
  return [{ id: "default" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <ProjectEditClient id={resolved?.id} />;
}
