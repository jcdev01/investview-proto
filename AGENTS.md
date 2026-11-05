# AGENTS.md — Contexto do Projeto InvestView

> Documento de contexto para agentes de IA e desenvolvedores. **Não contém segredos.**
> Atualize este arquivo quando decisões de arquitetura ou escopo mudarem.

## Visão geral

**InvestView** é um projeto acadêmico (Ciência da Computação) de acompanhamento e análise visual do mercado financeiro brasileiro. O front-end já existe como protótipo de alta fidelidade com **dados fictícios**; o back-end está sendo criado para adicionar contas de usuário, favoritos persistidos e integração real com APIs de cotação.

## Estado atual

- **Front-end (existente):** protótipo funcional, dados mockados em `src/data/`, sem chamadas externas.
- **Back-end (em desenvolvimento):** API Spring Boot para usuários, autenticação com Google, favoritos e cache.
- Os dados exibidos no front ainda são simulados; a integração com APIs reais será feita via back-end.

## Stack

### Front-end (já implementado)
- Vue 3 (Composition API) + Vite
- Vue Router
- Tailwind CSS 4
- Chart.js + vue-chartjs
- @lucide/vue (ícones)

### Back-end (planejado)
- Java + Spring Boot 3.x (Maven)
- Spring Web (REST) — `RestClient` para APIs externas (sem WebFlux)
- Spring Data JPA + PostgreSQL
- Flyway (migrations)
- Spring Security + OAuth2 Client (login Google)
- Spring Data Redis + Spring Cache (cache de cotações)
- Resilience4j (retry/backoff, timeout, circuit breaker)
- springdoc-openapi (Swagger UI)
- Lombok
- Testcontainers (Postgres + Redis) para testes de integração

### Infra local
- **Docker Compose** apenas com **Postgres + Redis**
- API roda na IDE durante o desenvolvimento (hot reload/debug)

## Escopo do back-end (decidido)

Rotas/domínios que **serão** implementados por enquanto:

1. **Usuários** — cadastro e gestão da conta
2. **Auth** — autenticação com Google (OAuth2)
3. **Favoritos** — persistidos por usuário (substitui o `localStorage` quando logado)
4. **Cache** — camada Redis para respostas da Brapi e CoinGecko

### Fora do escopo por enquanto
- Carteira/posições, ordens, operações financeiras
- Alertas de preço (RF29–RF31)
- Desempenho vs Ibovespa (RF32+)
- Recuperação de senha por e-mail (RF27)
- Demais "ideias novas" (RF41–RF59)
- Todos os demais RFs do front (RF01–RF24) continuam no protótipo com dados mockados

> Referência de requisitos: planilha/README do projeto. O front cobre RF01–RF24; o back cobre RF25–RF28 (conta) + favoritos + integração/cache (RF34–RF38).

## APIs externas

- **Brapi** — ações, FIIs, ETFs (cotações, listagem, histórico)
  - Plano gratuito: ~15.000 req/mês, 1 ticker por requisição, atualização ~30 min, histórico até 3 meses
- **CoinGecko** — criptomoedas (lista, preços, histórico) em BRL (`vs_currency=brl`)
  - Sem chave: ~5 chamadas/min (não usar em produção); usar chave Demo
  - Atribuição obrigatória ao exibir dados

### Estratégia de cache (Redis)
- TTL curto para cotações (respeitar atualização das APIs; ~30 min Brapi, 1–5 min CoinGecko)
- Chaves sugeridas: `quote:{ticker}`, `history:{ticker}:{range}`, `coingecko:markets:brl`
- Fallback com dado defasado em caso de erro/429 (indicar "Atualizado às HH:MM")
- Evitar cache stampede (lock/`SETNX` por chave)
- Cache **não** é usado para favoritos — esses vão no Postgres

## Modelo de dados (inicial)

- `User` — id, nome, email (único), provider (GOOGLE/LOCAL), criado_em
- `Favorite` — id, user_id (FK), asset_ticker, asset_type, criado_em; único por (user_id, asset_ticker)
- Favoritos pertencem ao usuário autenticado; sem login, o front mantém `localStorage` (RF18)

## Variáveis de ambiente (nomes apenas — nunca commitar valores)

```
DB_URL, DB_USER, DB_PASSWORD
REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
BRAPI_TOKEN
COINGECKO_API_KEY
JWT_SECRET (se adotar JWT)
```

Usar `.env` (ignorado no Git) e manter um `.env.example` com placeholders.

## Convenções

- Sem comentários no código, salvo quando realmente necessário explicar o "porquê"
- DTOs separados das entidades; validação com Bean Validation
- Tratamento de erros centralizado (`@RestControllerAdvice`) com mensagens claras
- Nunca expor segredos em logs
- Nomes de endpoints em português ou inglês — **manter consistência** (decidir e registrar aqui)
- Datas/horas em America/Sao_Paulo na apresentação; persistir em UTC

## Comandos

### Front-end
```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

### Infra (Docker)
```bash
docker compose up -d      # Postgres + Redis
docker compose down
docker compose down -v    # remove volumes (apaga dados)
```

### Back-end (quando criado)
```bash
./mvnw spring-boot:run
./mvnw test
```

## Estrutura do repositório

```
/                      # front-end (Vue)
  src/
  public/
  package.json
  docker-compose.yml   # Postgres + Redis
  backend/             # (planejado) API Spring Boot
```

## Manutenção deste arquivo

- Agentes devem atualizar este arquivo **automaticamente** sempre que uma decisão estrutural mudar: stack/dependências, escopo (entra/sai), modelo de dados, endpoints, convenções, variáveis de ambiente ou comandos.
- Não registrar mudanças efêmeras (dúvidas, explicações, tentativas descartadas).
- Nunca incluir segredos ou valores reais de variáveis — apenas nomes.

## Próximos passos

1. Criar `docker-compose.yml` com Postgres + Redis
2. Gerar projeto Spring Boot (dependências listadas acima)
3. Configurar OAuth2 Google + entidade `User`
4. Implementar CRUD de favoritos por usuário
5. Implementar camada de cache Redis + clients Brapi/CoinGecko
6. Substituir dados mockados do front pelas chamadas ao back-end
