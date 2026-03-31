# Arquitetura do Sistema

```mermaid
graph TD
    User[Usuário] -->|Acessa| Frontend[Frontend (React/Vite)]
    Frontend -->|HTTP Requests| API[Backend API (FastAPI)]
    API -->|Lê/Escreve| DB[(Database SQLite)]
    
    User -->|Compra via| WhatsApp[WhatsApp]
    
    Admin[Administrador] -->|Gerencia| Frontend
    Frontend -->|Rota /admin| Dashboard[Painel Admin]
```

## Componentes

1. **Frontend**: SPA em React, hospedado em servidor estático ou contêiner. Consome a API REST.
2. **Backend**: Servidor FastAPI. Gerencia regras de negócio e dados.
3. **Database**: SQLite (arquivo local) para simplicidade, migrável para PostgreSQL.
