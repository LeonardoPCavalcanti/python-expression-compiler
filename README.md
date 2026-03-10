# Arithmetic Expression Compiler (Python)

A compiler pipeline for arithmetic expressions implemented entirely in Python with no external dependencies. The system performs lexical analysis, LL(1) recursive-descent parsing, 3-address intermediate code (IR) generation, and IR execution — exposed through an interactive REPL.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | Python 3 (stdlib only) |
| Lexer | Regular expressions (`re` module) |
| Parser | LL(1) recursive descent |
| IR | 3-address code with named temporaries |
| Interface | Interactive REPL (stdin/stdout) |
| Tests | `unittest` (standard library) |

---

## Supported Language

| Feature | Details |
|---------|---------|
| Literals | Non-negative integers (`0`, `42`, `999`) |
| Operators | Addition (`+`), Multiplication (`*`) |
| Grouping | Parentheses `( )` |
| Precedence | `*` binds tighter than `+` |

---

## Grammar (LL(1))

The grammar is factored to eliminate left recursion and encode operator precedence:

```
E  → T E'
E' → + T E' | ε
T  → F T'
T' → * F T' | ε
F  → number | ( E )
```

`E` handles addition, `T` handles multiplication, and `F` handles atoms (literals and parenthesized sub-expressions). This structure guarantees correct precedence without any post-processing.

---

## Compilation Pipeline

```
Input string
    │
    ▼
[Lexer]  analisador_lexico.py
    │  Tokenizes input into: NUMBER, PLUS, STAR, LPAREN, RPAREN, EOF
    │
    ▼
[Parser] analisador_sintatico.py
    │  LL(1) recursive descent; drives IR generation during parsing
    │
    ▼
[IR Generator] codigo_intermediario.py
    │  Emits 3-address instructions: tN = operand op operand
    │
    ▼
[IR Executor]
    │  Evaluates the instruction list; returns the value of the last temporary
    │
    ▼
Result
```

### Example — `2 + 3 * 4`

Generated IR:

```
t1 = 2
t2 = 3
t3 = 4
t4 = t2 * t3
t5 = t1 + t4
```

Result: `t5 = 14`

---

## Project Structure

```
python-expression-compiler/
├── main.py                          # Entry point, launches the REPL
├── requirements.txt                 # Empty (no external dependencies)
├── src/tradutor_expressoes/
│   ├── tokens.py                    # Token type definitions
│   ├── analisador_lexico.py         # Lexer (tokenizer)
│   ├── analisador_sintatico.py      # Parser (LL(1) recursive descent)
│   ├── codigo_intermediario.py      # 3-address IR generator and executor
│   ├── interface_repl.py            # REPL loop
│   ├── erros.py                     # Error types (LexicalError, SyntaxError)
│   └── utils.py                     # Shared utilities
└── tests/
    ├── teste_analisador_lexico.py
    ├── teste_avaliacao_expressao.py
    ├── teste_erros_sintaticos.py
    └── teste_interface_repl.py
```

---

## Running

### Standard mode

```bash
python main.py
```

The REPL reads one expression per line, prints the result, and loops. On error, prints a diagnostic and continues.

```
> 2 + 3 * 4
Expressão válida. Resultado: 14

> (1 + 2) * (3 + 4)
Expressão válida. Resultado: 21

> 2 +
Erro sintático: token inesperado após '+'
```

### Debug mode

Prints the token stream and full IR listing before the result:

```bash
python main.py --debug
```

---

## Running Tests

```bash
# Run all tests
python -m pytest tests/

# Run a single test file
python -m pytest tests/teste_analisador_lexico.py

# Run with verbose output
python -m pytest tests/ -v
```

No installation required — all dependencies are part of the Python standard library.
