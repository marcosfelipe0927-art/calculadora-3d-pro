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
import { toast } from "sonner";
import {
  calcularPro,
  custoEnergiaKwh,
  maquinasBrasil,
  aliquotasIcms,
  type ParametrosCalculo,
} from "@/lib/calculadora";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";

// Lista de Tokens Cadastrados
const listaTokens: Record<string, { nome: string; email: string }> = {
  "TOKEN123": { nome: "Cliente 1", email: "cliente1@email.com" },
  "TOKEN456": { nome: "Cliente 2", email: "cliente2@email.com" },
  "TOKEN789": { nome: "Cliente 3", email: "cliente3@email.com" },
};

const SENHA_MESTRE = "antony@";

// Função para gerar fingerprint do dispositivo
const generateFingerprint = (): string => {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return btoa(`${ua}|${screen}|${lang}|${tz}`);
};

export default function Home() {
  // Controle de Acesso
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [senhaInput, setSenhaInput] = useState<string>("");
  const [showSenhaModal, setShowSenhaModal] = useState<boolean>(false);

  // Estado da Calculadora
  const [nomeCliente, setNomeCliente] = useState("");
  const [nomePeca, setNomePeca] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [peso, setPeso] = useState<number>(0);
  const [precoKg, setPrecoKg] = useState<number>(69.99);
  const [tImp, setTImp] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
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

  // useEffect para carregar dados do localStorage e verificar autenticação
  useEffect(() => {
    // Verificar token autenticado
    const savedToken = localStorage.getItem('calculadora_token');
    const savedFingerprint = localStorage.getItem('calculadora_fingerprint');
    const currentFingerprint = generateFingerprint();
    
    if (savedToken && listaTokens[savedToken]) {
      if (savedFingerprint === currentFingerprint) {
        setIsAuthenticated(true);
        setTokenInput(savedToken);
      } else {
        localStorage.removeItem('calculadora_token');
        localStorage.removeItem('calculadora_fingerprint');
        toast.error('Este token já está em uso em outro dispositivo');
      }
    }
    
    // Verificar se é admin
    const isAdminSaved = localStorage.getItem('calculadora_admin') === 'true';
    setIsAdmin(isAdminSaved);
    
    // Carregar configurações
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

  // Função para fazer login com token
  const handleTokenLogin = () => {
    if (!tokenInput.trim()) {
      toast.error('Digite um token');
      return;
    }
    
    if (!listaTokens[tokenInput]) {
      toast.error('Token inválido');
      return;
    }
    
    const fingerprint = generateFingerprint();
    const savedFingerprint = localStorage.getItem('calculadora_fingerprint');
    
    if (savedFingerprint && savedFingerprint !== fingerprint) {
      toast.error('Este token já está em uso em outro dispositivo');
      return;
    }
    
    localStorage.setItem('calculadora_token', tokenInput);
    localStorage.setItem('calculadora_fingerprint', fingerprint);
    setIsAuthenticated(true);
    toast.success(`Bem-vindo, ${listaTokens[tokenInput].nome}!`);
  };

  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem('calculadora_token');
    localStorage.removeItem('calculadora_fingerprint');
    localStorage.removeItem('calculadora_admin');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setTokenInput('');
    setSenhaInput('');
    toast.success('Desconectado');
  };

  // Função para verificar senha ADM
  const handleAdminLogin = () => {
    if (senhaInput === SENHA_MESTRE) {
      localStorage.setItem('calculadora_admin', 'true');
      setIsAdmin(true);
      setShowSenhaModal(false);
      setSenhaInput('');
      toast.success('Acesso de administrador liberado!');
    } else {
      toast.error('Senha incorreta');
      setSenhaInput('');
    }
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
      chkIcms,
      chkIss,
      chkRisco,
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
    toast.success('Configurações salvas!');
  };

  const addToHistorico = () => {
    const novoItem = {
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR'),
      cliente: nomeCliente || 'Cliente',
      peca: nomePeca || 'Peça',
      precoUnitario: resUn,
      precoLote: resKit,
      quantidade: qtdKit,
      custos: resCustoTotal,
      whatsapp: resZap,
    };
    const novoHistorico = [novoItem, ...historico].slice(0, 10);
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
    a.download = `orcamento-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tela de Bloqueio (Gatekeeper)
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
              <Label htmlFor="token">Token de Acesso</Label>
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
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

        <Tabs defaultValue="calculadora" className="w-full">
          <div className="flex justify-center items-center gap-4 mb-8">
            <TabsList className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} ${isDarkMode ? 'bg-gray-800' : ''}`}>
              <TabsTrigger value="calculadora">📊 Calcular</TabsTrigger>
              {isAdmin && <TabsTrigger value="configuracoes">⚙️ Ajustes</TabsTrigger>}
              {isAdmin && <TabsTrigger value="historico">⏱️ Histórico</TabsTrigger>}
            </TabsList>
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="outline"
              size="icon"
              className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </Button>
          </div>

          <TabsContent value="calculadora">
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isDarkMode ? 'text-white' : ''}`}>
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle>🍕 Dados da Peça</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cliente">Cliente</Label>
                      <Input
                        id="cliente"
                        placeholder="Nome"
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                        className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="peca">Peça</Label>
                      <Input
                        id="peca"
                        placeholder="Descrição"
                        value={nomePeca}
                        onChange={(e) => setNomePeca(e.target.value)}
                        className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Select value={material} onValueChange={setMaterial}>
                        <SelectTrigger id="material" className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}>
                          <SelectItem value="PLA">PLA</SelectItem>
                          <SelectItem value="ABS">ABS</SelectItem>
                          <SelectItem value="PETG">PETG</SelectItem>
                          <SelectItem value="TPU">TPU</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="peso">Peso (g)</Label>
                      <Input
                        id="peso"
                        type="number"
                        placeholder="0"
                        value={peso || ""}
                        onChange={(e) => setPeso(e.target.value ? parseFloat(e.target.value) : 0)}
                        className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preco-kg">Preço KG (R$)</Label>
                      <Input
                        id="preco-kg"
                        type="number"
                        step="0.01"
                        value={precoKg || ""}
                        onChange={(e) => setPrecoKg(e.target.value ? parseFloat(e.target.value) : 0)}
                        className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="tempo-imp">Tempo Impressão (h)</Label>
                      <Input
                        id="tempo-imp"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={tImp || ""}
                        onChange={(e) => setTImp(e.target.value ? parseFloat(e.target.value) : 0)}
                        className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="acabamento-h">Acabamento - Horas</Label>
                      <Input
                        id="acabamento-h"
                        type="number"
                        placeholder="0"
                        value={tPosHoras || ""}
                        onChange={(e) => setTPosHoras(e.target.value ? parseFloat(e.target.value) : 0)}
                        className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="acabamento-m">Minutos</Label>
                      <Input
                        id="acabamento-m"
                        type="number"
                        placeholder="0"
                        value={tPosMinutos || ""}
                        onChange={(e) => setTPosMinutos(e.target.value ? parseFloat(e.target.value) : 0)}
                        className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={qtdKit}
                      onChange={(e) => setQtdKit(e.target.value ? parseFloat(e.target.value) : 1)}
                      className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle>📊 Taxas e Impostos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="icms"
                        checked={chkIcms}
                        onCheckedChange={(checked) => setChkIcms(checked as boolean)}
                      />
                      <Label htmlFor="icms" className="text-sm">ICMS (Estado)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="iss"
                        checked={chkIss}
                        onCheckedChange={(checked) => setChkIss(checked as boolean)}
                      />
                      <Label htmlFor="iss" className="text-sm">ISS (5%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="risco"
                        checked={chkRisco}
                        onCheckedChange={(checked) => setChkRisco(checked as boolean)}
                      />
                      <Label htmlFor="risco" className="text-sm">10% Risco/Falha</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclusivo"
                        checked={exclusivo}
                        onCheckedChange={(checked) => setExclusivo(checked as boolean)}
                      />
                      <Label htmlFor="exclusivo" className="text-sm">💎 Modelagem Própria</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shopee"
                        checked={mkpShopee}
                        onCheckedChange={(checked) => setMkpShopee(checked as boolean)}
                      />
                      <Label htmlFor="shopee" className="text-sm">Shopee (15%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ml"
                        checked={mkpMl}
                        onCheckedChange={(checked) => setMkpMl(checked as boolean)}
                      />
                      <Label htmlFor="ml" className="text-sm">Mercado Livre (17%)</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="frete"
                        checked={chkFrete}
                        onCheckedChange={(checked) => setChkFrete(checked as boolean)}
                      />
                      <Label htmlFor="frete" className="text-sm">Incluir Frete</Label>
                    </div>
                    {chkFrete && (
                      <div>
                        <Label htmlFor="valor-frete">Valor Frete (R$)</Label>
                        <Input
                          id="valor-frete"
                          type="number"
                          step="0.01"
                          value={vFrete}
                          onChange={(e) => setVFrete(e.target.value ? parseFloat(e.target.value) : 0)}
                          className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="desconto">Desconto Kit (%): {descKit}%</Label>
                    <Slider
                      id="desconto"
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

              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle>🎉 Resultados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resUn && (
                    <>
                      <div>
                        <Label className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Preço Unitário</Label>
                        <div className={`mt-2 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                          <p className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>{resUn}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resUn)}
                            className="mt-2 w-full"
                            style={{color: '#f54900'}}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      {qtdKit > 1 && (
                        <div>
                          <Label className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Preço Total (Lote)</Label>
                          <div className={`mt-2 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
                            <p className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-green-900'}`}>{resKit}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(resKit)}
                              className="mt-2 w-full"
                              style={{color: '#f54900'}}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Custos Totais</Label>
                        <div className={`mt-2 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-200'}`}>
                          <p className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-yellow-900'}`}>{resCustoTotal}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resCustoTotal)}
                            className="mt-2 w-full"
                            style={{color: '#f54900'}}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>WhatsApp</Label>
                        <div className={`mt-2 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'}`}>
                          <p className={`text-xs font-mono whitespace-pre-wrap ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                            {resZap}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(resZap)}
                            className="mt-2 w-full"
                            style={{color: '#f54900'}}
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
                          className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''}`}
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

            <div className="hidden lg:flex justify-center mt-8">
              <Button
                onClick={handleCalcular}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-bold rounded-lg"
              >
                CALCULAR
              </Button>
            </div>
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="configuracoes">
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>⚙️ Configurações</CardTitle>
                    <CardDescription>Defina os parâmetros padrão da sua operação</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="maquina">Máquina Padrão</Label>
                        <Select value={nomeMaquina} onValueChange={setNomeMaquina}>
                          <SelectTrigger id="maquina" className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}>
                            {Object.entries(maquinasBrasil).map(([nome]) => (
                              <SelectItem key={nome} value={nome}>
                                {nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="custo-maq">Custo Máquina (R$/h)</Label>
                        <Input
                          id="custo-maq"
                          type="number"
                          step="0.01"
                          value={cMaq || ""}
                          onChange={(e) => setCMaq(e.target.value ? parseFloat(e.target.value) : 0)}
                          className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Select value={estado} onValueChange={setEstado}>
                          <SelectTrigger id="estado" className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}>
                            {Object.keys(aliquotasIcms).map((uf) => (
                              <SelectItem key={uf} value={uf}>
                                {uf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="v-hora">Sua Hora (R$)</Label>
                        <Input
                          id="v-hora"
                          type="number"
                          step="0.01"
                          value={vHora || ""}
                          onChange={(e) => setVHora(e.target.value ? parseFloat(e.target.value) : 0)}
                          className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                      </div>

                      <div>
                        <Label htmlFor="mult-excl">Multiplicador Exclusivo</Label>
                        <Input
                          id="mult-excl"
                          type="number"
                          step="0.1"
                          value={multExcl || ""}
                          onChange={(e) => setMultExcl(e.target.value ? parseFloat(e.target.value) : 0)}
                          className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
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
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>⏱️ Histórico de Orçamentos</CardTitle>
                    <CardDescription>Últimos 10 orçamentos calculados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historico.length === 0 ? (
                      <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum orçamento calculado ainda</p>
                    ) : (
                      <div className="space-y-3">
                        {historico.map((item) => (
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
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(item.whatsapp)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="flex lg:hidden justify-center mt-8">
          <Button
            onClick={handleCalcular}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-bold rounded-lg w-full"
          >
            CALCULAR
          </Button>
        </div>
      </div>

      {/* Footer com Botão ADM Escondido */}
      <footer className={`mt-16 py-8 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto flex justify-center">
          <Button
            onClick={() => setShowSenhaModal(true)}
            variant="ghost"
            className={`text-sm ${isDarkMode ? 'text-gray-800 hover:text-gray-700' : 'text-gray-100 hover:text-gray-200'}`}
          >
            •
          </Button>
        </div>
      </footer>

      {/* Modal de Senha ADM */}
      {showSenhaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className={`w-full max-w-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle>Acesso de Administrador</CardTitle>
              <CardDescription>Digite a senha mestre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Digite a senha"
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Confirmar
                </Button>
                <Button
                  onClick={() => {
                    setShowSenhaModal(false);
                    setSenhaInput('');
                  }}
                  variant="outline"
                  className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''}`}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
