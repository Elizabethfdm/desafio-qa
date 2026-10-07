# 🧪 Desafio Técnico de QA — Automação com Playwright

![Playwright](https://img.shields.io/badge/Playwright-TypeScript-2EAD33?logo=playwright)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)

Projeto desenvolvido para o **Desafio Técnico de QA**, com foco na validação automatizada das regras de negócio de um Mini Portal utilizando **Playwright + TypeScript**.

A solução combina testes de **API** e **E2E**, execução local, geração automática de evidências e integração com **GitHub Actions**, incluindo um **Quality Gate** que reprova o pipeline quando uma regra de negócio é violada.

---

## 🎯 Objetivo

O sistema foi recebido sem testes automatizados e precisava ser validado antes de uma possível publicação em produção.

A estratégia adotada prioriza:

- regras críticas de negócio;
- autorização e controle de acesso;
- isolamento de dados entre autorizadas;
- integridade dos dados;
- validações de entrada;
- localização da interface;
- regras específicas por país;
- autenticação e sessão;
- jornadas críticas pela interface;
- geração de evidências em caso de falha;
- execução contínua no CI.

A intenção da suíte não é simplesmente gerar uma grande quantidade de testes, mas garantir **cobertura orientada a risco e rastreabilidade com as regras RN01–RN14**.

---

# 🏗️ Arquitetura da solução

```text
desafio-qa/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docs/
│   └── decisoes.md
│
├── reports/
│   ├── playwright-report/
│   └── test-results/
│
├── src/
│   ├── server/
│   └── web/
│
├── tests/
│   ├── api/
│   │   ├── auth.spec.ts
│   │   ├── authorized.spec.ts
│   │   ├── contacts.spec.ts
│   │   ├── employees.spec.ts
│   │   ├── isolation.spec.ts
│   │   ├── permissions.spec.ts
│   │   ├── picklists.spec.ts
│   │   └── products.spec.ts
│   │
│   ├── e2e/
│   │   ├── authentication.spec.ts
│   │   ├── localization.spec.ts
│   │   └── permissions.spec.ts
│   │
│   └── helpers/
│       └── api.ts
│
├── playwright.config.ts
├── package.json
└── README.md
```

A suíte foi dividida entre **API** e **E2E** para manter os testes rápidos, legíveis e adequados ao tipo de risco validado.

---

# 🧠 Estratégia de testes

A cobertura foi definida considerando **risco, impacto e camada mais adequada de validação**.

### 🔴 P0 — Risco crítico

| Regra | Descrição |
|---|---|
| RN01 | Acesso por perfil |
| RN04 | Isolamento entre autorizadas |
| RN06 | Perfis somente consulta |
| RN11 | Unicidade |
| RN13 | Restrições por país |
| RN14 | Autenticação e sessão |

São regras relacionadas principalmente a **segurança, autorização e integridade dos dados**.

### 🟠 P1 — Risco alto

| Regra | Descrição |
|---|---|
| RN03 | Cadastro de autorizadas |
| RN05 | Funcionários |
| RN09 | Campos obrigatórios e formatos |
| RN10 | Telefone |
| RN12 | Produtos |

### 🟡 P2 — Risco funcional

| Regra | Descrição |
|---|---|
| RN02 | Menu |
| RN07 | Idioma |
| RN08 | Listas de valores |

Embora tenham impacto menor em segurança, continuam importantes para a consistência funcional e experiência do usuário.

Mais detalhes sobre a estratégia e as decisões técnicas estão disponíveis em:

```text
docs/decisoes.md
```

---

# 🔬 API x E2E

A estratégia utiliza as duas camadas de forma complementar.

## API

Os testes de API concentram regras como:

- autenticação;
- autorização;
- permissões;
- isolamento de dados;
- criação de autorizadas;
- funcionários;
- contatos;
- unicidade;
- validação de telefone;
- restrições por país;
- picklists;
- produtos;
- paginação;
- filtros;
- imagens.

Essa camada oferece feedback mais rápido e determinístico.

## E2E

Os testes E2E validam comportamentos que dependem efetivamente da interface:

- autenticação;
- logout;
- controle de acesso pela interface;
- acesso direto por URL;
- menu por perfil;
- restrições por país;
- localização;
- idioma da interface.

> Ocultar um botão não é suficiente para garantir segurança.
>
> Por isso, regras de autorização importantes também são verificadas diretamente no backend.

---

# 📋 Rastreabilidade das regras de negócio

A suíte foi construída com os identificadores das regras diretamente nos nomes dos testes.

Exemplo:

```text
RN01/RN06/RN13 - Permissões
RN09/RN10/RN11 - Contatos
RN12 - Produtos
RN14 - Autenticação e sessão
```

Isso facilita identificar rapidamente:

**Regra → teste → falha → evidência → defeito.**

---

# 🐞 Defeitos identificados

Durante a automação foram encontrados comportamentos que divergem das regras de negócio fornecidas.

## 🔴 BUG-01 — Atendente consegue cadastrar funcionário pela API

**Regras:** RN01 / RN06  
**Severidade sugerida:** Alta

### Esperado

Um usuário com perfil **Atendente** possui permissão apenas de consulta e não deve conseguir cadastrar funcionários.

```http
POST /api/employees
```

deveria retornar:

```text
403 Forbidden
```

### Encontrado

A API permite a operação.

### Evidência automatizada

```text
tests/api/permissions.spec.ts
```

---

## 🔴 BUG-02 — Atendente acessa formulário de funcionário por URL direta

**Regras:** RN01 / RN02 / RN06  
**Severidade sugerida:** Alta

### Esperado

O Atendente não deve visualizar funcionalidades de criação de funcionários, inclusive tentando acessar diretamente a rota.

### Encontrado

O formulário pode ser exibido por acesso direto à URL.

### Evidência automatizada

```text
tests/e2e/permissions.spec.ts
```

---

## 🔴 BUG-03 — Telefone argentino não é normalizado corretamente

**Regras:** RN09 / RN10  
**Severidade sugerida:** Alta

### Esperado

Para Argentina:

```text
Número nacional: 10 dígitos
Código do país: +54
```

Exemplo:

```text
1123456789
```

deveria ser persistido como:

```text
+541123456789
```

### Encontrado

O número é persistido sem a normalização esperada.

Exemplo observado:

```text
1123456789
```

### Evidência automatizada

```text
tests/api/contacts.spec.ts
```

---

## 🟠 BUG-04 — Formulário argentino apresenta label em português

**Regra:** RN07  
**Severidade sugerida:** Média

### Esperado

Uma autorizada argentina deve utilizar espanhol na interface.

Exemplo:

```text
Nombre
```

### Encontrado

O formulário apresenta:

```text
Nome
```

### Evidência automatizada

```text
tests/e2e/localization.spec.ts
```

---

# ⚠️ Sobre os testes com falha

A suíte contém testes que atualmente **falham propositalmente porque reproduzem defeitos encontrados no sistema-alvo**.

Esses testes não foram alterados para produzir artificialmente um pipeline verde.

A falha representa uma divergência entre:

```text
Comportamento esperado pelas regras de negócio
                    ↓
              ≠
                    ↓
Comportamento atual da aplicação
```

Dessa forma, os testes também funcionam como **regressão automatizada dos defeitos identificados**.

Quando os problemas forem corrigidos na aplicação, esses mesmos cenários deverão passar sem necessidade de alterar sua expectativa funcional.

---

# ⚙️ Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| Playwright | Automação API e E2E |
| TypeScript | Implementação dos testes |
| Node.js | Runtime |
| MongoDB | Banco utilizado pela aplicação |
| GitHub Actions | Integração contínua |
| Playwright HTML Reporter | Relatório de execução |
| Trace Viewer | Investigação das falhas |

A escolha do Playwright permite manter API e interface no mesmo ecossistema e utilizar recursos nativos como:

- assertions;
- retries;
- screenshots;
- vídeos;
- traces;
- relatório HTML.

---

# 💻 Pré-requisitos

Para executar o projeto localmente:

- Node.js 20 ou superior;
- MongoDB;
- npm.

O MongoDB pode estar disponível em:

```text
mongodb://localhost:27017
```

ou ser configurado através da variável:

```text
MONGO_URI
```

---

# 🚀 Preparando o ambiente

Clone o repositório e instale as dependências:

```bash
npm install
```

Instale o navegador utilizado pelo Playwright:

```bash
npx playwright install chromium
```

Prepare os dados iniciais:

```bash
npm run seed
```

Inicie a aplicação:

```bash
npm start
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

> Os testes assumem que a aplicação já está disponível na porta `3000`.
> Eles não iniciam uma segunda instância do sistema.

---

# 🧪 Executando os testes

## Todos os testes

```bash
npm test
```

## Somente API

```bash
npm run test:api
```

## Somente E2E

```bash
npm run test:e2e
```

## Typecheck

```bash
npm run typecheck
```

---

# 📊 Relatórios

Após uma execução, o Playwright gera o relatório HTML em:

```text
reports/playwright-report
```

Para visualizar:

```bash
npm run test:report
```

ou:

```bash
npx playwright show-report reports/playwright-report
```

---

# 📸 Evidências

Em cenários de falha, a suíte mantém evidências para facilitar a investigação.

Os arquivos são armazenados em:

```text
reports/test-results
```

Dependendo do tipo de teste e falha, podem ser disponibilizados:

```text
Trace
Screenshot
Vídeo
Error Context
```

Um trace pode ser aberto utilizando:

```bash
npx playwright show-trace caminho-do-trace.zip
```

Isso permite investigar requests, responses, ações da interface, DOM e estado da aplicação no momento da falha.

---

# 🔄 Integração contínua

O projeto utiliza **GitHub Actions**.

O workflow está localizado em:

```text
.github/workflows/ci.yml
```

O pipeline é disparado em:

```yaml
push:
pull_request:
```

A cada execução, o CI realiza:

```text
Checkout
   ↓
Configuração do Node.js
   ↓
Instalação das dependências
   ↓
Typecheck
   ↓
Build do front
   ↓
Instalação do Chromium
   ↓
Seed do banco
   ↓
Inicialização da aplicação
   ↓
Health Check
   ↓
Testes de API
   ↓
Testes E2E
   ↓
Publicação das evidências
   ↓
Quality Gate
```

---

# 🚦 Quality Gate

API e E2E são executados mesmo quando uma das suítes identifica uma falha.

Essa decisão permite coletar o máximo possível de informações em uma única execução.

O comportamento do CI é:

```text
API falha
    ↓
E2E continua
    ↓
Evidências são publicadas
    ↓
Resultados são consolidados
    ↓
Quality Gate reprova o pipeline
```

Portanto, uma execução vermelha causada pelos defeitos conhecidos representa o comportamento esperado do Quality Gate.

O pipeline somente deve ficar verde quando todas as regras automatizadas estiverem sendo atendidas pela aplicação.

---

# 📦 Artefatos do GitHub Actions

Independentemente do resultado dos testes, o pipeline publica:

```text
playwright-reports
```

contendo:

```text
reports/playwright-report
reports/test-results
```

Isso permite analisar as evidências mesmo quando o Quality Gate reprova a execução.

---

# 🔐 Regras principais do sistema

O sistema possui 14 regras de negócio utilizadas como referência para os testes:

| Regra | Descrição |
|---|---|
| RN01 | Acesso por perfil |
| RN02 | Menu conforme permissões |
| RN03 | Cadastro de autorizadas |
| RN04 | Isolamento entre autorizadas |
| RN05 | Funcionários |
| RN06 | Perfis somente consulta |
| RN07 | Idioma |
| RN08 | Listas de valores |
| RN09 | Campos obrigatórios e formatos |
| RN10 | Telefone conforme país |
| RN11 | Unicidade |
| RN12 | Produtos, filtros, paginação e imagens |
| RN13 | Restrições por país |
| RN14 | Autenticação e sessão |

---

# 🌎 Regras de telefone

| País | Código | Número nacional |
|---|---:|---:|
| Brasil | +55 | 10 ou 11 dígitos |
| Argentina | +54 | 10 dígitos |
| Colômbia | +57 | 10 dígitos |

O backend deve persistir o telefone no formato:

```text
+<código do país><número nacional>
```

---

# 👥 Perfis

| Perfil | Autorizadas | Contatos | Produtos | Funcionários |
|---|---|---|---|---|
| Super Admin | leitura/escrita | — | leitura | — |
| Proprietário | — | leitura/escrita | leitura | leitura/escrita |
| Atendente | — | somente leitura | leitura | somente leitura |

Existe ainda uma restrição específica para a **Colômbia**:

> O módulo de Funcionários não deve estar disponível para usuários de autorizadas colombianas.

Essa restrição é validada tanto na API quanto na interface.

---

# 🔑 Acesso inicial

O seed disponibiliza um Super Admin para os testes:

```text
E-mail: superadmin@example.com
Senha: Admin@123
```

Funcionários e proprietários criados recebem a senha padrão:

```text
Senha@123
```

Todos os dados utilizados pelo sistema são fictícios.

---

# 🌐 API

Com a aplicação em execução, a documentação Swagger fica disponível em:

```text
http://localhost:3000/api-docs.html
```

Principais endpoints utilizados pela suíte:

```text
POST /api/login

GET  /api/authorizeds
POST /api/authorizeds

GET  /api/contacts
POST /api/contacts

GET  /api/employees
POST /api/employees

GET  /api/products
GET  /api/products/:id/image

GET  /api/picklists
```

Com exceção de login e health check, as rotas protegidas exigem:

```http
Authorization: Bearer <token>
```

---

# 🗃️ Dados de teste

A estratégia busca evitar dependência entre testes.

Quando necessário, os cenários criam:

- autorizadas;
- proprietários;
- funcionários;
- contatos.

E-mails dinâmicos utilizam identificadores únicos para reduzir colisões entre execuções.

Os testes não dependem da ordem em que são executados para localizar dados criados por outros cenários.

---

# 🧹 Boas práticas adotadas

A implementação busca manter:

- separação entre API e E2E;
- helpers para operações reutilizáveis;
- testes independentes;
- dados dinâmicos;
- assertions objetivas;
- rastreabilidade pelas RNs;
- cobertura orientada a risco;
- evidências automáticas;
- CI reproduzível;
- Quality Gate;
- testes de regressão para defeitos encontrados.

---

# 📚 Decisões técnicas

As justificativas completas da estratégia estão documentadas em:

```text
docs/decisoes.md
```

O documento contém:

- estratégia de automação;
- escolha das ferramentas;
- priorização por risco;
- organização da suíte;
- estratégia de dados;
- decisão API x E2E;
- relatórios e evidências;
- estratégia de CI/CD;
- Quality Gate;
- defeitos identificados;
- oportunidades de evolução da cobertura.

---

# 🔮 Evolução da suíte

Como próximos passos, a suíte pode evoluir com:

- ampliação das validações negativas dos formulários;
- mais combinações de filtros;
- testes adicionais de fronteira;
- validação detalhada da expiração do JWT;
- expansão dos cenários de isolamento;
- maior cobertura E2E das jornadas críticas;
- execução paralela conforme crescimento da suíte.

A evolução deve continuar seguindo o princípio:

> **automatizar primeiro aquilo que representa maior risco para o negócio.**

---

# ✅ Resultado

A solução entregue permite:

```text
✔ Executar testes de API
✔ Executar testes E2E
✔ Validar regras de negócio
✔ Identificar violações de autorização
✔ Validar isolamento de dados
✔ Validar regras específicas por país
✔ Gerar relatórios HTML
✔ Registrar traces, screenshots e vídeos
✔ Executar automaticamente no GitHub Actions
✔ Publicar evidências como artefato
✔ Utilizar os testes como Quality Gate
✔ Manter rastreabilidade entre regra, teste e defeito
```

---

## 🧪 QA Challenge

**Playwright + TypeScript + API + E2E + GitHub Actions**

Automação estruturada com foco em **risco, rastreabilidade, evidências e qualidade contínua**.