import unittest
from src.tradutor_expressoes.interface_repl import executar_tradutor_com_detalhes
from tests.util_didatico import imprimir_execucao


class TesteAvaliacaoExpressao(unittest.TestCase):
    """
    Al\u00e9m de validar, imprime:
    tokens -> IR -> resultado.
    """

    def test_precedencia_operadores(self):
        detalhes = executar_tradutor_com_detalhes("2+3*4")
        imprimir_execucao(detalhes)
        self.assertEqual(detalhes["resultado"], 14)

    def test_parenteses(self):
        detalhes = executar_tradutor_com_detalhes("(2+3)*4")
        imprimir_execucao(detalhes)
        self.assertEqual(detalhes["resultado"], 20)

    def test_parenteses_aninhados(self):
        detalhes = executar_tradutor_com_detalhes("((2+3)*(4+1))")
        imprimir_execucao(detalhes)
        self.assertEqual(detalhes["resultado"], 25)

    def test_varias_operacoes(self):
        detalhes = executar_tradutor_com_detalhes("1+2+3*4+5")
        imprimir_execucao(detalhes)
        self.assertEqual(detalhes["resultado"], 20)

    def test_numeros_grandes(self):
        detalhes = executar_tradutor_com_detalhes("999999*2+1")
        imprimir_execucao(detalhes)
        self.assertEqual(detalhes["resultado"], 1999999)


if __name__ == "__main__":
    unittest.main()
