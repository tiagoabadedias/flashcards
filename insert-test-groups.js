// Script para inserir grupos de teste
const fetch = require('node-fetch');

async function insertTestGroups() {
  const baseUrl = 'http://localhost:3001/api/v1';
  
  const groups = [
    {
      name: "Turma de Matemática A",
      description: "Estudantes do ensino médio focados em matemática avançada",
      participants: [
        "11999999999",
        "11888888888",
        "11777777777",
        "11666666666"
      ],
      isActive: true
    },
    {
      name: "Grupo de Programação",
      description: "Desenvolvedores iniciantes aprendendo conceitos básicos",
      participants: [
        "21999999999",
        "21888888888",
        "21777777777"
      ],
      isActive: true
    },
    {
      name: "Turma de História",
      description: "Estudantes interessados em história brasileira",
      participants: [
        "31999999999",
        "31888888888"
      ],
      isActive: false
    },
    {
      name: "Grupo de Estudos de Banco de Dados",
      description: "Estudantes avançados em SQL e MySQL",
      participants: [
        "5551981354122", // Mesmo estudante da questão anterior
        "5511987654321",
        "5521999888777"
      ],
      isActive: true
    }
  ];

  console.log('🚀 Inserindo grupos de teste...');

  for (const group of groups) {
    try {
      const response = await fetch(`${baseUrl}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group)
      });

      if (response.ok) {
        const createdGroup = await response.json();
        console.log(`✅ Grupo criado: ${group.name} (${group.participants.length} participantes)`);
      } else {
        const error = await response.text();
        console.error(`❌ Erro ao criar grupo ${group.name}:`, error);
      }
    } catch (error) {
      console.error(`❌ Erro de rede ao criar grupo ${group.name}:`, error.message);
    }
  }

  console.log('✨ Inserção de grupos concluída!');
  console.log('🌐 Acesse: https://flashcards-sooty-ten.vercel.app/groups');
}

insertTestGroups();