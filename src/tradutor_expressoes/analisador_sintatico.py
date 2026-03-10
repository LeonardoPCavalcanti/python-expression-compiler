from .tokens import TipoToken
from .erros import ErroSintatico
from .codigo_intermediario import GeradorIR


class AnalisadorSintatico:
    """
    Parser LL(1) por descida recursiva.

    Ideia: cada não-terminal da gramática vira um método:
      E  → T E'
      E' → + T E' | ε
      T  → F T'
      T' → * F T' | ε
      F  → NUMERO | ( E )

    A precedência (* antes de +) aparece naturalmente porque:
    - multiplicação é tratada em T/T'
    - soma é tratada em E/E'
    """

    def __init__(self, tokens, fonte: str | None = None):
        self.tokens = tokens
        self.indice = 0
        self.ir = GeradorIR()      # gera o código intermediário (3 endereços) durante o parsing
        self.fonte = fonte         # string original (para mostrar contexto com ^ nas mensagens)

        self._token_anterior = None
        self._pilha_parenteses: list[int] = []  # guarda a posição onde cada '(' foi aberto

    def token_atual(self):
        # Retorna o token onde o parser "está apontando"
        return self.tokens[self.indice]

    def consumir(self, tipo_esperado):
        """
        Consome o token atual se ele for do tipo esperado.
        Caso contrário, gera um erro sintático bem explicado.
        """
        token = self.token_atual()

        if token.tipo != tipo_esperado:
            # Caso especial: abriu '(' mas terminou a entrada e ainda esperávamos ')'
            if tipo_esperado == TipoToken.FECHA_PAREN and token.tipo == TipoToken.FIM:
                aberto_em = self._pilha_parenteses[-1] if self._pilha_parenteses else None
                if aberto_em is not None:
                    raise ErroSintatico(
                        f"faltou ')': parêntese '(' aberto na posição {aberto_em} não foi fechado",
                        token.posicao,
                        fonte=self.fonte
                    )

            # Mensagem geral: “esperado X, encontrado Y”
            raise ErroSintatico(
                f"esperado {tipo_esperado.name}, encontrado {token.tipo.name}",
                token.posicao,
                fonte=self.fonte
            )

        # Token ok: avança para o próximo
        self.indice += 1
        self._token_anterior = token
        return token

    def analisar(self):
        """
        Ponto de entrada do parser:
        - analisa a expressão completa
        - exige chegar no token FIM no final
        - retorna o código IR gerado
        """
        self.expressao()

        # Se ainda sobrou token que não seja FIM, tem lixo após a expressão
        if self.token_atual().tipo != TipoToken.FIM:
            t = self.token_atual()
            raise ErroSintatico("tokens extras após o fim da expressão", t.posicao, fonte=self.fonte)

        return self.ir.codigo

    # E → T E'
    def expressao(self):
        valor = self.termo()
        return self.expressao_linha(valor)

    # E' → + T E' | ε
    def expressao_linha(self, herdado):
        # Enquanto houver '+', continuamos “acumulando” somas
        while self.token_atual().tipo == TipoToken.MAIS:
            self.consumir(TipoToken.MAIS)
            direito = self.termo()
            herdado = self.ir.somar(herdado, direito)  # gera instrução IR: t = a + b
        return herdado

    # T → F T'
    def termo(self):
        valor = self.fator()
        return self.termo_linha(valor)

    # T' → * F T' | ε
    def termo_linha(self, herdado):
        # Enquanto houver '*', continuamos “acumulando” multiplicações
        while self.token_atual().tipo == TipoToken.VEZES:
            self.consumir(TipoToken.VEZES)
            direito = self.fator()
            herdado = self.ir.multiplicar(herdado, direito)  # gera IR: t = a * b
        return herdado

    # F → NUMERO | ( E )
    def fator(self):
        token = self.token_atual()

        # Caso 1: número
        if token.tipo == TipoToken.NUMERO:
            self.consumir(TipoToken.NUMERO)
            return self.ir.carregar_constante(token.valor)  # gera IR: t = <constante>

        # Caso 2: parênteses
        if token.tipo == TipoToken.ABRE_PAREN:
            # Guardamos onde abriu para explicar melhor se faltar ')'
            self._pilha_parenteses.append(token.posicao)

            self.consumir(TipoToken.ABRE_PAREN)

            # Se abriu '(' e já acabou, não existe expressão dentro -> erro mais didático
            if self.token_atual().tipo == TipoToken.FIM:
                pos_fim = self.token_atual().posicao
                aberto_em = self._pilha_parenteses[-1]
                raise ErroSintatico(
                    f"parêntese '(' aberto na posição {aberto_em}, mas não há expressão dentro dele",
                    pos_fim,
                    fonte=self.fonte
                )

            valor = self.expressao()
            self.consumir(TipoToken.FECHA_PAREN)

            # Fechou corretamente: retiramos a marcação do '(' correspondente
            if self._pilha_parenteses:
                self._pilha_parenteses.pop()

            return valor

        # Se chegar aqui, o fator não começou como número nem '(' -> erro
        if token.tipo in {TipoToken.MAIS, TipoToken.VEZES}:
            # Ex.: "2+*" ou "+2" em pontos onde era esperado um fator
            op = token.lexema
            raise ErroSintatico(
                f"operador '{op}' em posição inválida: faltou um número ou '(' antes/depois do operador",
                token.posicao,
                fonte=self.fonte
            )

        if token.tipo == TipoToken.FECHA_PAREN:
            raise ErroSintatico(
                "encontrou ')' sem uma expressão válida antes (parêntese fechando sem abrir corretamente)",
                token.posicao,
                fonte=self.fonte
            )

        if token.tipo == TipoToken.FIM:
            raise ErroSintatico(
                "fim inesperado da entrada: faltou um número ou '(' para completar a expressão",
                token.posicao,
                fonte=self.fonte
            )

        # Fallback genérico
        raise ErroSintatico("esperado número ou '('", token.posicao, fonte=self.fonte)
