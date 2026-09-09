import fs from 'fs';
import path from 'path';

const root = process.cwd();
const webAppDir = path.join(root, 'apps', 'web', 'src', 'app');

// 1. Projects [id] page.tsx (Server Component)
const projectDetailPage = `import ProjectDetailClient from "./ProjectDetailClient";

export function generateStaticParams() {
  return [{ id: "default" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <ProjectDetailClient id={resolved?.id} />;
}
`;
fs.writeFileSync(path.join(webAppDir, 'projects', '[id]', 'page.tsx'), projectDetailPage, 'utf8');
console.log('✓ Wrote projects/[id]/page.tsx');

// 2. Projects [id]/edit/ProjectEditClient.tsx
const editClientPath = path.join(webAppDir, 'projects', '[id]', 'edit', 'ProjectEditClient.tsx');
let editClientContent = fs.readFileSync(editClientPath, 'utf8');
editClientContent = editClientContent.replace(
  'import React, { useState, use } from "react";\nimport { useRouter } from "next/navigation";',
  'import React, { useState } from "react";\nimport { useRouter, useParams } from "next/navigation";'
);
editClientContent = editClientContent.replace(
  'export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {\n  const resolvedParams = use(params);',
  'export default function ProjectEditClient({ id }: { id?: string }) {\n  const routeParams = useParams();\n  const activeId = id || (routeParams?.id as string);'
);
editClientContent = editClientContent.replace(
  'const project = projects.find((p) => p.id === resolvedParams.id);',
  'const project = projects.find((p) => p.id === activeId);'
);
fs.writeFileSync(editClientPath, editClientContent, 'utf8');
console.log('✓ Updated projects/[id]/edit/ProjectEditClient.tsx');

// Projects [id]/edit/page.tsx (Server Component)
const projectEditPage = `import ProjectEditClient from "./ProjectEditClient";

export function generateStaticParams() {
  return [{ id: "default" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <ProjectEditClient id={resolved?.id} />;
}
`;
fs.writeFileSync(path.join(webAppDir, 'projects', '[id]', 'edit', 'page.tsx'), projectEditPage, 'utf8');
console.log('✓ Wrote projects/[id]/edit/page.tsx');

// 3. Share [token]/SharedDocumentClient.tsx
const shareClientPath = path.join(webAppDir, 'share', '[token]', 'SharedDocumentClient.tsx');
let shareClientContent = fs.readFileSync(shareClientPath, 'utf8');
shareClientContent = shareClientContent.replace(
  'import React, { useEffect, useState, use } from "react";',
  'import React, { useEffect, useState } from "react";\nimport { useParams } from "next/navigation";'
);
shareClientContent = shareClientContent.replace(
  'export default function SharedDocumentPage({ params }: { params: Promise<{ token: string }> }) {\n  const resolvedParams = use(params);\n  const token = resolvedParams.token;',
  'export default function SharedDocumentClient({ token }: { token?: string }) {\n  const routeParams = useParams();\n  const activeToken = token || (routeParams?.token as string);'
);
shareClientContent = shareClientContent.replace(/token/g, (match, offset, str) => {
  // Replace references to token in useEffect
  return match;
});
// Replace specific references
shareClientContent = shareClientContent.replace('if (token) {', 'if (activeToken) {');
shareClientContent = shareClientContent.replace('getShareLinkByToken(token)', 'getShareLinkByToken(activeToken)');
shareClientContent = shareClientContent.replace('incrementShareView(token)', 'incrementShareView(activeToken)');
shareClientContent = shareClientContent.replace('[token, getShareLinkByToken, incrementShareView]', '[activeToken, getShareLinkByToken, incrementShareView]');
fs.writeFileSync(shareClientPath, shareClientContent, 'utf8');
console.log('✓ Updated share/[token]/SharedDocumentClient.tsx');

// Share [token]/page.tsx (Server Component)
const sharePage = `import SharedDocumentClient from "./SharedDocumentClient";

export function generateStaticParams() {
  return [{ token: "default" }];
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const resolved = await params;
  return <SharedDocumentClient token={resolved?.token} />;
}
`;
fs.writeFileSync(path.join(webAppDir, 'share', '[token]', 'page.tsx'), sharePage, 'utf8');
console.log('✓ Wrote share/[token]/page.tsx');

console.log('All static route wrappers successfully configured.');
