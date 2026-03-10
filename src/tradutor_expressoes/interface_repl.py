from .analisador_lexico import tokenizar
from .analisador_sintatico import AnalisadorSintatico
from .codigo_intermediario import executar_ir, executar_ir_com_passos, formatar_ir
from .erros import ErroLexico, ErroSintatico


def executar_tradutor(expressao: str) -> int:
    tokens = tokenizar(expressao)
    parser = AnalisadorSintatico(tokens, fonte=expressao)
    codigo = parser.analisar()
    return executar_ir(codigo)


def executar_tradutor_com_detalhes(expressao: str) -> dict:
    tokens = tokenizar(expressao)
    parser = AnalisadorSintatico(tokens, fonte=expressao)
    codigo = parser.analisar()

    resultado, passos = executar_ir_com_passos(codigo)

    return {
        "expressao": expressao,
        "tokens": tokens,
        "codigo_ir": codigo,
        "ir_formatado": formatar_ir(codigo),
        "passos_execucao": passos,
        "resultado": resultado,
    }


def _imprimir_debug(detalhes: dict) -> None:
    print("----- DEBUG -----")
    print("TOKENS:")
    for t in detalhes["tokens"]:
        print(f"  - {t.tipo.name:<12} lexema='{t.lexema}' pos={t.posicao} valor={t.valor}")

    print("\nCÓDIGO INTERMEDIÁRIO (3 endereços):")
    print(detalhes["ir_formatado"] if detalhes["ir_formatado"] else "(vazio)")

    print("\nEXECUÇÃO PASSO A PASSO (contas):")
    for linha in detalhes["passos_execucao"]:
        print(f"  - {linha}")
    print("-----------------\n")


def iniciar_repl(debug: bool = False, mostrar_banner: bool = True) -> None:
    """
    REPL: lê expressão, valida (léxico/sintático), executa e repete.
    - debug=True: imprime tokens + IR + contas passo a passo.
    - mostrar_banner=False: evita banner (útil para testes).
    """
    if mostrar_banner:
        print("Tradutor de Expressões Aritméticas")
        print("Aceita: números, +, *, parênteses. Digite 'exit' para sair.")
        if debug:
            print("Modo DEBUG ativado: exibindo tokens, IR e contas passo a passo.\n")
        else:
            print()

    while True:
        entrada = input("expr> ").strip()

        if entrada.lower() in {"exit", "quit"}:
            break

        if not entrada:
            print("[ERRO] entrada vazia. Digite uma expressão.\n")
            continue

        try:
            if debug:
                detalhes = executar_tradutor_com_detalhes(entrada)
                print("[OK] Expressão correta (léxico e sintático).")
                _imprimir_debug(detalhes)
                print(f"[OK] resultado = {detalhes['resultado']}\n")
            else:
                resultado = executar_tradutor(entrada)
                print("[OK] Expressão correta (léxico e sintático).")
                print(f"[OK] resultado = {resultado}\n")

        except (ErroLexico, ErroSintatico) as erro:
            print(str(erro))
            print()
