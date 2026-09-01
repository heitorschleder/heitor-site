# Portfólio + Blog pessoal — design

Data: 2026-09-01
Status: aprovado, pronto para virar plano de implementação

---

## 1. Objetivo

Site pessoal **canônico** do Heitor Schleder: substitui `personal-page` e `retrosite` como endereço
principal. Dois públicos, nessa ordem de prioridade:

1. **Recrutador internacional**, que abre a página, dá dez segundos de atenção e procura evidência.
2. **Leitor de blog**, que chegou por um post e pode virar leitor recorrente.

O site é **100% em inglês**, incluindo descrições de repositório e conteúdo de posts.

Critério de sucesso: um revisor que nunca ouviu falar do Heitor consegue, sem rolar até o fim,
responder *o que ele faz, em que stack, e qual foi o maior resultado que entregou*.

### Não-objetivos

- Não é CMS. Não há autenticação, painel de administração nem banco de dados.
- Não há i18n. Uma língua só, inglês. `lang="en"` fixo.
- Não há comentários, newsletter nem analytics de terceiros nesta fase.
- Não replica os painéis ao vivo do `retrosite` (Spotify, clima, heatmap). Aquele projeto continua
  existindo e vira um dos repositórios listados.

---

## 2. Decisões travadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Direção visual | **Field Console** | Linguagem visual vem do domínio em que ele trabalha — telemetria de frota, laudo de defeito, leitura de placa. É a única direção que não pode ter sido copiada de outro portfólio. |
| Acento | **Signal Blue** — `#5F9CF7` escuro / `#1B4CC9` claro | Verde/teal puxava para "tema de terminal"; azul lê como instrumento sem virar personagem. Duas variantes porque o mesmo hex não passa contraste nos dois fundos. |
| Tipografia | Barlow Condensed (títulos) · Barlow (corpo) · IBM Plex Mono (leituras, datas, código) | Condensada industrial dá o caráter de sinalização; Barlow regular mantém leitura longa confortável; mono ancora número e data. |
| Framework | Next.js 16 + React 19 + TypeScript | App Router, Server Components, build estático. |
| Estilo | Tailwind v4 + shadcn/ui | shadcn como fonte de primitivos com Radix por baixo; tokens próprios em `@theme` por cima, para não sair com cara de template. |
| Ícones | **lucide** na interface + **Tabler** (MIT) para GitHub e LinkedIn, vendorizados | lucide 1.39 não tem mais marcas; simple-icons tem GitHub mas removeu LinkedIn. Tabler usa grid 24×24 com traço 2px e canto arredondado — a mesma convenção do lucide, então os quatro ícones do nav têm o mesmo peso. |
| Arquitetura | Módulos por domínio + camada de UI atômica | Atomic design sozinho organiza por granularidade, não por domínio; com quatro rotas e dois modelos de conteúdo distintos tudo cairia no mesmo balaio. |
| Conteúdo | **Velite + zod** no build | Frontmatter inválido quebra o build, não a produção. Substitui o parser escrito à mão do `retrosite`. |
| Projetos | **API do GitHub no build** + overrides locais | "Todo repositório deve ser exibido" implica lista derivada, não curada. |
| Detalhe de cargo | **Acordeão inline**, não modal | Conteúdo de currículo precisa ser indexável, encontrável com Cmd+F e sobreviver a Print to PDF. Inline ainda permite abrir dois cargos e comparar — que é como se lê uma trilha de promoção. |
| Responsividade | **Mobile first**, breakpoints por `@container` | O componente responde à própria largura, não à da janela. Telefone e coluna estreita viram o mesmo problema, resolvido uma vez. |

---

## 3. Arquitetura

```
src/
  app/                        # rotas, layouts, metadata, sitemap, rss
    layout.tsx
    page.tsx                  # Home
    work/page.tsx
    work/[slug]/page.tsx
    blog/page.tsx
    blog/[slug]/page.tsx
    about/page.tsx
  modules/                    # domínio; cada um exporta só pelo index.ts
    home/
    career/
    repositories/
    writing/
    about/
  ui/                         # design system, sem conhecimento de domínio
    atoms/                    # Chip, Label, Rule, StatusDot, Readout, Tk
    molecules/                # Panel, PanelHeader, FilterStrip, EntryRow
    primitives/               # shadcn/ui gerado (Radix)
    icons/                    # lucide re-export + BrandGithub, BrandLinkedin
  shared/
    cn.ts
    seo.ts
    site.config.ts            # nome, links sociais, domínio
content/
  posts/YYYY-MM-DD-<slug>.mdx
  work/<slug>.mdx
  repos.overrides.ts          # descrições em inglês, revisáveis em diff
```

### Regra de dependência

- Um módulo **nunca** importa do interior de outro módulo. Só `modules/x` → `modules/y` via o
  `index.ts` de `y`, e mesmo isso é exceção que precisa de justificativa.
- `ui/` **não** importa de `modules/`. A seta aponta sempre para dentro.
- `shared/` não importa de nenhum dos dois.
- Um lint rule (`eslint-plugin-boundaries` ou `import/no-restricted-paths`) faz valer isso; a regra
  sem verificação automática apodrece em duas semanas.

Cada módulo responde três perguntas no seu README de uma linha: o que faz, como se usa, de que
depende.

---

## 4. Camada de tema

Um único conjunto de tokens em `@theme`, com o neutro derivado do acento — é isso que impede o
cinza de parecer default:

```css
@theme {
  --color-acc: #5F9CF7;                                    /* dark  */
  --color-bg:      color-mix(in oklab, var(--color-acc) 5%, #121415);
  --color-panel:   color-mix(in oklab, var(--color-acc) 6%, #1A1D1F);
  --color-panel-2: color-mix(in oklab, var(--color-acc) 9%, #232729);
  --color-rule:    color-mix(in oklab, var(--color-acc) 13%, #2B3033);
  --color-ink: #E8EAEC;
  --color-mute: #8C9298;
}
```

O modo claro redefine `--color-acc` para `#1B4CC9` e as bases neutras; as fórmulas de `color-mix`
não se repetem. Trocar o acento reassenta o neutro junto, automaticamente.

**Três estados de tema**, não dois: escolha explícita grava `data-theme` na raiz; o default
"system" não grava nada e depende de `prefers-color-scheme`. Todo token é declarado no `:root` nu
antes de qualquer bloco redefinir. A escolha persiste em `localStorage` e é aplicada por um script
inline no `<head>` — sem isso há flash de tema errado no primeiro paint.

### Responsividade

Mobile first: o estilo base é o de 390px, e `@container (min-width: …)` adiciona. Nada de
`max-width` como caminho principal.

- Nav abaixo de 560px: marca e ícones na primeira linha; as três rotas numa faixa full-bleed
  abaixo, alvo de toque de 44px cada. **Três links não justificam hambúrguer.**
- Cards de repositório: uma coluna abaixo de 440px, `auto-fill minmax(198px, 1fr)` acima.
- Coluna de leitura do artigo: 64 caracteres, centralizada, fora do painel.

---

## 5. Modelo de conteúdo

### 5.1 Velite — posts e case studies

```ts
const post = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s.object({
    title:   s.string().max(110),
    date:    s.isodate(),
    summary: s.string().max(260),
    tags:    s.array(s.string()).min(1),
    draft:   s.boolean().default(false),
    slug:    s.path(),
    content: s.mdx(),
    reading: s.metadata(),
  }),
})
```

`work` segue o mesmo formato acrescido de `company`, `year`, `stack: string[]` e `metrics`.

Regras: arquivo em `YYYY-MM-DD-<slug>.mdx`, slug minúsculo. `pageExtensions` **exclui** `md`/`mdx`,
para que nada em `content/` vire rota por acidente. Draft não entra em build de produção.

Realce de código: Shiki via `rehype-pretty-code`, com um tema derivado do acento — **um matiz mais
a rampa neutra**, sem tema arco-íris, para sobreviver à troca claro/escuro.

### 5.2 Repositórios — GitHub no build

Loader roda no build, não no runtime. Query GraphQL pede **apenas repositórios públicos**; a
exclusão é feita pela query, não por filtro local, e o tipo `Repository` não carrega campo
`isPrivate` — vazamento que não pode ser representado é melhor do que vazamento improvável.

Saída por repositório: `name`, `description`, `language`, `pushedAt`, `url`, `isPinned`.

**Descrições vêm de `content/repos.overrides.ts`**, não do GitHub. Motivo: oito dos vinte e dois
estão vazios ou em português, e o site é em inglês; além disso um arquivo versionado é revisável em
diff e permite escrever mais que uma linha. O GitHub fica intocado. Se um repositório novo aparecer
sem override, o build **avisa** e cai para a descrição do GitHub — não falha, mas não deixa passar
em silêncio.

Ordenação: pinados primeiro, depois `pushedAt` decrescente. Home mostra **dez** com botão de
expandir para os vinte e dois; `/work` mostra todos.

Se a API do GitHub falhar no build, o build **falha**. Um site publicado com zero repositórios é
pior do que um deploy que não saiu.

---

## 6. Rotas e composição

| Rota | Conteúdo |
|---|---|
| `/` | Hero · Career (acordeão, 4 cargos) · Repositories (10 + expandir) · Technologies · Education · Footer |
| `/work` | Case studies curados + grid completo dos 22 repositórios |
| `/work/[slug]` | Case study: contexto, decisões, resultado, stack |
| `/blog` | Índice, filtro por tag, RSS |
| `/blog/[slug]` | Artigo em coluna de 64 caracteres |
| `/about` | Trajetória, formação, contato |

Extras: `sitemap.ts`, `rss.xml`, `opengraph-image` por post.

### Career — conteúdo confirmado

| Período | Duração | Cargo | Empresa |
|---|---|---|---|
| Jun 2025 — | 1 ano 3 meses | Software Developer | PrologApp |
| Dez 2023 – Jun 2025 | 1 ano 7 meses | Tech Lead | Kebook |
| Dez 2022 – Dez 2023 | 1 ano | Frontend Developer Jr | Kebook |
| Nov 2022 – Dez 2022 | 1 mês | Intern | Kebook |

O cabeçalho do painel diz **"Intern to Tech Lead in 13 months"**. É o fato mais forte do currículo e
não pode depender do leitor somar as datas.

Key results por cargo saem de `src/Blocks.md` do repositório `heitor-curriculum` — métrica não se
inventa nem se infla.

### Footer

Links sociais repetidos **com texto ao lado** (`github.com/heitorschleder`, não só o ícone). Ícone
no topo serve quem já sabe o que procura; texto no rodapé serve quem chegou por um post.

---

## 7. Acessibilidade

- Contraste AA em ambos os temas, acento incluído — é por isso que existem duas variantes de azul.
- Acordeão com `<button aria-expanded>`; o painel é irmão, não filho do botão.
- Foco visível em todo elemento interativo. `prefers-reduced-motion` respeitado.
- Alvo de toque mínimo de 44px no mobile.
- Ícone sozinho sempre com `aria-label`. Ícone decorativo com `aria-hidden`.

---

## 8. Testes

Vitest + Testing Library + `jest-axe`, seguindo o que já funciona no `retrosite`.

- **Schema**: frontmatter inválido reprova no build. Teste que garante que reprova.
- **Loader do GitHub**: repositório privado nunca aparece na saída; override ausente emite aviso.
- **Acordeão**: `aria-expanded` acompanha o estado; vários abertos ao mesmo tempo.
- **Tema**: os três estados (explícito claro, explícito escuro, system) resolvem tokens legíveis.
- **a11y**: `jest-axe` sem violação em cada rota.

---

## 9. Pendências (não bloqueiam a implementação)

1. **Domínio.** Não definido. O repositório chama-se `heitor-site` provisoriamente; renomear é barato.
2. **Case studies.** Cinco cargos têm key results, mas nenhum `content/work/*.mdx` foi escrito ainda.
   A primeira fase pode entregar `/work` só com o grid de repositórios e os case studies chegam depois.
3. **Descrições inferidas.** Algumas das 22 descrições em inglês foram deduzidas do conteúdo do
   repositório (`HeiDev`, `drsolarclean`, `ecommerce-cars-test`). Merecem uma revisão antes de virar
   conteúdo publicado.
