---
title: React-PDF A melhor lib para criar PDF
description: Todos os macetes do React-PDF
publishedDate: 2025-09-24
tags:
  - lib
---

É muito comum nas aplicações de backoffice a funcionalidade de gerar relatórios. Como eu prestei serviço para uma empresa que vendia relatórios, eles deveriam ser Pixel Perfect, com paginação, sem erros de renderização, quebra de páginas sem perda de conteúdo. Eu aprendi várias dicas de como utilizar essa biblioteca para extrair o máximo possível.

## O básico

React-PDF não é uma biblioteca exclusiva do react para gerar pdfs com React, ela gera PDF com o JSX. Ou seja, você consegue também gerar PDF no nodejs com o mesmo código, sem maiores problemas. O [quick start](https://react-pdf.org/) é muito bom, e bem simples. 
Você pode definir os estilos em um arquivo separado com o `StyleSheet.create` e depois importar nos demais arquivos para reaproveitar código. Também é possível componentizar da mesma forma como um projeto React.
O diferencial dessa biblioteca é você escolher como será a renderização, via stream, file ou diretamente em um componente de Viewer no front.

## Componentes

A lista de componentes é bem enxuta:

- Document: É componente pai de todos os pdf
- Page: Representa uma página de um pdf (na prática um componente de page pode representar até n pagínas, vou explicar no capítulo de paginação)
- View: semelhante a uma `<div>` no HTML, para agrupar itens e aplicar estilos
- Text: Exibir texto
- Image: Imagem

Com apenas esses 5 componentes você já consegue fazer boa parte dos PDFs. Na doc oficial tem os parâmetros de cada um, mas eles se assemelham muito com os styles do React. Vale lembrar que não são todas os estilos que são aceitos, vale olhar a [documentação dos estilos](https://react-pdf.org/styling) para verificar a compatibilidade. Um ponto legal é que você consegue usar media query, tem poucas aplicações, mas pode ser útil.

Resumindo, você usará o componente View em conjunto com FlexBox para posicionar os elementos. Text para exibir os textos dentro das views e Image para as imagens. Sem muito segredo até agora.

## Os segredinhos

### Breakable vs. unbreakable components

Ao mudar de uma página para outras você pode querer que determinado conteúdo permaneça junto, como por exemplo uma tabela, para facilitar o usuário ver todas as informações.
Anteriormente eu disse que um componente `Page` representa uma única página da aplicação, porém se você colocar muito texto dentro desse componente, é provável que precise de mais de uma página para exibi-lo. Para alcançar esse resultado, podemos marcar o nosso componente com a flag `wrap`.

```jsx title=react-pdf.jsx
import { Document, Page, View } from '@react-pdf/renderer'

const doc = () => (
  <Document>
    <Page wrap>
      <Text>
      // Muito muito muito texto
      </Text>
    </Page>
  </Document>
);
```

Assim teremos a quantidade de páginas exatas para exibir todo o conteúdo.

Outro problema comum é agrupar os parágrafos, podemos querer que ao passar de uma página para outra os parágrafos se mantenham juntos.

```jsx title=react-pdf.jsx
import { Document, Page, View } from '@react-pdf/renderer'

const doc = () => (
  <Document>
    <Page wrap>
      <Text wrap={false}>
      // Primeiro parágrafo
      </Text>
      <Text wrap={false}>
      // Segundo parágrafo
      </Text>
      <Text wrap={false}>
      // Terceiro parágrafo
      </Text>
      <Text wrap={false}>
      // Quarto parágrafo
      </Text>
    </Page>
  </Document>
);
```
Sem utilizar o `wrap={false}`
![Sem utilizar wrap false](@/assets/react-pdf/example1.png)

Utilizando o  `wrap={false}`
![Utilizando wrap=true exemplo1](@/assets/react-pdf/example2.png)
![Utilizando wrap=true exemplo2](@/assets/react-pdf/example3.png)

O wrap com o valor `false` bloqueia que esse componente seja quebrado ao mudar de página, ou seja. Se ao exibir o quarto parágrafo não seja possível caber em apenas uma única página, ele não irá dividir o texto ao meio, e sim mover todo o componente Text para a próxima página.

- Breakable components (wrap={true}): aqueles que o wrap por padrão é true (View e Text), que tentará ocupar o espaço toda da página. 
- Unbreakable components (wrap={false}): aqueles que são indivisíveis, se não tiver espaço na página eles serão renderizados na página seguinte.

### Fixed Components

Para exibir os componentes em todas as páginas. Perfeito para cabeçalhos e rodapés. Normalmente eu uso com o position absolute para posicionar exatamente onde eu quero na página, e para não deixar o conteúdo ficar por cima desse componente eu aumento a margin da página do tamanho de altura do Fixed Component, assim ele o conteúdo não irá sobrepor.

```jsx title=react-pdf.jsx
import { Document, Page, Text } from '@react-pdf/renderer'

const doc = () => (
  <Document>
                // O padrão seria 30, coloquei 65 para o conteúdo não ficar em cima do rodapé
    <Page style={{paddingBottom: '65px' }} wrap>
      <Text
        fixed
        style={{
            position: 'absolute',
            fontSize: '8px',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
        }}
        render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
        }
       />
    </Page>
  </Document>
);
```

### Quebra de palavras

O ReactPDF tem o conceito de Hyphenation, na qual você consegue controlar como será a quebra de palavras no texto, em geral eu recomendo desabilitar esse recurso para evitar problemas. A função responsável por isso recebe a palavra em questão e retorna com array com as possibilidades de ser divididas, caso não queria dividir, só retornar um array com a palavra.

```jsx
import { Font } from '@react-pdf/renderer'

const hyphenationCallback = (word) => {
 return [word]
}

Font.registerHyphenationCallback(hyphenationCallback);
```

Dessa forma, ele não irá quebrar cada palavra. Contudo, você poderá ter um problema caso o tamanho da View seja maior do que o tamanho da palavra (exemplo na imagem abaixo), esse caso terá um overlap. 
Nesses casos específicos você pode aplicar uma condição específica para quebrar essas palavras se for o caso.

![Hyphenation](@/assets/react-pdf/example4.png)

### Tabelas

Criação de tabelas é a parte mais dolorosa de utilizar essa lib, porque não tem um componente específico para isso. Cabe a você criar seu próprio componente. Inicialmente pode parecer algo simples, até você se preocupar com a parte de bordas e paginação.
Eu recomendo você dar uma olhada na implementação das bibliotecas já existentes como: [@ag-media/react-pdf-table](https://github.com/ag-media/react-pdf-table#README).

A parte que você tem que se atentar é com as bordas, porque elas são condicionais. Por exemplo, vamos supor que a primeira linha tenha sempre a borda de cima. Quando for desenhar a última linha da tabela. Ela deverá ter a borda superior e inferior.

O tamanho das colunas também é importante que sejam flexíveis, uma sugestão é trabalhar com porcentagem, a linha total ocupa 100%, você define cada coluna ocupando X%, assim você consegue ter flexibilidade e customização.

Outro ponto chato é quando as tabelas ocupam mais de uma página, eu sugiro sempre que você saber que uma tabela caiba em uma página utilizar o `wrap={false}`, porque além de facilitar a leitura, ele também evita problemas de renderização.

Contudo é comum acontecer o seguinte:
![react pdf table](@/assets/react-pdf/example5.png)

Como as margens são condicionais pode ter esse problema. Para contornar isso eu fiz o seguinte: obrigava a tabela sempre começar em uma página nova com o atributo `break`. Definia um tamanho fixo para cada linha e calculava a quantidade máxima de linhas que seria possível colocar. Após isso dividia manualmente a tabela e começava na próxima página as linhas restantes.

Possivelmente tem outra solução para o problema, porém não encontrei e dessa forma funcionou.

### Storybook

Como o React-PDF também gera um componente React. É possível utilizar o storybook para documentar seu pdf. Dessa forma, melhora bastante a documentação do seu código e facilita a manutenção futuramente. 

A minha sugestão é dar uma olhada no [reposítório da woovi](https://github.com/woovibr/pix-pdf/tree/main). Na qual é implementado um storybook e uma arquitetura modular para criação de múltiplos PDFs.