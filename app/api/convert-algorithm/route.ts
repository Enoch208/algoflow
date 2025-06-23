import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function cleanMermaidSyntax(code: string): string {
  let cleaned = code;
  
  // Remove quotes around all node types
  cleaned = cleaned.replace(/\[\"([^"]*)\"\]/g, '[$1]');
  cleaned = cleaned.replace(/\{\"([^"]*)\"\}/g, '{$1}');
  cleaned = cleaned.replace(/\(\"([^"]*)\"\)/g, '($1)');
  cleaned = cleaned.replace(/\[\/\"([^"]*)\"\//g, '[/$1/]'); // Input parallelogram
  cleaned = cleaned.replace(/\[\\\"([^"]*)\"\\/g, '[\\$1\\]'); // Output parallelogram
  cleaned = cleaned.replace(/\[\(\"([^"]*)\"\)\]/g, '[($1)]'); // Database/Storage
  
  // Fix output parallelogram syntax - use single backslash format that works in Mermaid
  cleaned = cleaned.replace(/\[\\\\([^\\]*)\\\\\]/g, '[\\$1\\]'); // Convert double to single backslash
  cleaned = cleaned.replace(/\[\\([^\\]*)\\\]/g, '[\\$1\\]'); // Ensure proper format
  // Handle incomplete backslash syntax
  cleaned = cleaned.replace(/\[\\([^\\]*)\]/g, '[\\$1\\]');
  
  // Ensure input parallelograms have proper syntax (keep these as they work)
  cleaned = cleaned.replace(/\[\/([^\/]*)\]/g, '[/$1/]');
  
  // Fix double quotes in text
  cleaned = cleaned.replace(/"/g, '');
  
  // Remove problematic characters from node text that cause parser errors
  // Replace parentheses with spaces in node text
  cleaned = cleaned.replace(/\[([^\]]*)\(/g, (match, text) => {
    return `[${text.replace(/\(/g, ' ').replace(/\)/g, ' ')}`;
  });
  cleaned = cleaned.replace(/\{([^}]*)\(/g, (match, text) => {
    return `{${text.replace(/\(/g, ' ').replace(/\)/g, ' ')}`;
  });
  cleaned = cleaned.replace(/\[\/([^\/]*)\(/g, (match, text) => {
    return `[/${text.replace(/\(/g, ' ').replace(/\)/g, ' ')}`;
  });
  cleaned = cleaned.replace(/\[\\([^\\]*)\(/g, (match, text) => {
    return `[\\${text.replace(/\(/g, ' ').replace(/\)/g, ' ')}`;
  });
  
  // Clean up remaining parentheses in node text
  cleaned = cleaned.replace(/\[([^\]]*)\)/g, (match, text) => {
    return `[${text.replace(/\)/g, ' ')}]`;
  });
  cleaned = cleaned.replace(/\{([^}]*)\)/g, (match, text) => {
    return `{${text.replace(/\)/g, ' ')}}`;
  });
  
  // Remove other problematic special characters from node text (but preserve shape syntax)
  // Handle regular rectangles
  cleaned = cleaned.replace(/\[([^\]\\\/]*)\]/g, (match, text) => {
    const cleanText = text.replace(/[(){}[\],;:]/g, ' ').replace(/\s+/g, ' ').trim();
    return `[${cleanText}]`;
  });
  // Handle decisions
  cleaned = cleaned.replace(/\{([^}]*)\}/g, (match, text) => {
    const cleanText = text.replace(/[(){}[\],;:]/g, ' ').replace(/\s+/g, ' ').trim();
    return `{${cleanText}}`;
  });
  // Handle input parallelograms
  cleaned = cleaned.replace(/\[\/([^\/]*)\//g, (match, text) => {
    const cleanText = text.replace(/[(){}[\],;:]/g, ' ').replace(/\s+/g, ' ').trim();
    return `[/${cleanText}/]`;
  });
  // Handle output parallelograms with proper cleaning
  cleaned = cleaned.replace(/\[\\([^\\]*)\\/g, (match, text) => {
    const cleanText = text.replace(/[(){}[\],;:]/g, ' ').replace(/\s+/g, ' ').trim();
    return `[\\${cleanText}\\]`;
  });
  
  
  // Fix invalid node IDs (remove special characters)
  cleaned = cleaned.replace(/([A-Za-z0-9]+)\s*\[/g, (match, id) => {
    const cleanId = id.replace(/[^A-Za-z0-9]/g, '');
    return `${cleanId}[`;
  });
  
  // Fix broken arrows and connections
  cleaned = cleaned.replace(/--\s*([^-\s>]+)\s*-->/g, '-->|$1|');
  cleaned = cleaned.replace(/--\s+([^-\s>]+)\s+-->/g, '-->|$1|');
  
  // Ensure proper spacing
  cleaned = cleaned.replace(/-->/g, ' --> ');
  cleaned = cleaned.replace(/\s+-->\s+/g, ' --> ');
  
  // Remove any trailing/leading whitespace on each line
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
  
  // Remove empty lines
  cleaned = cleaned.replace(/\n\s*\n/g, '\n');
  
  // Fix malformed nodes with double closing brackets ]] (do this last after all other transformations)
  cleaned = cleaned.replace(/\]\]/g, ']');
  cleaned = cleaned.replace(/\}\}/g, '}');
  cleaned = cleaned.replace(/\)\)/g, ')');
  
  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const { algorithmText } = await req.json();

    if (!algorithmText) {
      return NextResponse.json(
        { error: 'Algorithm text is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert at converting algorithm descriptions into valid Mermaid flowchart syntax using PROPER FLOWCHART SHAPES.

MANDATORY SHAPE RULES:
1. Start/End: ([Start]) and ([End]) - ovals
2. Input: [/Input Text/] - parallelogram (left slant) - ALWAYS use this for any input operations
3. Output: [\\Output Text\\] - parallelogram (right slant) - ALWAYS use this for output operations
4. Process: [Process Step] - rectangle
5. Decision: {Question?} - diamond
6. Storage/Database: [(Database)] - cylinder

CRITICAL SYNTAX RULES:
1. Use ONLY "flowchart TD" format
2. Node IDs: MUST be single, continuous words (e.g., A, B, C1, Input1, ProcessStep). NO spaces or special characters.
3. NO quotes around text content inside shapes.
4. NO parentheses, brackets, commas, colons, or semicolons in node text.
5. Decision branches: D -->|Yes| E or D -->|No| F
6. Keep labels under 20 characters and use simple words only.
7. Links must use '-->' and be on separate lines from node definitions.
8. For ANY input operation (reading, getting, receiving data), use [/Input Text/] parallelogram
9. For ANY output operation (displaying, showing, returning, printing data), use [\\Output Text\\] parallelogram

CORRECT EXAMPLE:
flowchart TD
    Start([Start])
    Input1[/Get Material Name/]
    Process1[Convert to Lowercase]
    Decision1{In Ductile List?}
    Output1[\\Return Ductile\\]
    Decision2{In Brittle List?}
    Output2[\\Return Brittle\\]
    Output3[\\Return Unknown\\]
    End([End])
    
    Start --> Input1
    Input1 --> Process1
    Process1 --> Decision1
    Decision1 -->|Yes| Output1
    Decision1 -->|No| Decision2
    Decision2 -->|Yes| Output2
    Decision2 -->|No| Output3
    Output1 --> End
    Output2 --> End
    Output3 --> End

Convert this algorithm using EXACT shape conventions. Remember to use parallelograms for ALL input/output operations:
${algorithmText}

Return ONLY valid Mermaid flowchart code. NO explanations, NO markdown blocks.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fullResponse = response.text();

    // Extract and clean the Mermaid code from the response
    let mermaidCode = fullResponse.trim();
    
    // Remove any markdown code blocks if present
    if (mermaidCode.includes('```')) {
      const codeBlockMatch = mermaidCode.match(/```(?:mermaid)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        mermaidCode = codeBlockMatch[1].trim();
      }
    }
    
    // Remove any explanatory text before the flowchart
    const flowchartMatch = mermaidCode.match(/(flowchart\s+TD[\s\S]*)/i);
    if (flowchartMatch) {
      mermaidCode = flowchartMatch[1].trim();
    }

    // Clean up common syntax issues
    mermaidCode = cleanMermaidSyntax(mermaidCode);

    return NextResponse.json({ 
      mermaidCode: mermaidCode,
      fullResponse: fullResponse
    });
  } catch (error) {
    console.error('Error converting algorithm:', error);
    
    // Fallback to simple conversion if API fails
    const fallbackMermaidCode = `flowchart TD
    Start([Start])
    Input1[/Enter Data/]
    Process[Process Algorithm]
    Output1[\\Display Result\\]
    End([End])
    Start --> Input1
    Input1 --> Process
    Process --> Output1
    Output1 --> End`;
    
    return NextResponse.json({ 
      mermaidCode: fallbackMermaidCode,
      fallback: true 
    });
  }
}