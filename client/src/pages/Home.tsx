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
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import {
  calcularPro,
  custoEnergiaKwh,
  maquinasBrasil,
  aliquotasIcms,
  type ParametrosCalculo,
} from "@/lib/calculadora";
import { useState } from "react";

export default function Home() {
  // Estado da Calculadora
  const [nomeCliente, setNomeCliente] = useState("");
  const [nomePeca, setNomePeca] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [peso, setPeso] = useState<number>(17);
  const [precoKg, setPrecoKg] = useState<number>(69.99);
  const [tImp, setTImp] = useState<number>(2.02);
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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-900">🚀 Calculadora 3D PRO</h1>
        </div>

        <Tabs defaultValue="calculadora" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="calculadora">📊 Calculadora</TabsTrigger>
            <TabsTrigger value="configuracoes">⚙️ Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="calculadora">
            {/* Mobile: Dados da Peça */}
            <div className="lg:hidden mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📦 Dados da Peça</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="cliente">Cliente</Label>
                      <Input
                        id="cliente"
                        placeholder="Nome"
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="peca">Peça</Label>
                      <Input
                        id="peca"
                        placeholder="Descrição"
                        value={nomePeca}
                        onChange={(e) => setNomePeca(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Select value={material} onValueChange={setMaterial}>
                        <SelectTrigger id="material" className="mt-1">
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
                      <Label htmlFor="peso">Peso (g)</Label>
                      <Input
                        id="peso"
                        type="number"
                        value={peso || ""}
                        onChange={(e) => setPeso(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
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
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="t-imp">Tempo Impressão (h)</Label>
                      <Input
                        id="t-imp"
                        type="number"
                        step="0.01"
                        value={tImp || ""}
                        onChange={(e) => setTImp(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="t-pos-horas">Acabamento - Horas</Label>
                      <Input
                        id="t-pos-horas"
                        type="number"
                        placeholder="0"
                        value={tPosHoras || ""}
                        onChange={(e) => setTPosHoras(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="t-pos-minutos">Minutos</Label>
                      <Input
                        id="t-pos-minutos"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="59"
                        value={tPosMinutos || ""}
                        onChange={(e) => setTPosMinutos(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qtd">Quantidade</Label>
                    <Input
                      id="qtd"
                      type="number"
                      value={qtdKit || ""}
                      onChange={(e) => setQtdKit(e.target.value ? parseFloat(e.target.value) : 1)}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile: Taxas e Impostos */}
            <div className="lg:hidden mb-6">
              <Card>
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
              <Card>
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

                      <Button
                        onClick={downloadOrcamento}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Orçamento
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Desktop: 3 colunas lado a lado */}
            <div className="hidden lg:grid grid-cols-3 gap-6 mb-6" id="cards-container">
              {/* Coluna 1: Dados da Peça */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📦 Dados da Peça</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="cliente">Cliente</Label>
                      <Input
                        id="cliente"
                        placeholder="Nome"
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="peca">Peça</Label>
                      <Input
                        id="peca"
                        placeholder="Descrição"
                        value={nomePeca}
                        onChange={(e) => setNomePeca(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Select value={material} onValueChange={setMaterial}>
                        <SelectTrigger id="material" className="mt-1">
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
                      <Label htmlFor="peso">Peso (g)</Label>
                      <Input
                        id="peso"
                        type="number"
                        value={peso || ""}
                        onChange={(e) => setPeso(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
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
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="t-imp">Tempo Impressão (h)</Label>
                      <Input
                        id="t-imp"
                        type="number"
                        step="0.01"
                        value={tImp || ""}
                        onChange={(e) => setTImp(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="t-pos-horas">Acabamento - Horas</Label>
                      <Input
                        id="t-pos-horas"
                        type="number"
                        placeholder="0"
                        value={tPosHoras || ""}
                        onChange={(e) => setTPosHoras(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="t-pos-minutos">Minutos</Label>
                      <Input
                        id="t-pos-minutos"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="59"
                        value={tPosMinutos || ""}
                        onChange={(e) => setTPosMinutos(e.target.value ? parseFloat(e.target.value) : 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qtd">Quantidade</Label>
                    <Input
                      id="qtd"
                      type="number"
                      value={qtdKit || ""}
                      onChange={(e) => setQtdKit(e.target.value ? parseFloat(e.target.value) : 1)}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Coluna 2: Taxas e Impostos */}
              <Card>
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
              <Card>
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

                      <Button
                        onClick={downloadOrcamento}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Orçamento
                      </Button>
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
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Configurações</CardTitle>
                <CardDescription>Defina os parâmetros padrão da sua operação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maquina">Máquina Padrão</Label>
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
                    <Label htmlFor="custo-maq">Custo Máquina (R$/h)</Label>
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
                    <Label htmlFor="estado">Estado</Label>
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
                    <Label htmlFor="v-hora">Sua Hora (R$)</Label>
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
                    <Label htmlFor="mult-excl">Multiplicador Exclusivo</Label>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
