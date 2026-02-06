// Script para inserir dados via REST API
async function insertData() {
  const baseUrl = 'http://localhost:3001/api/v1';
  
  try {
    console.log('🚀 Inserindo dados de teste...');
    
    // Usar campanhas existentes
    const campaigns = {
      matematica: "69729ffbb97b49a883535241",
      historia: "6972a000b97b49a883535244"
    };
    
    // 2. Inserir questões com respostas dos alunos para Matemática
    const mathQuestions = [
      {
        phoneNumber: "11999999999",
        question: "Quanto é 2 + 2?",
        answer: "4",
        campaign: campaigns.matematica,
        retornoAluno: "2 mais 2 é igual a 4",
        nota: "10",
        resposta: "Perfeito! Resposta correta.",
        type: "open_ended",
        difficulty: "easy",
        isActive: true
      },
      {
        phoneNumber: "11888888888", 
        question: "Quanto é 2 + 2?",
        answer: "4",
        campaign: campaigns.matematica,
        retornoAluno: "Acho que é 5",
        nota: "0",
        resposta: "Resposta incorreta. A soma de 2 + 2 é 4.",
        type: "open_ended",
        difficulty: "easy",
        isActive: true
      },
      {
        phoneNumber: "11999999999",
        question: "Qual é a raiz quadrada de 16?",
        answer: "4",
        campaign: campaigns.matematica,
        retornoAluno: "A raiz quadrada de 16 é 4",
        nota: "10",
        resposta: "Excelente! Continua assim.",
        type: "open_ended",
        difficulty: "medium",
        isActive: true
      }
    ];
    
    // Inserir questões de matemática
    for (const questionData of mathQuestions) {
      try {
        const response = await fetch(`${baseUrl}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData)
        });
        
        if (response.ok) {
          console.log('✅ Questão de matemática inserida para:', questionData.phoneNumber);
        } else {
          const errorText = await response.text();
          console.error('❌ Erro ao inserir questão de matemática:', errorText);
        }
      } catch (error) {
        console.error('❌ Erro de rede:', error.message);
      }
    }
    
    console.log('✨ Dados inseridos com sucesso!');
    console.log('🌐 Teste no frontend: http://localhost:3000/questions');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

insertData();