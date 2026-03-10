import argparse
from src.tradutor_expressoes.interface_repl import iniciar_repl


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="tradutor_expressoes",
        description="Tradutor de expressões (+, *, parênteses) com análise léxica, sintática e IR (3 endereços)."
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Mostra tokens, IR (3 endereços) e execução passo a passo das contas."
    )
    args = parser.parse_args()

    iniciar_repl(debug=args.debug)


if __name__ == "__main__":
    main()
