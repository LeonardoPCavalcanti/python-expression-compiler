import { useMemo, useState } from 'react';
import { Github, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { compilar, type Token, type TokenType } from './compiler';
import AstTree from './components/AstTree';

const EXAMPLES = ['2 + 3 * 4', '(2 + 3) * 4', '1 + 2 + 3 + 4', '2 * (3 + (4 * 5))', '7'];

const TOKEN_STYLE: Record<TokenType, string> = {
  NUMERO: 'text-green border-green/40',
  MAIS: 'text-accent border-accent/40',
  VEZES: 'text-pink border-pink/40',
  ABRE_PAREN: 'text-amber border-amber/40',
  FECHA_PAREN: 'text-amber border-amber/40',
  FIM: 'text-muted border-line',
};

export default function App() {
  const [src, setSrc] = useState('2 + 3 * 4');
  const result = useMemo(() => compilar(src), [src]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-line bg-panel/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent">
              <Zap size={18} />
            </span>
            <div>
              <h1 className="font-700 leading-tight">Expression Compiler</h1>
              <p className="text-[0.7rem] text-muted">Playground · Léxico → Sintático → IR</p>
            </div>
          </div>
          <a
            href="https://github.com/LeonardoPCavalcanti/python-expression-compiler"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-white"
          >
            <Github size={16} /> <span className="hidden sm:inline">Código</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
          Digite uma expressão aritmética (inteiros, <code className="text-accent">+</code>,{' '}
          <code className="text-pink">*</code> e parênteses). O compilador roda inteiro no seu
          navegador e mostra, ao vivo, cada fase: <strong className="text-white">tokens</strong>,{' '}
          <strong className="text-white">árvore sintática</strong>,{' '}
          <strong className="text-white">código de 3 endereços</strong> e a{' '}
          <strong className="text-white">execução</strong>.
        </p>

        {/* Input */}
        <div className="rounded-xl border border-line bg-panel p-4">
          <label className="mb-2 block text-[0.7rem] font-600 uppercase tracking-wider text-muted">
            Expressão
          </label>
          <input
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            spellCheck={false}
            autoFocus
            className="w-full rounded-lg border border-line bg-ink px-4 py-3 font-mono text-lg text-white outline-none focus:border-accent"
            placeholder="ex.: 2 + 3 * 4"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[0.7rem] text-muted">Exemplos:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setSrc(ex)}
                className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-white"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Erro */}
        {!result.ok && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-600 text-red-300">
              <AlertTriangle size={16} /> Erro {result.error.stage}
            </div>
            <p className="mt-1 text-sm text-red-200/90">{result.error.message}</p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-ink p-3 font-mono text-sm leading-relaxed">
              <span className="text-white">{src || ' '}</span>
              {'\n'}
              <span className="text-red-400">
                {' '.repeat(Math.max(0, result.error.posicao))}^
              </span>
            </pre>
          </div>
        )}

        {/* Resultado em fases */}
        {result.ok && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* Tokens */}
            <Panel title="1 · Tokens (análise léxica)">
              <div className="flex flex-wrap gap-2">
                {result.tokens.map((t, i) => (
                  <TokenChip key={i} token={t} />
                ))}
              </div>
            </Panel>

            {/* AST */}
            <Panel title="2 · Árvore Sintática (parser LL(1))">
              <AstTree node={result.ast} />
            </Panel>

            {/* IR */}
            <Panel title="3 · Código de 3 Endereços (IR)">
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-white/90">
                {result.irText || '(vazio)'}
              </pre>
            </Panel>

            {/* Execução */}
            <Panel title="4 · Execução passo a passo">
              <div className="space-y-1.5">
                {result.passos.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-accent">{p.reg}</span>
                    <ArrowRight size={13} className="text-muted" />
                    <span className="text-white/80">{p.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm text-muted">Resultado</span>
                <span className="font-mono text-2xl font-700 text-green">{result.resultado}</span>
              </div>
            </Panel>
          </div>
        )}

        {/* Gramática */}
        <div className="mt-8 rounded-xl border border-line bg-panel p-5">
          <h2 className="mb-3 text-[0.7rem] font-600 uppercase tracking-wider text-muted">
            Gramática (LL(1))
          </h2>
          <pre className="font-mono text-sm leading-relaxed text-white/70">
            {`E  → T E'
E' → + T E' | ε
T  → F T'
T' → * F T' | ε
F  → número | ( E )`}
          </pre>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Fatorada para eliminar recursão à esquerda e codificar precedência: <code>*</code> liga
            mais forte que <code>+</code> porque é resolvido em <code>T/T'</code>, mais fundo na
            árvore que <code>E/E'</code>.
          </p>
        </div>

        <footer className="mt-10 text-center text-xs text-muted">
          Compilador portado de Python para TypeScript · roda 100% no navegador ·{' '}
          <a
            href="https://github.com/LeonardoPCavalcanti"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:text-accent hover:underline"
          >
            Leonardo Cavalcanti
          </a>
        </footer>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <h2 className="mb-4 text-[0.7rem] font-600 uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}

function TokenChip({ token }: { token: Token }) {
  return (
    <span
      className={`inline-flex flex-col items-center rounded-md border bg-ink px-2.5 py-1 ${TOKEN_STYLE[token.tipo]}`}
    >
      <span className="font-mono text-sm font-600">{token.tipo === 'FIM' ? 'EOF' : token.lexema}</span>
      <span className="text-[0.55rem] uppercase tracking-wide opacity-70">{token.tipo}</span>
    </span>
  );
}
