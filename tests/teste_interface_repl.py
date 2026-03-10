import unittest
from unittest.mock import patch
import builtins
import sys

from src.tradutor_expressoes.interface_repl import iniciar_repl
from tests.util_didatico import imprimir_bloco


class TesteInterfaceREPL(unittest.TestCase):
    """
    Testa o REPL simulando entradas e capturando prints.

    Melhorias:
    - mostra a saída capturada no terminal (sys.__stdout__.write)
    - não imprime banner no REPL durante testes (mostrar_banner=False)
    """

    def _mostrar_saida_capturada(self, titulo: str, saida: str) -> None:
        sys.__stdout__.write("\n" + "-" * 70 + "\n")
        sys.__stdout__.write(f"{titulo}\n")
        sys.__stdout__.write("-" * 70 + "\n")
        sys.__stdout__.write(saida + "\n")
        sys.__stdout__.write("-" * 70 + "\n\n")

    def test_execucao_valida_e_saida(self):
        imprimir_bloco("REPL :: deve aceitar uma expressão válida e sair com 'exit'")
        entradas = iter(["2+3*4", "exit"])

        with patch.object(builtins, "input", lambda _: next(entradas)):
            with patch("builtins.print") as mock_print:
                iniciar_repl(debug=False, mostrar_banner=False)
                saida = "\n".join(" ".join(map(str, c.args)) for c in mock_print.call_args_list)

        self._mostrar_saida_capturada("SAÍDA CAPTURADA DO REPL (caso válido)", saida)

        self.assertIn("[OK] Expressão correta (léxico e sintático).", saida)
        self.assertIn("[OK] resultado = 14", saida)

    def test_erro_lexico(self):
        imprimir_bloco("REPL :: deve mostrar erro léxico")
        entradas = iter(["2+@", "exit"])

        with patch.object(builtins, "input", lambda _: next(entradas)):
            with patch("builtins.print") as mock_print:
                iniciar_repl(debug=False, mostrar_banner=False)
                saida = "\n".join(" ".join(map(str, c.args)) for c in mock_print.call_args_list)

        self._mostrar_saida_capturada("SAÍDA CAPTURADA DO REPL (erro léxico)", saida)

        self.assertIn("[ERRO LÉXICO]", saida)

    def test_erro_sintatico(self):
        imprimir_bloco("REPL :: deve mostrar erro sintático")
        entradas = iter(["2+*", "exit"])

        with patch.object(builtins, "input", lambda _: next(entradas)):
            with patch("builtins.print") as mock_print:
                iniciar_repl(debug=False, mostrar_banner=False)
                saida = "\n".join(" ".join(map(str, c.args)) for c in mock_print.call_args_list)

        self._mostrar_saida_capturada("SAÍDA CAPTURADA DO REPL (erro sintático)", saida)

        self.assertIn("[ERRO SINTÁTICO]", saida)


if __name__ == "__main__":
    unittest.main()
