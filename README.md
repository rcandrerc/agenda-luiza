# Tarefas da Luiza

App de tarefas do dia da Luiza. Ela, o papai e a mamãe usam o mesmo app, cada um no seu celular, e tudo aparece na hora para os três.

- **Celular da Luiza:** lista do dia separada em Casa e Escola, cada tarefa com um emoji. Ela marca a caixinha quando termina e pode tirar uma foto.
- **Celular dos pais:** quantas tarefas ela já fez, as fotos que mandou e um campo para criar tarefas novas (todo dia ou só hoje).
- **Fotos que somem sozinhas:** cada foto é reduzida no celular antes de enviar (uns 200 a 300 KB) e é apagada 24 horas depois. Dá pra mudar o prazo em `src/familia.js`.

Feito com React + Vite e Firebase (login com a conta Google e banco Firestore). Funciona no plano grátis (Spark): as fotos ficam no próprio Firestore, sem precisar do Storage.

## Como ligar no Firebase

1. No [console do Firebase](https://console.firebase.google.com), crie um projeto novo (ex.: `tarefas-da-luiza`).
2. **Authentication** > Começar > ative o provedor **Google**. Não precisa criar usuários: cada um entra com a própria conta Google.
3. **Firestore Database** > Criar banco de dados (pode ser na região `southamerica-east1`, São Paulo).
4. **Configurações do projeto** > Geral > Seus apps > adicione um app **Web**. Copie os valores mostrados para um arquivo `.env` (use o `.env.example` como modelo).
5. Quem entra primeiro escolhe "Eu sou a Luiza" ou "Eu sou o papai ou a mamãe". São 3 vagas (Luiza e até dois pais) e a escolha é definitiva; depois que as vagas enchem, mais ninguém consegue entrar. Mande o endereço do app só para a família e entrem os três logo.
6. Publique as regras e o app:

   ```bash
   npm install
   npm install -g firebase-tools
   firebase login
   firebase use --add          # escolha o projeto criado no passo 1
   npm run build
   firebase deploy             # publica as regras do Firestore e o site
   ```

   No fim aparece o endereço do app, algo como `https://tarefas-da-luiza.web.app`.

7. Entre com a conta de um dos pais (depois de escolher o papel) e toque em **Criar as tarefas de sempre** para cadastrar as tarefas iniciais.

### Instalar no celular

Abra o endereço do app no celular e:

- **Android (Chrome):** menu ⋮ > *Adicionar à tela inicial*.
- **iPhone (Safari):** botão de compartilhar > *Adicionar à Tela de Início*.

### Limpeza das fotos

O app apaga as fotos vencidas sempre que alguém o abre, então não precisa configurar nada. Se quiser uma garantia extra, no console do Google Cloud dá pra criar uma política de TTL no Firestore para a coleção `fotos` usando o campo `expiraEm`.

## Rodar no computador

```bash
npm install
npm run dev
```

## Onde fica cada coisa

| Arquivo | O que faz |
| --- | --- |
| `src/familia.js` | Tarefas iniciais, prazo das fotos e limite de pais |
| `src/dados.js` | Leitura e gravação no Firestore, compressão e limpeza das fotos |
| `src/TelaLuiza.jsx` | Tela da Luiza |
| `src/TelaPais.jsx` | Tela dos pais |
| `firestore.rules` | Quem pode ler e escrever o quê |
