import { useState } from "react";
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

export default function Home() {
  // Estado da Calculadora
  const [nomeCliente, setNomeCliente] = useState("Miniatura Dragão");
  const [material, setMaterial] = useState("PLA");
  const [peso, setPeso] = useState(17);
  const [precoKg, setPrecoKg] = useState(69.99);
  const [tImp, setTImp] = useState(2.02);
  const [tPos, setTPos] = useState(0);
  const [qtdKit, setQtdKit] = useState(1);

  // Taxas e Impostos
  const [chkIcms, setChkIcms] = useState(false);
  const [chkIss, setChkIss] = useState(false);
  const [chkRisco, setChkRisco] = useState(true);
  const [exclusivo, setExclusivo] = useState(false);
  const [mkpShopee, setMkpShopee] = useState(false);
  const [mkpMl, setMkpMl] = useState(false);
  const [chkFrete, setChkFrete] = useState(false);
  const [descKit, setDescKit] = useState(10);

  // Configurações
  const [nomeMaquina, setNomeMaquina] = useState("Bambu Lab A1");
  const [cMaq, setCMaq] = useState(0.9);
  const [estado, setEstado] = useState("Média Nacional");
  const [vHora, setVHora] = useState(40);
  const [vFrete, setVFrete] = useState(25);
  const [multExcl, setMultExcl] = useState(4.5);

  // Resultados
  const [resUn, setResUn] = useState("");
  const [resKit, setResKit] = useState("");
  const [resZap, setResZap] = useState("");

  const handleCalcular = () => {
    const params: ParametrosCalculo = {
      material,
      peso,
      precoKg,
      tImp,
      tPos,
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
    };

    const resultado = calcularPro(params);
    setResUn(resultado.resUn);
    setResKit(resultado.resKit);
    setResZap(resultado.resZap);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const downloadOrcamento = () => {
    const conteudo = `${resZap}\n\n---\n\nPreço Unitário:\n${resUn}\n\nPreço Total:\n${resKit}`;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(conteudo));
    element.setAttribute("download", `orcamento_${nomeCliente || "peca"}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Orçamento baixado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Calculadora 3D PRO</h1>
          <p className="text-gray-600">Calcule custos e preços para impressão 3D com precisão</p>
        </div>

        <Tabs defaultValue="calculadora" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2">
            <TabsTrigger value="calculadora">📊 Calculadora</TabsTrigger>
            <TabsTrigger value="configuracoes">⚙️ Configurações</TabsTrigger>
          </TabsList>

          {/* ABA: CALCULADORA */}
          <TabsContent value="calculadora" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1: Dados da Peça */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📦 Dados da Peça</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cliente">Cliente/Peça</Label>
                    <Input
                      id="cliente"
                      placeholder="Ex: Miniatura Dragão"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      className="mt-1"
                    />
                  </div>

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
                      value={peso}
                      onChange={(e) => setPeso(parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preco-kg">Preço KG (R$)</Label>
                    <Input
                      id="preco-kg"
                      type="number"
                      step="0.01"
                      value={precoKg}
                      onChange={(e) => setPrecoKg(parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="t-imp">Tempo Impressão (h)</Label>
                    <Input
                      id="t-imp"
                      type="number"
                      step="0.01"
                      value={tImp}
                      onChange={(e) => setTImp(parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="t-pos">Tempo Acabamento (h)</Label>
                    <Input
                      id="t-pos"
                      type="number"
                      step="0.01"
                      value={tPos}
                      onChange={(e) => setTPos(parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qtd">Quantidade</Label>
                    <Input
                      id="qtd"
                      type="number"
                      value={qtdKit}
                      onChange={(e) => setQtdKit(parseFloat(e.target.value))}
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
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="icms"
                        checked={chkIcms}
                        onCheckedChange={(checked) => setChkIcms(checked as boolean)}
                      />
                      <Label htmlFor="icms" className="cursor-pointer">
                        ICMS (Estado)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="iss"
                        checked={chkIss}
                        onCheckedChange={(checked) => setChkIss(checked as boolean)}
                      />
                      <Label htmlFor="iss" className="cursor-pointer">
                        ISS (5%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="risco"
                        checked={chkRisco}
                        onCheckedChange={(checked) => setChkRisco(checked as boolean)}
                      />
                      <Label htmlFor="risco" className="cursor-pointer">
                        10% Risco/Falha
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclusivo"
                        checked={exclusivo}
                        onCheckedChange={(checked) => setExclusivo(checked as boolean)}
                      />
                      <Label htmlFor="exclusivo" className="cursor-pointer">
                        💎 Modelagem Própria
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shopee"
                        checked={mkpShopee}
                        onCheckedChange={(checked) => setMkpShopee(checked as boolean)}
                      />
                      <Label htmlFor="shopee" className="cursor-pointer">
                        Shopee (15%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ml"
                        checked={mkpMl}
                        onCheckedChange={(checked) => setMkpMl(checked as boolean)}
                      />
                      <Label htmlFor="ml" className="cursor-pointer">
                        Mercado Livre (17%)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="frete"
                        checked={chkFrete}
                        onCheckedChange={(checked) => setChkFrete(checked as boolean)}
                      />
                      <Label htmlFor="frete" className="cursor-pointer">
                        Incluir Frete
                      </Label>
                    </div>
                  </div>

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

            {/* Botão Calcular */}
            <div className="flex justify-center">
              <Button
                onClick={handleCalcular}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-12"
              >
                CALCULAR
              </Button>
            </div>
          </TabsContent>

          {/* ABA: CONFIGURAÇÕES */}
          <TabsContent value="configuracoes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna 1: Máquina e Estado */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚙️ Máquina e Localização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maquina">Máquina</Label>
                    <Select value={nomeMaquina} onValueChange={setNomeMaquina}>
                      <SelectTrigger id="maquina" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(maquinasBrasil).map((maq) => (
                          <SelectItem key={maq} value={maq}>
                            {maq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="c-maq">Aluguel Máquina (R$/h)</Label>
                    <Input
                      id="c-maq"
                      type="number"
                      step="0.01"
                      value={cMaq}
                      onChange={(e) => setCMaq(parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Seu Estado</Label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger id="estado" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(custoEnergiaKwh).map((est) => (
                          <SelectItem key={est} value={est}>
                            {est}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Coluna 2: Custos e Margens */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💵 Custos e Margens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="v-hora">Sua Hora (R$)</Label>
                    <Input
                      id="v-hora"
                      type="number"
                      step="0.01"
                      value={vHora}
                      onChange={(e) => setVHora(parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="v-frete">Valor Frete (R$)</Label>
                    <Input
                      id="v-frete"
                      type="number"
                      step="0.01"
                      value={vFrete}
                      onChange={(e) => setVFrete(parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mult-excl">
                      Multiplicador Exclusividade: {multExcl.toFixed(1)}x
                    </Label>
                    <Slider
                      id="mult-excl"
                      min={1}
                      max={30}
                      step={0.5}
                      value={[multExcl]}
                      onValueChange={(value) => setMultExcl(value[0])}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
