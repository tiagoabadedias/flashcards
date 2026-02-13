// Script simples para verificar e inserir dados de teste
const { MongoClient, ObjectId } = require('mongodb');

async function checkAndInsertData() {
  let client;
  
  try {
    // Tentando conectar ao MongoDB local
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('✅ Conectado ao MongoDB local');
    
    const db = client.db('flashcards');
    
    // Verificar quantas questões existem
    const questionsCount = await db.collection('questions').countDocuments();
    const questionsWithPhoneCount = await db.collection('questions').countDocuments({
      phoneNumber: { $exists: true, $ne: null, $ne: '' }
    });
    
    console.log(`📊 Total de questões: ${questionsCount}`);
    console.log(`📱 Questões com phoneNumber: ${questionsWithPhoneCount}`);
    
    if (questionsWithPhoneCount === 0) {
      console.log('🚀 Inserindo dados de teste...');
      
      // Criar um usuário de teste
      const testUser = {
        _id: new ObjectId('507f1f77bcf86cd799439011'), // ID fixo para facilitar testes
        name: 'Usuário de Teste',
        email: 'teste@teste.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      try {
        await db.collection('users').insertOne(testUser);
        console.log('👤 Usuário de teste criado');
      } catch (error) {
        if (error.code !== 11000) { // Ignorar erro de duplicata
          throw error;
        }
        console.log('👤 Usuário de teste já existe');
      }
      
      // Criar campanha de teste
      const testCampaign = {
        _id: new ObjectId(),
        name: 'Campanha de Teste',
        description: 'Campanha para testar o módulo de estudantes',
        isActive: true,
        userId: testUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const campaignResult = await db.collection('campaigns').insertOne(testCampaign);
      console.log('📚 Campanha de teste criada');
      
      // Inserir questões de teste com phoneNumbers
      const testQuestions = [
        {
          phoneNumber: '5511998887777',
          name: 'João Silva',
          question: 'O que é JavaScript?',
          answer: 'JavaScript é uma linguagem de programação',
          campaign: testCampaign._id,
          userId: testUser._id,
          nota: '8',
          resposta: 'Boa resposta!',
          retornoAluno: 'JavaScript é uma linguagem para fazer sites dinâmicos',
          answeredAt: new Date(),
          type: 'open_ended',
          difficulty: 'easy',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          phoneNumber: '5511998887777',
          name: 'João Silva',
          question: 'O que é HTML?',
          answer: 'HTML é uma linguagem de marcação',
          campaign: testCampaign._id,
          userId: testUser._id,
          nota: '7',
          resposta: 'Resposta adequada',
          retornoAluno: 'HTML estrutura as páginas web',
          answeredAt: new Date(),
          type: 'open_ended',
          difficulty: 'easy',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          phoneNumber: '5521987654321',
          name: 'Maria Santos',
          question: 'O que é JavaScript?',
          answer: 'JavaScript é uma linguagem de programação',
          campaign: testCampaign._id,
          userId: testUser._id,
          nota: '9',
          resposta: 'Excelente!',
          retornoAluno: 'JavaScript é usado para interatividade na web',
          answeredAt: new Date(),
          type: 'open_ended',
          difficulty: 'easy',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await db.collection('questions').insertMany(testQuestions);
      console.log(`📝 ${testQuestions.length} questões de teste inseridas`);
      console.log('🎉 Dados de teste inseridos com sucesso!');
      console.log(`💡 Use este userId para testes: ${testUser._id}`);
    } else {
      console.log('✅ Já existem dados com phoneNumber no banco');
      
      // Mostrar algumas questões de exemplo
      const sampleQuestions = await db.collection('questions').find({
        phoneNumber: { $exists: true, $ne: null, $ne: '' }
      }).limit(3).toArray();
      
      console.log('📋 Exemplos de questões:');
      sampleQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q.phoneNumber} - ${q.name} - UserID: ${q.userId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Dica: Inicie o MongoDB com: docker-compose up -d');
      console.log('💡 Ou instale localmente: brew install mongodb-community');
    }
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkAndInsertData();