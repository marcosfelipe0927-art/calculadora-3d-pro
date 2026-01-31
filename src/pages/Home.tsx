import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Share2, Clock, Lock, Save, Eye, EyeOff, Edit2, Trash2, AlertCircle } from "lucide-react";
import { TimeMaskInput } from "@/components/TimeMaskInput";
import { CurrencyInput } from "@/components/CurrencyInput";
import { toast } from "sonner";
import {
  calcularPro,
  custoEnergiaKwh,
  maquinasBrasil,
  aliquotasIcms,
  type ParametrosCalculo,
} from "@/lib/calculadora";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  // Estado de Autenticação (Simplificado)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [userType, setUserType] = useState<'guest' | 'pro'>('guest');
  const [calculosRealizados, setCalculosRealizados] = useState<number>(0);
  
  // Ref para scroll automático
  const resultadosRef = useRef<HTMLDivElement>(null);

  // Estado da Calculadora
  const [nomeCliente, setNomeCliente] = useState("");
  const [nomePeca, setNomePeca] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [peso, setPeso] = useState<number>(0);
  const [precoKg, setPrecoKg] = useState<number>(69.99);
  const [tImp, setTImp] = useState<number>(0);
  const [tPosHoras, setTPosHoras] = useState<number>(0);
  const [tPosMinutos, setTPosMinutos] = useState<number>(0);
  const [qtdKit, setQtdKit] = useState<number>(1);

  // Taxas e Impostos
  const [chkIcms, setChkIcms] = useState<boolean>(false);
  const [chkIss, setChkIss] = useState<boolean>(false);
  const [chkRisco, setChkRisco] = useState<boolean>(true);
  const [exclusivo, setExclusivo] = useState<boolean>(false);
  const [mkpShopee, setMkpShopee] = useState<boolean>(false);
  const [mkpMl, setMkpMl] = useState<boolean>(false);
  const [chkFrete, setChkFrete] = useState<boolean>(false);
  const [descKit, setDescKit] = useState<number>(10);

  // Configurações
  const [nomeMaquina, setNomeMaquina] = useState<string>("Bambu Lab A1");
  const [cMaq, setCMaq] = useState<number>(0.9);
  const [estado, setEstado] = useState<string>("SP");
  const [vHora, setVHora] = useState<number>(40);
  const [vFrete, setVFrete] = useState<number>(25);
  const [multExcl, setMultExcl] = useState<number>(4.5);

  const [resUn, setResUn] = useState<string>("");
  const [resKit, setResKit] = useState<string>("");
  const [resUnCompleto, setResUnCompleto] = useState<string>("");
  const [resKitCompleto, setResKitCompleto] = useState<string>("");
  const [resZap, setResZap] = useState<string>("");
  const [resCustoTotal, setResCustoTotal] = useState<string>("");
  const [historico, setHistorico] = useState<any[]>([]);
  const [buscaHistorico, setBuscaHistorico] = useState<string>("");
  
  // Estado de Insumos
  const [materiais, setMateriais] = useState<any[]>([]);
  const [novoMaterial, setNovoMaterial] = useState({ nome: '', marca: '', precoPago: 0, pesoTotal: 0 });
  const [abaterDoEstoque, setAbaterDoEstoque] = useState<boolean>(true);

  // Carregamento inicial - SIMPLIFICADO
  useEffect(() => {
    console.log('[INIT] Carregando configurações do localStorage...');

    // Carregar configurações de máquina
    const savedConfig = localStorage.getItem('calculadora_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setNomeMaquina(config.nomeMaquina || 'Bambu Lab A1');
      setCMaq(config.cMaq || 0.9);
      setEstado(config.estado || 'SP');
      setVHora(config.vHora || 40);
      setVFrete(config.vFrete || 25);
      setMultExcl(config.multExcl || 4.5);
      setChkIcms(config.chkIcms || false);
      setChkIss(config.chkIss || false);
      setChkRisco(config.chkRisco !== undefined ? config.chkRisco : true);
      setExclusivo(config.exclusivo || false);
      setMkpShopee(config.mkpShopee || false);
      setMkpMl(config.mkpMl || false);
      setChkFrete(config.chkFrete || false);
      setDescKit(config.descKit || 10);
    }
    
    // Carregar histórico
    const savedHistorico = localStorage.getItem('calculadora_historico');
    if (savedHistorico) {
      setHistorico(JSON.parse(savedHistorico));
    }
    
    // Carregar materiais
    const savedMateriais = localStorage.getItem('calculadora_materiais');
    if (savedMateriais) {
      setMateriais(JSON.parse(savedMateriais));
    }

    // Carregar tipo de usuário e contador de cálculos
    const savedUserType = localStorage.getItem('userType') as 'guest' | 'pro' | null;
    const savedCalculos = localStorage.getItem('calculos_realizados');
    const lastResetDate = localStorage.getItem('calculos_last_reset_date');
    const lastResetWeek = localStorage.getItem('calculos_last_reset_week');
    
    const today = new Date().toDateString();
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    
    // Reset diário se mudou o dia
    if (lastResetDate !== today) {
      localStorage.setItem('calculos_realizados', '0');
      localStorage.setItem('calculos_last_reset_date', today);
      setCalculosRealizados(0);
    } else if (savedCalculos) {
      setCalculosRealizados(parseInt(savedCalculos, 10));
    }
    
    // Reset semanal se mudou a semana
    if (lastResetWeek && parseInt(lastResetWeek, 10) !== currentWeek) {
      localStorage.setItem('calculos_semanais', '0');
      localStorage.setItem('calculos_last_reset_week', currentWeek.toString());
    } else if (!lastResetWeek) {
      localStorage.setItem('calculos_last_reset_week', currentWeek.toString());
    }
    
    if (savedUserType) {
      setUserType(savedUserType);
    }

    console.log('[INIT] Configurações carregadas com sucesso');
  }, []);

  // Salvar config automaticamente quando há mudanças
  useEffect(() => {
    const config = {
      nomeMaquina,
      cMaq,
      estado,
      vHora,
      vFrete,
      multExcl,
      chkIcms,
      chkIss,
      chkRisco,
      exclusivo,
      mkpShopee,
      mkpMl,
      chkFrete,
      descKit,
    };
    localStorage.setItem('calculadora_config', JSON.stringify(config));
  }, [nomeMaquina, cMaq, estado, vHora, vFrete, multExcl, chkIcms, chkIss, chkRisco, exclusivo, mkpShopee, mkpMl, chkFrete, descKit]);

  const handleSalvarMaterial = () => {
    if (!novoMaterial.nome.trim() || !novoMaterial.marca.trim() || novoMaterial.pesoTotal <= 0) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }
    const novoId = Date.now().toString();
    const materialNovo = {
      id: novoId,
      nome: novoMaterial.nome,
      marca: novoMaterial.marca,
      precoPago: novoMaterial.precoPago,
      pesoTotal: novoMaterial.pesoTotal,
      pesoUsado: 0,
    };
    const novosMateriais = [...materiais, materialNovo];
    setMateriais(novosMateriais);
    localStorage.setItem('calculadora_materiais', JSON.stringify(novosMateriais));
    setNovoMaterial({ nome: '', marca: '', precoPago: 0, pesoTotal: 0 });
    toast.success('Material salvo com sucesso!');
  };

  const handleDeletarMaterial = (id: string) => {
    const novosMateriais = materiais.filter(m => m.id !== id);
    setMateriais(novosMateriais);
    localStorage.setItem('calculadora_materiais', JSON.stringify(novosMateriais));
    toast.success('Material removido');
  };

  const handleCalcular = () => {
    if (!nomeCliente.trim() || !nomePeca.trim() || peso <= 0) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const parametros: ParametrosCalculo = {
      material,
      peso,
      precoKg,
      tImp,
      tPosHoras,
      tPosMinutos,
      qtdKit,
      chkIcms,
      chkIss,
      chkRisco,
      exclusivo,
      mkpShopee,
      mkpMl,
      chkFrete,
      descKit,
      cMaq,
      estado,
      vHora,
      vFrete,
      multExcl,
    };

    const resultado = calcularPro(parametros);

    setResUn(resultado.resUn);
    setResKit(resultado.resKit);
    setResUnCompleto(resultado.resUnCompleto);
    setResKitCompleto(resultado.resKitCompleto);
    setResZap(resultado.resZap);
    setResCustoTotal(resultado.resCustoTotal);

    // Atualizar histórico
    const novoCalculo = {
      id: Date.now(),
      nomeCliente,
      nomePeca,
      material,
      peso,
      data: new Date().toLocaleString('pt-BR'),
      preco: resultado.resUn,
    };

    const novoHistorico = [novoCalculo, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem('calculadora_historico', JSON.stringify(novoHistorico));

    // Incrementar contador de cálculos
    const novoContador = calculosRealizados + 1;
    setCalculosRealizados(novoContador);
    localStorage.setItem('calculos_realizados', novoContador.toString());

    // Scroll automático para resultados
    setTimeout(() => {
      resultadosRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    toast.success('Cálculo realizado com sucesso!');
  };

  const handleCopiarResultado = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success('Copiado para a área de transferência!');
  };

  const handleDownloadPDF = () => {
    toast.info('Funcionalidade de download em desenvolvimento');
  };

  const handleLimparHistorico = () => {
    setHistorico([]);
    localStorage.setItem('calculadora_historico', JSON.stringify([]));
    toast.success('Histórico limpo');
  };

  const historicoFiltrado = historico.filter(item =>
    item.nomeCliente.toLowerCase().includes(buscaHistorico.toLowerCase()) ||
    item.nomePeca.toLowerCase().includes(buscaHistorico.toLowerCase())
  );

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-bold">Calculadora 3D PRO</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
              <div className="text-sm text-muted-foreground">
                {userType === 'pro' ? '✓ PRO' : 'Guest'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-8 space-y-8">
          {/* Seção de Cálculo */}
          <Card>
            <CardHeader>
              <CardTitle>Calculadora de Preço</CardTitle>
              <CardDescription>Insira os dados da peça para calcular o preço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeCliente">Nome do Cliente</Label>
                  <Input
                    id="nomeCliente"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomePeca">Nome da Peça</Label>
                  <Input
                    id="nomePeca"
                    value={nomePeca}
                    onChange={(e) => setNomePeca(e.target.value)}
                    placeholder="Ex: Suporte de Parede"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger id="material">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLA">PLA</SelectItem>
                      <SelectItem value="PETG">PETG</SelectItem>
                      <SelectItem value="ABS">ABS</SelectItem>
                      <SelectItem value="TPU">TPU</SelectItem>
                      <SelectItem value="Nylon">Nylon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (g)</Label>
                  <Input
                    id="peso"
                    type="number"
                    value={peso}
                    onChange={(e) => setPeso(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precoKg">Preço do Kg (R$)</Label>
                  <CurrencyInput
                    id="precoKg"
                    value={precoKg}
                    onChange={setPrecoKg}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tImp">Tempo de Impressão (h)</Label>
                  <Input
                    id="tImp"
                    type="number"
                    value={tImp}
                    onChange={(e) => setTImp(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tPosHoras">Tempo Pós-Processamento (h)</Label>
                  <Input
                    id="tPosHoras"
                    type="number"
                    value={tPosHoras}
                    onChange={(e) => setTPosHoras(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tPosMinutos">Tempo Pós-Processamento (min)</Label>
                  <Input
                    id="tPosMinutos"
                    type="number"
                    value={tPosMinutos}
                    onChange={(e) => setTPosMinutos(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qtdKit">Quantidade de Kits</Label>
                <Slider
                  id="qtdKit"
                  min={1}
                  max={100}
                  step={1}
                  value={[qtdKit]}
                  onValueChange={(value) => setQtdKit(value[0])}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">Quantidade: {qtdKit}</div>
              </div>

              <Button onClick={handleCalcular} className="w-full bg-orange-500 hover:bg-orange-600">
                Calcular Preço
              </Button>
            </CardContent>
          </Card>

          {/* Resultados */}
          {resUn && (
            <Card ref={resultadosRef}>
              <CardHeader>
                <CardTitle>Resultados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Preço Unitário</div>
                    <div className="text-2xl font-bold">{resUn}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopiarResultado(resUn)}
                      className="mt-2"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Preço por Kit</div>
                    <div className="text-2xl font-bold">{resKit}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopiarResultado(resKit)}
                      className="mt-2"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Custo Total</div>
                  <div className="text-3xl font-bold text-orange-500">{resCustoTotal}</div>
                </div>

                <Button onClick={handleDownloadPDF} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" /> Baixar PDF
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Cálculos</CardTitle>
              <CardDescription>Últimos cálculos realizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por cliente ou peça..."
                  value={buscaHistorico}
                  onChange={(e) => setBuscaHistorico(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleLimparHistorico}
                  disabled={historico.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {historicoFiltrado.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum cálculo realizado ainda
                  </div>
                ) : (
                  historicoFiltrado.map((item) => (
                    <div key={item.id} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{item.nomeCliente}</div>
                          <div className="text-sm text-muted-foreground">{item.nomePeca}</div>
                          <div className="text-xs text-muted-foreground">{item.data}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-500">{item.preco}</div>
                          <div className="text-xs text-muted-foreground">{item.material}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
