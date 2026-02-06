#!/bin/bash

# Script para popular o banco de dados com dados de exemplo

echo "Populando banco de dados..."

# Criar Campanha 1
echo "Criando Campanha 1: Matemática Básica"
curl -X POST "http://localhost:3001/api/v1/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campanha Matemática Básica",
    "description": "Campanha focada em questões básicas de matemática para estudantes iniciantes",
    "isActive": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "tags": ["matematica", "basico", "educacao"]
  }'

echo ""

# Criar Campanha 2  
echo "Criando Campanha 2: História do Brasil"
curl -X POST "http://localhost:3001/api/v1/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "História do Brasil",
    "description": "Questões sobre a história brasileira desde o descobrimento até os dias atuais",
    "isActive": true,
    "tags": ["historia", "brasil", "cultura"]
  }'

echo ""

# Criar Campanha 3
echo "Criando Campanha 3: Ciências Gerais"
curl -X POST "http://localhost:3001/api/v1/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ciências Gerais",
    "description": "Questões diversas de ciências naturais e exatas",
    "isActive": false,
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-06-30T23:59:59.999Z", 
    "tags": ["ciencias", "biologia", "fisica", "quimica"]
  }'

echo ""
echo "Campanhas criadas com sucesso!"