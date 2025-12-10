import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const genAI = new GoogleGenerativeAI("");

const searchBtn = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const resultsBox = document.getElementById("results");

searchBtn.addEventListener("click", async () => {
  const keywords = document.getElementById("keywords").value.trim();
  const state = document.getElementById("state").value.trim();

  if (!keywords) return showError("Digite palavras-chave!");
  if (!state) return showError("Digite o estado!");

  clearUI();
  loading.style.display = "block";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Você é um assistente que retorna EXCLUSIVAMENTE JSON. 
NUNCA use blocos de código. 
Formato OBRIGATÓRIO:

[
  {
    "nome": "",
    "local": "",
    "link": "",
    "resumo": ""
  }
]

Palavras-chave: ${keywords}
Estado: ${state}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // 🔥 Remove blocos markdown tipo ```json ... ```
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```json|```js|```/g, "").trim();
    });

    // 🔥 Remove crases soltas
    text = text.replace(/`/g, "").trim();

    let items;

    try {
      items = JSON.parse(text);
    } catch (err) {
      return showError("Formato inesperado da IA:\n\n" + text);
    }

    showResults(items);

  } catch (e) {
    console.error(e);
    showError("Erro inesperado. Tente novamente.");
  } finally {
    loading.style.display = "none";
  }
});

function showError(msg) {
  errorBox.style.display = "block";
  errorBox.innerText = msg;
}

function clearUI() {
  errorBox.style.display = "none";
  errorBox.innerText = "";
  resultsBox.innerHTML = "";
}

function showResults(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    resultsBox.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }

  arr.forEach(item => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <strong>${item.nome || "Sem nome"}</strong><br>
      ${item.local || "Sem local"}<br>
      <a href="${item.link}" target="_blank">Abrir edital</a><br>
      <p>${item.resumo || ""}</p>
    `;
    resultsBox.appendChild(div);
  });
}

