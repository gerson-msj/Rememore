CMP-007 — Seletor de Tom

Especificação consolidada para a Stack2 (.NET 10 / Blazor WebAssembly)  
Data: 20/10/2026 · Destino: Meu Drive/Projetos/Rememore/05 - Especificação  
Status: unidade aprovada para encaminhamento ao programador; implementação e checkpoints ainda não iniciados.

1. Propósito e decisão de reconstrução

Reconstruir CMP-007 — Seletor de Tom e materializar, na mesma unidade, a fundação cromática reutilizável do Tom que os demais componentes Blazor irão consumir. A unidade termina exclusivamente no /lab; não inclui integração das páginas, conversão integral do CMP-030, persistência real ou backend. O componente deve ser observável em tema claro, escuro e Sistema, operável por ponteiro, toque e teclado, e deve produzir continuamente um valor visual, além de comunicar a conclusão do gesto. A infraestrutura cromática deve calcular a aparência de qualquer Tom recebido sem conhecer memória, categoria, panorama, navegação ou armazenamento.

Esta é uma síntese operacional das decisões finais da Stack1, não um roteiro para redescobri-las. O programador deve usar este corpo como fonte suficiente de regras, aparência, estados, casos-limite e aceites. Consulta ao TSX/CSS e aos testes antigos é permitida quando ajudar na transcrição técnica; a leitura integral das specs históricas é complementar, não pré-requisito. Não introduzir discussão sobre regras que já estão fechadas nem copiar literalmente Preact ou o laboratório antigo.

2. Recorte, fronteiras e autoridade das fontes

• Incluído: seletor reutilizável; apresentação de ativação/ausência; escala e revelação cromática; comportamento de gesto/teclado/foco; resposta temporal configurável; aparência compartilhada de Tom; configuração temática padrão; calibração cromática isolada do laboratório; curva cromática 20/50 e seu experimento; exemplos e testes automatizados matemáticos; documentação e memória técnica.
• Excluído: IndexedDB, leitura/gravação de captura, regra de evolução de usuário, telas de Categorizar/Memorar/Revisar/Rememorar, popup de exclusão real, alteração funcional do CMP-030, substituição de _old, integração com CMP-006/CMP-008/CMP-009/CMP-011/CMP-012, backend, sincronização remota, alteração de dados persistidos.
• Coexistência: CMP-030 — Memória já tem modo Memorar aprovado na Stack2; ele não deve ser remodelado nesta unidade para colorir. O laboratório utilizará uma amostra demonstrativa fiel à linguagem final de components/Memoria.tsx da Stack1, consumindo o mesmo mecanismo visual compartilhado que os futuros componentes usarão. Não duplicar a fórmula cromática nessa amostra.
• Precedência: decisões posteriores validadas e código final da Stack1 substituem rascunhos intermediários. A configuração final é colorização ampla, sem faixa lateral ativa, curva global 20/50 e resposta padrão do seletor 1.000 ms/ease-out, ambos aprovados após revisões de 05.19. O valor transitório de 500 ms não é o padrão final.
• Identificações históricas: o CMP-008 — Memória citado nas specs da Stack1 corresponde agora ao CMP-030 — Memória; CMP-008 — Janela Temporal é outra peça. O experimento de curva do Tom não possui CMP próprio.

3. Rastreabilidade das regras e materialização antiga

Specs Stack1 de aplicação direta ao seletor: 05.08 — Componente de Memória (vocabulário visual, experimentos e reutilização), 05.11 — Tom e Balanço Sentimental (controle efetivo, ativação, movimento, contratos) e 05.19 — Finalização do Panorama (correções e decisões finais da animação, captura e resposta). Complementares somente para a infraestrutura compartilhada: 05.18 — Laboratório de Refinamento do Panorama (curva cromática experimental), 05.22 — Variação do Tom da Categoria (consumo posterior da mesma progressão e dos temas). As próprias unidades contêm seções de origem funcional e Pareceres; consultar 04.08 — Componentes — Capturar e 04.11 — Componentes — Rememorar somente quando um vínculo complementar exigir rastreamento.

Fontes de código em `Stack1/` na branch `main`:

• components/SeletorTom.tsx + assets/seletor-tom.css — geometria, gradação revelada, switch de apoio, acessibilidade, ponteiro/teclado e animação.
• components/ExperimentoMemoria.tsx + assets/laboratorio-memoria.css — controles do laboratório, combinações cromáticas, texto/categoria e sete estratégias visuais antigas; só uma estratégia final será reproduzida.
• components/Memoria.tsx + assets/memoria.css + components/MemoriaLaboratorio.tsx — referência de acabamento aprovado da memória real; não portar todas as variantes nem integrá-las agora.
• app/utilitarios/aparenciaTom.ts + assets/tom.css — função e tokens cromáticos compartilhados; referência principal de arquitetura para Blazor.
• app/utilitarios/curvaTom.ts, app/utilitarios/curvaTom_test.ts e app/utilitarios/aparenciaTom_test.ts — curva visual, parâmetros e invariantes verificáveis.
• app/utilitarios/respostaSeletor.ts e testes relacionados — comportamento temporal, interpolação e padrão final.
• islands/ExperimentoCurvaTom.tsx — comparação linear × experimental; adaptar demonstrações sem exigir a construção antecipada de outros CMPs.

Stack2 atual — pontos de integração apenas arquitetural: src/Rememore.Client/Infraestrutura/EstadoTema.cs, PaletaTema.cs, Pages/Lab.razor, Componentes/Lab/BlocoLab.razor, wwwroot/css/app.css, wwwroot/css/components.css e Componentes/Memoria.razor(.css). Conferir a versão real do worktree develop antes de editar, pois o inventário remoto pode estar defasado em relação ao trabalho local. Respeitar a estrutura de /lab, os componentes compartilhados existentes, Bulma e o esquema de temas.

4. Contrato semântico do Tom

O Tom é um inteiro funcional de −100 a +100, passo 1, com ausência representada separadamente (null, e não 0). Negativo e positivo representam duas famílias de cor; 0 representa um Tom informado e neutro. Nunca converter ausência em zero durante cálculos, armazenamento ou apresentação. Fora do domínio, a infraestrutura deve limitar/validar entradas para evitar CSS inválido; isso não autoriza mudar valores de negócio persistidos. A transformação cromática não modifica o número funcional recebido ou publicado.

O componente é controlado pelo chamador: recebe o valor/ausência, estado de disponibilidade quando necessário e parâmetros opcionais de resposta; comunica mudança contínua do valor atual e o término lógico da interação, sem gravar diretamente dados e sem conhecer a memória à qual pertence. A composição de switch e faixa pode ser feita por um componente de apresentação contendo uma escala acessível interna, desde que o contrato público seja claro, reutilizável e não multiplique fontes de verdade. Sugestão conceitual, não assinatura C# obrigatória: Valor (int?), Desabilitado, Resposta (atrasoMs e curva), AoAlterar e AoConcluir, com evento distinto de solicitação de desativação quando houver efeito persistente. Identificadores HTML e rótulos devem ser únicos quando existirem várias instâncias.

Ativação e desativação

O controle binário chama-se “Registrar Tom” e apresenta semântica de switch acessível (não checkbox visual simples). Quando desligado: estado null, escala visível porém inativa/neutra, alça visual centralizada, geometria preservada. Ao ativar, começa em 0 se ainda não havia Tom; já é informação válida e neutra. Desativar um Tom existente — inclusive 0 — solicita remoção; na futura página persistente o chamador deverá obter confirmação via CMP-028 com título “Desativar o Tom?”, mensagem “O Tom selecionado será apagado. Deseja continuar?”, ações Desativar / Cancelar. Cancelamento preserva estado e valor. A remoção só se torna confirmada depois do commit bem-sucedido; reativar após exclusão começa em 0. Nesta unidade laboratorial, o switch é simulado, sem banco; não acoplar CMP-007 ao popup ou a IndexedDB. A demonstração deve comunicar honestamente quando o estado é apenas de teste.

A disponibilidade do Tom por níveis de experiência pertence à página chamadora, não ao CMP-007. O balanço sentimental não ativa nem recebe Tom. Catálogos de categorias e popups de pesquisa permanecem neutros; no futuro, superfícies de uma mesma memória poderão consumir a aparência compartilhada sem colorir automaticamente todos os filhos indiscriminadamente.

5. Linguagem visual definitiva compartilhada

5.1 Extremos cromáticos por tema

Os extremos aprovados do produto são Terracota (negativo) e Petróleo (positivo):

• Claro: negativo #B45F4D; positivo #237F88.
• Escuro: negativo #E99E89; positivo #79CBD1.
• Sistema: usar o tema efetivo já resolvido pela infraestrutura da Stack2; reagir à mudança do sistema sem forçar tema próprio.

Esses quatro valores pertencem à configuração canônica do produto e devem ser aplicados em componentes normais mesmo quando um experimentador alterar cores no laboratório. Os extremos do Tom são complementares às cores já definidas para o sistema: não substituir indiscriminadamente PaletaTema, não sobrescrever globalmente cores-base do Bulma, não persistir escolhas experimentais como nova paleta oficial. Um ajuste local de laboratório deve fazer sombra de tokens somente dentro da(s) amostra(s) experimental(is).

5.2 Curva global de intensidade aprovada — 20/50

Aplicar aos consumidores da aparência superficial a transformação contínua, simétrica, de dois segmentos lineares. Seja m = min(100, max(0, |tom|)) e L = 20, I = 50. A intensidade visual percentual é:

• 0 ≤ m ≤ L: V = m/L × I;
• L < m ≤ 100: V = I + ((m−L)/(100−L)) × (100−I).

O sinal do Tom escolhe a família de cor e é preservado na transformação. null → null, 0 → 0, ±20 → ±50, ±100 → ±100; por exemplo, +37 → +60,625, −37 → −60,625. Não aproximar valores de negócio nem introduzir discretizações de cor. No experimento de curva, expor L inteiro de 1 a 99 e I inteiro de 0 a 100; fora do laboratório, os parâmetros oficiais são fixos 20 e 50. A comparação linear existe apenas para análise visual, não para substituir globalmente a curva aprovada.

Distinção técnica que precisa ser preservada: na Stack1, o preenchimento/revelação da trilha interativa de SeletorTom.tsx usa a posição geométrica e a intensidade local calculadas a partir de |Tom| (escala da trilha); a aparência de superfícies via aparenciaTom.ts utiliza a curva global 20/50. Não confundir a função de coloração da superfície com a geometria e o gradiente de progresso da escala. A futura Variação do Tom bilateral utiliza a curva compartilhada ao produzir suas extensões; por isso as primitivas de cores e progressão devem ser reutilizáveis, sem forçar todos os consumidores a terem um seletor.

5.3 Tokens e regiões de aplicação

Materializar um mecanismo independente dos CMPs: função/serviço puro C# para transformação e composição de aparência, mais CSS compartilhado de Tom com tokens semânticos. O consumidor informa Tom (int?) e recebe classe/variáveis/estilo apropriados, sem precisar recalcular as cores na página. A função não lê DOM, banco nem estado de autenticação; cores efetivas derivam dos tokens temáticos do CSS. Reaproveitar a relação já existente entre --cor-* e Bulma onde aplicável.

A configuração final de app/utilitarios/aparenciaTom.ts é categoria = ativa; borda = ativa; sombra = ativa; fundo = ativo; faixa = desativada; setas = ativas. Isso substitui as alternativas de experimento da 05.08. Para Tom informado, reproduzir os resultados aprovados de assets/tom.css:

• --tom-cor: mistura OKLab entre extremo da polaridade (peso da curva visual) e texto fraco do tema;
• --tom-fundo: mistura de 13% da cor de Tom com o fundo-base do tema;
• --tom-borda: mistura de 70% da cor com a borda normal;
• --tom-sombra: mistura sRGB de 32% da cor com transparente;
• --tom-categoria: mistura OKLab de 72% da cor com texto forte;
• --tom-seta, --tom-seta-realce, --tom-seta-inativa: misturas de 72%, 55% e 35%, respectivamente, com os tokens de texto correspondentes;
• --tom-texto: texto normal do tema; --tom-faixa: transparente na configuração final.

Quando Tom é null, a superfície usa os tokens neutros do tema: fundo-base, borda, texto, categoria, sombra padrão (texto com 12% de transparência), setas neutras e faixa transparente, sem classes ou pesos de Tom informado. Tom 0 continua conceitual e semanticamente informado, mesmo quando sua aparência cromática é suave. O desenho final não depende de uma faixa lateral ativa para registrar essa diferença; o laboratório também exibe texto de estado para comparação inequívoca. Não reintroduzir faixa obrigatória de uma versão histórica anterior sem orientação do operador.

A amostra compacta de memória utiliza moldura única, categoria integrada à borda superior quando fornecida, borda/sombra/fundo de Tom e texto de leitura normal. O gradiente da prévia termina em `--tom-fundo` efetivo, nunca em fundo fixo; hover e foco não podem neutralizar os tokens cromáticos nem reduzir legibilidade. A cor de categoria e o texto precisam permanecer legíveis no claro/escuro. Não converter a apresentação de Tom em sete variantes de classe para o produto. Consumidores futuros (Memória, Categoria do Panorama, Janela Temporal, Onda e Variação) poderão aplicar apenas os tokens adequados à sua geometria, sem herdar CSS acoplado a .memoria.

5.4 Isolamento e responsabilidade técnica no Blazor

Separar (a) tokens e operações compartilhadas de Tom, (b) CSS específico do controle SeletorTom.razor.css e (c) CSS da demonstração. Um arquivo global pequeno de tokens/estilos comuns de Tom é legítimo; não colocar toda a estilização num app.css monolítico, nem criar CSS isolado duplicado em cada consumidor. Os estilos Bulma e a infraestrutura de tema continuam autoridades para fonte, espaços, foco e controles nativos, salvo exceção visual justificada. Quando houver interop para animação/ponteiro, manter código JS restrito à mecânica visual e liberar recursos no descarte do componente. O cálculo puro da curva e aparência deve ser testável sem navegador.

6. Aparência e comportamento do Seletor de Tom

6.1 Geometria e escala

Uma trilha horizontal contínua de −100 a +100, neutra em toda sua extensão, com 0 no centro. A alça inicia ou fica em 50% quando Tom 0/ausente. Uma marca discreta indica o centro. O trecho ativo não preenche do início da trilha até a alça como um range convencional: revela exclusivamente do centro até a posição corrente, para a esquerda em Tom negativo e para a direita em Tom positivo. A área não percorrida permanece neutra. Toda a progressão cromática entre 0 e o valor final é mostrada no trecho revelado, não uma única cor chapada nem o caminho efetivamente percorrido pelo mouse; clicar diretamente em +60 deve resultar exatamente no mesmo degradê que arrastar de 0 até +60.

Referência concreta de Stack1: caixa do controle de cerca de 2,9 rem; trilha de 0,45 rem, com margens laterais de cerca de 0,575 rem; alça visual circular de 1,15 rem; marca central de 0,85 rem; textos discretos de 0,8 rem abaixo da trilha. Valores são referências para reproduzir a percepção e podem receber adaptação pontual validada à geometria do Blazor, sem reinventar o desenho. O switch tem referência de 2,7 × 1,5 rem, foco visível e pequeno deslocamento do botão. Bulma nativo deve ser a primeira opção para controles acessórios, e CSS autoral limitado às necessidades que Bulma não cobre.

Os rótulos visíveis ao usuário são “Negativo”, “Neutro”, “Positivo”. Não exibir −100, 0, +100 como notas da interface de produto. Valores podem aparecer na instrumentação do laboratório para teste. Enquanto desativado, a trilha permanece com geometria estável, neutra e sem interação funcional. A escala e a superfície de amostra devem acompanhar o valor visual efetivo, não saltar diretamente para o alvo quando houver atraso de animação.

6.2 Ponteiro, toque e captura

Clique em qualquer ponto útil do trilho deve posicionar o alvo; arraste horizontal altera o alvo mesmo que o ponteiro saia um pouco para cima/baixo do controle; manter captura estável do ponteiro pela raiz/superfície adequada até soltar/cancelar. Não exigir movimento adicional do mouse para completar animação retardada. Mapear a posição horizontal em valor inteiro: round(clamp((clientX−esquerda)/largura, 0, 1) × 200 − 100); áreas não interativas de referência textual não devem alterar o Tom. Ao soltar, liberar captura com segurança e sinalizar conclusão após convergência da animação pendente, se houver. Cancelamento/perda de captura não deve deixar gesto indefinidamente aberto. Evitar comportamento de range nativo que reposicione o controle no meio da animação ou exiba borda de foco na largura inteira: a Stack1 separou a superfície de gesto do input type=range acessível.

6.3 Teclado e acessibilidade

Preservar uma superfície nativa input type=range ou semântica equivalente completa: min=-100, max=100, step=1, aria-valuenow com valor inteiro corrente e aria-valuetext com direção compreensível (Negativo / Neutro / Positivo; Sem Tom quando desligado); label acessível “Tom: Negativo, Neutro ou Positivo”. Teclado com setas, Home/End, PageUp/PageDown quando aplicável; foco visível concentrado na alça, não em grande retângulo ao redor da faixa. Informar alteração contínua durante o gesto e emitir conclusão em keyup das teclas relevantes e/ou blur, sem depender só de ponteiros; não duplicar conclusões que não representem mudança efetiva. Hover não é o único indicador de interatividade. Observar contraste, toque e movimento reduzido, com semântica válida sem controles interativos aninhados.

6.4 Resposta temporal final

Padrão definitivo de Stack1: `atrasoMs = 1000`, curva `ease-out` para CMP-007. Configuração opcional permite no laboratório atrasos 0–1200 ms em passos de 50 ms e quatro curvas: linear, ease-in, ease-out, ease-in-out (rótulos: Linear; Acelera ao longo do movimento; Desacelera ao se aproximar; Acelera e depois desacelera). 0 e prefers-reduced-motion: reduce movem imediatamente. O laboratório do Tom mantém estes controles independentes dos controles da Janela Temporal CMP-008.

A curva ease-out aprovada é aproximação exponencial até o alvo, não transição CSS reiniciada a cada render: em cada avanço, considerando dt em segundos e T=atrasoMs/1000, aplicar fração p=1−exp(−6,9×dt/T) ao deslocamento restante. A Stack1 considera convergência quando a distância normalizada é menor que 0,001; limita dt a no máximo 64 ms por quadro; continua agendando quadros até convergir, mesmo com ponteiro parado. As curvas alternativas usam avanço controlado com velocidade/aceleração no utilitário antigo, podendo ser traduzidas com fidelidade matemática sem replicar sua organização de refs. A posição e o valor acessível acompanham a posição real animada, publicada como inteiro arredondado sem repetir emissões idênticas.

Evitar a corrida observada na Stack1 entre valor publicado para o pai e valor controlado devolvido em render: a confirmação de um valor transitório já emitido não reinicia nem interrompe a animação; uma alteração externa realmente nova deve refletir-se prontamente. Em Blazor, dimensionar C#/JS interop e renderização de modo que o loop de animação não produza atualizações excessivas ou estado atrasado. O programador escolhe a fronteira JS/C# conforme evidência de desempenho e guarda a mecânica em módulo delimitado, sem duplicar lógica cromática de negócio no JavaScript.

6.5 Fluxo de edição futura sem persistência nesta unidade

Distinguir valor em movimento, valor efetivo final da interação e valor persistido confirmado pela página futura. Mudanças contínuas podem atualizar visualmente superfícies externas; não persistir a cada passo do ponteiro ou quadro. O evento de conclusão publica o valor final após o gesto/animação, permitindo à página futura realizar um único commit local. Em caso de erro remoto/local, caberá ao chamador reconciliar o valor protegido e apresentar falha sem declarar salvamento. Neste /lab, capturar e mostrar os eventos em diagnóstico simples, mas não simular como se existisse armazenamento real.

7. Experimento obrigatório no novo /lab

Criar um bloco próprio CMP-007 — Seletor de Tom na infraestrutura atual de BlocoLab, sem fundir componentes existentes nem modificar a rota antiga /laboratorio. A estrutura deve usar controls Bulma/HTML simples e apresentar a escala, os controles e uma única amostra da colorização ampla aprovada. A amostra pode ser uma peça demonstrativa específica, mas deve consumir AparenciaTom/tokens globais exatamente como um componente real faria, para não duplicar algoritmo e não mascarar falhas de integração. Não construir os outros seis modelos de colorização nem um seletor para alternar modelos.

7.1 Controles preservados da experimentação antiga

• Switch Registrar Tom; estado inicial representativo +65 com Tom informado; quando desativado, Sem Tom e alça central neutra; quando reativado a partir da ausência, valor 0. Exibir estado legível: negativo, neutro, positivo ou Sem Tom.
• CMP-007 interativo, com controles Atraso da escala e Curva da escala independentes, com valores e quatro opções acima. Botões de cenário: Extremo negativo (−100), Negativo moderado (−55), Negativo próximo do centro (−2), Neutro (0), Positivo próximo do centro (+2), Positivo moderado (+55), Extremo positivo (+100). Permitir demonstrar toque, mouse, teclado, reativação/desativação e divergência entre alvo/posição animada.
• Textarea para texto da memória e campo para categoria (vazio omite legenda), ambos atualizando a amostra ao vivo; usar texto longo inicial representativo para observar gradiente e contrastes; aceitar acentuação, múltiplos parágrafos e palavras longas.
• Calibração dos extremos negativo e positivo do tema claro e do escuro, por controles HTML de cor, exibindo o código hexadecimal; escolher o tema que se está editando (pode seguir o tema efetivo atual ou oferecer escolha explícita coerente com EstadoTema). O switch global Sistema/Claro/Escuro e a alteração do tema efetivo devem refletir-se na amostra sem perder os quatro rascunhos.
• Combinações sugeridas históricas e ajustes manuais preservados: trocar a sugestão afeta somente o par do tema editado; selecionar manualmente uma cor torna a combinação “Personalizada” quando não coincidir com preset. Ver tabela de presets abaixo.
• Comparação da curva cromática: experimento compacto com Tom de teste, limiar (1–99), intensidade no limiar (0–100), visualização Linear × Experimental, sequência de Tons de referência (+100, +80, +60, +40, +20, +10, 0, −10, −20, −40, −60, −80, −100) e amostra separada Sem Tom. Pode usar superfícies demonstrativas leves baseadas nos tokens comuns, sem exigir CMP-009 antes de sua reconstrução. Uma mudança dos parâmetros experimentais afeta apenas as amostras da comparação e a amostra de teste associada, não os componentes normais da página nem o padrão 20/50 usado pelo produto.
• Um diagnóstico discreto dos últimos AoAlterar/AoConcluir e valores efetivo/alvo quando útil ao teste, sem transformar diagnósticos técnicos em interface do produto.

7.2 O que fica expressamente simplificado

Excluir: controle “Largura máxima da amostra”, os sete modelos alternativos de colorização, e seu seletor/lista/comparação. Haverá uma única amostra de memória de referência, com a colorização ampla final do bloco antigo “Componente de memória — componente real”. A largura da amostra será naturalmente responsiva ao contêiner. Não confundir os sete modelos de colorização excluídos com as sete combinações cromáticas sugeridas: estas últimas permanecem para a calibração, conforme solicitação de conservar os demais recursos do experimento.

7.3 Combinações cromáticas de experimentação (não oficiais)

Combinação   ·   Claro negativo   ·   Claro positivo   ·   Escuro negativo   ·   Escuro positivo

Escolha inicial   ·   #007BFF   ·   #00FFAA   ·   #CC0000   ·   #FFEA00
Ameixa e jade   ·   #945078   ·   #25836F   ·   #D99AC3   ·   #79D5B7
Ardósia e mel   ·   #586D94   ·   #B17B22   ·   #99B1DF   ·   #EBC779
Terracota e petróleo (padrão)   ·   #B45F4D   ·   #237F88   ·   #E99E89   ·   #79CBD1
Índigo e damasco   ·   #6B5CA5   ·   #C27A3D   ·   #B4A1EB   ·   #F1BF8F
Rosa antigo e oliva   ·   #A45F77   ·   #75833C   ·   #DFA3B8   ·   #BECE87
Orquídea e turquesa   ·   #AD469C   ·   #008B88   ·   #E48AD3   ·   #5EDBCB

Os rascunhos do laboratório podem permanecer em memória de sessão ou em armazenamento exclusivo da demonstração, reutilizando a política existente para rascunhos do tema, se compatível. Isso não altera os quatro extremos oficiais de Tom, a aparência de outros blocos, rotas ou componentes. Oferecer mecanismo discreto de restaurar padrão do laboratório, se necessário para não deixar a amostra em estado experimental confuso; não estabelecer nova necessidade funcional de produto.

7.4 Isolamento demonstrável das cores experimentais

A alteração de negativo/positivo ou de limiar/intensidade no laboratório deve colorir imediatamente a única amostra controlada e as amostras exploratórias vinculadas, mas não recalibrar o CMP-030 existente, os demais blocos, cabeçalho, páginas ou os tokens globais. Alternar tema claro/escuro/Sistema recalcula a aparência dos componentes reais sempre pelos quatro extremos fixos e oficiais e da amostra pelas cores experimentais do tema correspondente. Esse isolamento será caso obrigatório de aceitação e teste: variar as cores laboratoriais e inspecionar visualmente um item normal da página sem alteração indevida.

8. Etapas obrigatórias de execução e aprovação

Checkpoint 1 — Estrutura HTML/Bulma

Criar a entrada própria no /lab, estrutura de switch e range acessível, grupos de controles, única caixa-amostra, diagnóstico e área de experimento cromático, ainda sem animação/transformação funcional completas. Usar componentes HTML e classes Bulma existentes; preservar a página. Verificar estrutura, semântica, ordem de foco, geometria e responsividade inicial; sem CSS autoral ornamental antecipado. Parar para inspeção/aceite do operador.

Checkpoint 2 — Aparência e fundação de estilos

Materializar tokens cromáticos oficiais e mecanismo compartilhado C#/CSS, colorização ampla escolhida, escala neutra/revelada e alça, switch, estados nulo/zero/negativo/positivo, temas e gradiente que termina no fundo efetivo. Ajustar aparência e responsividade no Blazor; corrigir a causa de inconsistências em vez de acumular overrides. Inspecionar higiene de HTML/CSS e integração com Bulma após os refinamentos: nenhum CSS morto, duplicado ou espalhado nas páginas, seletores excessivamente específicos ou alteração indevida do foco nativo. Esta revisão pertence ao próprio checkpoint 2. Parar para aceite visual e de limpeza técnica do operador. Não iniciar a mecânica funcional antes do aceite.

Checkpoint 3 — Funcionalidade completa

Ligar interações, cálculo 20/50, gradiente do eixo, controles laboratoriais, presets e ajustes manuais, quatro curvas de animação, teclado/foco, ponteiro/toque com captura, emissão distinta de mudança/conclusão, movimento reduzido, alteração de tema e isolamento das cores. Exercitar casos definidos no item 9; executar testes automatizados determinísticos, build e verificações de qualidade. Parar para aceite funcional e visual do operador; não integrar páginas automaticamente.

Em todos os checkpoints, anotar no Markdown operacional as alterações efetivas, evidências, problemas encontrados, alternativas testadas e por que foram descartadas, decisões do operador, arquivos/classes afetados, verificações, pendências e ponto de retomada. Atualizar .docs/memoria-tecnica.md com soluções que importam à manutenção, especialmente animação/JS interop, isolamento temático, uso do Bulma e CSS isolado. Não declarar aprovação nem encerramento antes de confirmação do operador.

9. Cenários obrigatórios de teste e aceite

Matemática/infraestrutura (testes automatizados C#): (a) null permanece fora da curva; (b) 0 definido; (c) extremos ±100; (d) ±20 → ±50; (e) ±37 → ±60,625; (f) simetria positiva/negativa; (g) monotonicidade e limites da intensidade; (h) proteção contra entradas fora do domínio; (i) ausência de estilo cromático para null; (j) sem alteração do valor funcional; (k) composição de tokens por tema e ausência de vazamento experimental; (l) resultado independente da trajetória do ponteiro para o mesmo valor.

Interação (laboratório manual e verificações automatizáveis): clique em ponto distante sem arraste, arraste contínuo rápido/lento, toque e desvio vertical, pausa do mouse após o clique, soltar enquanto anima, troca externa do valor durante anima, reversão abrupta entre extremos, retorno a 0, switch ligar/desligar, teclado e finalização única, blur, componente desabilitado, perda de captura, foco visível somente na alça, valores acessíveis, prefers-reduced-motion e atraso 0, curvas alternativas e atraso 1.000/ease-out. Verificar que o valor da amostra, trilha, alça e diagnóstico evoluem coerentemente e que a conclusão não dispara persistência.

Aparência (operador): claro, escuro e Sistema; valores null, 0, ±2, ±20, ±55, ±100; categoria ausente/longa; textos curtos/longos; tom de mesmo valor sob curvas laboratoriais diferentes; borda, sombra, fundo e título da categoria; gradiente sobre fundo colorido; contraste/foco; desktop e viewport estreita (incluindo 390×844), sem controle artificial de largura máxima. Garantir ausência de transbordamento horizontal ou sobreposição de rótulos na trilha, inclusive em fonte personalizada do laboratório.

Isolamento (regressão): editar as quatro cores no laboratório, escolher cada preset, mudar limiar/intensidade, trocar tema e retornar ao padrão; observar que a amostra muda imediatamente, mas o restante do /lab, as páginas existentes, paletas de Sistema e os componentes normais continuam usando Terracota/Petróleo + 20/50 oficiais. Verificar que fechar/reabrir o bloco mantém o comportamento de expansão já existente e que erro de acesso a armazenamento laboratorial não desativa o componente.

Qualidade técnica: build do cliente .NET 10 sem novos avisos/erros, testes de matemática/contratos, git diff --check, ausência de regressões nos blocos anteriores, checagem visual real no navegador em temas e telas estreitas. Diagnosticar travamento ou parada de dotnet watch antes de atribuir problemas visuais ao CSS.

10. Condições de conclusão e continuidade

A unidade só estará concluída quando o CMP-007 — Seletor de Tom funcionar isoladamente no /lab, com estrutura/aparência/funcionalidade aprovadas em checkpoints; quando a função de aparência de Tom e o CSS temático compartilhado estiverem disponíveis para futuros CMPs sem dependência da amostra; quando a curva oficial 20/50 e a resposta padrão de 1.000 ms/ease-out tiverem testes; quando o laboratório oferecer uma única amostra ampla com todo o restante útil da instrumentação preservado e sem largura máxima; e quando o isolamento de cores experimentais estiver comprovado.

Não executar agora: integração do CMP-030 com Tom, expansão de Categorizar, alteração de telas existentes, substituição de componentes antigos, IndexedDB, regras de persistência e implementação de CMP-008/CMP-009/CMP-011/CMP-012. Esses componentes futuramente receberão valores e tokens já prontos; sua revisão será autorizada e validada separadamente. O produto mantém a fundação vigente e o próximo passo depende do aceite e do Parecer final do programador.

11. Referência compacta para o Codex

Leia primeiro: este documento integral; depois AGENTS.md aplicável, .docs/memoria-tecnica.md, código vigente de src/Rememore.Client/Pages/Lab.razor, bloco de laboratório e infraestrutura de temas.

Se necessário, consulte diretamente o fonte antigo: Stack1/components/SeletorTom.tsx, Stack1/assets/seletor-tom.css, Stack1/app/utilitarios/respostaSeletor.ts, Stack1/app/utilitarios/aparenciaTom.ts, Stack1/assets/tom.css, Stack1/app/utilitarios/curvaTom.ts, Stack1/components/ExperimentoMemoria.tsx, Stack1/assets/laboratorio-memoria.css, Stack1/components/Memoria.tsx, Stack1/assets/memoria.css, Stack1/islands/ExperimentoCurvaTom.tsx e testes relacionados. Evite abrir as especificações antigas por padrão: todo contrato funcional e visual pertinente já foi sintetizado aqui. Se surgir contradição concreta entre este texto e o código final, registrar o ponto e pedir decisão ao operador antes de alterar comportamento aprovado; não transportar regras de páginas incidentalmente encontradas nas specs.

Forma de trabalho: checkpoints sequenciais 1 (HTML/Bulma), 2 (aparência limpa + infraestrutura compartilhada), 3 (funcionalidade/testes); registro técnico e validação do operador em cada etapa. Não transformar esta unidade laboratorial em retomada de 05.07.02.



Continuidade do programador: registrar aqui, sem modificar o corpo aprovado, checkpoints, deliberações posteriores do operador, correções e Parecer final quando expressamente solicitado.

## Continuidade da implementação

### Estado inicial — 20/10/2026

- Unidade aprovada e iniciada; trabalho restrito ao `/lab`, sem integração a páginas, persistência real ou backend.
- Branch do repositório: `develop`. O worktree já tinha alterações preexistentes em `.docs/especificacoes/CMP-001-campo-de-senha.md` (remoção), `.docs/especificacoes/README.md`, `AGENTS.md`, `.docs/especificacoes/CMP-007-seletor-de-Tom.md` (especificação fornecida, ainda não rastreada) e `.docs/especificacoes/concluidas/CMP-001-campo-de-senha.md` (arquivo não rastreado). Preservar todas.
- O caminho `Stack1/` faz parte do mesmo repositório. A referência local `main` não contém essas fontes; após confirmação do operador em 20/10/2026, usar como referência histórica os arquivos enumerados na especificação no worktree `develop`, sem alterar a Stack1.
- A documentação oficial do Bulma foi consultada para controles de formulário. Ela documenta o wrapper `.checkbox` sobre `input type="checkbox"` e o padrão `.field` / `.control`, mas não fornece controle switch nem range próprio. O operador aprovou em 20/10/2026 a estrutura HTML nativa de formulário no Checkpoint 1 e refinamento visual no Checkpoint 2.
- Fontes oficiais consultadas: <https://bulma.io/documentation/form/>, <https://bulma.io/documentation/elements/form/> e <https://bulma.io/documentation/form/checkbox/>.

### Plano e estado dos checkpoints

1. **Checkpoint 1 — Estrutura HTML/Bulma (aceito pelo operador em 20/10/2026):** adicionar ao `/lab` um bloco próprio CMP-007 com estrutura sem lógica de negócio, usando HTML semântico e padrões Bulma documentados. Incluir switch e range nativos acessíveis, grupos de controles, uma caixa-amostra e áreas de diagnóstico/experimento como estrutura. Não introduzir CSS personalizado, JavaScript ou cálculo funcional. Verificar compilação, ordem semântica/de foco e apresentação estrutural/responsiva; parar para inspeção e aceite do operador.
2. **Checkpoint 2 — Aparência e fundação (aceito pelo operador em 20/10/2026):** tokens oficiais, cálculo compartilhado, aparência da amostra e refinamento visual com Bulma e CSS localizado; aparência aprovada pelo operador.
3. **Checkpoint 3 — Funcionalidade (validado pelo operador em 20/10/2026):** interações, fundação compartilhada e instrumentação do laboratório implementadas e validadas. Ajustes pontuais futuros poderão retornar a esta unidade, sem alterar o registro deste aceite.

### Próxima ação

Unidade encerrada por solicitação do operador em 20/10/2026. Parecer final registrado abaixo; especificação arquivada em `.docs/especificacoes/concluidas/CMP-007-seletor-de-Tom.md`. Integrações a páginas permanecem fora desta unidade.

### Checkpoint 3 — funcionalidade completa (implementação concluída; validado pelo operador)

- `SeletorTom.razor` é controlado pelo chamador, com estados distintos de Tom ausente e zero definido, eventos contínuos/alvo/conclusão/desativação, parâmetro de atraso e curva, largura configurável, range acessível para teclado e identificador único por instância. `wwwroot/js/seletorTom.js` cuida somente de ponteiro/toque, captura, requestAnimationFrame, preferência de movimento reduzido e callbacks de interação; cálculo de aparência e avanço temporal ficam em C# puro (`AparenciaTom.cs`, `RespostaSeletor.cs`). O dispose libera listeners/captura e referência JS.
- A demonstração inclui sete alvos de cenário, ativação/desativação, bloqueio de teste, atraso 0–1.200 ms, quatro curvas, amostra com texto/categoria editáveis, calibração isolada para temas claro/escuro, sete presets, cores manuais, reset e comparação da curva linear com a experimental. Cores experimentais são variáveis inline no wrapper da demonstração; os quatro tokens oficiais em `wwwroot/css/tom.css` e a paleta do tema não são alterados. `AmostraMemoriaTom.razor` recebe parâmetros de curva para não duplicar a matemática.
- Revisão no navegador na prévia compilada `http://localhost:5194/lab`: ativar switch atualizou o range de desabilitado para ativo e registrou 0; clique no cenário `Positivo moderado` animou de +65 até +55 e emitiu conclusão uma vez no destino; range por teclado (seta esquerda) mudou +55 para +54 e concluiu em +54; arraste do thumb para +50 mostrou valor intermediário +46, alvo +50 e conclusão final +50; desabilitar tornou range, switch e cenários inativos; preset Índigo e damasco atualizou cores e identidade do preset; edição manual para `#112233` mudou o preset para Personalizada; tema de edição Escuro expôs os extremos escuros correspondentes e preset padrão; reset devolveu a paleta experimental oficial; switch de desabilitar foi revertido. A tela foi deixada em cenário Positivo moderado, tema claro e paleta padrão. Essa prévia foi compilada separadamente porque a aba `5193` controlada pelo operador respondeu HTTP, mas falhou ao carregar módulo dinâmico; o processo do `dotnet watch` não foi reiniciado.
- Verificações finais em 20/10/2026: `dotnet build Rememore.slnx --no-restore --verbosity:minimal` passou, 0 avisos e 0 erros; `dotnet test tests/Rememore.Client.Tests/Rememore.Client.Tests.csproj --no-restore --verbosity:minimal` passou com 21/21; `git diff --check` passou. Cobertura inclui ausente/zero, extremos, curva 20/50, simetria/monotonicidade/limites, tokens, transformação negativa, isolamento da curva linear, atraso zero/padrão, reversão, proteção de passo e entradas inválidas.
- Limites da verificação feita pelo programador: não foram exercitados em navegador toque físico, todas as combinações de atraso/curvas, `prefers-reduced-motion`, blur/perda real de captura, tema global Sistema, viewport 390×844, contraste medido, categoria ausente/longa nem todos os estados de texto; não foi feita regressão visual das outras páginas/blocos ou teste de falha de armazenamento. A instrumentação não persiste valores, conforme escopo. A inspeção de código confirma que as cores experimentais ficam no wrapper, mas a comparação visual simultânea com uma instância normal fora do CMP-007 permanece para a validação do operador.
- Documentação reutilizável registrada em `.docs/memoria-tecnica.md`: padrão de largura fluida usado na demonstração; contrato da fundação pura `AparenciaTom`/`MovimentoSeletor`; separação da mecânica de pointer/touch e animação no módulo JS; escopo local das cores experimentais. O operador validou antes o Razor e CSS do controle de largura e autorizou o padrão para componentes futuros.
- Estado: toda a implementação prevista para este checkpoint foi concluída. Checkpoints 1 e 2 já aceitos; o Checkpoint 3 aguarda avaliação funcional e visual do operador. Não integrar páginas, mover a especificação ou escrever Parecer final ainda.
- Decisão posterior do operador em 20/10/2026: clique pontual na trilha deve usar `ease-in`; clicar e arrastar deve usar `ease-in-out`; ambos mantêm resposta de 500 ms. Essa decisão atualiza o padrão temporal anterior de 1.000 ms/ease-out para as interações de ponteiro do CMP-007 e prevalece sobre as referências históricas no corpo aprovado. A duração continua configurável no laboratório. Para separar clique de arraste, adotado limiar técnico de 4 px entre `pointerdown` e movimento; deslocamentos menores conservam a resposta de clique.
- Ajuste implementado: `SeletorTom` recebe curvas distintas para clique/arraste; pressionar a trilha ativa a curva de clique e, ao exceder 4 px, passa para a curva de arraste, reiniciando a velocidade da animação. A curva genérica continua aplicável ao teclado e aos cenários de demonstração. No laboratório, a duração inicial é 500 ms e há seletores independentes para clique, arraste e teclado/cenários.
- Validação do ajuste na prévia compilada `http://localhost:5195/lab`: clique pontual mudou +65 para alvo −61, exibiu valor intermediário (−53) e concluiu em −61; arraste mudou o alvo para +71, exibiu +67 durante a resposta e concluiu em +71. O laboratório apresentou 500 ms, `ease-in` para clique e `ease-in-out` para arraste. Build da solução passou com 0 avisos/erros; testes passaram 21/21 em execução sequencial; `git diff --check` passou. Uma tentativa inicial de rodar build e teste em paralelo disputou o assembly de teste (CS2012); a execução sequencial passou.
- O `dotnet watch` do operador em 5193 não foi reiniciado nem alterado. A validação confirma clique/arraste na configuração padrão; o limiar de 4 px é uma escolha técnica inicial, disponível para avaliação do operador. Permanecem os limites de validação manual já anotados para toque físico, movimento reduzido, viewport estreita, tema Sistema, contraste e regressão dos demais blocos/páginas.
- Investigação de fluidez solicitada pelo operador em 20/10/2026: Stack1 e Stack2 atualizavam estado/renderização a cada quadro ou mudança inteira, incluindo chamadas repetidas de callback e atualização da amostra. O cálculo de cor em si é simples; o custo provável é a cascata de atualizações e renderizações no caminho de animação. Na Stack2, a animação permanece em `requestAnimationFrame`, mas a posição/trilha/alça e os atributos acessíveis são atualizados diretamente pelo módulo JS; notificações ao .NET foram limitadas a no máximo 30 por segundo, com o valor final publicado antes da conclusão. Isso reduz renderizações do laboratório sem reduzir a cadência visual do controle; as curvas aprovadas permanecem intactas.
- Após a otimização, prévia `http://localhost:5195/lab`: arraste até −63 atualizou a amostra, trilha e alça, e clique até +52 percorreu valor intermediário +43 e concluiu em +52. O atraso permaneceu em 500 ms e as curvas de clique/arraste permaneceram nos valores aprovados. Build da solução: 0 avisos/erros; testes: 21/21; `git diff --check`: passou. Não foi feita medição instrumental de FPS nem comparação quantitativa antes/depois; a melhoria de renderização é baseada na redução efetiva de chamadas e foi conferida visualmente, sujeita à avaliação de fluidez do operador.
- Estado: ajuste implementado; Checkpoint 3 aguarda nova avaliação funcional/visual. Não integrar páginas, mover a especificação ou escrever Parecer final ainda.
- Investigação adicional solicitada pelo operador em 20/10/2026: a borda ampla na alça era o indicador `:focus-visible` da entrada range, focada por código ao clicar na trilha. A borda menor durante arraste é o estilo esperado de foco da alça. O título de página recebe foco de navegação por uma regra distinta e permanece com seu indicador acessível.
- Correção: enquanto o foco do range vier do ponteiro, a raiz recebe a classe `seletor-tom--foco-ponteiro`, que suprime apenas o anel visual da alça. A classe sai em blur ou quando uma tecla de valor é usada, preservando o foco visível para teclado.
- Causa da desaceleração ao aproximar-se do alvo: depois de soltar o ponteiro, o tipo de gesto era descartado junto com o identificador do ponteiro. Um rerender Blazor durante a animação chamava `definirResposta` e restabelecia a curva genérica (`ease-out`), embora a resposta ainda devesse usar `ease-in` (clique) ou `ease-in-out` (arraste). A curva do gesto agora é mantida até a conclusão da animação e então limpa; a curva genérica segue para teclado e cenários.
- Validação desta correção em `http://localhost:5195/lab`: após recarregar a prévia recompilada, clique na trilha deixou a raiz com `seletor-tom--foco-ponteiro` e o estilo calculado da alça com `outline-style: none`; ao pressionar ArrowRight, a classe foi removida e o foco de teclado mostrou `outline-style: solid` de 2 px. A inspeção visual confirmou que o contorno amplo some após clique e permanece o indicador menor quando o teclado assume o foco. Clique no centro também concluiu em zero e atualizou o diagnóstico uma vez.
- Validação da curva: inspeção do fluxo confirmou que `tipoGestoPonteiro` persiste após `pointerup`, é consultado por `definirResposta` durante rerenders e só é limpo na conclusão ou em substituição do valor externo. Assim, o clique mantém `ease-in` e o arraste mantém `ease-in-out` até a convergência. Não houve instrumentação de FPS nem quantificação da fluidez; a avaliação final de sensação de movimento permanece com o operador.
- Recompilação e verificações após os ajustes: `dotnet build Rememore.slnx --no-restore --verbosity:minimal` passou com 0 avisos e 0 erros; testes `Rememore.Client.Tests` passaram 21/21; `git diff --check` passou. A primeira tentativa de recarregar a aplicação antes de reiniciar a prévia 5195 apresentou a tela de erro do Blazor; após reiniciar somente essa prévia compilada, `/lab` carregou normalmente. O servidor `dotnet watch` do operador em 5193 não foi alterado.
- Retorno do operador após a correção: confirmou que a opção `:focus-visible` não aparece mais após clicar na trilha, que o movimento está fluido e que a coloração da amostra acompanha o efeito; considerou o resultado excelente. A borda indevida e a fluidez deixam de ser pendências para revisão.
- O operador validou o Checkpoint 3 em 20/10/2026: considerou corretos os comportamentos e aceitou que detalhes adicionais, se encontrados depois, sejam tratados como ajustes pontuais nesta unidade. Este aceite não encerra nem arquiva a especificação; o encerramento formal continua a depender de pedido próprio do operador.
- Ajuste pontual solicitado pelo operador em 20/10/2026: o `input type="range"` do CMP-007 deve manter o domínio acessível `min=-100`, `max=100`, conforme a escala funcional especificada. O range havia sido ampliado experimentalmente para ±1000, mas essa escala não pertence ao CMP-007. Page Up/Down agora têm tratamento explícito para continuar levando aos extremos ±100, sem depender do incremento nativo do navegador. As setas continuam usando o passo nativo de 1. A lógica funcional já limitava os valores a ±100.
- Ajuste de teclado solicitado em 20/10/2026: setas sem modificadores avançam para o próximo valor fixo de 10 na direção pressionada; por exemplo, +65 vai a +70 com direita e +60 com esquerda. `Shift` + seta avança ou recua 1 a partir do alvo atual. Valores de passo personalizados para `Control` e `Alt` não foram definidos; esses modificadores não recebem regra própria nesta alteração. Home/End e Page Up/Down mantêm o comportamento de ir aos extremos.
- Ajuste de resposta de teclado solicitado em 20/10/2026: Page Up/Down e mouse compartilham o controle de atraso geral, mantido em 500 ms por padrão; as setas recebem atraso próprio, iniciado em 1.000 ms, e seletor de curva próprio no laboratório. O controle de curva anterior passa a identificar Page Up/Down e cenários; clique e arraste preservam suas curvas separadas.
- Clarificação do operador em 20/10/2026: Page Up continua avançando em direção a +100 e Page Down em direção a −100, com 0 como uma parada real entre lados. De um valor negativo, Page Up primeiro anima até 0; outra pressão, após a parada, segue a +100. Page Down segue a mesma regra no sentido oposto. A repetição automática por manter a tecla pressionada não deve pular a parada.
- Ajuste solicitado em 20/10/2026: a largura inicial do controle na demonstração e o padrão do componente passaram de 60% para 100%. O atraso inicial já era 500 ms (`RespostaSeletor.PadraoTom`) e foi mantido nesse valor; clique segue `ease-in`, arraste `ease-in-out` e o teclado/cenários passaram de `ease-out` para `linear`, conforme nova decisão do operador.
- Conferência do foco por teclado: ArrowRight mostra `:focus-visible` somente na alça, sem borda ampla na área inteira do seletor. A pedido do operador, o contorno externo de 2 px com afastamento foi removido; o foco agora é indicado por um único anel fino de 1 px na própria alça, com a cor do link. Essa sinalização localizada permanece para acessibilidade.
- Após a alteração do foco: build da solução passou sem avisos/erros; a prévia `http://localhost:5195/lab` confirmou o anel externo removido e um único anel fino durante o uso do teclado. Largura 100%, atraso 500 ms e curvas de ponteiro permanecem corretos. `git diff --check` passou; o `dotnet watch` do operador em 5193 permaneceu intocado.
- Ajuste de padrão solicitado junto ao aceite do Checkpoint 3: curva de teclado e cenários deve iniciar em `linear`, mantendo clique em `ease-in`, arraste em `ease-in-out` e atraso em 500 ms. Atualizados `RespostaSeletor.PadraoTom`, o estado inicial da demonstração e a expectativa existente em `MovimentoSeletorTests`. Build passou sem avisos/erros; após recarregar a prévia `/lab`, os valores visíveis foram 500 ms, `ease-in`, `ease-in-out` e `linear`, com largura 100%. `git diff --check` passou. Os testes automatizados não foram executados neste ajuste.
- Aceite final do operador em 20/10/2026, com base nos valores visíveis no laboratório: componente validado e aprovado. Padrões aprovados: largura do seletor 100%; atraso de Page Up/Down, clique e arraste 500 ms; atraso das setas 1.000 ms; curva ao clicar na trilha `ease-in`; curva ao clicar e arrastar `ease-in-out`; curva de Page Up/Down e cenários `ease-in`; curva das setas `linear`. O print do laboratório mostrou as quatro curvas selecionadas e confirmou os valores padrão visuais. Alinhados `RespostaSeletor.PadraoTom`, o padrão de `CurvaSetas` no componente e o estado inicial da demonstração a esse aceite; atualizada a expectativa de contrato já existente nos testes. Não foi solicitado encerramento ou arquivamento da especificação.

## Parecer final do programador — 20/10/2026

### Resultado e escopo

Implementação prevista para CMP-007 concluída e validada nos três checkpoints. `SeletorTom` e a fundação compartilhada de aparência e movimento foram implementados e demonstrados no `/lab`. A unidade não integra o seletor a páginas reais, não converte o CMP-030, não grava estado, não usa IndexedDB e não implementa API ou backend, conforme o recorte aprovado. A integração futura deve ocorrer em especificação própria, depois do aceite do componente no laboratório.

O componente é controlado pelo chamador e distingue Tom ausente (`null`) de Tom informado igual a zero. Mantém escala de −100 a +100; apresenta switch, controle acessível por teclado, interações por ponteiro/toque, eventos de alteração e conclusão, resposta temporal configurável e largura ajustável. `AparenciaTom.cs` e `RespostaSeletor.cs` mantêm os cálculos em C# puro; `wwwroot/js/seletorTom.js` limita-se à mecânica de ponteiro/toque, captura, animação por `requestAnimationFrame`, foco e comunicação interop. A demonstração oferece cenários, diagnósticos, amostra de memória, calibração cromática local e experimento da curva sem alterar os tokens globais.

### Padrões aprovados

- Largura inicial: 100%.
- Atraso de Page Up/Down, clique e arraste: 500 ms; atraso das setas: 1.000 ms.
- Curva ao clicar na trilha: `ease-in`; ao clicar e arrastar: `ease-in-out`; Page Up/Down e cenários: `ease-in`; setas: `linear`.
- Setas sem modificadores percorrem múltiplos fixos de 10; `Shift` + seta varia 1. Page Up/Down preservam o sentido para os extremos e param em zero ao atravessar o centro; uma segunda pressão na mesma direção continua até o extremo. Repetição automática não pula a parada neutra.
- Foco visível permanece localizado na alça para uso por teclado. Clique na trilha não deixa o anel amplo de `:focus-visible`; a animação mantém a curva do gesto até convergir.

Os padrões finais foram confirmados no laboratório e pelo print enviado pelo operador. O valor de curva `ease-in` para Page Up/Down e cenários foi alinhado em `RespostaSeletor.PadraoTom` e na demonstração após esse aceite.

### Validações e aceite

- Checkpoints 1 e 2 foram aceitos pelo operador após inspeção da estrutura e da apresentação, incluindo comparação visual com Stack1. O operador aprovou os ajustes próprios de CSS necessários para reproduzir a geometria do seletor.
- Checkpoint 3 foi validado pelo operador após testar movimento, resposta cromática, foco e uso do teclado. Ele confirmou a fluidez e o acompanhamento visual da amostra; aceitou tratar eventuais descobertas posteriores como ajustes pontuais. No encerramento, declarou o componente validado e aprovado.
- Na prévia compilada `/lab`, foram verificados ativação/desativação, estado neutro, clique em cenário, teclado, arraste, conclusão, bloqueio de interações, edição de cores e presets. Ajustes de foco e persistência da curva durante rerenders também foram inspecionados no navegador. Os detalhes e as URLs das prévias estão registrados nos checkpoints acima.
- A suíte `Rememore.Client.Tests` passou com 21/21 testes na validação do Checkpoint 3. Após o último ajuste de padrão aceito, `dotnet build Rememore.slnx --no-restore --verbosity:minimal` passou com 0 avisos e 0 erros, e `git diff --check` passou. A suíte não foi executada novamente após esse último ajuste; a expectativa de padrão existente foi atualizada.

### Limites conhecidos

Não foram verificados toque físico, todas as combinações de curvas e atrasos, `prefers-reduced-motion`, perda real de captura/blur, tema Sistema, contraste medido, viewport 390×844, todos os estados de texto, regressão visual das demais páginas ou falha de armazenamento. Não foi medida a taxa de quadros instrumentalmente; a fluidez foi avaliada visualmente pelo operador. Não há pendência de implementação dentro do escopo desta unidade. Os itens acima delimitam verificações não realizadas, não alteram o aceite do operador.

### Arquivamento

O operador solicitou o encerramento em 20/10/2026. Parecer final registrado neste Markdown e unidade movida para `.docs/especificacoes/concluidas/CMP-007-seletor-de-Tom.md`. O conteúdo aprovado da especificação foi preservado integralmente; este Parecer foi acrescentado na seção de continuidade.

### Checkpoint 1 — estrutura HTML/Bulma

- Implementado bloco `cmp-007-seletor-tom` em `Pages/Lab.razor`, estrutura reutilizável inicial em `Componentes/SeletorTom.razor` e demonstração em `Componentes/Lab/DemonstracaoSeletorTom.razor`.
- A estrutura cobre switch nativo com `role="switch"`, range acessível, controles estáticos de resposta e cenários, texto/categoria, uma amostra, calibração das quatro cores, combinação sugerida, experimento da curva e diagnóstico. Nenhuma regra de negócio, CSS personalizado ou JavaScript foi acrescentado; a amostra e os valores demonstrativos ainda não reagem aos controles.
- `git diff --check`: passou. `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore --verbosity:minimal`: passou, 0 avisos e 0 erros. Não foram adicionados nem executados testes automatizados neste checkpoint.
- A inspeção visual automatizada não foi possível porque não há navegador disponível na sessão. O operador informou que avaliou os primeiros resultados e aceitou avançar ao Checkpoint 2 em 20/10/2026; não detalhou cenários adicionais. O servidor da prévia havia sido iniciado em `http://localhost:5193/lab`; o reinício do computador pode tê-lo encerrado.
- Estado: Checkpoint 1 aceito pelo operador. Sua aprovação cobre a estrutura inicial; a aparência refinada e os cenários cromáticos ainda serão revisados no Checkpoint 2.

### Checkpoint 2 — aparência e fundação compartilhada (aceito pelo operador)

- Iniciado após o aceite explícito do Checkpoint 1 pelo operador em 20/10/2026.
- Preservar o limite desta etapa: tokens oficiais de Tom, função compartilhada de transformação/aparência e refinamento visual; não ativar ponteiro, teclado, switch, controles de experimento, resposta temporal ou persistência.
- Implementação visual preparada: `Infraestrutura/AparenciaTom.cs` expõe transformação e composição de classes/variáveis CSS; `wwwroot/css/tom.css` define extremos claro/escuro e mistura as cores com tokens da paleta Bulma; `AmostraMemoriaTom.razor` e seu CSS isolado demonstram moldura, categoria e gradiente sobre o fundo efetivo; `SeletorTom.razor.css` refina switch, trilha, marca central, alça, estados de foco e rótulos; `DemonstracaoSeletorTom.razor` usa a amostra ampla no laboratório. `app.css` importa `tom.css`. A estrutura segue os elementos de formulário Bulma consultados no Checkpoint 1.
- Higiene confirmada: estilos específicos estão em CSS localizado/isolado e no arquivo temático; nenhum seletor de foco depende de token Bulma inexistente. As cores de Tom ficam em `--tom-*` e não substituem as variáveis da paleta global.
- Verificações de 20/10/2026: `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore --verbosity:minimal` passou, 0 avisos e 0 erros. `git diff --check` passou. Não foram executados testes automatizados neste checkpoint; os testes matemáticos pertencem ao Checkpoint 3.
- No primeiro preparo do Checkpoint 2 a revisão pelo navegador não estava disponível e a prévia anterior havia sido encerrada após o reinício do equipamento. Em 20/10/2026, o operador informou que iniciou `dotnet watch` em `http://localhost:5193/lab` e deixou a Stack1 em `http://localhost:5180/laboratorio`; as duas abas foram então inspecionadas diretamente, sem reiniciar os servidores.
- Ajustes visuais solicitados pelo operador após a retomada da prévia em 20/10/2026: aumentar o espaço entre o Seletor de Tom e “Atraso da escala” (`SeletorTom.razor.css`, margem final de 1rem), e entre a amostra e “Calibração cromática do laboratório” (`AmostraMemoriaTom.razor.css`, margem final de 1.5rem). A área do range agora ocupa a largura integral do controle; a alça nativa (transparente nesta etapa) e trilha visual compartilham a mesma referência, reservando o recuo de 0.575rem à alça/trilha, não à caixa do range. Comparação visual direta feita nas abas abertas do operador (`/lab` e Stack1 `/laboratorio`): trilha, centro, alça e rótulos estão alinhados na mesma escala proporcional; espaçamentos aparecem separados na prévia atualizada. O aceite final do Checkpoint 2 foi registrado abaixo após a confirmação do operador.
- Diretriz visual reafirmada pelo operador em 20/10/2026: para componentes complexos cuja reprodução dependa de uma apresentação própria, a similaridade visual com a Stack1 é o critério deste CMP, mesmo que o CSS local se afaste do markup/estilo convencional Bulma. Bulma permanece onde ajuda com tokens e estrutura externa; não limitar o seletor ao aspecto de um range padrão. Comparação minuciosa de `Stack1/assets/seletor-tom.css` e `Stack1/components/SeletorTom.tsx` identificou diferenças de trilha neutra, dimensões/posição do trilho, marca central, alça com anel, alinhamento horizontal dos rótulos e título acessível visível. O CSS isolado foi aproximado aos valores originais (2.9rem de altura, trilho a 1rem, alça a 0.65rem, anel exterior, rótulos sem recuo lateral); o nome acessível da escala permanece, mas visualmente oculto como na Stack1. Prévia `/lab` conferida após hot reload; avaliação/aceite visual final do operador ainda pendente.
- Ajuste fino solicitado em 20/10/2026: a inspeção revelou que `overflow: hidden` na trilha cortava a marca divisória central, e que a borda arredondada da trilha não arredondava o início/fim do segmento revelado. Removido o recorte da trilha e aplicado `border-radius: inherit` ao segmento, preservando os cantos arredondados; a marca central agora aparece para além do corpo da trilha. Naquele estado intermediário, o controle visual foi limitado a `min(100%, 32rem)` para reproduzir a largura efetiva da coluna do exemplo Stack1. A largura fixa foi depois substituída pelo ajuste de largura solicitado no item seguinte. A comparação permanece aguardando aceite final do operador.
- Solicitação visual adicional do operador em 20/10/2026: adicionar ao bloco de laboratório um range que dimensione o componente entre 30% e 100% da largura disponível, para comparar largura reduzida/total e comportamento responsivo; esse controle altera apenas a apresentação e não ativa as demais interações do CMP-007. `DemonstracaoSeletorTom.razor` agora exibe o percentual e atualiza `SeletorTom.LarguraPercentual`; o CSS aplica a largura ao componente inteiro, e `DemonstracaoSeletorTom.razor.css` estende o range de teste à largura do bloco. Valor inicial previsto: 60%, próximo à coluna da referência Stack1. A alça visual foi elevada 2px (`top: calc(0.65rem - 2px)`) para compensar o desalinhamento óptico observado.
- Pedido final de ajuste do operador em 20/10/2026: tornar suave o controle de largura, removendo os passos de 5%. A demonstração agora usa `step="any"`, estado `double` e formatação/parsing invariantes; o componente limita e aplica larguras fracionárias entre 30% e 100%. Build do cliente passou com 0 avisos e 0 erros; `git diff --check` passou.
- Correção pós-aceite solicitada pelo operador em 20/10/2026: o controle de largura movia o componente, mas o thumb nativo ficava fora de sincronia. Causa: parsing de `input type="range"` decimal pela cultura pt-BR (ponto tratado como separador de milhar) e atualização manual do evento sem binding do valor DOM. O range agora usa `@bind:event="oninput"` com `@bind:culture="CultureInfo.InvariantCulture"`, mantendo `step="any"`. Na prévia compilada em `http://localhost:5194/lab`, teste com 75,4 mostrou texto, posição acessível do thumb e largura do componente sincronizados. Build passou com 0 avisos/erros e `git diff --check` passou. O endpoint 5193 respondeu HTTP, mas após recarga o Blazor falhou ao buscar seu módulo dinâmico; o processo controlado pelo operador não foi reiniciado.
- Aceite explícito do operador em 20/10/2026: “Agora sim, eu gostei muito de como ficou o próprio componente. Você conseguiu reproduzir todos os detalhes que haviam na stack 1. Então, o visual do componente até o momento está muito bom.” Checkpoint 2 aceito. A prévia precisa ser recarregada pelo operador quando o `dotnet watch` estiver ativo para visualizar o último controle de largura contínuo.
- O operador confirmou que validou o Razor e o CSS do controle de largura e solicitou seu reaproveitamento em componentes futuros; o padrão foi registrado em `.docs/memoria-tecnica.md`.
- Checkpoint 3 iniciado em 20/10/2026 após o aceite do Checkpoint 2. Escopo: interações, animação configurável, fundação de aparência, demonstração/calibração isolada, testes determinísticos, build e revisão de acessibilidade. A inspeção da especificação não apontou dúvida funcional pendente; não inclui integração nem persistência.

