import { useMemo, useState } from 'react';
import { Github, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { compilar, type Token, type TokenType } from './compiler';
import AstTree from './components/AstTree';

const EXAMPLES = ['2 + 3 * 4', '(2 + 3) * 4', '1 + 2 + 3 + 4', '2 * (3 + (4 * 5))', '7'];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const TOKEN_STYLE: Record<TokenType, string> = {
  NUMERO: 'text-green border-green/40 bg-green/5',
  MAIS: 'text-accent border-accent/40 bg-accent/5',
  VEZES: 'text-pink border-pink/40 bg-pink/5',
  ABRE_PAREN: 'text-amber border-amber/40 bg-amber/5',
  FECHA_PAREN: 'text-amber border-amber/40 bg-amber/5',
  FIM: 'text-muted border-line bg-ink',
};

export default function App() {
  const [src, setSrc] = useState('2 + 3 * 4');
  const result = useMemo(() => compilar(src), [src]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-line bg-panel/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-white shadow-sm shadow-accent/30">
              <Zap size={18} />
            </span>
            <div>
              <h1 className="font-display text-xl font-600 leading-none text-navy">
                Expression Compiler
              </h1>
              <p className="mt-0.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted">
                Léxico → Sintático → IR
              </p>
            </div>
          </div>
          <a
            href="https://github.com/LeonardoPCavalcanti/python-expression-compiler"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-navy"
          >
            <Github size={16} /> <span className="hidden sm:inline">Código</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <h2 className="font-display text-4xl font-900 leading-[1.02] text-navy sm:text-5xl">
            Veja um compilador
            <br />
            <span className="text-accent">pensar em voz alta.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            Digite uma expressão aritmética (inteiros, <code className="text-accent">+</code>,{' '}
            <code className="text-pink">*</code> e parênteses). O compilador roda inteiro no seu
            navegador e revela, ao vivo, cada fase:{' '}
            <strong className="text-navy">tokens</strong>,{' '}
            <strong className="text-navy">árvore sintática</strong>,{' '}
            <strong className="text-navy">código de 3 endereços</strong> e a{' '}
            <strong className="text-navy">execução</strong>.
          </p>
        </motion.div>

        {/* Input */}
        <div className="mt-8 rounded-xl border border-line bg-panel p-4 shadow-sm shadow-navy/5">
          <label className="mb-2 block font-mono text-[0.66rem] font-500 uppercase tracking-[0.18em] text-muted">
            Expressão
          </label>
          <input
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            spellCheck={false}
            autoFocus
            className="w-full rounded-lg border border-line bg-ink px-4 py-3 font-mono text-lg text-navy outline-none transition-colors focus:border-accent"
            placeholder="ex.: 2 + 3 * 4"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.7rem] text-muted">Exemplos:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setSrc(ex)}
                className="rounded-md border border-line bg-panel px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-navy"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Erro */}
        {!result.ok && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="mt-4 rounded-xl border border-pink/40 bg-pink/5 p-4"
          >
            <div className="flex items-center gap-2 text-sm font-600 text-pink">
              <AlertTriangle size={16} /> Erro {result.error.stage}
            </div>
            <p className="mt-1 text-sm text-navy/80">{result.error.message}</p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-ink p-3 font-mono text-sm leading-relaxed">
              <span className="text-navy">{src || ' '}</span>
              {'\n'}
              <span className="text-pink">{' '.repeat(Math.max(0, result.error.posicao))}^</span>
            </pre>
          </motion.div>
        )}

        {/* Resultado em fases */}
        {result.ok && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* Tokens */}
            <Panel title="1 · Tokens (análise léxica)" index={0}>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {result.tokens.map((t, i) => (
                    <TokenChip key={`${t.tipo}-${t.lexema}-${i}`} token={t} delay={i * 0.04} />
                  ))}
                </AnimatePresence>
              </div>
            </Panel>

            {/* AST */}
            <Panel title="2 · Árvore Sintática (parser LL(1))" index={1}>
              <AstTree node={result.ast} />
            </Panel>

            {/* IR */}
            <Panel title="3 · Código de 3 Endereços (IR)" index={2}>
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-navy/90">
                {result.irText || '(vazio)'}
              </pre>
            </Panel>

            {/* Execução */}
            <Panel title="4 · Execução passo a passo" index={3}>
              <div className="space-y-1.5">
                {result.passos.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05, ease: EASE_OUT_EXPO }}
                    className="flex items-center gap-2 font-mono text-sm"
                  >
                    <span className="text-accent">{p.reg}</span>
                    <ArrowRight size={13} className="text-muted" />
                    <span className="text-navy/80">{p.text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm text-muted">Resultado</span>
                <motion.span
                  key={result.resultado}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                  className="font-display text-3xl font-900 text-green"
                >
                  {result.resultado}
                </motion.span>
              </div>
            </Panel>
          </div>
        )}

        {/* Gramática */}
        <div className="mt-8 rounded-xl border border-line bg-panel p-5 shadow-sm shadow-navy/5">
          <h2 className="mb-3 font-mono text-[0.66rem] font-600 uppercase tracking-[0.18em] text-muted">
            Gramática (LL(1))
          </h2>
          <pre className="font-mono text-sm leading-relaxed text-navy/75">
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

        <footer className="mt-10 text-center font-mono text-xs text-muted">
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

function Panel({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 + index * 0.08, ease: EASE_OUT_EXPO }}
      className="rounded-xl border border-line bg-panel p-5 shadow-sm shadow-navy/5"
    >
      <h2 className="mb-4 font-mono text-[0.66rem] font-600 uppercase tracking-[0.18em] text-muted">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function TokenChip({ token, delay }: { token: Token; delay: number }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.7, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.3, delay, ease: EASE_OUT_EXPO }}
      className={`inline-flex flex-col items-center rounded-md border px-2.5 py-1 ${TOKEN_STYLE[token.tipo]}`}
    >
      <span className="font-mono text-sm font-600">
        {token.tipo === 'FIM' ? 'EOF' : token.lexema}
      </span>
      <span className="text-[0.55rem] uppercase tracking-wide opacity-70">{token.tipo}</span>
    </motion.span>
  );
}
