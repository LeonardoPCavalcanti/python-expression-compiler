import unittest
from src.tradutor_expressoes.interface_repl import executar_tradutor_com_detalhes
from src.tradutor_expressoes.erros import ErroSintatico, ErroLexico
from tests.util_didatico import imprimir_erro


class TesteErrosSintaticos(unittest.TestCase):
    """
    Testes de erro: imprimem o motivo e garantem que o erro correto acontece.
    """

    def test_fim_inesperado(self):
        expr = "2+"
        try:
            executar_tradutor_com_detalhes(expr)
            self.fail("Era esperado ErroSintatico, mas n\u00e3o ocorreu.")
        except ErroSintatico as e:
            imprimir_erro(expr, e, "Falta um operando ap\u00f3s o operador '+'.")
            self.assertIsInstance(e, ErroSintatico)

    def test_parentese_nao_fechado(self):
        expr = "(2+3"
        try:
            executar_tradutor_com_detalhes(expr)
            self.fail("Era esperado ErroSintatico, mas n\u00e3o ocorreu.")
        except ErroSintatico as e:
            imprimir_erro(expr, e, "Abriu '(', mas n\u00e3o encontrou ')'.")
            self.assertIsInstance(e, ErroSintatico)

    def test_operador_no_inicio(self):
        expr = "+2"
        try:
            executar_tradutor_com_detalhes(expr)
            self.fail("Era esperado ErroSintatico, mas n\u00e3o ocorreu.")
        except ErroSintatico as e:
            imprimir_erro(expr, e, "A express\u00e3o n\u00e3o pode come\u00e7ar com operador.")
            self.assertIsInstance(e, ErroSintatico)

    def test_operadores_seguidos(self):
        expr = "2++3"
        try:
            executar_tradutor_com_detalhes(expr)
            self.fail("Era esperado ErroSintatico, mas n\u00e3o ocorreu.")
        except ErroSintatico as e:
            imprimir_erro(expr, e, "Dois operadores seguidos sem operando no meio.")
            self.assertIsInstance(e, ErroSintatico)

    def test_caractere_invalido(self):
        expr = "2+@"
        try:
            executar_tradutor_com_detalhes(expr)
            self.fail("Era esperado ErroLexico, mas n\u00e3o ocorreu.")
        except ErroLexico as e:
            imprimir_erro(expr, e, "O caractere '@' n\u00e3o pertence \u00e0 linguagem.")
            self.assertIsInstance(e, ErroLexico)


if __name__ == "__main__":
    unittest.main()
