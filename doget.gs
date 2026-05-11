function doGet(e) {
  // Log para monitorar as requisições no painel "Execuções" do Apps Script
  console.log("Parâmetros recebidos: " + JSON.stringify(e.parameter));
  
  var resultado = { encontrado: false, debug: "" };
  
  try {
    const SS_ID = "1e2MfXxnGHnkifeh-uJiRrSYuI8rxbp-GCdWvNpj-lgI";
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("community_members");
    const data = sheet.getDataRange().getValues();
    
    // Captura os parâmetros enviados pelo Widget
    const emailBuscado = (e.parameter.email || "").toLowerCase().trim();
    const ultimoSaldo = parseInt(e.parameter.ultimoSaldo || 0);

    // Parâmetros extras para o Log
    const descricao = e.parameter.descricao || "Acesso/Consulta";
    
    resultado.debug = "Buscando por: " + emailBuscado;

    // Definição dos índices das colunas (A=0, B=1, C=2...)
    const COL_ID = 0;       // Coluna A
    const COL_NOME = 1;     // Coluna B
    const COL_EMAIL = 2;    // Coluna C
    const COL_CPF = 3;      // Coluna D
    const COL_ARRASAS = 10; // Coluna K
    const COL_BADGE = 11;   // Coluna L

    for (var i = 1; i < data.length; i++) {
      var linha = data[i];
      var emailLinha = String(linha[COL_EMAIL] || "").toLowerCase().trim();
      
      if (emailLinha === emailBuscado) {
        var saldoNaPlanilha = parseInt(linha[COL_ARRASAS]) || 0;
        var novoSaldo = saldoNaPlanilha;

        resultado = {
          encontrado: true,
          nome: linha[COL_NOME],
          arrasas: novoSaldo,
          badge: linha[COL_BADGE] || "Aprendiz Curiosa 🐾",
          // Manda festejar se o saldo atual for maior que o que o widget tinha guardado
          festejar: (novoSaldo > ultimoSaldo)
        };
        break;
      }
    }
  } catch (err) {
    console.error("Erro no doGet: " + err.toString());
    resultado.erro = err.toString();
  }

  // Retorno JSONP para garantir que o navegador não bloqueie a resposta (CORS)
  var callback = e.parameter.callback || "callback";
  var json = JSON.stringify(resultado);
  return ContentService.createTextOutput(callback + '(' + json + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}