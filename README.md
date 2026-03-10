# Tradutor de Expressões Aritméticas

Este projeto implementa um tradutor simples de expressões aritméticas com:

- **Análise léxica** (tokenização por RegEx)
- **Análise sintática** (parser LL(1) por descida recursiva)
- **Geração de código intermediário** em formato de **3 endereços**
- **Execução do código intermediário** para produzir o resultado final
- **REPL** (loop) que fica esperando expressões, imprime erro ou resultado e continua

A linguagem aceita:
- **Inteiros não-negativos** (ex.: `0`, `12`, `999`)
- Operadores: `+` e `*`
- Parênteses: `(` e `)`


## 1) Comportamento exigido (REPL)

O programa:
1. Fica esperando uma string (uma expressão) do usuário.
2. Faz análise léxica e sintática.
3. Se houver erro, imprime uma mensagem clara e volta a esperar outra string.
4. Se estiver correta, imprime:
   - confirmação de correção (léxico e sintático)
   - resultado da expressão
   e volta a esperar outra string.


## 2) Gramática utilizada (LL)

A gramática implementada (forma típica para LL com precedência) é:

E  → T E'
E' → + T E' | ε
T  → F T'
T' → * F T' | ε
F  → número | ( E )

Essa estrutura garante:
- **precedência**: `*` é resolvido antes de `+`
- **parênteses**: subexpressões entre `(` e `)` são avaliadas antes


## 3) Código intermediário (3 endereços)

Durante o parsing, o sistema gera IR de 3 endereços com temporários:

Exemplo para `2+3*4`:

t1 = 2  
t2 = 3  
t3 = 4  
t4 = t2 * t3  
t5 = t1 + t4

O resultado final é o valor do último temporário.


## 4) Como rodar

### Rodar normalmente (saída “limpa”)
```bash
py main.py
