# Entre Memórias

Site estático, responsivo e personalizável feito com HTML, CSS e JavaScript puro.

## Executar localmente

Não abra `index.html` diretamente pelo gerenciador de arquivos, porque o navegador pode bloquear a leitura do JSON. Inicie um servidor HTTP na pasta do projeto:

```bash
python -m http.server 8000
```

Depois acesse http://localhost:8000.

## Adicionar fotografias

1. Copie as imagens para `assets/images/`.
2. Abra o site e clique em **editar conteúdo** no rodapé.
3. Entre na aba **Galeria** ou **Memórias**.
4. Informe o caminho relativo, por exemplo `assets/images/foto-01.jpg`.
5. Clique em **Adicionar fotografia** ou **Adicionar memória**.
6. Clique em **Exportar conteúdo JSON**.
7. Substitua `data/content.json` pelo arquivo exportado.

## Adicionar áudios

1. Copie gravações autorizadas para `assets/audio/`.
2. Abra **editar conteúdo** > **Áudios**.
3. Informe título, descrição e caminho, por exemplo `assets/audio/risada.mp3`.
4. Adicione e exporte o JSON.

## Editar abertura e carta

Em **editar conteúdo** > **Carta e início**, altere o título, a frase de abertura, a mensagem final, assinatura e, opcionalmente, o caminho da música ambiente. A música só começa após o visitante tocar no botão de áudio.

## Como as alterações são salvas

O painel é um editor local: as alterações ficam na memória da página enquanto ela está aberta. Para manter o conteúdo, exporte o JSON. Coloque também os arquivos de mídia nas pastas indicadas. Para publicar, envie `data/content.json` atualizado e os arquivos de mídia junto com o restante do projeto.

O painel não envia arquivos para um servidor e não sincroniza automaticamente entre dispositivos. Não use dados sensíveis ou conteúdo íntimo. Use apenas imagens e gravações que seja adequado compartilhar.

## Publicação

O projeto pode ser hospedado em GitHub Pages ou Netlify. Como é uma hospedagem estática, os arquivos publicados podem ficar acessíveis a qualquer pessoa com acesso ao site. Um link difícil de adivinhar não é proteção por senha.

## Personalização

Os dados ficam em `data/content.json`. O site funciona mesmo sem memórias, imagens ou áudios cadastrados; nesse caso, apresenta espaços vazios explicativos.
