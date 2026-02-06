# Flashcards API

API NestJS para gerenciamento de campanhas e consulta de questões de flashcards com integração MongoDB.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **TypeScript** - Linguagem de programação
- **Class Validator** - Validação de dados
- **Class Transformer** - Transformação de objetos

## 📁 Estrutura do Projeto

```
src/
├── modules/
│   ├── campaign/          # Módulo de campanhas
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── schemas/      # Schemas do MongoDB
│   │   ├── campaign.controller.ts
│   │   ├── campaign.service.ts
│   │   └── campaign.module.ts
│   └── question/         # Módulo de questões
│       ├── dto/
│       ├── schemas/
│       ├── question.controller.ts
│       ├── question.service.ts
│       └── question.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## 🏗️ Instalação

### Pré-requisitos

- Node.js (v18 ou superior)
- MongoDB (local ou Atlas)
- npm ou yarn

### Passos

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd flashcards
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   MONGODB_URI=mongodb://localhost:27017/flashcards
   PORT=3000
   NODE_ENV=development
   ```

4. **Inicie o MongoDB** (se estiver usando local)
   ```bash
   mongod
   ```

5. **Execute a aplicação**
   ```bash
   # Desenvolvimento
   npm run start:dev

   # Produção
   npm run build
   npm run start:prod
   ```

## 📋 Endpoints da API

### Campanhas

#### **POST** `/api/v1/campaigns`
Cria uma nova campanha.

**Payload:**
```json
{
  "name": "Campanha de Matemática",
  "description": "Campanha focada em questões de matemática básica",
  "isActive": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "tags": ["matematica", "basico"]
}
```

#### **GET** `/api/v1/campaigns`
Lista todas as campanhas com filtros opcionais.

**Query Parameters:**
- `name` - Filtrar por nome (busca parcial)
- `active` - Filtrar por status ativo (`true` ou `false`)

#### **GET** `/api/v1/campaigns/:id`
Busca uma campanha específica por ID.

#### **PATCH** `/api/v1/campaigns/:id`
Atualiza uma campanha existente.

#### **PATCH** `/api/v1/campaigns/:id/activate`
Ativa uma campanha.

#### **PATCH** `/api/v1/campaigns/:id/deactivate`
Desativa uma campanha.

#### **DELETE** `/api/v1/campaigns/:id`
Remove uma campanha.

### Questões

#### **GET** `/api/v1/questions`
Lista questões com paginação e filtros.

**Query Parameters:**
- `question` - Filtrar por texto da questão
- `category` - Filtrar por categoria
- `type` - Tipo da questão (`multiple_choice`, `true_false`, `open_ended`)
- `difficulty` - Dificuldade (`easy`, `medium`, `hard`)
- `tags` - Array de tags
- `isActive` - Status ativo
- `limit` - Limite de resultados (padrão: 10)
- `offset` - Offset para paginação (padrão: 0)
- `sortBy` - Campo de ordenação (padrão: `createdAt`)
- `sortOrder` - Ordem (`asc` ou `desc`, padrão: `desc`)

#### **GET** `/api/v1/questions/:id`
Busca uma questão específica por ID.

#### **GET** `/api/v1/questions/category/:category`
Lista questões por categoria.

#### **GET** `/api/v1/questions/difficulty/:difficulty`
Lista questões por nível de dificuldade.

#### **GET** `/api/v1/questions/random`
Retorna questões aleatórias.

**Query Parameters:**
- `limit` - Número de questões (padrão: 10)

#### **GET** `/api/v1/questions/stats`
Retorna estatísticas das questões.

#### **GET** `/api/v1/questions/categories`
Lista todas as categorias disponíveis.

#### **GET** `/api/v1/questions/tags`
Lista todas as tags disponíveis.

### Sistema

#### **GET** `/api/v1/`
Verificação de status da API.

#### **GET** `/api/v1/health`
Health check da aplicação.

## 📊 Schemas MongoDB

### Campaign Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  isActive: Boolean,
  startDate: Date,
  endDate: Date,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Questions Collection
```javascript
{
  _id: ObjectId,
  question: String,
  answer: String,
  options: [String],
  type: String, // 'multiple_choice', 'true_false', 'open_ended'
  difficulty: String, // 'easy', 'medium', 'hard'
  tags: [String],
  isActive: Boolean,
  category: String,
  explanation: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testando a API

### Usando cURL

**Criar uma campanha:**
```bash
curl -X POST http://localhost:3000/api/v1/campaigns \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Teste de Matemática",
    "description": "Campanha de teste para matemática"
  }'
```

**Listar questões:**
```bash
curl "http://localhost:3000/api/v1/questions?limit=5&difficulty=easy"
```

### Usando Postman

Importe a collection disponível no diretório `/docs` (se existir) ou use os endpoints documentados acima.

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes
npm run test
npm run test:watch
npm run test:cov

# Linting
npm run lint
npm run format
```

## 📦 Docker (Opcional)

Para executar com Docker:

```bash
# Build da imagem
docker build -t flashcards-api .

# Executar container
docker run -p 3000:3000 --env-file .env flashcards-api
```

## 🌐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `MONGODB_URI` | URI de conexão do MongoDB | `mongodb://localhost:27017/flashcards` |
| `PORT` | Porta da aplicação | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `JWT_SECRET` | Chave secreta JWT (futuro) | - |
| `API_VERSION` | Versão da API | `v1` |

## 🚀 Melhorias Futuras

- [ ] Autenticação JWT
- [ ] Logs estruturados
- [ ] Cache com Redis
- [ ] Documentação Swagger
- [ ] Testes unitários e e2e
- [ ] Docker Compose
- [ ] CI/CD Pipeline
- [ ] Rate Limiting
- [ ] Monitoramento e Métricas

## 📄 Licença

Este projeto é privado e não possui licença pública.

## 🤝 Contribuição

Para contribuir com este projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ usando NestJS**# flashcards
