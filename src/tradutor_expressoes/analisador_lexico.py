import re
from .tokens import Token, TipoToken
from .erros import ErroLexico

# Expressões regulares nomeadas: cada grupo (?P<NOME>...) representa um tipo de token.
# A ordem importa: o regex tenta casar a partir da posição atual e pega o primeiro que encaixar.
PADRAO_TOKEN = re.compile(
    r"""
    (?P<ESPACO>\s+)|          # espaços em branco (serão ignorados)
    (?P<NUMERO>\d+)|          # inteiros não-negativos
    (?P<MAIS>\+)|             # operador +
    (?P<VEZES>\*)|            # operador *
    (?P<ABRE_PAREN>\()|       # (
    (?P<FECHA_PAREN>\))       # )
    """,
    re.VERBOSE,
)


class AnalisadorLexico:
    """
    Responsável por transformar a string de entrada em uma sequência de tokens.
    Cada token carrega: tipo, lexema, valor (se for número) e posição na string.
    """

    def __init__(self, texto: str):
        self.texto = texto
        self.pos = 0  # índice atual dentro da string

    def proximo_token(self) -> Token:
        # Se chegamos ao fim da string, retornamos um token FIM (EOF)
        if self.pos >= len(self.texto):
            return Token(TipoToken.FIM, "", None, self.pos)

        # Tenta reconhecer um token começando exatamente na posição atual
        match = PADRAO_TOKEN.match(self.texto, self.pos)
        if not match:
            # Se nada casar, o caractere atual é inválido para a linguagem -> erro léxico
            ch = self.texto[self.pos]
            raise ErroLexico(f"símbolo inválido '{ch}'", self.pos, fonte=self.texto)

        # lastgroup diz qual grupo nomeado casou (NUMERO, MAIS, VEZES, etc.)
        tipo = match.lastgroup
        lexema = match.group(tipo)
        posicao = self.pos
        self.pos = match.end()  # avança o cursor até o fim do token encontrado

        # Espaços são descartados: chamamos recursivamente até achar um token "real"
        if tipo == "ESPACO":
            return self.proximo_token()

        # Para número, além do lexema guardamos o valor inteiro
        if tipo == "NUMERO":
            return Token(TipoToken.NUMERO, lexema, int(lexema), posicao)

        # Para símbolos, o valor é None (não há valor numérico)
        if tipo == "MAIS":
            return Token(TipoToken.MAIS, lexema, None, posicao)
        if tipo == "VEZES":
            return Token(TipoToken.VEZES, lexema, None, posicao)
        if tipo == "ABRE_PAREN":
            return Token(TipoToken.ABRE_PAREN, lexema, None, posicao)
        if tipo == "FECHA_PAREN":
            return Token(TipoToken.FECHA_PAREN, lexema, None, posicao)

        # Segurança: se por algum motivo vier um grupo inesperado
        raise ErroLexico("token desconhecido", posicao, fonte=self.texto)


def tokenizar(texto: str) -> list[Token]:
    """
    Função utilitária: consome a string inteira e devolve a lista de tokens
    finalizada com o token FIM.
    """
    analisador = AnalisadorLexico(texto)
    tokens: list[Token] = []

    while True:
        token = analisador.proximo_token()
        tokens.append(token)

        # Paramos quando encontramos o token de fim (EOF)
        if token.tipo == TipoToken.FIM:
            break

    return tokens
