# 00 - Guia do Contexto do Projeto

## O Rememore

O Rememore é um sistema para capturar, organizar, preservar e reencontrar memórias pessoais. Sua documentação é evolutiva: começa pela exploração das ideias, consolida o conhecimento vigente e o refina progressivamente até orientar a construção do sistema. Descobertas posteriores podem levar à revisão da documentação responsável.

## Organização do projeto

- **01 - Descoberta:** registra ideias, investigações e a origem das decisões.
- **02 - Consolidado:** reúne, sem duplicação, as definições vigentes do produto.
- **03 - Fluxos:** mostra como a pessoa percorre o sistema para atingir seus objetivos.
- **04 - Funcionalização:** detalha como as funcionalidades e a experiência devem operar.
- **05 - Especificação:** transforma partes da Funcionalização em unidades de desenvolvimento.

Cada diretório tem seu próprio documento inicial, que explica seu objetivo e uso. Consulte esse guia para conhecer seus procedimentos e documentos.

## Documentos da raiz

- **00 - Guia do Contexto do Projeto:** apresenta o projeto e orienta a leitura inicial.
- **01 - Próximas Tarefas:** informa o que está em andamento e o que vem a seguir.
- **02 - Mapa do Laboratório:** identifica os elementos e componentes reutilizáveis do sistema.

## Stack e publicação

A interface é construída com .NET 10 e Blazor WebAssembly, usando Bulma como base visual. O CSS é organizado por alcance: estilos globais, layouts compartilhados e estilos específicos de páginas e componentes. A construção parte do HTML semântico e do Bulma, com personalizações e refinamentos quando necessários.

A publicação prevista usa GitHub Pages para a interface, Render para a API e Turso para o banco de dados. A API e o backend funcional ainda são frentes a desenvolver.

## Momento atual

O projeto está na fase de criação e execução das Especificações. O documento 01 - Próximas Tarefas indica qual unidade está em elaboração ou desenvolvimento e qual é o próximo passo. O 05.00 - Guia da Especificação explica como conduzir esse trabalho.
