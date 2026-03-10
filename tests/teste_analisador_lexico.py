import unittest
from src.tradutor_expressoes.analisador_lexico import tokenizar
from src.tradutor_expressoes.erros import ErroLexico
from src.tradutor_expressoes.tokens import TipoToken
from tests.util_didatico import imprimir_bloco


class TesteAnalisadorLexico(unittest.TestCase):
    """
    Testa se o l\u00e9xico tokeniza corretamente e imprime a tokeniza\u00e7\u00e3o.
    """

    def test_tokenizacao_basica(self):
        expr = "2+3*4"
        imprimir_bloco(f"AN\u00c1LISE L\u00c9XICA :: {expr}")
        tokens = tokenizar(expr)

        for t in tokens:
            print(f"  - {t.tipo.name:<12} lexema='{t.lexema}' pos={t.posicao} valor={t.valor}")

        tipos = [t.tipo for t in tokens[:-1]]
        self.assertEqual(
            tipos,
            [TipoToken.NUMERO, TipoToken.MAIS, TipoToken.NUMERO, TipoToken.VEZES, TipoToken.NUMERO],
        )

    def test_ignora_espacos(self):
        expr = "  ( 2 + 3 ) * 4  "
        imprimir_bloco(f"AN\u00c1LISE L\u00c9XICA (com espa\u00e7os) :: {expr}")
        tokens = tokenizar(expr)

        for t in tokens:
            print(f"  - {t.tipo.name:<12} lexema='{t.lexema}' pos={t.posicao} valor={t.valor}")

        self.assertEqual(tokens[-1].tipo, TipoToken.FIM)

    def test_erro_lexico_caractere_invalido(self):
        expr = "2+@"
        imprimir_bloco(f"AN\u00c1LISE L\u00c9XICA (erro esperado) :: {expr}")
        with self.assertRaises(ErroLexico) as ctx:
            tokenizar(expr)
        print(f"Erro capturado: {ctx.exception}")


if __name__ == "__main__":
    unittest.main()
