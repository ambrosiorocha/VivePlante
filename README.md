# Viveiro de Mudas - Sistema Completo

Sistema de gestão e vendas para viveiro de mudas, incluindo site institucional, catálogo, integração com WhatsApp e painel administrativo.

## Tecnologias

- **Backend**: Python (FastAPI), SQLModel, SQLite
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons

## Estrutura

- `backend/`: API e banco de dados
- `frontend/`: Interface do usuário

## Como Rodar

### 1. Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Acesse: `http://localhost:8000/docs` para ver a API.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`.

## Funcionalidades

- **Catálogo**: Visualize produtos e categorias.
- **Compra via WhatsApp**: Clique em comprar para enviar mensagem formatada.
- **Admin**: Acesse `/admin` (Login: admin/admin) para ver dashboard e gerenciar produtos.

## Docker (Opcional)

```bash
docker-compose up --build
```
