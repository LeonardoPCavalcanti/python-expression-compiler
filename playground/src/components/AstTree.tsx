import type { AstNode } from '../compiler';

/**
 * Renderiza a AST como uma árvore visual: nós-operador (+, *) no topo com seus
 * dois filhos abaixo, conectados por linhas; folhas são números. A precedência
 * fica evidente — multiplicações aparecem mais "fundas" que somas.
 */
export default function AstTree({ node }: { node: AstNode }) {
  return (
    <div className="flex justify-center overflow-x-auto pb-2">
      <Node node={node} />
    </div>
  );
}

function Node({ node }: { node: AstNode }) {
  if (node.kind === 'num') {
    return (
      <div className="flex flex-col items-center">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-green/40 bg-green/10 font-mono text-sm font-700 text-green">
          {node.value}
        </span>
      </div>
    );
  }

  const opColor = node.op === '*' ? 'text-pink border-pink/40 bg-pink/10' : 'text-accent border-accent/40 bg-accent/10';
  return (
    <div className="flex flex-col items-center">
      <span
        className={`grid h-10 w-10 place-items-center rounded-lg border font-mono text-lg font-700 ${opColor}`}
      >
        {node.op}
      </span>
      {/* conector vertical */}
      <span className="h-4 w-px bg-line" />
      <div className="flex items-start gap-6 border-t border-line pt-4">
        <div className="relative">
          <span className="absolute -top-4 left-1/2 h-4 w-px bg-line" />
          <Node node={node.left} />
        </div>
        <div className="relative">
          <span className="absolute -top-4 left-1/2 h-4 w-px bg-line" />
          <Node node={node.right} />
        </div>
      </div>
    </div>
  );
}
