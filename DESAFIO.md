# Desafio técnico — QA

## Contexto

Você recebeu um sistema novo, ainda sem nenhum teste, para validar antes de ir à produção.
O sistema e as regras de negócio estão descritos no [README](README.md).

Você pode usar as ferramentas e bibliotecas que preferir. O que avaliamos é o seu raciocínio, a organização do código
e a forma como você explica as suas escolhas.

## O que fazer

Crie uma suíte de testes automatizados, de interface (E2E) e/ou de API, que valide as regras de negócio do sistema.

A suíte deve:

- cobrir as regras de negócio;
- gerar um relatório de execução com os resultados;
- rodar localmente e no GitHub Actions, usando o gatilho que você considerar ideal, com o relatório publicado como
  artefato da execução.

## Justifique as suas decisões

Registre em `docs/decisoes.md`:

## Estrutura do repositório

```
docs/decisoes.md            suas justificativas (modelo para preencher)
tests/                      seus testes
reports/                    relatórios e evidências gerados pelos testes
src/                        o sistema (não é o foco da avaliação)
.github/workflows/ci.yml    pipeline base
```

Organize a pasta `tests/` como achar melhor.

## Pipeline

O repositório traz um workflow base. A cada execução ele:

1. instala as dependências e checa os tipos;
2. gera o front e recria os dados iniciais;
3. sobe a aplicação em `http://localhost:3000` com um MongoDB disponível;
4. executa os scripts `test:api` e `test:e2e` do `package.json` (passos ignorados se o script não existir);
5. publica relatórios e evidências como artefato da execução.

O workflow só roda manualmente. Definir o gatilho (a cada push, pull request, agendado ou outro) faz parte do desafio.
Defina no `package.json` os scripts que o pipeline deve executar.
A aplicação **já está no ar** quando os testes rodam: não suba outra instância na porta 3000.

## Como rodar localmente

Veja o [README](README.md) (Node, MongoDB local e `npm start`).

## O que avaliamos

- Defeitos encontrados e qualidade do registro.
- Cobertura das regras de negócio e qualidade dos testes.
- Organização, legibilidade e manutenção da automação.
- Relatório e pipeline.
- Clareza das decisões justificadas.
