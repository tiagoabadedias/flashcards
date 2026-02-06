// Script para inserir dados de teste realistas
// Execute com: node insert-realistic-data.js

const { MongoClient, ObjectId } = require('mongodb');

async function insertRealisticData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const db = client.db('flashcards');
    
    // 1. Criar campanhas
    const campaigns = [
      {
        name: "Banco de Dados MySQL",
        description: "Questões sobre conceitos avançados de MySQL",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Programação Web",
        description: "Questões sobre desenvolvimento web moderno",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const campaignsResult = await db.collection('campaigns').insertMany(campaigns);
    console.log('Campanhas criadas:', Object.values(campaignsResult.insertedIds));
    
    const [campaign1Id, campaign2Id] = Object.values(campaignsResult.insertedIds);
    
    // 2. Inserir questões com respostas dos alunos
    const questions = [
      // Campanha 1 - Banco de Dados MySQL
      // Estudante 1 - Excelente
      {
        phoneNumber: "5551981354122",
        question: "O que são VIEW, TRIGGER e PROCEDURE no MySQL e qual a principal utilidade de cada um?",
        return: true,
        answer: "VIEW é uma tabela virtual derivada de uma consulta SQL, usada para simplificar consultas complexas e melhorar a segurança ao restringir o acesso a dados específicos. TRIGGER é um conjunto de comandos que é automaticamente executado em resposta a eventos como inserção, atualização ou exclusão de dados em uma tabela, usado para manter integridade e executar ações automáticas. PROCEDURE é um conjunto armazenado de comandos SQL que pode ser chamado para executar ações repetitivas ou lógicas complexas, facilitando a reutilização de código e a organização da lógica no banco de dados.",
        campaign: campaign1Id.toString(),
        nota: "2",
        resposta: "Sua resposta não abordou o conteúdo solicitado sobre VIEW, TRIGGER e PROCEDURE no MySQL. Recomendo focar diretamente na definição e utilidade de cada conceito para melhorar seu desempenho. Continue se esforçando, sua dedicação é importante para aprimorar suas respostas.",
        retornoAluno: "Falei para a tia que ia olhar ali como é que estava ali o cronograma, né? Aí essa semana agora tá bem cheinho, aí para segunda-feira, para segunda-feira eu já consigo fazer, daí a gente pode pedir, a gente pode pedir na sexta, que por nada vem sábado de manhã ou vem na segunda de manhã, aí vindo a gente já consegue iniciar.",
        type: "open_ended",
        difficulty: "hard",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        phoneNumber: "5551981354122",
        question: "Explique a diferença entre INNER JOIN e LEFT JOIN no MySQL.",
        return: true,
        answer: "INNER JOIN retorna apenas os registros que têm correspondência em ambas as tabelas. LEFT JOIN retorna todos os registros da tabela da esquerda e os registros correspondentes da tabela da direita, preenchendo com NULL quando não há correspondência.",
        campaign: campaign1Id.toString(),
        nota: "8",
        resposta: "Boa resposta! Você demonstrou entender bem a diferença entre os tipos de JOIN. Continue assim!",
        retornoAluno: "INNER JOIN só traz os dados que existem nas duas tabelas. LEFT JOIN traz tudo da primeira tabela e o que tem na segunda, se não tiver coloca NULL.",
        type: "open_ended",
        difficulty: "medium",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Estudante 2 - Regular
      {
        phoneNumber: "5511987654321",
        question: "O que são VIEW, TRIGGER e PROCEDURE no MySQL e qual a principal utilidade de cada um?",
        return: true,
        answer: "VIEW é uma tabela virtual derivada de uma consulta SQL, usada para simplificar consultas complexas e melhorar a segurança ao restringir o acesso a dados específicos. TRIGGER é um conjunto de comandos que é automaticamente executado em resposta a eventos como inserção, atualização ou exclusão de dados em uma tabela, usado para manter integridade e executar ações automáticas. PROCEDURE é um conjunto armazenado de comandos SQL que pode ser chamado para executar ações repetitivas ou lógicas complexas, facilitando a reutilização de código e a organização da lógica no banco de dados.",
        campaign: campaign1Id.toString(),
        nota: "6",
        resposta: "Resposta correta mas poderia ter mais detalhes. Tente explicar com exemplos práticos na próxima vez.",
        retornoAluno: "VIEW é como uma consulta salva que parece uma tabela. TRIGGER executa automaticamente quando algo acontece na tabela. PROCEDURE é uma função que você pode chamar para fazer várias coisas no banco.",
        type: "open_ended",
        difficulty: "hard",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        phoneNumber: "5511987654321",
        question: "Explique a diferença entre INNER JOIN e LEFT JOIN no MySQL.",
        return: true,
        answer: "INNER JOIN retorna apenas os registros que têm correspondência em ambas as tabelas. LEFT JOIN retorna todos os registros da tabela da esquerda e os registros correspondentes da tabela da direita, preenchendo com NULL quando não há correspondência.",
        campaign: campaign1Id.toString(),
        nota: "4",
        resposta: "Resposta incompleta. Você entendeu o conceito básico mas faltou explicar melhor o comportamento do LEFT JOIN.",
        retornoAluno: "INNER JOIN junta as tabelas. LEFT JOIN também junta mas é diferente.",
        type: "open_ended",
        difficulty: "medium",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Estudante 3 - Fraco
      {
        phoneNumber: "5521999888777",
        question: "O que são VIEW, TRIGGER e PROCEDURE no MySQL e qual a principal utilidade de cada um?",
        return: true,
        answer: "VIEW é uma tabela virtual derivada de uma consulta SQL, usada para simplificar consultas complexas e melhorar a segurança ao restringir o acesso a dados específicos. TRIGGER é um conjunto de comandos que é automaticamente executado em resposta a eventos como inserção, atualização ou exclusão de dados em uma tabela, usado para manter integridade e executar ações automáticas. PROCEDURE é um conjunto armazenado de comandos SQL que pode ser chamado para executar ações repetitivas ou lógicas complexas, facilitando a reutilização de código e a organização da lógica no banco de dados.",
        campaign: campaign1Id.toString(),
        nota: "1",
        resposta: "Resposta não corresponde ao conteúdo da pergunta. É importante estudar mais sobre os conceitos de banco de dados. Recomendo revisar o material e tentar novamente.",
        retornoAluno: "Professora, eu não consegui entender direito essa pergunta. Pode explicar de novo na próxima aula?",
        type: "open_ended",
        difficulty: "hard",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Campanha 2 - Programação Web
      {
        phoneNumber: "5551981354122",
        question: "Qual a diferença entre var, let e const no JavaScript?",
        return: true,
        answer: "var tem escopo de função e pode ser redeclarada. let tem escopo de bloco e pode ser reatribuída mas não redeclarada. const tem escopo de bloco e não pode ser reatribuída nem redeclarada.",
        campaign: campaign2Id.toString(),
        nota: "9",
        resposta: "Excelente resposta! Você domina bem os conceitos de escopo em JavaScript.",
        retornoAluno: "var é mais antiga e tem problemas de escopo. let é melhor para variáveis que mudam. const é para constantes que não mudam depois de declaradas.",
        type: "open_ended",
        difficulty: "medium",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      {
        phoneNumber: "5511987654321",
        question: "Qual a diferença entre var, let e const no JavaScript?",
        return: true,
        answer: "var tem escopo de função e pode ser redeclarada. let tem escopo de bloco e pode ser reatribuída mas não redeclarada. const tem escopo de bloco e não pode ser reatribuída nem redeclarada.",
        campaign: campaign2Id.toString(),
        nota: "7",
        resposta: "Boa resposta, você entendeu as diferenças básicas. Seria interessante mencionar também sobre hoisting na próxima vez.",
        retornoAluno: "var é global, let e const são do bloco. const não muda.",
        type: "open_ended",
        difficulty: "medium",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const questionsResult = await db.collection('questions').insertMany(questions);
    console.log('Questões inseridas:', questionsResult.insertedCount);
    
    console.log('\\n=== RESUMO DOS DADOS INSERIDOS ===');
    console.log('Campanhas:', campaigns.length);
    console.log('Questões:', questions.length);
    console.log('\\nEstudantes e suas médias:');
    
    // Calcular médias por estudante
    const students = {};
    questions.forEach(q => {
      if (!students[q.phoneNumber]) {
        students[q.phoneNumber] = { notas: [], count: 0 };
      }
      students[q.phoneNumber].notas.push(parseFloat(q.nota));
      students[q.phoneNumber].count++;
    });
    
    Object.entries(students).forEach(([phone, data]) => {
      const media = data.notas.reduce((a, b) => a + b, 0) / data.count;
      console.log(`📱 ${phone}: ${data.count} questões, média: ${media.toFixed(1)}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

insertRealisticData();