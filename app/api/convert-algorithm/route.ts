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
  
  // Fix double quotes in text
  cleaned = cleaned.replace(/"/g, '');
  
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
2. Input: [/Input Text/] - parallelogram (left slant)
3. Output: [\Output Text\] - parallelogram (right slant)
4. Process: [Process Step] - rectangle
5. Decision: {Question?} - diamond
6. Storage/Database: [(Database)] - cylinder

CRITICAL SYNTAX RULES:
1. Use ONLY "flowchart TD" format
2. Node IDs: simple letters/numbers (A, B, C1, Input1, etc.)
3. NO quotes around text
4. Decision branches: D -->|Yes| E or D -->|No| F
5. Keep labels under 18 characters
6. NO special characters in node IDs

CORRECT EXAMPLE:
flowchart TD
    Start([Start])
    Input1[/Get Material Name/]
    Process1[Convert to Lowercase]
    Decision1{In Ductile List?}
    Output1[\Return Ductile\]
    Decision2{In Brittle List?}
    Output2[\Return Brittle\]
    Output3[\Return Unknown\]
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

Convert this algorithm using EXACT shape conventions:
${algorithmText}

Return ONLY valid Mermaid flowchart code. NO explanations, NO markdown blocks.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fullResponse = response.text();

    // Log the full response for debugging
    console.log('=== GEMINI FULL RESPONSE ===');
    console.log(fullResponse);
    console.log('=== END RESPONSE ===');

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

    console.log('=== EXTRACTED MERMAID CODE ===');
    console.log(mermaidCode);
    console.log('=== END MERMAID CODE ===');

    return NextResponse.json({ 
      mermaidCode: mermaidCode,
      fullResponse: fullResponse // Include full response for debugging
    });
  } catch (error) {
    console.error('Error converting algorithm:', error);
    
    // Fallback to simple conversion if API fails
    const fallbackMermaidCode = `flowchart TD
    Start([Start])
    Process["Process Algorithm"]
    End([End])
    Start --> Process
    Process --> End`;

    return NextResponse.json({ 
      mermaidCode: fallbackMermaidCode,
      fallback: true 
    });
  }
}