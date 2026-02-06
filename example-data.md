# Dados de Exemplo

Use estes dados para testar a API localmente.

## Exemplos de Campanhas

### Criar Campanha 1
```bash
curl -X POST http://localhost:3000/api/v1/campaigns \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Campanha Matemática Básica",
    "description": "Campanha focada em questões básicas de matemática para estudantes iniciantes",
    "isActive": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "tags": ["matematica", "basico", "educacao"]
  }'
```

### Criar Campanha 2
```bash
curl -X POST http://localhost:3000/api/v1/campaigns \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "História do Brasil",
    "description": "Questões sobre a história brasileira desde o descobrimento até os dias atuais",
    "isActive": true,
    "tags": ["historia", "brasil", "cultura"]
  }'
```

## Exemplos de Questões (para inserir diretamente no MongoDB)

```javascript
// Conecte ao MongoDB e use o banco flashcards
use flashcards

// Inserir questões de exemplo
db.questions.insertMany([
  {
    question: "Quanto é 2 + 2?",
    answer: "4",
    options: ["2", "3", "4", "5"],
    type: "multiple_choice",
    difficulty: "easy",
    tags: ["matematica", "soma", "basico"],
    isActive: true,
    category: "Matemática",
    explanation: "A soma de 2 + 2 resulta em 4",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "Qual é a capital do Brasil?",
    answer: "Brasília",
    options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
    type: "multiple_choice",
    difficulty: "easy",
    tags: ["geografia", "brasil", "capital"],
    isActive: true,
    category: "Geografia",
    explanation: "Brasília é a capital federal do Brasil desde 1960",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "O Brasil foi colonizado por Portugal?",
    answer: "true",
    options: ["true", "false"],
    type: "true_false",
    difficulty: "easy",
    tags: ["historia", "brasil", "colonizacao"],
    isActive: true,
    category: "História",
    explanation: "O Brasil foi colonizado pelos portugueses a partir de 1500",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "Explique o que é fotossíntese",
    answer: "Processo pelo qual as plantas produzem energia usando luz solar, água e CO2",
    options: [],
    type: "open_ended",
    difficulty: "medium",
    tags: ["biologia", "plantas", "energia"],
    isActive: true,
    category: "Biologia",
    explanation: "A fotossíntese é um processo fundamental realizado pelas plantas para converter energia luminosa em energia química",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    question: "Quanto é 15 × 7?",
    answer: "105",
    options: ["95", "100", "105", "110"],
    type: "multiple_choice",
    difficulty: "medium",
    tags: ["matematica", "multiplicacao"],
    isActive: true,
    category: "Matemática",
    explanation: "15 × 7 = 105",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## Testando a API

### Buscar todas as campanhas
```bash
curl http://localhost:3000/api/v1/campaigns
```

### Buscar campanhas ativas
```bash
curl http://localhost:3001/api/v1/campaigns?active=true
```

### Buscar questões com paginação
```bash
curl "http://localhost:3001/api/v1/questions?limit=3&offset=0"
```

### Buscar questões por dificuldade
```bash
curl http://localhost:3001/api/v1/questions/difficulty/easy
```

### Buscar questões por categoria
```bash
curl http://localhost:3001/api/v1/questions/category/Matemática
```

### Obter questões aleatórias
```bash
curl "http://localhost:3001/api/v1/questions/random?limit=2"
```

### Obter estatísticas das questões
```bash
curl http://localhost:3001/api/v1/questions/stats
```

### Health check
```bash
curl http://localhost:3001/api/v1/health
```