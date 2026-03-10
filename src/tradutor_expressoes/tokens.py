from dataclasses import dataclass
from enum import Enum, auto

class TipoToken(Enum):
    NUMERO = auto()
    MAIS = auto()
    VEZES = auto()
    ABRE_PAREN = auto()
    FECHA_PAREN = auto()
    FIM = auto()

@dataclass(frozen=True)
class Token:
    """
    Representa um token da linguagem.
    """
    tipo: TipoToken
    lexema: str
    valor: int | None
    posicao: int
