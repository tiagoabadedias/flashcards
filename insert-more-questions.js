// Conecte ao MongoDB e execute este script para inserir mais questões de exemplo

use flashCards

// Inserir questão para a campanha de Matemática Básica
db.questions.insertOne({
  question: "Quanto é 15 + 27?",
  answer: "42",
  options: ["40", "41", "42", "43"],
  type: "multiple_choice",
  difficulty: "easy",
  tags: ["matematica", "soma", "aritmetica"],
  isActive: true,
  category: "Matemática",
  explanation: "Para somar 15 + 27, podemos fazer: 15 + 27 = 42",
  campaign: ObjectId("69729ffbb97b49a883535241"),
  phoneNumber: "5551981354123",
  return: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Inserir questão para a campanha de Programação Web
db.questions.insertOne({
  question: "Qual é a diferença entre let, const e var em JavaScript?",
  answer: "let tem escopo de bloco e pode ser reatribuída, const tem escopo de bloco mas não pode ser reatribuída, var tem escopo de função",
  options: [],
  type: "open_ended",
  difficulty: "medium",
  tags: ["javascript", "variaveis", "escopo"],
  isActive: true,
  category: "Programação",
  explanation: "let e const foram introduzidas no ES6 e têm escopo de bloco, enquanto var tem escopo de função e pode causar problemas de hoisting",
  campaign: ObjectId("6972a2b21546c6c498db44b7"),
  phoneNumber: "5551981354124",
  return: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Inserir questão para a campanha de Ciências Gerais
db.questions.insertOne({
  question: "A fotossíntese ocorre principalmente em qual parte da planta?",
  answer: "Folhas",
  options: ["Raízes", "Caule", "Folhas", "Flores"],
  type: "multiple_choice",
  difficulty: "easy",
  tags: ["biologia", "fotossintese", "plantas"],
  isActive: true,
  category: "Biologia",
  explanation: "As folhas contêm cloroplastos que realizam a fotossíntese, capturando luz solar e convertendo CO2 em glicose",
  campaign: ObjectId("6972a004b97b49a883535247"),
  phoneNumber: "5551981354125",
  return: false,
  createdAt: new Date(),
  updatedAt: new Date()
});