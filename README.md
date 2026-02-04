# Neon Runner: Cyber Hand

![Status](https://img.shields.io/badge/Status-Premium-cyan)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Three.js%20%7C%20MediaPipe-magenta)

Uma experiência interativa de alta performance que combina a estética **Cyberpunk** com tecnologias de ponta em **Computer Vision**. Controle o seu corredor futurista utilizando apenas gestos das mãos, capturados em tempo real pela sua webcam.

---

## 🚀 Visão Geral

O **Neon Runner: Cyber Hand** é um runner 3D infinito onde o usuário interage através de reconhecimento de gestos. O projeto utiliza o modelo de **Hand Landmarking** do MediaPipe para extrair coordenadas precisas da mão, que são traduzidas em comandos de movimento dentro de um ambiente processual gerado dinamicamente com **React Three Fiber**.

### 🎮 Como Jogar

1.  **Mova a mão lateralmente**: Troca de pista (Esquerda, Centro, Direita).
2.  **Levante a mão**: Salta sobre barreiras ou buracos.
3.  **Abaixe a mão**: Desliza sob obstáculos altos.
4.  **Objetivo**: Colete núcleos de energia (octaedros neon) e desvie dos obstáculos para alcançar a maior distância possível.

---

## 🛠️ Tecnologias Utilizadas

### Core
- **React 19**: Biblioteca principal para interface e lógica de estados.
- **TypeScript**: Tipagem estática para robustez e manutenção.
- **Zustand**: Gerenciamento de estado global ultra-leve e performático.

### 3D & Efeitos
- **Three.js & @react-three/fiber**: Engine 3D potente integrada ao ecossistema React.
- **@react-three/drei**: Helpers essenciais para câmeras, materiais e modelos.
- **@react-three/postprocessing**: Filtros de imagem avançados (Bloom Seletivo, Chromatic Aberration, Noise, Vignette).

### Computer Vision
- **MediaPipe Hands**: Engine de IA do Google para rastreamento de 21 pontos da mão com baixa latência via CPU/GPU.

---

## ✨ Funcionalidades Principais

- **Interface Premium**: Design totalmente reconstruído com foco em UX, utilizando animações suaves com `framer-motion` e ícones da `lucide-react`.
- **Renderização Futurista**: Shaders personalizados, trilhas de luz (`Trail`), e materiais distorcivos (`MeshDistortMaterial`).
- **Sistema de Recordes**: Persistência local (LocalStorage) do melhor desempenho do jogador.
- **Geração Procedural**: Ambientes e desafios criados dinamicamente com curva de dificuldade progressiva.
- **Feedback Visual Dinâmico**: HUD detalhado com indicadores de link neural e notificações de gestos.

---

## 📦 Instalação e Uso

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Webcam funcional

### Passos
1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/matheussiqueira-dev/Neon-Runner-Cyber-Hand.git
   cd Neon-Runner-Cyber-Hand
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse**: `http://localhost:3000` (ou a porta indicada no terminal).

---

## 🏗️ Estrutura do Projeto

```text
├── components/          # Componentes React (UI, 3D, HandTracking)
├── services/            # Lógica de Gestos e MediaPipe
├── public/              # Assets estáticos e modelos de IA
├── store.ts             # Estado Global (Zustand)
├── types.ts             # Definições de Tipos TypeScript
├── index.css            # Design System & Variáveis Globais
└── App.tsx              # Ponto de entrada da aplicação
```

---

## 💎 Boas Práticas Implementadas

- **Componentização**: Divisão clara entre camadas de UI (2D), Lógica (Services) e Renderização (3D).
- **Hooks Customizados**: Isolamento de lógica complexa para facilitar o teste e reuso.
- **Performance**: Otimização do loop de renderização do Three.js e controle de frequência de detecção do MediaPipe (~30 FPS).
- **Acessibilidade**: Contraste elevado, hierarquia visual clara e feedbacks sonoros/visuais para cada ação.

---

## 🔮 Melhorias Futuras

- [ ] Adicionar suporte a múltiplos temas de cores (Synthwave, Dark-Web, Matrix).
- [ ] Implementar sistema de áudio 3D (Web Audio API) para imersão total.
- [ ] Criar ranking global via Firebase ou Supabase.
- [ ] Calibração dinâmica de sensibilidade de gestos para diferentes condições de iluminação.

---

Autoria: Matheus Siqueira  
Website: [https://www.matheussiqueira.dev/](https://www.matheussiqueira.dev/)
