import type { Token, TokenType } from './tokenizer';

const PRECEDENCE: Partial<Record<TokenType, number>> = {
  UNION: 1,
  CONCAT: 2,
  STAR: 3,
  PLUS: 3,
  OPTIONAL: 3,
};

const RIGHT_ASSOC = new Set<TokenType>(['STAR', 'PLUS', 'OPTIONAL']);

function isOperator(type: TokenType): boolean {
  return type in PRECEDENCE;
}

export interface PostfixResult {
  postfix: string[];
  tokens: Token[];
  error?: string;
}

/**
 * Convierte tokens normalizados a notación postfix (Shunting Yard).
 */
export function toPostfix(tokens: Token[]): PostfixResult {
  const output: Token[] = [];
  const stack: Token[] = [];
  const postfixDisplay: string[] = [];

  for (const token of tokens) {
    if (token.type === 'EOF') break;

    if (token.type === 'CHAR' || token.type === 'EPSILON') {
      output.push(token);
      postfixDisplay.push(token.value);
    } else if (token.type === 'STAR' || token.type === 'PLUS' || token.type === 'OPTIONAL') {
      while (
        stack.length > 0 &&
        isOperator(stack[stack.length - 1].type) &&
        (PRECEDENCE[stack[stack.length - 1].type]! > PRECEDENCE[token.type]! ||
          (PRECEDENCE[stack[stack.length - 1].type]! === PRECEDENCE[token.type]! &&
            !RIGHT_ASSOC.has(token.type)))
      ) {
        const op = stack.pop()!;
        output.push(op);
        postfixDisplay.push(op.value);
      }
      stack.push(token);
    } else if (token.type === 'CONCAT' || token.type === 'UNION') {
      while (
        stack.length > 0 &&
        stack[stack.length - 1].type !== 'LPAREN' &&
        isOperator(stack[stack.length - 1].type) &&
        PRECEDENCE[stack[stack.length - 1].type]! >= PRECEDENCE[token.type]!
      ) {
        const op = stack.pop()!;
        output.push(op);
        postfixDisplay.push(op.value);
      }
      stack.push(token);
    } else if (token.type === 'LPAREN') {
      stack.push(token);
    } else if (token.type === 'RPAREN') {
      while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
        const op = stack.pop()!;
        output.push(op);
        postfixDisplay.push(op.value);
      }
      if (stack.length === 0) {
        return { postfix: [], tokens: [], error: 'Paréntesis desbalanceados.' };
      }
      stack.pop();
    }
  }

  while (stack.length > 0) {
    const op = stack.pop()!;
    if (op.type === 'LPAREN' || op.type === 'RPAREN') {
      return { postfix: [], tokens: [], error: 'Paréntesis desbalanceados.' };
    }
    output.push(op);
    postfixDisplay.push(op.value);
  }

  return { postfix: postfixDisplay, tokens: output };
}
