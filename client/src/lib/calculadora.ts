// Dados de custos de energia por estado
const custoEnergiaKwh: Record<string, number> = {
  "Média Nacional": 0.72,
  "Acre": 0.65,
  "Alagoas": 0.78,
  "Amapá": 0.68,
  "Amazonas": 0.72,
  "Bahia": 0.75,
  "Ceará": 0.82,
  "Distrito Federal": 0.71,
  "Espírito Santo": 0.73,
  "Goiás": 0.69,
  "Maranhão": 0.80,
  "Mato Grosso": 0.70,
  "Mato Grosso do Sul": 0.72,
  "Minas Gerais": 0.68,
  "Pará": 0.70,
  "Paraíba": 0.81,
  "Paraná": 0.67,
  "Pernambuco": 0.79,
  "Piauí": 0.83,
  "Rio de Janeiro": 0.76,
  "Rio Grande do Norte": 0.80,
  "Rio Grande do Sul": 0.69,
  "Rondônia": 0.71,
  "Roraima": 0.66,
  "Santa Catarina": 0.68,
  "São Paulo": 0.74,
  "Sergipe": 0.77,
  "Tocantins": 0.72,
};

const maquinasBrasil: Record<string, [string, number]> = {
  "Bambu Lab A1": ["Bambu Lab", 1.0],
  "Creality Ender 3": ["Creality", 0.9],
  "Prusa i3 MK3S+": ["Prusa", 1.1],
  "Anycubic i3 Mega": ["Anycubic", 0.95],
  "Elegoo Neptune 3": ["Elegoo", 0.85],
  "Anet A8": ["Anet", 0.8],
  "Customizada": ["Custom", 1.0],
};

const aliquotasIcms: Record<string, number> = {
  "Média Nacional": 18,
  "Acre": 17,
  "Alagoas": 17,
  "Amapá": 17,
  "Amazonas": 18,
  "Bahia": 18,
  "Ceará": 17,
  "Distrito Federal": 18,
  "Espírito Santo": 18,
  "Goiás": 17,
  "Maranhão": 18,
  "Mato Grosso": 17,
  "Mato Grosso do Sul": 17,
  "Minas Gerais": 18,
  "Pará": 17,
  "Paraíba": 18,
  "Paraná": 18,
  "Pernambuco": 17,
  "Piauí": 17,
  "Rio de Janeiro": 20,
  "Rio Grande do Norte": 17,
  "Rio Grande do Sul": 17,
  "Rondônia": 17,
  "Roraima": 17,
  "Santa Catarina": 17,
  "São Paulo": 18,
  "Sergipe": 17,
  "Tocantins": 17,
};

// Função para arredondar psicologicamente
function arredondarPsicologico(valor: number): number {
  if (valor < 10) return Math.ceil(valor * 10) / 10;
  if (valor < 100) return Math.ceil(valor * 2) / 2;
  return Math.ceil(valor / 5) * 5;
}

// Interface para os parâmetros de cálculo
export interface ParametrosCalculo {
  material: string;
  peso: number;
  precoKg: number;
  tImp: number;
  tPosHoras: number;
  tPosMinutos: number;
  exclusivo: boolean;
  qtdKit: number;
  descKit: number;
  vHora: number;
  cMaq: number;
  estado: string;
  mkpShopee: boolean;
  mkpMl: boolean;
  chkFrete: boolean;
  vFrete: number;
  chkRisco: boolean;
  multExcl: number;
  nomeMaquina: string;
  chkIcms: boolean;
  chkIss: boolean;
  nomeCliente: string;
  nomePeca: string;
}

// Interface para o resultado
export interface ResultadoCalculo {
  resUn: string;
  resKit: string;
  resZap: string;
  valoresUnitarios: number[];
  valoresKit: number[];
  custosUnitarios: number[];
  custosKit: number[];
  resCustoUn: string;
  resCustoKit: string;
}

export function calcularPro(params: ParametrosCalculo): ResultadoCalculo {
  const {
    material,
    peso,
    precoKg,
    tImp,
    tPosHoras,
    tPosMinutos,
    exclusivo,
    qtdKit,
    descKit,
    vHora,
    cMaq,
    estado,
    mkpShopee,
    mkpMl,
    chkFrete,
    vFrete,
    chkRisco,
    multExcl,
    nomeMaquina,
    chkIcms,
    chkIss,
    nomeCliente,
    nomePeca,
  } = params;

  const tPosTotal = tPosHoras + tPosMinutos / 60;

  // 1. Custos de Produção (sem incluir trabalho de acabamento)
  const valorKwh = custoEnergiaKwh[estado] || 0.72;
  const fatorCons = maquinasBrasil[nomeMaquina]?.[1] || 1.0;
  const multMat: Record<string, number> = {
    PLA: 0.8,
    PETG: 1.0,
    ABS: 1.4,
  };
  const eReal = valorKwh * (multMat[material] || 1.0) * fatorCons;

  const cMaterial = (precoKg / 1000) * peso;
  const cOperacional = (eReal + cMaq) * tImp;

  let custoBase = cMaterial + cOperacional;
  if (chkRisco) custoBase *= 1.1;

  // 2. Aplicar desconto de lote ANTES de impostos e taxas
  const fatorDesc = qtdKit > 1 ? 1 - descKit / 100 : 1.0;
  const custoBaseComDesc = custoBase * fatorDesc;

  // 3. Cálculo das Margens (Mínimo, Sugerido, Premium)
  const margens = exclusivo
    ? [multExcl, multExcl * 1.3, multExcl * 1.6]
    : [2.5, 3.5, 5.0];

  const vBase = margens.map((m) => custoBaseComDesc * m);

  // 4. Markup de Taxas e Impostos
  const pIcms = (aliquotasIcms[estado] || 18) / 100;
  const pIss = 0.05;
  const taxas =
    (mkpShopee ? 0.15 : 0) +
    (mkpMl ? 0.17 : 0) +
    (chkIcms ? pIcms : 0) +
    (chkIss ? pIss : 0);

  // 5. Custo unitário de trabalho (acabamento por unidade)
  const custoTrabalhoUnitario = tPosTotal * vHora;

  // 6. Processamento Final (Taxas -> Arredondamento -> Adicionar acabamento e frete)
  const vFinais: number[] = [];
  for (const v of vBase) {
    const vComTaxa = taxas < 1 ? v / (1 - taxas) : v;
    const vArredondado = arredondarPsicologico(vComTaxa);
    let vFinal = vArredondado + custoTrabalhoUnitario;
    if (chkFrete) vFinal += vFrete;
    vFinais.push(vFinal);
  }

  // 7. Cálculos do Lote (Kit)
  const fatorDesc2 = qtdKit > 1 ? 1 - descKit / 100 : 1.0;
  // Remover frete dos unitários antes de multiplicar (frete será adicionado uma única vez)
  const vSemFrete = vFinais.map((v) => chkFrete ? v - vFrete : v);
  const kFinais = vSemFrete.map((v) => v * qtdKit * fatorDesc2);
  
  // Adicionar frete apenas uma vez no total do lote
  if (chkFrete) {
    kFinais[0] += vFrete;
    kFinais[1] += vFrete;
    kFinais[2] += vFrete;
  }

  // Cálculo dos custos sem lucro (apenas custo de produção + acabamento + frete, SEM margens e SEM impostos)
  const custoUnitarioBase = custoBase + custoTrabalhoUnitario;
  const custoUnitarioComFrete = chkFrete ? custoUnitarioBase + vFrete : custoUnitarioBase;
  
  const custosUnitarios = [custoUnitarioComFrete, custoUnitarioComFrete, custoUnitarioComFrete];
  
  const custoSemFrete = custoUnitarioBase;
  const custosKit = [
    custoSemFrete * qtdKit + (chkFrete ? vFrete : 0),
    custoSemFrete * qtdKit + (chkFrete ? vFrete : 0),
    custoSemFrete * qtdKit + (chkFrete ? vFrete : 0),
  ];

  // Formatação das Strings de saída
  const resUn = `Mínimo: R$ ${vFinais[0].toFixed(2)} | Sugerido: R$ ${vFinais[1].toFixed(2)} | Premium: R$ ${vFinais[2].toFixed(2)}`;
  const resKit = `Mínimo: R$ ${kFinais[0].toFixed(2)} | Sugerido: R$ ${kFinais[1].toFixed(2)} | Premium: R$ ${kFinais[2].toFixed(2)}`;
  const resCustoUn = `Mínimo: R$ ${custosUnitarios[0].toFixed(2)} | Sugerido: R$ ${custosUnitarios[1].toFixed(2)} | Premium: R$ ${custosUnitarios[2].toFixed(2)}`;
  const resCustoKit = `Mínimo: R$ ${custosKit[0].toFixed(2)} | Sugerido: R$ ${custosKit[1].toFixed(2)} | Premium: R$ ${custosKit[2].toFixed(2)}`;

  // Texto WhatsApp (Usa o valor Sugerido como padrão)
  const dataE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const dataFormatada = `${String(dataE.getDate()).padStart(2, "0")}/${String(dataE.getMonth() + 1).padStart(2, "0")}`;
  const txt = `📄 ORÇAMENTO: ${nomeCliente || "Peça 3D"}
💰 Valor Total: R$ ${kFinais[1].toFixed(2)}
📅 Entrega estimada: ${dataFormatada}
⚙️ ${material} | ${nomeMaquina}`;

  return {
    resUn,
    resKit,
    resZap: txt,
    valoresUnitarios: vFinais,
    valoresKit: kFinais,
    custosUnitarios,
    custosKit,
    resCustoUn,
    resCustoKit,
  };
}

// Exportar dados para uso em Home.tsx
export { custoEnergiaKwh, maquinasBrasil, aliquotasIcms };
