# Separação CRM / website e otimização

## Limites acordados

- Duas aplicações no mesmo repositório, com deploys independentes.
- Preservar as versões públicas existentes, os URLs, o visual e as funcionalidades do CRM.
- Backend partilhado; website sem Clerk, credenciais internas ou helpers autenticados.
- Não executar builds nem publicar. Não realizar limpeza geral, apagar versões ou descartar alterações existentes.

## Ordem de execução

- [x] Migrar frontend administrativo para apps/crm e páginas públicas para apps/website.
- [x] Isolar layouts, fontes, variáveis de ambiente, scripts de arranque e configurações de deploy.
- [x] Manter e testar a lista explícita de dados públicos e o isolamento da autenticação.
- [x] Otimizar imagens responsivas dos conceitos sem alterar fotografias/composição; preservar prioridade da imagem principal.
- [x] Reduzir trabalho desnecessário nas animações sem remover efeitos; organizar o arranque fora do HTML monolítico.
- [x] Executar testes de estabilidade, tipos, unidades e navegação em desenvolvimento, com limites descritos na auditoria.
- [x] Documentar comandos, portas, migração de deploy e limitações verificadas.

`/stand-orbit/referencias` foi preservado e aberto no navegador após a migração. Nenhuma versão de comparação foi eliminada.

## Validação posterior, não apresentada como concluída

- Configurar os dois projetos na plataforma de alojamento e validar os deploys quando autorizado.
- Lighthouse/Core Web Vitals de produção, cache frio/rede lenta, dispositivos físicos e sessão autenticada do CRM.
- Otimização das fotografias reais no backend/storage: os endpoints públicos atuais foram preservados, não convertidos para um serviço de imagens diferente.

O ganho de performance só será declarado onde houver medição. Sem build não será apresentada uma pontuação de produção.
