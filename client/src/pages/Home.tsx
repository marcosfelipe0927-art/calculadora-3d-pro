import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Copy, Download, Share2, Clock, Lock } from "lucide-react";
import { TimeMaskInput } from "@/components/TimeMaskInput";
import { toast } from "sonner";
import {
  calcularPro,
  custoEnergiaKwh,
  maquinasBrasil,
  aliquotasIcms,
  type ParametrosCalculo,
} from "@/lib/calculadora";
import {
  generateFingerprint,
  isTokenValid,
  saveAuthToLocalStorage,
  getTokenFromLocalStorage,
  getFingerprintFromLocalStorage,
  isSameDevice,
  clearAuthFromLocalStorage,
} from "@/lib/auth";
import { useState, useEffect } from "react";

export default function Home() {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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
  const [resZap, setResZap] = useState<string>("");
  const [resCustoTotal, setResCustoTotal] = useState<string>("");
  const [historico, setHistorico] = useState<any[]>([]);
  const [buscaHistorico, setBuscaHistorico] = useState<string>("");

  useEffect(() => {
    // Verificar autenticacao no carregamento
    const savedToken = getTokenFromLocalStorage();
    const savedFingerprint = getFingerprintFromLocalStorage();
    const currentFingerprint = generateFingerprint();

    if (savedToken) {
      const validacao = isTokenValid(savedToken);
      if (validacao.valido) {
        if (savedFingerprint && isSameDevice(savedFingerprint, currentFingerprint)) {
          setIsAuthenticated(true);
        } else if (!savedFingerprint) {
          setIsAuthenticated(true);
        } else {
          toast.error("Este token ja esta em uso em outro dispositivo");
          clearAuthFromLocalStorage();
        }
      } else {
        toast.error(validacao.motivo || "Token invalido");
        clearAuthFromLocalStorage();
      }
    }

    const savedConfig = localStorage.getItem('calculadora_config');
    const savedHistorico = localStorage.getItem('calculadora_historico');
    
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
    
    if (savedHistorico) {
      setHistorico(JSON.parse(savedHistorico));
    }
  }, []);

  const handleTokenLogin = () => {
    if (!tokenInput.trim()) {
      toast.error("Digite um token valido");
      return;
    }

    const validacao = isTokenValid(tokenInput);
    if (!validacao.valido) {
      toast.error(validacao.motivo || "Token invalido");
      return;
    }

    const currentFingerprint = generateFingerprint();
    const savedFingerprint = getFingerprintFromLocalStorage();
    const savedToken = getTokenFromLocalStorage();

    // Se ja existe um token salvo e nao eh o mesmo
    if (savedToken && savedToken !== tokenInput) {
      toast.error("Outro token ja esta em uso neste dispositivo");
      return;
    }

    // Se ja existe um fingerprint salvo e nao corresponde
    if (savedFingerprint && !isSameDevice(savedFingerprint, currentFingerprint)) {
      toast.error("Este token ja esta em uso em outro dispositivo");
      return;
    }

    saveAuthToLocalStorage(tokenInput, currentFingerprint);
    setIsAuthenticated(true);
    setTokenInput("");
    toast.success("Acesso concedido!");
  };

  const handleLogout = () => {
    clearAuthFromLocalStorage();
    setIsAuthenticated(false);
    setTokenInput("");
    toast.success("Desconectado com sucesso");
  };

  const handleCalcular = () => {
    const params: ParametrosCalculo = {
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
    };

    const resultado = calcularPro(params);
    setResUn(resultado.resUn);
    setResKit(resultado.resKit);
    setResZap(resultado.resZap);
    setResCustoTotal(resultado.resCustoTotal);
    addToHistorico();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const saveConfig = () => {
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
    toast.success('Configuracoes salvas!');
  };

  const reorcarItem = (item: any) => {
    setNomeCliente(item.cliente === 'Cliente' ? '' : item.cliente);
    setNomePeca(item.peca === 'Peca' ? '' : item.peca);
    setMaterial(item.material || 'PLA');
    setPeso(item.peso || 0);
    setPrecoKg(item.precoKg || 69.99);
    setTImp(item.tImp || 0);
    setTPosHoras(item.tPosHoras || 0);
    setTPosMinutos(item.tPosMinutos || 0);
    setQtdKit(item.qtdKit || 1);
    setChkIcms(item.chkIcms || false);
    setChkIss(item.chkIss || false);
    setChkRisco(item.chkRisco !== undefined ? item.chkRisco : true);
    setExclusivo(item.exclusivo || false);
    setMkpShopee(item.mkpShopee || false);
    setMkpMl(item.mkpMl || false);
    setChkFrete(item.chkFrete || false);
    setDescKit(item.descKit || 10);
    toast.success('Dados carregados! Clique em CALCULAR para atualizar.');
  };

  const addToHistorico = () => {
    const novoItem = {
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR'),
      cliente: nomeCliente || 'Cliente',
      peca: nomePeca || 'Peca',
      precoUnitario: resUn,
      precoLote: resKit,
      quantidade: qtdKit,
      custos: resCustoTotal,
      whatsapp: resZap,
      material,
      peso,
      precoKg,
      tImp,
      tPosHoras,
      tPosMinutos,
      chkIcms,
      chkIss,
      chkRisco,
      exclusivo,
      mkpShopee,
      mkpMl,
      chkFrete,
      descKit,
    };
    const novoHistorico = [novoItem, ...historico].slice(0, 200);
    setHistorico(novoHistorico);
    localStorage.setItem('calculadora_historico', JSON.stringify(novoHistorico));
  };

  const shareWhatsApp = () => {
    if (!resZap) {
      toast.error('Calcule primeiro!');
      return;
    }
    const texto = encodeURIComponent(resZap);
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };

  const downloadOrcamento = () => {
    const conteudo = `${resZap}\n\n---\n\nPreço Unitário:\n${resUn}\n\nPreço Total:\n${resKit}`;
    const blob = new Blob([conteudo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orcamento.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-orange-50 to-orange-100'
      } p-4`}>
        <Card className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Acesso Restrito
            </CardTitle>
            <CardDescription>Digite seu token de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="token" className={isDarkMode ? 'text-white' : ''}>Token de Acesso</Label>
              <Input
                id="token"
                type="password"
                placeholder="Digite seu token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTokenLogin()}
                className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>
            <Button
              onClick={handleTokenLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Acessar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-orange-50 to-orange-100'
    } p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 flex justify-between items-center">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-orange-900'}`}>🚀 Calculadora 3D PRO</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''}
          >
            Sair
          </Button>
        </div>

        <Tabs defaultValue="calculadora" className={`w-full ${isDarkMode ? 'dark' : ''}`}>
          <div className="flex justify-center items-center gap-4 mb-8">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="calculadora">📊 Calcular</TabsTrigger>
              <TabsTrigger value="configuracoes">⚙️ Ajustes</TabsTrigger>
              <TabsTrigger value="historico">⏱️ Histórico</TabsTrigger>
            </TabsList>
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="outline"
              size="icon"
              className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </Button>
          </div>

          <TabsContent value="calculadora">
            {/* Mobile: Dados da Peça */}
            <div className="lg:hidden mb-6">
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">📦 Dados da Peça</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="cliente" className={isDarkMode ? 'text-white' : ''}>Cliente</Label>
                      <Input
                        id="cliente"
                        placeholder="Nome"
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="peca" className={isDarkMode ? 'text-white' : ''}>Peça</Label>
                      <Input
                        id="peca"
                        placeholder="Descrição"
                        value={nomePeca}
                        onChange={(e) => setNomePeca(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <Label htmlFor="material" className={isDarkMode ? 'text-white' : ''}>Material</Label>
                      <Select value={material} onValueChange={setMaterial}>
                        <SelectTrigger id="material" className="mt-1 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLA">PLA</SelectItem>
                          <SelectItem value="PETG">PETG</SelectItem>
                          <SelectItem value="ABS">ABS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="peso" className={isDarkMode ? 'text-white' : ''}>Peso (g)</Label>
                      <Input
                        id="peso"
                        type="number"
                        value={peso || ""}
                        onChange={(e) => setPeso(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1 w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="preco-kg" className={isDarkMode ? 'text-white' : ''}>Preço KG (R$)</Label>
                      <Input
                        id="preco-kg"
                        type="number"
                        step="0.01"
                        value={precoKg || ""}
                        onChange={(e) => setPrecoKg(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1 w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="t-imp" className={isDarkMode ? 'text-white' : ''}>Tempo Impressão (HH:mm)</Label>
                      <TimeMaskInput
                        value={tImp.toString()}
                        onChange={(value) => setTImp(value ? parseFloat(value) : 0)}
                        placeholder="00:00"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="t-pos" className={isDarkMode ? 'text-white' : ''}>Acabamento (HH:mm)</Label>
                      <TimeMaskInput
                        value={(tPosHoras + tPosMinutos / 60).toString()}
                        onChange={(value) => {
                          if (value) {
                            const totalHours = parseFloat(value);
                            setTPosHoras(Math.floor(totalHoras));
                            setTPosMinutos(Math.round((totalHoras % 1) * 60));
                          } else {
                            setTPosHoras(0);
                            setTPosMinutos(0);
                          }
                        }}
                        placeholder="00:00"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="qtd" className={isDarkMode ? 'text-white' : ''}>Quantidade</Label>
                      <Input
                        id="qtd"
                        type="number"
                        value={qtdKit || ""}
                        onChange={(e) => setQtdKit(e.target.value ? parseFloat(e.target.value) : 1)}
                        className="mt-1 w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile: Taxas e Impostos */}
            <div className="lg:hidden mb-6">
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">🛒 Taxas e Impostos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="icms"
                        checked={chkIcms}
                        onCheckedChange={(checked) => setChkIcms(checked as boolean)}
                      />
                      <Label htmlFor="icms" className="cursor-pointer text-sm">
                        ICMS (Estado)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="iss"
                        checked={chkIss}
                        onCheckedChange={(checked) => setChkIss(checked as boolean)}
                      />
                      <Label htmlFor="iss" className="cursor-pointer text-sm">
                        ISS (5%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="risco"
                        checked={chkRisco}
                        onCheckedChange={(checked) => setChkRisco(checked as boolean)}
                      />
                      <Label htmlFor="risco" className="cursor-pointer text-sm">
                        10% Risco/Falha
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclusivo"
                        checked={exclusivo}
                        onCheckedChange={(checked) => setExclusivo(checked as boolean)}
                      />
                      <Label htmlFor="exclusivo" className="cursor-pointer text-sm">
                        💎 Modelagem Própria
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shopee"
                        checked={mkpShopee}
                        onCheckedChange={(checked) => setMkpShopee(checked as boolean)}
                      />
                      <Label htmlFor="shopee" className="cursor-pointer text-sm">
                        Shopee (15%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ml"
                        checked={mkpMl}
                        onCheckedChange={(checked) => setMkpMl(checked as boolean)}
                      />
                      <Label htmlFor="ml" className="cursor-pointer text-sm">
                        Mercado Livre (17%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 col-span-2">
                      <Checkbox
                        id="frete"
                        checked={chkFrete}
                        onCheckedChange={(checked) => setChkFrete(checked as boolean)}
                      />
                      <Label htmlFor="frete" className="cursor-pointer text-sm">
                        Incluir Frete
                      </Label>
                    </div>
                  </div>

                  {chkFrete && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Label htmlFor="v-frete-modal">Valor Frete (R$)</Label>
                      <Input
                        id="v-frete-modal"
                        type="number"
                        step="0.01"
                        value={vFrete || ""}
                        onChange={(e) => setVFrete(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Label htmlFor="desc-kit">Desconto Kit (%): {descKit}%</Label>
                    <Slider
                      id="desc-kit"
                      min={0}
                      max={50}
                      step={1}
                      value={[descKit]}
                      onValueChange={(value) => setDescKit(value[0])}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile: Botão CALCULAR */}
            <div className="lg:hidden flex justify-center mb-6">
              <Button
                onClick={handleCalcular}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-bold rounded-lg w-full"
              >
                CALCULAR
              </Button>
            </div>

            {/* Mobile: Resultados */}
            <div className="lg:hidden mb-6">
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">💰 Resultados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resUn && (
                    <>
                      <div>
                        <Label className="text-sm" style={{color: isDarkMode ? '#ffffff' : '#4b5563'}}>Preço Unitário</Label>
                        <div className={`mt-2 p-3 rounded-lg border ${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                          <p className={`text-sm font-mono ${isDarkMode ? 'text-blue-100' : 'text-gray-900'}`}>{resUn}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resUn)}
                            className="mt-2 w-full" style={{color: '#f54900'}}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      {qtdKit > 1 && (
                        <div>
                          <Label className="text-sm" style={{color: isDarkMode ? '#ffffff' : '#4b5563'}}>Preço Total (Lote)</Label>
                          <div className={`mt-2 p-3 rounded-lg border ${isDarkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'}`}>
                            <p className={`text-sm font-mono ${isDarkMode ? 'text-green-100' : 'text-gray-900'}`}>{resKit}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(resKit)}
                              className="mt-2 w-full" style={{color: '#f54900'}}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm" style={{color: isDarkMode ? '#ffffff' : '#4b5563'}}>Custos Totais</Label>
                        <div className={`mt-2 p-3 rounded-lg border ${isDarkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
                          <p className={`text-sm font-mono ${isDarkMode ? 'text-yellow-100' : 'text-gray-900'}`}>{resCustoTotal}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resCustoTotal)}
                            className="mt-2 w-full" style={{color: '#f54900'}}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm" style={{color: isDarkMode ? '#ffffff' : '#4b5563'}}>WhatsApp</Label>
                        <div className={`mt-2 p-3 rounded-lg border ${isDarkMode ? 'bg-purple-900 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                          <p className={`text-xs font-mono whitespace-pre-wrap ${isDarkMode ? 'text-purple-100' : 'text-gray-900'}`}>
                            {resZap}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resZap)}
                            className="mt-2 w-full" style={{color: '#f44900'}}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={shareWhatsApp}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button
                          onClick={downloadOrcamento}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Desktop: 3 colunas lado a lado */}
            <div className="hidden lg:grid grid-cols-3 gap-6 mb-6" id="cards-container">
              {/* Coluna 1: Dados da Peça */}
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">📦 Dados da Peça</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="cliente" className={isDarkMode ? 'text-white' : ''}>Cliente</Label>
                      <Input
                        id="cliente"
                        placeholder="Nome"
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="peca" className={isDarkMode ? 'text-white' : ''}>Peça</Label>
                      <Input
                        id="peca"
                        placeholder="Descrição"
                        value={nomePeca}
                        onChange={(e) => setNomePeca(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <Label htmlFor="material" className={isDarkMode ? 'text-white' : ''}>Material</Label>
                      <Select value={material} onValueChange={setMaterial}>
                        <SelectTrigger id="material" className="mt-1 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLA">PLA</SelectItem>
                          <SelectItem value="PETG">PETG</SelectItem>
                          <SelectItem value="ABS">ABS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="peso" className={isDarkMode ? 'text-white' : ''}>Peso (g)</Label>
                      <Input
                        id="peso"
                        type="number"
                        value={peso || ""}
                        onChange={(e) => setPeso(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1 w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="preco-kg" className={isDarkMode ? 'text-white' : ''}>Preço KG (R$)</Label>
                      <Input
                        id="preco-kg"
                        type="number"
                        step="0.01"
                        value={precoKg || ""}
                        onChange={(e) => setPrecoKg(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1 w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="t-imp" className={isDarkMode ? 'text-white' : ''}>Tempo Impressão (HH:mm)</Label>
                      <TimeMaskInput
                        value={tImp.toString()}
                        onChange={(value) => setTImp(value ? parseFloat(value) : 0)}
                        placeholder="00:00"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="t-pos" className={isDarkMode ? 'text-white' : ''}>Acabamento (HH:mm)</Label>
                      <TimeMaskInput
                        value={(tPosHoras + tPosMinutos / 60).toString()}
                        onChange={(value) => {
                          if (value) {
                            const totalHours = parseFloat(value);
                            setTPosHoras(Math.floor(totalHoras));
                            setTPosMinutos(Math.round((totalHoras % 1) * 60));
                          } else {
                            setTPosHoras(0);
                            setTPosMinutos(0);
                          }
                        }}
                        placeholder="00:00"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="qtd" className={isDarkMode ? 'text-white' : ''}>Quantidade</Label>
                      <Input
                        id="qtd"
                        type="number"
                        value={qtdKit || ""}
                        onChange={(e) => setQtdKit(e.target.value ? parseFloat(e.target.value) : 1)}
                        className="mt-1 w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coluna 2: Taxas e Impostos */}
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">🛒 Taxas e Impostos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="icms"
                        checked={chkIcms}
                        onCheckedChange={(checked) => setChkIcms(checked as boolean)}
                      />
                      <Label htmlFor="icms" className="cursor-pointer text-sm">
                        ICMS (Estado)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="iss"
                        checked={chkIss}
                        onCheckedChange={(checked) => setChkIss(checked as boolean)}
                      />
                      <Label htmlFor="iss" className="cursor-pointer text-sm">
                        ISS (5%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="risco"
                        checked={chkRisco}
                        onCheckedChange={(checked) => setChkRisco(checked as boolean)}
                      />
                      <Label htmlFor="risco" className="cursor-pointer text-sm">
                        10% Risco/Falha
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclusivo"
                        checked={exclusivo}
                        onCheckedChange={(checked) => setExclusivo(checked as boolean)}
                      />
                      <Label htmlFor="exclusivo" className="cursor-pointer text-sm">
                        💎 Modelagem Própria
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shopee"
                        checked={mkpShopee}
                        onCheckedChange={(checked) => setMkpShopee(checked as boolean)}
                      />
                      <Label htmlFor="shopee" className="cursor-pointer text-sm">
                        Shopee (15%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ml"
                        checked={mkpMl}
                        onCheckedChange={(checked) => setMkpMl(checked as boolean)}
                      />
                      <Label htmlFor="ml" className="cursor-pointer text-sm">
                        Mercado Livre (17%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 col-span-2">
                      <Checkbox
                        id="frete"
                        checked={chkFrete}
                        onCheckedChange={(checked) => setChkFrete(checked as boolean)}
                      />
                      <Label htmlFor="frete" className="cursor-pointer text-sm">
                        Incluir Frete
                      </Label>
                    </div>
                  </div>

                  {chkFrete && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Label htmlFor="v-frete-modal">Valor Frete (R$)</Label>
                      <Input
                        id="v-frete-modal"
                        type="number"
                        step="0.01"
                        value={vFrete || ""}
                        onChange={(e) => setVFrete(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Label htmlFor="desc-kit">Desconto Kit (%): {descKit}%</Label>
                    <Slider
                      id="desc-kit"
                      min={0}
                      max={50}
                      step={1}
                      value={[descKit]}
                      onValueChange={(value) => setDescKit(value[0])}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Coluna 3: Resultados */}
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">💰 Resultados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resUn && (
                    <>
                      <div>
                        <Label className="text-sm text-gray-600">Preço Unitário</Label>
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-mono text-blue-900">{resUn}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resUn)}
                            className="mt-2 w-full"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      {qtdKit > 1 && (
                        <div>
                          <Label className="text-sm text-gray-600">Preço Total (Lote)</Label>
                          <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-mono text-green-900">{resKit}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(resKit)}
                              className="mt-2 w-full"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm text-gray-600">Custos Totais</Label>
                        <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm font-mono text-yellow-900">{resCustoTotal}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resCustoTotal)}
                            className="mt-2 w-full"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-gray-600">WhatsApp</Label>
                        <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-mono text-purple-900 whitespace-pre-wrap">
                            {resZap}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resZap)}
                            className="mt-2 w-full"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={shareWhatsApp}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button
                          onClick={downloadOrcamento}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="hidden lg:flex justify-center">
              <Button
                onClick={handleCalcular}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-bold rounded-lg"
              >
                CALCULAR
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="configuracoes">
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : ''}>⚙️ Configurações</CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>Defina os parâmetros padrão da sua operação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maquina" className={isDarkMode ? 'text-white' : ''}>Máquina Padrão</Label>
                    <Select value={nomeMaquina} onValueChange={setNomeMaquina}>
                      <SelectTrigger id="maquina" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(maquinasBrasil).map(([nome]) => (
                          <SelectItem key={nome} value={nome}>
                            {nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="custo-maq" className={isDarkMode ? 'text-white' : ''}>Custo Máquina (R$/h)</Label>
                    <Input
                      id="custo-maq"
                      type="number"
                      step="0.01"
                      value={cMaq || ""}
                      onChange={(e) => setCMaq(e.target.value ? parseFloat(e.target.value) : 0)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado" className={isDarkMode ? 'text-white' : ''}>Estado</Label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger id="estado" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(aliquotasIcms).map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="v-hora" className={isDarkMode ? 'text-white' : ''}>Sua Hora (R$)</Label>
                    <Input
                      id="v-hora"
                      type="number"
                      step="0.01"
                      value={vHora || ""}
                      onChange={(e) => setVHora(e.target.value ? parseFloat(e.target.value) : 0)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mult-excl" className={isDarkMode ? 'text-white' : ''}>Multiplicador Exclusivo</Label>
                    <Input
                      id="mult-excl"
                      type="number"
                      step="0.1"
                      value={multExcl || ""}
                      onChange={(e) => setMultExcl(e.target.value ? parseFloat(e.target.value) : 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  onClick={saveConfig}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-4"
                >
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : ''}>⚡️ Histórico de Orçamentos</CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>Todos os orçamentos calculados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Buscar por cliente ou peca..."
                  value={buscaHistorico}
                  onChange={(e) => setBuscaHistorico(e.target.value)}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
                {historico.length === 0 ? (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum orçamento calculado ainda</p>
                ) : (
                  <div className="space-y-3">
                    {historico
                      .filter((item) =>
                        item.cliente.toLowerCase().includes(buscaHistorico.toLowerCase()) ||
                        item.peca.toLowerCase().includes(buscaHistorico.toLowerCase())
                      )
                      .map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.cliente} - {item.peca}
                            </p>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {item.data}
                            </p>
                            <p className={`text-sm mt-2 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Unitário: {item.precoUnitario} | Lote: {item.precoLote || '-'} | Qtd: {item.quantidade}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => reorcarItem(item)}
                              className={isDarkMode ? 'text-orange-400 hover:text-orange-300' : ''}
                              title="Reorcar este item"
                            >
                              Reorcar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(item.whatsapp)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
