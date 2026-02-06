# Dados de Exemplo com Respostas de Estudantes

## Campanha 1: Matemática Básica
**POST** `http://localhost:3001/campaigns`
```json
{
  "name": "Matemática Básica",
  "description": "Questões fundamentais de matemática",
  "isActive": true
}
```

## Respostas do Estudante 1 (11999999999)

### Questão 1 - Acertou
**POST** `http://localhost:3001/questions`
```json
{
  "question": "Quanto é 2 + 2?",
  "answer": "4",
  "studentAnswer": "4",
  "score": 10,
  "options": ["2", "3", "4", "5"],
  "type": "multiple_choice",
  "campaign": "CAMPAIGN_ID_HERE",
  "phoneNumber": "11999999999",
  "difficulty": "easy"
}
```

### Questão 2 - Acertou
**POST** `http://localhost:3001/questions`
```json
{
  "question": "Qual é a raiz quadrada de 16?",
  "answer": "4",
  "studentAnswer": "4",
  "score": 10,
  "options": ["2", "3", "4", "8"],
  "type": "multiple_choice", 
  "campaign": "CAMPAIGN_ID_HERE",
  "phoneNumber": "11999999999",
  "difficulty": "medium"
}
```

## Respostas do Estudante 2 (11888888888)

### Questão 1 - Errou
**POST** `http://localhost:3001/questions`
```json
{
  "question": "Quanto é 2 + 2?",
  "answer": "4",
  "studentAnswer": "3",
  "score": 0,
  "options": ["2", "3", "4", "5"],
  "type": "multiple_choice",
  "campaign": "CAMPAIGN_ID_HERE", 
  "phoneNumber": "11888888888",
  "difficulty": "easy"
}
```

### Questão 2 - Errou
**POST** `http://localhost:3001/questions`
```json
{
  "question": "Qual é a raiz quadrada de 16?",
  "answer": "4",
  "studentAnswer": "8",
  "score": 0,
  "options": ["2", "3", "4", "8"],
  "type": "multiple_choice",
  "campaign": "CAMPAIGN_ID_HERE",
  "phoneNumber": "11888888888", 
  "difficulty": "medium"
}
```

## Respostas do Estudante 3 (11777777777)

### Questão 1 - Acertou parcialmente
**POST** `http://localhost:3001/questions`
```json
{
  "question": "Quanto é 2 + 2?",
  "answer": "4",
  "studentAnswer": "4",
  "score": 10,
  "options": ["2", "3", "4", "5"],
  "type": "multiple_choice",
  "campaign": "CAMPAIGN_ID_HERE",
  "phoneNumber": "11777777777",
  "difficulty": "easy"
}
```

### Questão 2 - Errou
**POST** `http://localhost:3001/questions`
```json
{
  "question": "Qual é a raiz quadrada de 16?",
  "answer": "4",
  "studentAnswer": "2",
  "score": 0,
  "options": ["2", "3", "4", "8"],
  "type": "multiple_choice",
  "campaign": "CAMPAIGN_ID_HERE",
  "phoneNumber": "11777777777",
  "difficulty": "medium"
}
```

## Campanha 2: Português
**POST** `http://localhost:3001/campaigns`
```json
{
  "name": "Português",
  "description": "Questões de gramática e interpretação",
  "isActive": true
}
```

## Respostas do Estudante 1 (11999999999) - Nova campanha

### Questão 1 - Acertou
**POST** `http://localhost:3001/questions`
```json
{
  "question": "Qual é o plural de 'animal'?",
  "answer": "animais",
  "studentAnswer": "animais",
  "score": 10,
  "options": ["animals", "animais", "animales", "animalos"],
  "type": "multiple_choice",
  "campaign": "CAMPAIGN2_ID_HERE",
  "phoneNumber": "11999999999",
  "difficulty": "easy"
}
```

## Resumo dos Resultados Esperados

### Campanha: Matemática Básica
- **Estudante 11999999999**: 20 pontos (2/2 questões corretas)
- **Estudante 11888888888**: 0 pontos (0/2 questões corretas)
- **Estudante 11777777777**: 10 pontos (1/2 questões corretas)

### Campanha: Português
- **Estudante 11999999999**: 10 pontos (1/1 questão correta)

## Notas
- Substitua `CAMPAIGN_ID_HERE` pelo ID real da campanha criada
- O phoneNumber identifica o estudante
- O score é a pontuação obtida (0 ou 10 por questão)
- studentAnswer é o que o aluno respondeu
- answer é a resposta correta