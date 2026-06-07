// ─────────────────────────────────────────────────────────────────────────
// Port em TypeScript do compilador de expressões (originalmente em Python).
//
// Pipeline: análise léxica → parser LL(1) por descida recursiva (construindo
// a AST) → geração de código intermediário de 3 endereços → execução passo a
// passo. Mantém a mesma gramática, os mesmos nomes de token e o mesmo formato
// de IR/erros da implementação Python deste repositório.
//
// Gramática (LL(1), fatorada para precedência e sem recursão à esquerda):
//   E  → T E'
//   E' → + T E' | ε
//   T  → F T'
//   T' → * F T' | ε
//   F  → NUMERO | ( E )
// ─────────────────────────────────────────────────────────────────────────

export type TokenType = 'NUMERO' | 'MAIS' | 'VEZES' | 'ABRE_PAREN' | 'FECHA_PAREN' | 'FIM';

export interface Token {
  tipo: TokenType;
  lexema: string;
  valor: number | null;
  posicao: number;
}

// ── AST ──────────────────────────────────────────────────────────────────
export type AstNode =
  | { kind: 'num'; value: number }
  | { kind: 'bin'; op: '+' | '*'; left: AstNode; right: AstNode };

// ── IR (3 endereços) ─────────────────────────────────────────────────────
export interface Instr {
  op: 'LOADI' | 'ADD' | 'MUL';
  dst: string;
  a?: string;
  b?: string;
  imm?: number;
}

export class CompileError extends Error {
  constructor(
    public stage: 'léxico' | 'sintático',
    message: string,
    public posicao: number,
  ) {
    super(message);
  }
}

// ── Léxico ───────────────────────────────────────────────────────────────
const PADRAO = /\s+|\d+|\+|\*|\(|\)/y; // 'y' = sticky: casa a partir de lastIndex

export function tokenizar(texto: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < texto.length) {
    PADRAO.lastIndex = pos;
    const m = PADRAO.exec(texto);
    if (!m || m.index !== pos) {
      throw new CompileError('léxico', `símbolo inválido '${texto[pos]}'`, pos);
    }
    const lexema = m[0];
    const start = pos;
    pos = PADRAO.lastIndex;
    if (/^\s+$/.test(lexema)) continue; // espaços ignorados
    if (/^\d+$/.test(lexema)) {
      tokens.push({ tipo: 'NUMERO', lexema, valor: parseInt(lexema, 10), posicao: start });
    } else {
      const map: Record<string, TokenType> = {
        '+': 'MAIS',
        '*': 'VEZES',
        '(': 'ABRE_PAREN',
        ')': 'FECHA_PAREN',
      };
      tokens.push({ tipo: map[lexema], lexema, valor: null, posicao: start });
    }
  }
  tokens.push({ tipo: 'FIM', lexema: '', valor: null, posicao: texto.length });
  return tokens;
}

// ── Parser (constrói AST + gera IR) ──────────────────────────────────────
class Parser {
  private i = 0;
  private temp = 0;
  ir: Instr[] = [];
  private parenStack: number[] = [];

  constructor(private tokens: Token[]) {}

  private atual(): Token {
    return this.tokens[this.i];
  }

  private consumir(tipo: TokenType): Token {
    const t = this.atual();
    if (t.tipo !== tipo) {
      if (tipo === 'FECHA_PAREN' && t.tipo === 'FIM' && this.parenStack.length) {
        throw new CompileError(
          'sintático',
          `faltou ')': parêntese '(' aberto na posição ${this.parenStack[this.parenStack.length - 1]} não foi fechado`,
          t.posicao,
        );
      }
      throw new CompileError('sintático', `esperado ${tipo}, encontrado ${t.tipo}`, t.posicao);
    }
    this.i++;
    return t;
  }

  private novoTemp(): string {
    this.temp += 1;
    return `t${this.temp}`;
  }

  parse(): AstNode {
    const ast = this.expressao();
    this.consumir('FIM');
    return ast;
  }

  // E → T E'
  private expressao(): AstNode {
    return this.expressaoLinha(this.termo());
  }

  // E' → + T E' | ε
  private expressaoLinha(herdado: AstNode): AstNode {
    while (this.atual().tipo === 'MAIS') {
      this.consumir('MAIS');
      const dir = this.termo();
      const t = this.novoTemp();
      this.ir.push({ op: 'ADD', dst: t, a: this.regOf(herdado), b: this.regOf(dir) });
      herdado = { kind: 'bin', op: '+', left: herdado, right: dir };
      this.astReg.set(herdado, t);
    }
    return herdado;
  }

  // T → F T'
  private termo(): AstNode {
    return this.termoLinha(this.fator());
  }

  // T' → * F T' | ε
  private termoLinha(herdado: AstNode): AstNode {
    while (this.atual().tipo === 'VEZES') {
      this.consumir('VEZES');
      const dir = this.fator();
      const t = this.novoTemp();
      this.ir.push({ op: 'MUL', dst: t, a: this.regOf(herdado), b: this.regOf(dir) });
      herdado = { kind: 'bin', op: '*', left: herdado, right: dir };
      this.astReg.set(herdado, t);
    }
    return herdado;
  }

  // F → NUMERO | ( E )
  private fator(): AstNode {
    const t = this.atual();
    if (t.tipo === 'NUMERO') {
      this.consumir('NUMERO');
      const reg = this.novoTemp();
      this.ir.push({ op: 'LOADI', dst: reg, imm: t.valor! });
      const node: AstNode = { kind: 'num', value: t.valor! };
      this.astReg.set(node, reg);
      return node;
    }
    if (t.tipo === 'ABRE_PAREN') {
      this.parenStack.push(t.posicao);
      this.consumir('ABRE_PAREN');
      if (this.atual().tipo === 'FIM') {
        throw new CompileError(
          'sintático',
          `parêntese '(' aberto na posição ${t.posicao}, mas não há expressão dentro dele`,
          this.atual().posicao,
        );
      }
      const node = this.expressao();
      this.consumir('FECHA_PAREN');
      this.parenStack.pop();
      return node;
    }
    if (t.tipo === 'MAIS' || t.tipo === 'VEZES') {
      throw new CompileError(
        'sintático',
        `operador '${t.lexema}' em posição inválida: faltou um número ou '(' antes/depois do operador`,
        t.posicao,
      );
    }
    if (t.tipo === 'FECHA_PAREN') {
      throw new CompileError(
        'sintático',
        "encontrou ')' sem uma expressão válida antes (parêntese fechando sem abrir corretamente)",
        t.posicao,
      );
    }
    throw new CompileError(
      'sintático',
      "fim inesperado da entrada: faltou um número ou '(' para completar a expressão",
      t.posicao,
    );
  }

  // Mapeia cada nó da AST ao temporário que carrega seu valor (para gerar IR).
  private astReg = new Map<AstNode, string>();
  private regOf(node: AstNode): string {
    return this.astReg.get(node)!;
  }
}

// ── Formatação e execução da IR ──────────────────────────────────────────
export function formatarIR(ir: Instr[]): string {
  return ir
    .map((ins) =>
      ins.op === 'LOADI'
        ? `${ins.dst} = ${ins.imm}`
        : `${ins.dst} = ${ins.a} ${ins.op === 'ADD' ? '+' : '*'} ${ins.b}`,
    )
    .join('\n');
}

export interface ExecStep {
  reg: string;
  text: string;
  value: number;
}

export function executarComPassos(ir: Instr[]): { resultado: number; passos: ExecStep[] } {
  const mem: Record<string, number> = {};
  const passos: ExecStep[] = [];
  for (const ins of ir) {
    if (ins.op === 'LOADI') {
      mem[ins.dst] = ins.imm!;
      passos.push({ reg: ins.dst, text: `${ins.dst} = ${ins.imm}`, value: ins.imm! });
    } else {
      const va = mem[ins.a!];
      const vb = mem[ins.b!];
      const r = ins.op === 'ADD' ? va + vb : va * vb;
      mem[ins.dst] = r;
      const sym = ins.op === 'ADD' ? '+' : '*';
      passos.push({ reg: ins.dst, text: `${ins.dst} = ${va} ${sym} ${vb} = ${r}`, value: r });
    }
  }
  const resultado = ir.length ? mem[ir[ir.length - 1].dst] : 0;
  return { resultado, passos };
}

// ── Fachada ──────────────────────────────────────────────────────────────
export interface CompileOk {
  ok: true;
  tokens: Token[];
  ast: AstNode;
  ir: Instr[];
  irText: string;
  passos: ExecStep[];
  resultado: number;
}
export interface CompileFail {
  ok: false;
  tokens: Token[];
  error: CompileError;
}

export function compilar(texto: string): CompileOk | CompileFail {
  let tokens: Token[] = [];
  try {
    tokens = tokenizar(texto);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const ir = parser.ir;
    const { resultado, passos } = executarComPassos(ir);
    return { ok: true, tokens, ast, ir, irText: formatarIR(ir), passos, resultado };
  } catch (e) {
    if (e instanceof CompileError) return { ok: false, tokens, error: e };
    throw e;
  }
}
