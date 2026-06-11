"""Testes do pipeline completo: lexer -> parser LL(1) -> IR -> execucao.

Cada classe cobre uma fase; os testes de ponta a ponta verificam a propriedade
que importa num tradutor de expressoes: o resultado respeita precedencia e
associatividade da aritmetica.
"""

import pytest

from src.tradutor_expressoes.analisador_lexico import tokenizar
from src.tradutor_expressoes.erros import ErroLexico, ErroSintatico
from src.tradutor_expressoes.interface_repl import executar_tradutor
from src.tradutor_expressoes.tokens import TipoToken


class TestAnalisadorLexico:
    def test_tokeniza_expressao_simples(self):
        tipos = [t.tipo for t in tokenizar("2+3*4")]
        assert tipos == [
            TipoToken.NUMERO,
            TipoToken.MAIS,
            TipoToken.NUMERO,
            TipoToken.VEZES,
            TipoToken.NUMERO,
            TipoToken.FIM,
        ]

    def test_numero_com_varios_digitos_vira_um_token(self):
        tokens = tokenizar("1234")
        assert tokens[0].tipo == TipoToken.NUMERO
        assert tokens[0].valor == 1234

    def test_espacos_sao_ignorados(self):
        sem_espacos = [t.tipo for t in tokenizar("2+3")]
        com_espacos = [t.tipo for t in tokenizar("  2  +  3  ")]
        assert sem_espacos == com_espacos

    def test_caractere_invalido_gera_erro_lexico(self):
        with pytest.raises(ErroLexico):
            tokenizar("2$3")


class TestPrecedenciaEAssociatividade:
    def test_multiplicacao_antes_da_soma(self):
        assert executar_tradutor("2+3*4") == 14

    def test_parenteses_mudam_a_precedencia(self):
        assert executar_tradutor("(2+3)*4") == 20

    def test_soma_associa_a_esquerda(self):
        assert executar_tradutor("1+2+3+4") == 10

    def test_parenteses_aninhados(self):
        assert executar_tradutor("((2+3)*(4+1))") == 25

    def test_numero_sozinho(self):
        assert executar_tradutor("7") == 7


class TestErrosSintaticos:
    @pytest.mark.parametrize(
        "expressao",
        [
            "2+",        # operando faltando
            "(2+3",      # parentese aberto sem fechar
            "2 3",       # dois numeros sem operador
            "*2",        # operador no inicio
            "()",        # parenteses vazios
        ],
    )
    def test_expressao_malformada_gera_erro_sintatico(self, expressao):
        with pytest.raises(ErroSintatico):
            executar_tradutor(expressao)

    def test_entrada_vazia_gera_erro_sintatico(self):
        with pytest.raises((ErroSintatico, ErroLexico)):
            executar_tradutor("")
