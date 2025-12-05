/**
 * Simulation Service - Offline Demo Implementation
 * A self-contained service layer for portfolio demonstration.
 * Provides Python code simulation and intelligent assistant capabilities
 * without external API dependencies.
 */

/** Stores variables during Python simulation execution */
interface SimulationContext {
  variables: Map<string, number | string | boolean>;
  output: string[];
}

/**
 * Evaluates basic mathematical expressions with variable substitution
 * @param expr - The expression string to evaluate
 * @param ctx - Current simulation context containing variable bindings
 * @returns Computed numeric result
 */
const evaluateMathExpression = (expr: string, ctx: SimulationContext): number => {
  let processed = expr.trim();
  
  ctx.variables.forEach((value, key) => {
    if (typeof value === 'number') {
      const pattern = new RegExp(`\\b${key}\\b`, 'g');
      processed = processed.replace(pattern, value.toString());
    }
  });

  processed = processed.replace(/\*\*/g, '^');
  
  const tokens = processed.match(/[\d.]+|\+|-|\*|\/|\^|\(|\)/g) || [];
  return computeFromTokens(tokens);
};

/**
 * Recursive descent parser for arithmetic token streams
 * Handles operator precedence: parentheses > exponent > multiply/divide > add/subtract
 */
const computeFromTokens = (tokens: string[]): number => {
  let pos = 0;

  const parseExpression = (): number => {
    let result = parseTerm();
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++];
      const right = parseTerm();
      result = op === '+' ? result + right : result - right;
    }
    return result;
  };

  const parseTerm = (): number => {
    let result = parseFactor();
    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
      const op = tokens[pos++];
      const right = parseFactor();
      result = op === '*' ? result * right : result / right;
    }
    return result;
  };

  const parseFactor = (): number => {
    let result = parseAtom();
    while (pos < tokens.length && tokens[pos] === '^') {
      pos++;
      const exponent = parseAtom();
      result = Math.pow(result, exponent);
    }
    return result;
  };

  const parseAtom = (): number => {
    if (tokens[pos] === '(') {
      pos++;
      const result = parseExpression();
      pos++;
      return result;
    }
    if (tokens[pos] === '-') {
      pos++;
      return -parseAtom();
    }
    return parseFloat(tokens[pos++]);
  };

  return parseExpression();
};

/**
 * Extracts the content inside a print() statement
 * Handles nested parentheses and string literals
 */
const extractPrintContent = (line: string): string | null => {
  const printMatch = line.match(/print\s*\((.*)\)\s*$/);
  if (!printMatch) return null;
  return printMatch[1].trim();
};

/**
 * Processes f-string syntax for variable interpolation
 * @param content - Raw f-string content including quotes
 * @param ctx - Simulation context for variable lookup
 */
const processFString = (content: string, ctx: SimulationContext): string => {
  const inner = content.slice(2, -1);
  return inner.replace(/\{([^}]+)\}/g, (_, varExpr) => {
    const varName = varExpr.trim();
    if (ctx.variables.has(varName)) {
      return String(ctx.variables.get(varName));
    }
    if (/[\d+\-*/]/.test(varExpr)) {
      return String(evaluateMathExpression(varExpr, ctx));
    }
    return `{${varExpr}}`;
  });
};

/**
 * Executes a single line of simulated Python code
 * @param line - Single line of Python source code
 * @param ctx - Mutable simulation context
 */
const executeLine = (line: string, ctx: SimulationContext): void => {
  const trimmed = line.trim();
  
  if (trimmed === '' || trimmed.startsWith('#')) {
    return;
  }

  const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
  if (assignMatch) {
    const [, varName, valueExpr] = assignMatch;
    const strMatch = valueExpr.match(/^["'](.*)["']$/);
    
    if (strMatch) {
      ctx.variables.set(varName, strMatch[1]);
    } else if (valueExpr === 'True') {
      ctx.variables.set(varName, true);
    } else if (valueExpr === 'False') {
      ctx.variables.set(varName, false);
    } else {
      ctx.variables.set(varName, evaluateMathExpression(valueExpr, ctx));
    }
    return;
  }

  if (trimmed.startsWith('print(')) {
    const content = extractPrintContent(trimmed);
    if (content === null) {
      ctx.output.push('SyntaxError: invalid print statement');
      return;
    }

    if (content.startsWith('f"') || content.startsWith("f'")) {
      ctx.output.push(processFString(content, ctx));
      return;
    }

    const stringMatch = content.match(/^["'](.*)["']$/);
    if (stringMatch) {
      ctx.output.push(stringMatch[1]);
      return;
    }

    if (ctx.variables.has(content)) {
      ctx.output.push(String(ctx.variables.get(content)));
      return;
    }

    const numericResult = evaluateMathExpression(content, ctx);
    ctx.output.push(String(numericResult));
    return;
  }

  if (trimmed.startsWith('for ') || trimmed.startsWith('while ') || 
      trimmed.startsWith('if ') || trimmed.startsWith('def ') ||
      trimmed.startsWith('class ') || trimmed.startsWith('import ') ||
      trimmed.startsWith('from ')) {
    throw new Error(`UnsupportedOperation: '${trimmed.split(' ')[0]}' statements require full interpreter`);
  }
};

/**
 * Simulates Python code execution locally using a JavaScript-based interpreter.
 * Supports basic operations including variable assignment, arithmetic, and print statements.
 * @param code - Python source code to simulate
 * @returns Promise resolving to simulated execution output
 */
export const runPythonSimulation = async (code: string): Promise<string> => {
  const ctx: SimulationContext = {
    variables: new Map(),
    output: []
  };

  try {
    const lines = code.split('\n');
    
    for (const line of lines) {
      executeLine(line, ctx);
    }

    return ctx.output.length > 0 ? ctx.output.join('\n') : '';
  } catch (error) {
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return 'RuntimeError: execution failed unexpectedly';
  }
};

/** Response patterns for the assistant with weighted keyword matching */
interface ResponsePattern {
  triggers: string[];
  response: string;
  requiresAll?: boolean;
}

const assistantPatterns: ResponsePattern[] = [
  {
    triggers: ['hello', 'hi', 'hey', 'greetings'],
    response: 'Hello! How can I assist you today?'
  },
  {
    triggers: ['how are you', 'how do you do'],
    response: "I'm functioning well, thank you for asking. What can I help you with?"
  },
  {
    triggers: ['what', 'your', 'name'],
    response: "I'm an AI assistant built into this application to help answer your questions.",
    requiresAll: true
  },
  {
    triggers: ['thank', 'thanks'],
    response: "You're welcome! Let me know if there's anything else I can help with."
  },
  {
    triggers: ['bye', 'goodbye', 'see you'],
    response: 'Goodbye! Feel free to return if you have more questions.'
  },
  {
    triggers: ['python'],
    response: 'Python is a high-level, interpreted programming language known for its readability and versatility. It supports multiple paradigms including procedural, object-oriented, and functional programming.'
  },
  {
    triggers: ['javascript', 'js'],
    response: 'JavaScript is a dynamic scripting language primarily used for web development. It runs in browsers and on servers via Node.js, enabling full-stack development with a single language.'
  },
  {
    triggers: ['typescript', 'ts'],
    response: 'TypeScript is a strongly-typed superset of JavaScript developed by Microsoft. It adds static type checking and modern ECMAScript features, compiling down to plain JavaScript.'
  },
  {
    triggers: ['what', 'is', 'variable'],
    response: 'A variable is a named storage location in memory that holds a value. Variables allow programs to store, retrieve, and manipulate data during execution.',
    requiresAll: true
  },
  {
    triggers: ['what', 'is', 'function'],
    response: 'A function is a reusable block of code that performs a specific task. Functions accept inputs (parameters), process them, and optionally return an output value.',
    requiresAll: true
  },
  {
    triggers: ['what', 'is', 'loop'],
    response: 'A loop is a control structure that repeats a block of code while a condition is true. Common types include for loops (counted iteration) and while loops (conditional iteration).',
    requiresAll: true
  },
  {
    triggers: ['what', 'is', 'api'],
    response: 'An API (Application Programming Interface) is a set of protocols that allows different software applications to communicate. APIs define methods and data formats for requesting and exchanging information.',
    requiresAll: true
  },
  {
    triggers: ['explain', 'recursion'],
    response: 'Recursion is a technique where a function calls itself to solve smaller instances of the same problem. It requires a base case to terminate and is useful for tree traversal, factorial calculation, and divide-and-conquer algorithms.'
  },
  {
    triggers: ['help', 'can you do', 'capabilities'],
    response: 'I can answer questions about programming concepts, explain technical terms, perform basic calculations, and provide general assistance. Try asking me about languages, algorithms, or coding concepts!'
  },
  {
    triggers: ['weather'],
    response: "I don't have access to real-time weather data in demo mode. For current conditions, please check a dedicated weather service."
  }
];

/**
 * Attempts to parse and evaluate a mathematical question
 * @param prompt - User's natural language math query
 * @returns Calculated result or null if not a math question
 */
const tryMathResponse = (prompt: string): string | null => {
  const mathPatterns = [
    /what(?:'s| is)\s+([\d\s+\-*/().^]+)/i,
    /calculate\s+([\d\s+\-*/().^]+)/i,
    /compute\s+([\d\s+\-*/().^]+)/i,
    /([\d]+)\s*(plus|\+)\s*([\d]+)/i,
    /([\d]+)\s*(minus|-)\s*([\d]+)/i,
    /([\d]+)\s*(times|\*|x)\s*([\d]+)/i,
    /([\d]+)\s*(divided by|\/)\s*([\d]+)/i
  ];

  for (const pattern of mathPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      let expression = match[1] || `${match[1]} ${match[2]} ${match[3]}`;
      expression = expression
        .replace(/plus/gi, '+')
        .replace(/minus/gi, '-')
        .replace(/times/gi, '*')
        .replace(/x(?=\s*\d)/gi, '*')
        .replace(/divided by/gi, '/');
      
      const ctx: SimulationContext = { variables: new Map(), output: [] };
      const result = evaluateMathExpression(expression, ctx);
      
      if (!isNaN(result)) {
        return `The result is ${result}.`;
      }
    }
  }
  return null;
};

/**
 * Finds the best matching response pattern for a given prompt
 * @param prompt - Normalized user input
 * @returns Matched response string or null
 */
const findPatternMatch = (prompt: string): string | null => {
  const normalized = prompt.toLowerCase();
  
  for (const pattern of assistantPatterns) {
    if (pattern.requiresAll) {
      const allPresent = pattern.triggers.every(trigger => 
        normalized.includes(trigger.toLowerCase())
      );
      if (allPresent) return pattern.response;
    } else {
      const anyPresent = pattern.triggers.some(trigger =>
        normalized.includes(trigger.toLowerCase())
      );
      if (anyPresent) return pattern.response;
    }
  }
  return null;
};

/**
 * Provides intelligent responses to user prompts using pattern matching
 * and basic natural language understanding.
 * @param prompt - User's question or statement
 * @returns Promise resolving to an appropriate response
 */
export const askAssistant = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim().length === 0) {
    return "I didn't receive a question. Could you please try again?";
  }

  const mathResult = tryMathResponse(prompt);
  if (mathResult) {
    return mathResult;
  }

  const patternMatch = findPatternMatch(prompt);
  if (patternMatch) {
    return patternMatch;
  }

  const wordCount = prompt.trim().split(/\s+/).length;
  if (wordCount < 3) {
    return "Could you provide more details? I'd be happy to help with a more specific question.";
  }

  return "I understand you're asking about something, but I don't have specific information on that topic in demo mode. Try asking about programming concepts, or use the code simulator for Python execution.";
};
