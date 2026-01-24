'use client'

interface ContentRendererProps {
  content: string
}

export function ContentRenderer({ content }: ContentRendererProps) {
  // Enhanced function to format content into proper HTML with Tailwind v4 classes
  function formatBlogContent(content: string): string {
    if (!content) return ''
    
    // Check if content is already HTML (contains HTML tags)
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return content
    }
    
    // Clean up and format the content
    const processedContent = content
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/([.!?])\s+/g, '$1 ') // Clean up spacing after punctuation
      .trim()
    
    // Split into paragraphs looking for logical breaks
    const paragraphs: string[] = []
    const sentences = processedContent.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length === 0) return ''
    
    let currentParagraph = ''
    let sentenceCount = 0
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      
      // Detect headings (short sentences with specific patterns)
      const isHeading = trimmedSentence.length < 100 && (
        trimmedSentence.toLowerCase().includes('about') ||
        trimmedSentence.toLowerCase().includes('how ') ||
        trimmedSentence.toLowerCase().includes('why ') ||
        trimmedSentence.toLowerCase().includes('join ') ||
        trimmedSentence.toLowerCase().includes('five ') ||
        trimmedSentence.toLowerCase().startsWith('the ') ||
        trimmedSentence.toLowerCase().includes('conservation') ||
        trimmedSentence.toLowerCase().includes('threats') ||
        trimmedSentence.toLowerCase().includes('research') ||
        trimmedSentence.toLowerCase().includes('future') ||
        trimmedSentence.toLowerCase().includes('success') ||
        trimmedSentence.toLowerCase().includes('experience')
      )
      
      if (isHeading) {
        // Save current paragraph if it has content
        if (currentParagraph.trim()) {
          paragraphs.push(`<p class="text-gray-700 leading-relaxed mb-6">${currentParagraph.trim()}.</p>`)
        }
        
        // Add as heading with Tailwind v4 classes
        const headingLevel = trimmedSentence.length < 50 ? 'h3' : 'h2'
        paragraphs.push(`<${headingLevel} class="font-bold text-teal-700 mt-8 mb-4">${trimmedSentence}.</${headingLevel}>`)
        currentParagraph = ''
        sentenceCount = 0
      } else {
        // Add to current paragraph
        currentParagraph += (currentParagraph ? ' ' : '') + trimmedSentence
        sentenceCount++
        
        // Create new paragraph after 3-4 sentences or when it gets long
        if (sentenceCount >= 4 || currentParagraph.length > 300) {
          paragraphs.push(`<p class="text-gray-700 leading-relaxed mb-6">${currentParagraph}.</p>`)
          currentParagraph = ''
          sentenceCount = 0
        }
      }
    }
    
    // Add any remaining content
    if (currentParagraph.trim()) {
      paragraphs.push(`<p class="text-gray-700 leading-relaxed mb-6">${currentParagraph}.</p>`)
    }
    
    return paragraphs.join('\n\n')
  }

  const formattedContent = formatBlogContent(content)
  
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-teal-700 prose-h1:text-4xl prose-h1:font-bold prose-h1:mt-12 prose-h1:mb-6 prose-h1:first:mt-0 prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4 prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:underline-offset-4 prose-ul:my-6 prose-ul:space-y-2 prose-ul:list-disc prose-ol:my-6 prose-ol:space-y-2 prose-ol:list-decimal prose-li:text-gray-700 prose-li:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:italic prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6 prose-hr:border-gray-300 prose-hr:my-8 prose-strong:text-teal-700 prose-strong:font-semibold prose-em:italic prose-em:text-gray-700 prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8 prose-table:overflow-x-auto prose-table:my-6 prose-thead:bg-gray-50 prose-tbody:bg-white prose-tbody:divide-y prose-tbody:divide-gray-200 prose-tr:border-b prose-tr:border-gray-200 prose-th:px-6 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-medium prose-th:text-gray-500 prose-th:uppercase prose-th:tracking-wider prose-td:px-6 prose-td:py-4 prose-td:whitespace-nowrap prose-td:text-sm prose-td:text-gray-700">
      <div dangerouslySetInnerHTML={{ 
        __html: formattedContent 
      }} />
    </div>
  )
}