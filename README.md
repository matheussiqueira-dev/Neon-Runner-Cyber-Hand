# Neon Runner: Cyber Hand

Um infinite runner cyberpunk controlado por gestos, com visualização da mão em tempo real e atmosfera neon. Projeto autoral.

## Destaques

- Controle por gestos (pular, deslizar, esquerda/direita)
- Visualização da mão como esqueleto cibernético
- Cena 3D com iluminação e pós‑efeitos estilizados
- Interface responsiva com overlay de HUD

## Tecnologias

- React + TypeScript
- Vite
- Three.js + @react-three/fiber
- Zustand
- MediaPipe Tasks Vision (detecção de mãos)

## Como Rodar Localmente

**Pré‑requisitos:** Node.js 18+

1. Instale as dependências:
   `npm install`
2. Configure a variável `APP_API_KEY` em `.env.local` se sua implantação exigir.
3. Baixe o modelo de mão e coloque em `public/models/hand_landmarker.task`.
4. Execute o projeto:
   `npm run dev`

## Controles

- **Pular:** mão na parte superior do quadro
- **Deslizar:** mão na parte inferior do quadro
- **Mover:** swipe para esquerda/direita

## Estrutura do Projeto

- `components/` componentes visuais e cena 3D
- `services/gestureService.ts` lógica de detecção de gestos
- `store.ts` estado global do jogo

## Licença

Todos os direitos reservados.

## Autoria

**Matheus Siqueira**