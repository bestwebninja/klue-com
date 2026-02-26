import { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  CheckSquare,
  Highlighter,
  Subscript,
  Superscript,
  Undo,
  Redo,
  FileCode,
  Upload,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  content: string;
  setContent: (value: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  userId?: string;
}

type ToolbarAction = {
  icon: React.ElementType;
  label: string;
  action: () => void;
  shortcut?: string;
};

export function BlogToolbar({
  textareaRef,
  content,
  setContent,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  userId,
}: BlogToolbarProps) {
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [tableRows, setTableRows] = useState('3');
  const [tableCols, setTableCols] = useState('3');
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const getSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: '' };
    
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: content.substring(textarea.selectionStart, textarea.selectionEnd),
    };
  };

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, text } = getSelection();
    const selectedText = text || placeholder;
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newStart = start + before.length;
      const newEnd = newStart + selectedText.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start } = getSelection();
    
    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && content[lineStart - 1] !== '\n') {
      lineStart--;
    }

    const newText = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const wrapSelectedLines = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = getSelection();
    
    // Find line boundaries
    let lineStart = start;
    while (lineStart > 0 && content[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    let lineEnd = end;
    while (lineEnd < content.length && content[lineEnd] !== '\n') {
      lineEnd++;
    }

    const selectedLines = content.substring(lineStart, lineEnd);
    const wrappedLines = selectedLines
      .split('\n')
      .map(line => prefix + line)
      .join('\n');

    const newText = content.substring(0, lineStart) + wrappedLines + content.substring(lineEnd);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const handleInsertLink = () => {
    const { text } = getSelection();
    const displayText = linkText || text || 'link text';
    insertText(`[${displayText}](`, ')', linkUrl || 'https://');
    setLinkUrl('');
    setLinkText('');
    setLinkPopoverOpen(false);
  };

  const handleInsertImage = () => {
    insertText(`![${imageAlt || 'Image description'}](`, ')', imageUrl || 'https://');
    setImageUrl('');
    setImageAlt('');
    setImagePopoverOpen(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!userId) {
      toast({ title: 'Please log in to upload images', variant: 'destructive' });
      return;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setImageUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Insert image markdown at cursor
      insertText(`![${imageAlt || file.name}](`, ')', publicUrl);
      setImageAlt('');
      setImagePopoverOpen(false);
      toast({ title: 'Image uploaded successfully!' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Failed to upload image', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setImageUploading(false);
    }
  };

  const onImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleInsertTable = () => {
    const rows = parseInt(tableRows) || 3;
    const cols = parseInt(tableCols) || 3;
    
    let table = '\n';
    // Header row
    table += '| ' + Array(cols).fill('Header').map((h, i) => `${h} ${i + 1}`).join(' | ') + ' |\n';
    // Separator
    table += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
    // Data rows
    for (let i = 0; i < rows - 1; i++) {
      table += '| ' + Array(cols).fill('Cell').join(' | ') + ' |\n';
    }
    table += '\n';
    
    insertText(table, '', '');
    setTablePopoverOpen(false);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    shortcut,
    disabled = false 
  }: { 
    icon: React.ElementType; 
    label: string; 
    onClick: () => void;
    shortcut?: string;
    disabled?: boolean;
  }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClick}
            disabled={disabled}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{label}{shortcut && <span className="ml-2 text-muted-foreground">{shortcut}</span>}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/50 border rounded-t-lg border-b-0">
      {/* Undo/Redo */}
      {(onUndo || onRedo) && (
        <>
          <ToolbarButton icon={Undo} label="Undo" onClick={onUndo || (() => {})} shortcut="Ctrl+Z" disabled={!canUndo} />
          <ToolbarButton icon={Redo} label="Redo" onClick={onRedo || (() => {})} shortcut="Ctrl+Y" disabled={!canRedo} />
          <Separator orientation="vertical" className="h-6 mx-1" />
        </>
      )}

      {/* Text formatting */}
      <ToolbarButton icon={Bold} label="Bold" onClick={() => insertText('**', '**', 'bold text')} shortcut="Ctrl+B" />
      <ToolbarButton icon={Italic} label="Italic" onClick={() => insertText('*', '*', 'italic text')} shortcut="Ctrl+I" />
      <ToolbarButton icon={Underline} label="Underline" onClick={() => insertText('<u>', '</u>', 'underlined text')} />
      <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => insertText('~~', '~~', 'strikethrough text')} />
      <ToolbarButton icon={Highlighter} label="Highlight" onClick={() => insertText('<mark>', '</mark>', 'highlighted text')} />
      <ToolbarButton icon={Subscript} label="Subscript" onClick={() => insertText('<sub>', '</sub>', 'subscript')} />
      <ToolbarButton icon={Superscript} label="Superscript" onClick={() => insertText('<sup>', '</sup>', 'superscript')} />

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => insertAtLineStart('# ')} />
      <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => insertAtLineStart('## ')} />
      <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => insertAtLineStart('### ')} />

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <ToolbarButton icon={List} label="Bullet List" onClick={() => wrapSelectedLines('- ')} />
      <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const { start, end } = getSelection();
        
        let lineStart = start;
        while (lineStart > 0 && content[lineStart - 1] !== '\n') lineStart--;
        let lineEnd = end;
        while (lineEnd < content.length && content[lineEnd] !== '\n') lineEnd++;

        const lines = content.substring(lineStart, lineEnd).split('\n');
        const numberedLines = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        
        const newText = content.substring(0, lineStart) + numberedLines + content.substring(lineEnd);
        setContent(newText);
        setTimeout(() => textarea.focus(), 0);
      }} />
      <ToolbarButton icon={CheckSquare} label="Task List" onClick={() => wrapSelectedLines('- [ ] ')} />

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Block elements */}
      <ToolbarButton icon={Quote} label="Blockquote" onClick={() => wrapSelectedLines('> ')} />
      <ToolbarButton icon={Code} label="Inline Code" onClick={() => insertText('`', '`', 'code')} />
      <ToolbarButton icon={FileCode} label="Code Block" onClick={() => insertText('\n```\n', '\n```\n', 'code here')} />
      <ToolbarButton icon={Minus} label="Horizontal Rule" onClick={() => insertText('\n\n---\n\n', '', '')} />

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Links and Media */}
      <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link className="h-4 w-4" />
            <span className="sr-only">Insert Link</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Insert Link</h4>
            <div className="space-y-2">
              <Label htmlFor="linkText">Link Text</Label>
              <Input
                id="linkText"
                placeholder="Display text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleInsertLink} className="w-full">Insert Link</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Image className="h-4 w-4" />
            <span className="sr-only">Insert Image</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Insert Image</h4>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4 pt-4">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageFileChange}
                  className="hidden"
                />
                <div className="space-y-2">
                  <Label htmlFor="uploadImageAlt">Alt Text (optional)</Label>
                  <Input
                    id="uploadImageAlt"
                    placeholder="Image description"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => imageInputRef.current?.click()} 
                  className="w-full gap-2"
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Max 5MB • JPG, PNG, GIF, WebP
                </p>
              </TabsContent>
              <TabsContent value="url" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageAlt">Alt Text</Label>
                  <Input
                    id="imageAlt"
                    placeholder="Image description"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                  />
                </div>
                <Button onClick={handleInsertImage} className="w-full">Insert Image</Button>
              </TabsContent>
            </Tabs>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Table className="h-4 w-4" />
            <span className="sr-only">Insert Table</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <h4 className="font-medium">Insert Table</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tableRows">Rows</Label>
                <Input
                  id="tableRows"
                  type="number"
                  min="2"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableCols">Columns</Label>
                <Input
                  id="tableCols"
                  type="number"
                  min="2"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleInsertTable} className="w-full">Insert Table</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text alignment (HTML-based) */}
      <ToolbarButton icon={AlignLeft} label="Align Left" onClick={() => insertText('<div style="text-align: left;">', '</div>', 'content')} />
      <ToolbarButton icon={AlignCenter} label="Align Center" onClick={() => insertText('<div style="text-align: center;">', '</div>', 'content')} />
      <ToolbarButton icon={AlignRight} label="Align Right" onClick={() => insertText('<div style="text-align: right;">', '</div>', 'content')} />
    </div>
  );
}
