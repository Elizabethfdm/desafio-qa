# Decisões de Qualidade e Automação

## 1. Estratégia de testes

A estratégia foi definida com base nas regras de negócio e nos riscos envolvidos.

A suíte foi dividida entre testes de API e testes E2E, utilizando a camada mais adequada para validar cada comportamento.

As regras relacionadas a autorização, isolamento de dados, validações, integridade e regras de negócio foram priorizadas na API, por permitir testes mais rápidos, determinísticos e com menor dependência da interface.

Os testes E2E foram utilizados para comportamentos que precisam ser comprovados pela perspectiva do usuário, como:

- autenticação;
- logout;
- acesso por perfil;
- exibição de funcionalidades no menu;
- tentativa de acesso direto por URL;
- localização da interface conforme o país do usuário.

A intenção não foi maximizar a quantidade de testes, mas garantir cobertura dos principais riscos e manter rastreabilidade entre os testes automatizados e as regras RN01 a RN14.

---

## 2. Ferramentas e tecnologias

Foi utilizado Playwright com TypeScript.

A escolha permite manter testes de API e E2E no mesmo ecossistema, utilizando a mesma estrutura de execução, assertions e relatórios.

O Playwright também fornece recursos importantes para investigação de falhas, como:

- relatório HTML;
- traces;
- screenshots;
- vídeos;
- retries configuráveis;
- execução por projects.

A configuração foi organizada em dois projects:

- `api`: testes das APIs e regras de negócio;
- `e2e`: testes dos principais comportamentos da interface.

Essa separação também permite executar cada camada individualmente durante desenvolvimento e diagnóstico.

---

## 3. Priorização por risco

As regras foram priorizadas considerando principalmente segurança, isolamento de dados e impacto no negócio.

### P0 — Risco crítico

- RN01 — Acesso por perfil
- RN04 — Isolamento
- RN06 — Consulta
- RN11 — Unicidade
- RN13 — Restrições por país
- RN14 — Sessão

Falhas nessas regras podem permitir acesso indevido, alteração não autorizada ou exposição de informações entre empresas.

### P1 — Risco alto

- RN03 — Autorizadas
- RN05 — Funcionários
- RN09 — Campos obrigatórios e formatos
- RN10 — Telefone
- RN12 — Produtos

São regras diretamente relacionadas à integridade dos cadastros e aos principais fluxos funcionais.

### P2 — Risco funcional

- RN02 — Menu
- RN07 — Idioma
- RN08 — Listas de valores

Embora tenham menor impacto de segurança, são importantes para consistência da experiência do usuário e aderência às regras do produto.

---

## 4. Organização da suíte

Os testes foram organizados por domínio e camada.

Estrutura utilizada:

tests/
├── api/
│   ├── auth.spec.ts
│   ├── authorized.spec.ts
│   ├── contacts.spec.ts
│   ├── employees.spec.ts
│   ├── isolation.spec.ts
│   ├── permissions.spec.ts
│   ├── picklists.spec.ts
│   └── products.spec.ts
├── e2e/
│   ├── authentication.spec.ts
│   ├── localization.spec.ts
│   └── permissions.spec.ts
└── helpers/
    └── api.ts

Os arquivos são separados por responsabilidade para facilitar manutenção e localização dos cenários.

O helper de API concentra operações reutilizadas, como autenticação e criação de dados necessários aos testes.

---

## 5. Estratégia de dados de teste

A suíte utiliza os dados iniciais conhecidos do sistema e cria dados adicionais por API quando necessário.

Para evitar colisões entre execuções, dados que precisam ser únicos utilizam identificadores dinâmicos.

Exemplo:

`Date.now()` combinado com um sufixo aleatório.

Essa estratégia reduz dependência entre testes e evita que uma execução anterior provoque falhas por duplicidade em execuções posteriores.

Sempre que possível, cada teste prepara os próprios dados necessários e não depende da ordem de execução dos demais testes.

---

## 6. API x E2E

Uma decisão importante da estratégia foi não considerar uma funcionalidade segura apenas porque determinada opção está oculta na interface.

Por exemplo, esconder um botão de cadastro para um perfil de consulta não garante que esse usuário esteja impedido de executar diretamente a chamada da API.

Por esse motivo, regras de autorização foram priorizadas na API e complementadas com E2E nos fluxos mais importantes.

A estratégia permite detectar situações como:

- interface bloqueia a operação, mas backend permite;
- menu oculta determinada funcionalidade, mas URL direta continua acessível;
- endpoint aceita uma operação incompatível com o perfil autenticado.

Também evita duplicar toda a cobertura da API na interface, reduzindo tempo de execução e custo de manutenção.

---

## 7. Cobertura das regras de negócio

A suíte foi construída buscando rastreabilidade com as regras RN01 a RN14.

| Regra | Cobertura principal |
| --- | --- |
| RN01 — Acesso por perfil | API e E2E |
| RN02 — Menu | E2E |
| RN03 — Autorizadas | API |
| RN04 — Isolamento | API |
| RN05 — Funcionários | API |
| RN06 — Consulta | API e E2E |
| RN07 — Idioma | E2E |
| RN08 — Listas de valores | API |
| RN09 — Campos obrigatórios e formatos | API |
| RN10 — Telefone | API |
| RN11 — Unicidade | API |
| RN12 — Produtos | API |
| RN13 — Restrições por país | API/E2E |
| RN14 — Sessão | E2E |

Alguns cenários validam mais de uma regra simultaneamente. Isso foi mantido quando as regras fazem parte do mesmo comportamento de negócio, evitando duplicação desnecessária.

---

## 8. Principais cenários automatizados

Entre os comportamentos cobertos pela suíte estão:

- autenticação;
- logout;
- bloqueio de acesso para usuário não autenticado;
- controle de acesso por perfil;
- permissões de leitura e escrita;
- criação de autorizada com proprietário;
- isolamento de dados entre autorizadas;
- cadastro de funcionários;
- isolamento de funcionários;
- restrições para perfil Atendente;
- localização da interface conforme o país;
- tradução das listas de valores;
- manutenção do valor interno das picklists independentemente do idioma;
- validação de contatos;
- normalização de telefone;
- validação de telefone inválido;
- unicidade de e-mail dentro da mesma autorizada;
- possibilidade de utilização do mesmo e-mail em autorizadas diferentes quando permitido pelo escopo;
- paginação de produtos;
- filtro de produtos;
- disponibilização das imagens dos produtos.

---

## 9. Defeitos identificados e evidenciados pela suíte

Durante a construção e execução dos testes foram identificados comportamentos divergentes das regras de negócio.

Os testes foram mantidos com as expectativas determinadas pelas regras, em vez de alterar as assertions apenas para obter uma execução totalmente verde.

### BUG-01 — Atendente consegue cadastrar funcionário pela API

**Regras relacionadas:** RN01 / RN06  
**Severidade sugerida:** Alta

**Cenário**

Usuário com perfil Atendente possui permissão de consulta, mas não deveria possuir permissão para cadastrar funcionários.

**Esperado**

A tentativa de criação por:

`POST /api/employees`

deve ser rejeitada, retornando HTTP `403`.

**Resultado observado**

A API permite a operação e retorna HTTP `201`.

Isso demonstra que a restrição de escrita não está sendo aplicada corretamente no backend.

**Evidência automatizada**

`tests/api/permissions.spec.ts`

---

### BUG-02 — Telefone argentino válido não é normalizado conforme a regra

**Regras relacionadas:** RN09 / RN10  
**Severidade sugerida:** Alta

**Cenário**

É cadastrado um contato pertencente a uma autorizada da Argentina utilizando telefone válido.

**Esperado**

O telefone deve seguir o formato definido para o país e ser persistido com o código internacional `+54`.

**Resultado observado**

O cadastro é realizado, porém o telefone não é normalizado com o código do país conforme esperado.

**Evidência automatizada**

`tests/api/contacts.spec.ts`

---

### BUG-03 — Telefone argentino fora do formato permitido é aceito

**Regras relacionadas:** RN09 / RN10  
**Severidade sugerida:** Alta

**Cenário**

É enviado um telefone inválido, como `123`, para um contato de uma autorizada argentina.

**Esperado**

A API deve rejeitar o cadastro por formato inválido, retornando erro de validação.

**Resultado observado**

A API aceita o cadastro e retorna HTTP `201`.

**Evidência automatizada**

`tests/api/contacts.spec.ts`

---

### BUG-04 — Formulário de Contatos da Argentina é apresentado em português

**Regra relacionada:** RN07  
**Severidade sugerida:** Média

**Cenário**

Usuário pertencente a uma autorizada argentina acessa o formulário de Contatos.

**Esperado**

Os textos da interface devem ser apresentados em espanhol, conforme o país da autorizada.

Exemplos esperados:

- `Nombre`
- `Teléfono`

**Resultado observado**

O formulário apresenta textos em português, como:

- `Nome`

O comportamento viola a regra de localização definida para o usuário.

**Evidência automatizada**

`tests/e2e/localization.spec.ts`

---

## 10. Resultado da execução

Na execução consolidada realizada durante o desenvolvimento foram obtidos os seguintes resultados:

### API

- 22 testes executados
- 19 testes aprovados
- 3 testes falharam evidenciando comportamentos divergentes das regras de negócio

### E2E

- 5 testes executados
- 4 testes aprovados
- 1 teste falhou evidenciando comportamento divergente da regra de localização

### Consolidado

- 27 testes automatizados
- 23 aprovados
- 4 falhas relacionadas a comportamentos do sistema

As falhas conhecidas foram mantidas propositalmente na suíte para que o relatório demonstre os defeitos encontrados.

Uma suíte totalmente verde não foi considerada objetivo quando o comportamento observado do sistema diverge das regras fornecidas.

---

## 11. Relatórios e evidências

O Playwright gera relatório HTML em:

`reports/playwright-report`

As evidências das execuções são armazenadas em:

`reports/test-results`

Dependendo do tipo de execução e falha, podem ser disponibilizados:

- trace;
- screenshot;
- vídeo;
- contexto da falha;
- stack trace.

Esses artefatos auxiliam na reprodução e investigação dos defeitos encontrados.

Os relatórios e evidências também são disponibilizados pelo pipeline para consulta após a execução.

---

## 12. Pipeline de integração contínua

A suíte foi preparada para execução local e no GitHub Actions.

Foram definidos scripts separados para API e E2E no `package.json`, permitindo que o pipeline execute as duas camadas independentemente.

O workflow utiliza a infraestrutura fornecida pelo desafio, responsável por:

1. instalar as dependências;
2. verificar os tipos;
3. preparar os dados;
4. disponibilizar o MongoDB;
5. iniciar a aplicação;
6. executar os testes;
7. publicar relatórios e evidências.

A suíte de testes não inicia uma segunda instância da aplicação na porta `3000`, pois o próprio workflow disponibiliza o sistema antes da execução dos testes.

O CI é configurado para execução em `push` e `pull_request`.

A escolha permite detectar regressões durante o desenvolvimento e antes da integração de alterações.

---

## 13. Manutenibilidade

Algumas decisões foram tomadas para reduzir o custo de manutenção da automação:

- separação entre API e E2E;
- organização por domínio;
- centralização de operações reutilizáveis em helpers;
- criação dinâmica de dados;
- redução da dependência entre testes;
- assertions relacionadas diretamente às regras de negócio;
- uso de identificadores estáveis na interface sempre que disponíveis;
- execução independente das suítes de API e E2E.

Também foi evitada a duplicação desnecessária de cenários entre API e interface.

---

## 14. Próximas evoluções

A suíte atual prioriza as regras e riscos mais relevantes para uma validação inicial antes da entrada do sistema em produção.

Como evolução, seriam considerados:

- ampliação dos testes negativos dos formulários;
- testes adicionais de valores limite;
- validação temporal da expiração da sessão;
- ampliação das jornadas E2E críticas;
- cenários adicionais de alteração e exclusão;
- execução paralela conforme crescimento da suíte;
- avaliação de testes de contrato para APIs;
- definição de quality gates conforme maturidade e estabilidade da aplicação.

A evolução continuaria baseada em risco e histórico de defeitos, priorizando cenários que forneçam maior retorno de qualidade e evitando crescimento da suíte apenas por quantidade.

---

## 15. Considerações finais

A estratégia adotada busca equilibrar cobertura, velocidade de execução, confiabilidade e manutenção.

A API concentra a maior parte das validações de regras de negócio, enquanto os testes E2E validam comportamentos em que a experiência real do usuário é relevante.

Durante a execução, a automação não foi utilizada apenas para demonstrar cenários de sucesso. Ela também evidenciou comportamentos incompatíveis com as regras fornecidas.

Os testes relacionados a esses comportamentos permanecem falhando para registrar objetivamente a divergência entre o resultado esperado e o resultado atual da aplicação.

O código do sistema-alvo não foi alterado com o objetivo de fazer os testes passarem.