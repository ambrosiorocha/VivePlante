# Análise Técnica do Projeto Vive Plante

## 1. Estrutura de Pastas e Arquivos
O projeto está organizado como um monorrepo com separação clara entre frontend e backend:

- **Root (`/`)**: Contém configuração do Docker (`docker-compose.yml`), README e scripts de utilidade (`verify_api.py`, `seed.py`).
- **Backend (`/backend`)**:
  - `main.py`: Ponto de entrada da aplicação FastAPI.
  - `database.py`: Configuração do banco de dados SQLite e migrações manuais.
  - `models.py`: Definições de tabelas (SQLModel) para Produtos, Usuários, Clientes, Vendas e Configurações.
  - `routers/`: Controladores de API (`auth.py`, `products.py`, `sales.py`, `dashboard.py`, `clients.py`, `settings.py`, `chatbot.py`).
  - `config.py`: Variáveis de configuração (atualmente hardcoded).
- **Frontend (`/frontend`)**:
  - Baseado em Vite + React + TypeScript.
  - `src/components`: Componentes reutilizáveis (Navbar, Footer).
  - `src/pages`: Páginas de navegação (`Home`, `Catalog`, `Admin/*`).
  - `src/context`: Gerenciamento de estado global simples (`SettingsContext`).

## 2. Linguagens e Frameworks
- **Backend**: Python 3.10+ com **FastAPI** (API REST), **SQLModel** (ORM), **Pydantic** (validação de dados).
- **Frontend**: TypeScript, **React**, **Vite** (build tool), **Tailwind CSS** (estilização), **Recharts** (gráficos), **Lucide React** (ícones).
- **Banco de Dados**: **SQLite** (arquivo local `database.db`).
- **Infraestrutura**: Docker e Docker Compose.

## 3. Arquitetura do Sistema
A arquitetura é **Monolítica Modular** (Client-Server):
- **Frontend SPA**: Single Page Application que consome a API REST.
- **Backend API**: Serviço Stateless (embora use sessões de banco) que provê endpoints JSON.
- **Não é Microserviços**: O sistema roda como um único serviço de backend e um de frontend.
- **Padrão de Camadas**: Routers -> Services (implícito nos routers) -> Models/Database.

## 4. Integração com Firebase
**NÃO há integração com Firebase implementada.**
- O código foi analisado e não existem referências a `firebase-admin` ou bibliotecas de cliente Firebase.
- A autenticação atual em `routers/auth.py` é um **placeholder** e não funcional para produção.
- O banco de dados é puramente SQLite local.

## 5. Funcionalidades Implementadas
- **Catálogo de Produtos**: Listagem, criação e edição (básico).
- **Gestão de Vendas**: Criação de vendas, cálculo de totais, baixa de estoque automática.
- **Dashboard**: Visualização de métricas (vendas, receita, produtos populares) usando gráficos Recharts.
- **Clientes**: CRUD básico de clientes e histórico de compras.
- **Configurações**: Edição de dados da empresa (nome, whats, logo) que refletem no frontend.
- **Chatbot**: Lógica simples baseada em regras (if/else) em `routers/chatbot.py`.

## 6. O que Falta para um ERP Completo (Production-Ready)
1. **Autenticação Real**: Implementar JWT com refresh tokens e hashing de senha seguro (bcrypt está listado mas não plenamente integrado no fluxo de login).
2. **Controle de Acesso (RBAC)**: Diferenciar Admin de Vendedor/Usuário comum.
3. **Módulo Fiscal**: Emissão de NF-e/NFC-e (obrigatório para ERPs reais no Brasil).
4. **Relatórios Avançados**: Exportação para PDF/Excel.
5. **Gestão de Estoque Avançada**: Histórico de movimentação (kardex), perdas/quebras, inventário.
6. **Financeiro**: Contas a pagar/receber, fluxo de caixa real.

## 7. Riscos de Segurança e Vulnerabilidades
- **Segredo Hardcoded**: `SECRET_KEY` em `config.py` está exposto no código.
- **CORS Permissivo**: `allow_origins` inclui localhost, o que é inseguro se exposto em rede pública sem restrição.
- **Autenticação Fraca**: Endpoints críticos (como `/sales` DELETE/PUT) podem não estar protegidos corretamente se a dependência de usuário atual não for estrita.
- **SQLite Concorrência**: SQLite não lida bem com múltiplas escritas simultâneas, risco de `database is locked`.
- **Validação de Entrada**: Depende do Pydantic, mas regras de negócio complexas (ex: estoque negativo em edições concorrentes) podem falhar.

## 8. Escalabilidade
- **Baixa/Média**. O uso do SQLite limita a escala vertical e horizontal.
- **Single Tenant**: A estrutura atual suporta apenas uma empresa por implantação.
- Para escalar:
  - Migrar para **PostgreSQL**.
  - Servir frontend via CDN (Netlify/Vercel) e backend em container orquestrado (K8s/ECS).

## 9. Melhorias Sugeridas
- **Backend**:
  - Migrar para PostgreSQL.
  - Implementar Testes Unitários e de Integração (Pytest).
  - Usar Variáveis de Ambiente (`python-dotenv`).
- **Frontend**:
  - Implementar React Query para cache e estado de servidor.
  - Melhorar tratamento de erros (Toasts/Notificações).
- **Database**:
  - Criar migrações reais com **Alembic** em vez de checagens manuais no startup.

## 10. Roadmap de Desenvolvimento (Prioridade)
1. **Segurança (Imediato)**: Configurar Auth JWT real e remover secrets do código.
2. **Infraestrutura**: Configurar PostgreSQL e Docker para produção.
3. **Core Features**: Completar CRUDs e validações de estoque.
4. **Financeiro/Fiscal**: Implementar fluxo de caixa e preparação para NFe.
5. **UX/UI**: Melhorar feedback visual e responsividade mobile.

## 11. Sugestão de Deploy
- **Hospedagem**: VPS (DigitalOcean, AWS Lightsail ou Hetzner).
- **Containerização**: Usar o `docker-compose.yml` existente, mas com Nginx como Reverse Proxy (SSL via Certbot).
- **Domínio**: Comprar domínio `.com.br` e apontar DNS.
- **CI/CD**: GitHub Actions para deploy automático.

## 12. Transformação em SaaS Comercial
1. **Multi-tenancy**: Adicionar `company_id` em **todas** as tabelas (Produtos, Vendas, Clientes).
2. **Isolamento de Dados**: Garantir que queries sempre filtrem por `company_id` do usuário logado.
3. **Assinaturas**: Integrar Stripe/Asaas para gestão de planos e pagamentos.
4. **Onboarding**: Fluxo automatizado de criação de conta e empresa.

## 13. Melhores Práticas para ERP Agrícola
- **Offline-First**: Implementar PWA (Service Workers) para permitir uso no campo sem internet.
- **Rastreabilidade**: Controle de lotes de sementes/mudas (seed-to-sale).
- **Integração IoT**: Suporte futuro a sensores de umidade/clima.
- **Calendário de Cultivo**: Alertas de poda/rega/colheita baseados em data.

## 14. Resumo da Auditoria Técnica
O sistema é um **protótipo funcional** e bem estruturado para um MVP (Produto Mínimo Viável). O código é limpo e moderno, utilizando tecnologias atuais (FastAPI/React). No entanto, **não está pronto para produção comercial** devido à falta de autenticação robusta, uso de banco de dados SQLite e ausência de camadas de segurança básicas.
