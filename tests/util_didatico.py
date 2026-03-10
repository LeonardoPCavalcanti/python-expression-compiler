def imprimir_bloco(titulo: str) -> None:
    print("\n" + "=" * 70)
    print(titulo)
    print("=" * 70)


def imprimir_execucao(detalhes: dict) -> None:
    imprimir_bloco(f"EXECU\u00c7\u00c3O DID\u00c1TICA :: {detalhes['expressao']}")

    print("1) TOKENS (sa\u00edda do analisador l\u00e9xico):")
    for t in detalhes["tokens"]:
        print(
            f"   - {t.tipo.name:<12} lexema='{t.lexema}' pos={t.posicao} valor={t.valor}"
        )

    print("\n2) C\u00d3DIGO INTERMEDI\u00c1RIO (3 endere\u00e7os):")
    print(detalhes["ir_formatado"] if detalhes["ir_formatado"] else "   (vazio)")

    print("\n3) RESULTADO FINAL:")
    print(f"   => {detalhes['resultado']}")

    print("=" * 70 + "\n")


def imprimir_erro(expressao: str, erro: Exception, motivo_esperado: str | None = None) -> None:
    imprimir_bloco(f"CASO DE ERRO (did\u00e1tico) :: {expressao}")

    if motivo_esperado:
        print("Motivo esperado:")
        print(f"  - {motivo_esperado}\n")

    print("Erro obtido:")
    print(f"  - {erro}")

    print("=" * 70 + "\n")
