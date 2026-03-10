from dataclasses import dataclass

def _formatar_contexto(fonte: str | None, posicao: int) -> str:
    """
    Mostra a linha de entrada e uma seta (^) apontando para a posi\u00e7\u00e3o do erro.
    """
    if fonte is None:
        return ""

    # Garante posicao dentro de limites (EOF pode ser len(fonte))
    p = max(0, min(posicao, len(fonte)))

    linha = fonte
    seta = " " * p + "^"

    return f"\nEntrada: {linha}\n         {seta}"


@dataclass(frozen=True)
class ErroLexico(Exception):
    mensagem: str
    posicao: int
    fonte: str | None = None

    def __str__(self) -> str:
        return f"[ERRO LÉXICO] posição {self.posicao}: {self.mensagem}{_formatar_contexto(self.fonte, self.posicao)}"


@dataclass(frozen=True)
class ErroSintatico(Exception):
    mensagem: str
    posicao: int
    fonte: str | None = None

    def __str__(self) -> str:
        return f"[ERRO SINTÁTICO] posição {self.posicao}: {self.mensagem}{_formatar_contexto(self.fonte, self.posicao)}"
