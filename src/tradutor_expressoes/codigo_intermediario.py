from dataclasses import dataclass

@dataclass(frozen=True)
class Instrucao:
    """
    Instrução de código intermediário (3 endereços).
    op: "LOADI", "ADD", "MUL"
    """
    op: str
    dst: str
    a: str | None = None
    b: str | None = None
    imm: int | None = None


class GeradorIR:
    """
    Gera instruções de 3 endereços durante o parsing.
    """
    def __init__(self):
        self.codigo: list[Instrucao] = []
        self._temp = 0

    def _novo_temporario(self) -> str:
        self._temp += 1
        return f"t{self._temp}"

    def carregar_constante(self, valor: int) -> str:
        t = self._novo_temporario()
        self.codigo.append(Instrucao(op="LOADI", dst=t, imm=valor))
        return t

    def somar(self, esquerda: str, direita: str) -> str:
        t = self._novo_temporario()
        self.codigo.append(Instrucao(op="ADD", dst=t, a=esquerda, b=direita))
        return t

    def multiplicar(self, esquerda: str, direita: str) -> str:
        t = self._novo_temporario()
        self.codigo.append(Instrucao(op="MUL", dst=t, a=esquerda, b=direita))
        return t


def executar_ir(codigo: list[Instrucao]) -> int:
    """
    Executa a IR e retorna o resultado final.
    """
    memoria: dict[str, int] = {}

    for ins in codigo:
        if ins.op == "LOADI":
            memoria[ins.dst] = int(ins.imm)
        elif ins.op == "ADD":
            memoria[ins.dst] = memoria[ins.a] + memoria[ins.b]
        elif ins.op == "MUL":
            memoria[ins.dst] = memoria[ins.a] * memoria[ins.b]
        else:
            raise RuntimeError(f"Operação IR inválida: {ins.op}")

    return memoria[codigo[-1].dst] if codigo else 0


def executar_ir_com_passos(codigo: list[Instrucao]) -> tuple[int, list[str]]:
    """
    Executa a IR e também retorna passos didáticos com as contas realizadas.
    Ex.: "t4 = 3 * 4 = 12"
    """
    memoria: dict[str, int] = {}
    passos: list[str] = []

    for ins in codigo:
        if ins.op == "LOADI":
            memoria[ins.dst] = int(ins.imm)
            passos.append(f"{ins.dst} = {memoria[ins.dst]}")
        elif ins.op == "ADD":
            va = memoria[ins.a]
            vb = memoria[ins.b]
            memoria[ins.dst] = va + vb
            passos.append(f"{ins.dst} = {va} + {vb} = {memoria[ins.dst]}")
        elif ins.op == "MUL":
            va = memoria[ins.a]
            vb = memoria[ins.b]
            memoria[ins.dst] = va * vb
            passos.append(f"{ins.dst} = {va} * {vb} = {memoria[ins.dst]}")
        else:
            raise RuntimeError(f"Operação IR inválida: {ins.op}")

    resultado = memoria[codigo[-1].dst] if codigo else 0
    return resultado, passos


def formatar_ir(codigo: list[Instrucao]) -> str:
    """
    Formata a IR para exibição (3 endereços).
    """
    linhas: list[str] = []
    for ins in codigo:
        if ins.op == "LOADI":
            linhas.append(f"{ins.dst} = {ins.imm}")
        elif ins.op == "ADD":
            linhas.append(f"{ins.dst} = {ins.a} + {ins.b}")
        elif ins.op == "MUL":
            linhas.append(f"{ins.dst} = {ins.a} * {ins.b}")
    return "\n".join(linhas)
