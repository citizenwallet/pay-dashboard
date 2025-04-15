import { MarkdownAsync } from 'react-markdown';
import rehypeStarryNight from 'rehype-starry-night';
import remarkGfm from 'remark-gfm';
import fs from 'fs';
import path from 'path';

export default function TermsAndConditions() {
  const filePath = path.join(
    process.cwd(),
    'public',
    'agreement',
    'Businesses general conditions_fr.md'
  );
  const content = fs.readFileSync(filePath, 'utf-8');

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <MarkdownAsync
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeStarryNight]}
          components={{
            table: ({ children }) => (
              <div className="mb-6 overflow-x-auto">
                <table className="min-w-full divide-y  border">
                  {children}
                </table>
              </div>
            ),

            tbody: ({ children }) => (
              <tbody className=" divide-y ">{children}</tbody>
            ),

            th: ({ children }) => (
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {children}
              </td>
            ),

            h1: ({ children }) => (
              <h1 className="mb-6 text-3xl font-bold">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-4 text-2xl font-bold">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-3 text-xl font-bold">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => <ul className="mb-4 pl-6">{children}</ul>,
            ol: ({ children }) => (
              <ol className="mb-4 list-decimal pl-6">{children}</ol>
            ),
            li: ({ children }) => <li className="mb-2">{children}</li>,
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-blue-600 underline hover:text-blue-800"
              >
                {children}
              </a>
            )
          }}
        >
          {content}
        </MarkdownAsync>
      </div>
    </div>
  );
}
