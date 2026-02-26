 import { Link } from 'react-router-dom';
 import { BookOpen } from 'lucide-react';
 
 interface AlsoReadPost {
   title: string;
   slug: string;
   excerpt?: string | null;
 }
 
 interface AlsoReadBoxProps {
   posts: AlsoReadPost[];
   variant?: 'inline' | 'sidebar';
 }
 
 export const AlsoReadBox = ({ posts, variant = 'inline' }: AlsoReadBoxProps) => {
   if (posts.length === 0) return null;
 
   if (variant === 'sidebar') {
     return (
       <div className="bg-muted/50 border border-border rounded-lg p-4">
         <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
           <BookOpen className="h-4 w-4" />
           Also Read
         </h4>
         <ul className="space-y-2">
           {posts.map((post) => (
             <li key={post.slug}>
               <Link
                 to={`/blog/${post.slug}`}
                 className="text-sm text-primary hover:underline font-medium line-clamp-2"
               >
                 {post.title}
               </Link>
             </li>
           ))}
         </ul>
       </div>
     );
   }
 
   return (
     <div className="my-8 p-5 bg-primary/5 border-l-4 border-primary rounded-r-lg">
       <h4 className="font-semibold text-sm text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
         <BookOpen className="h-4 w-4" />
         Also Read
       </h4>
       <ul className="space-y-2">
         {posts.map((post) => (
           <li key={post.slug} className="flex items-start gap-2">
             <span className="text-primary mt-1.5">→</span>
             <div>
               <Link
                 to={`/blog/${post.slug}`}
                 className="text-foreground hover:text-primary font-medium transition-colors"
               >
                 {post.title}
               </Link>
               {post.excerpt && (
                 <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                   {post.excerpt}
                 </p>
               )}
             </div>
           </li>
         ))}
       </ul>
     </div>
   );
 };