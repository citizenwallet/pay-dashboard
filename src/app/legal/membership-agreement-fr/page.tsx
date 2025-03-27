import { MarkdownAsync } from 'react-markdown';
import rehypeStarryNight from 'rehype-starry-night';
import remarkGfm from 'remark-gfm';
import fs from 'fs';
import path from 'path';

export default function MembershipAgreement() {
  const filePath = path.join(
    process.cwd(),
    'public',
    'agreement',
    'membership agreement.md'
  );
  const content = fs.readFileSync(filePath, 'utf-8');

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <MarkdownAsync
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeStarryNight]}
        >
          {content}
        </MarkdownAsync>
      </div>
    </div>
  );
}
