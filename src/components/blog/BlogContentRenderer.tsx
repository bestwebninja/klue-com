import React from 'react';
import { Link } from 'react-router-dom';
import { processContentWithLinks } from '@/lib/autoLinking';
import { AlsoReadBox } from './AlsoReadBox';

interface BlogLink {
  title: string;
  slug: string;
  excerpt?: string | null;
}

interface BlogContentRendererProps {
  content: string;
  relatedPosts?: BlogLink[];
  alsoReadPosts?: BlogLink[];
}

export const BlogContentRenderer = ({ 
  content, 
  relatedPosts = [],
  alsoReadPosts = []
}: BlogContentRendererProps) => {
  // Process content with auto-linking
  const processedContent = processContentWithLinks(
    content,
    relatedPosts.map(p => ({ title: p.title, slug: p.slug }))
  );
  
  const lines = processedContent.split('\n');
  const totalLines = lines.length;
  const alsoReadInsertPoint = Math.floor(totalLines * 0.4); // Insert "Also Read" at 40% through content
  
  const parseLinks = (text: string): React.ReactNode => {
    // Match [[BLOG_LINK:slug:text]] and [[SITE_LINK:url:text]] patterns
    const linkPattern = /\[\[(BLOG_LINK|SITE_LINK):([^:]+):([^\]]+)\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = linkPattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const [, linkType, urlOrSlug, linkText] = match;
      
      if (linkType === 'BLOG_LINK') {
        parts.push(
          <Link
            key={`link-${keyIndex++}`}
            to={`/blog/${urlOrSlug}`}
            className="text-primary hover:underline font-medium"
          >
            {linkText}
          </Link>
        );
      } else {
        parts.push(
          <Link
            key={`link-${keyIndex++}`}
            to={urlOrSlug}
            className="text-primary hover:underline font-medium"
          >
            {linkText}
          </Link>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const renderLine = (line: string, index: number): React.ReactElement => {
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-xl font-semibold mt-8 mb-4">{parseLinks(line.slice(4))}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold mt-10 mb-4">{parseLinks(line.slice(3))}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-3xl font-bold mt-10 mb-4">{parseLinks(line.slice(2))}</h1>;
    }
    if (line.startsWith('- ')) {
      return <li key={index} className="ml-6 mb-2">{parseLinks(line.slice(2))}</li>;
    }
    if (line.trim() === '') {
      return <br key={index} />;
    }
    return <p key={index} className="mb-4 leading-relaxed">{parseLinks(line)}</p>;
  };

  return (
    <div className="prose prose-lg max-w-none text-foreground">
      {lines.map((line, index) => {
        const lineElement = renderLine(line, index);
        
        // Insert "Also Read" box at the calculated point
        if (index === alsoReadInsertPoint && alsoReadPosts.length > 0) {
          return (
            <React.Fragment key={`fragment-${index}`}>
              {lineElement}
              <AlsoReadBox 
                key={`also-read-${index}`} 
                posts={alsoReadPosts} 
              />
            </React.Fragment>
          );
        }
        
        return lineElement;
      })}
    </div>
  );
};