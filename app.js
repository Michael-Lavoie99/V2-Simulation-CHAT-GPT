const personas = [
  {
    id: "famille",
    nom: "Sophie Tremblay",
    situation:
      "Mère de deux enfants, habite à Laval, utilise beaucoup la voiture pour école/sport. Budget mensuel serré.",
    objectifs: ["sécurité", "espace coffre", "coût d'entretien", "financement flexible"],
    contraintes: ["paiement mensuel max de 520$", "préfère garantie prolongée"],
    preferences: ["VUS compact", "consommation faible", "connectivité Apple CarPlay"],
    objectionPrix:
      "Ça dépasse un peu ce que je paie actuellement. Quelles options de financement pouvez-vous me proposer?",
    closingSignal:
      "Si la mensualité reste dans mon budget et que la garantie est bonne, je suis prête à avancer aujourd'hui.",
  },
  {
    id: "professionnel",
    nom: "Karim El Mansouri",
    situation:
      "Consultant TI, fait environ 35 000 km/an, souvent sur autoroute, priorise confort et fiabilité.",
    objectifs: ["consommation autoroute", "aides à la conduite", "valeur de revente", "service après-vente"],
    contraintes: ["livraison rapide", "espace pour matériel de travail"],
    preferences: ["berline intermédiaire", "sièges ergonomiques", "version hybride"],
    objectionPrix:
      "Le véhicule me plaît, mais je veux comprendre le coût total de possession sur 5 ans.",
    closingSignal:
      "Avec une bonne reprise et un plan d'entretien clair, je peux signer cette semaine.",
  },
  {
    id: "etudiant",
    nom: "Émile Gagnon",
    situation:
      "Étudiant universitaire à Montréal, premier achat auto, budget limité mais veut une auto fiable pour 5 ans.",
    objectifs: ["prix d'achat", "fiabilité mécanique", "consommation urbaine", "assurances abordables"],
    contraintes: ["acompte faible", "paiements bihebdomadaires"],
    preferences: ["compacte d'occasion", "faible kilométrage", "inspection complète"],
    objectionPrix:
      "J'ai peur des coûts cachés. Est-ce que vous pouvez détailler les frais exacts?",
    closingSignal:
      "Si je vois un rapport d'inspection clair et un prix transparent, je suis motivé à acheter.",
  },
];

const stageConfig = {
  qualification: {
    weight: 40,
    keywords: [
      "budget",
      "utilisation",
      "kilométrage",
      "famille",
      "besoin",
      "priorité",
      "financement",
      "échange",
      "reprise",
      "mensualité",
      "acompte",
      "déplacement",
    ],
  },
  presentation: {
    weight: 35,
    keywords: [
      "caractéristique",
      "équipement",
      "sécurité",
      "consommation",
      "garantie",
      "essai",
      "technologie",
      "compar",
      "moteur",
      "version",
      "autonomie",
      "confort",
    ],
  },
  closing: {
    weight: 25,
    keywords: [
      "offre",
      "prix final",
      "paiement",
      "contrat",
      "signature",
      "livraison",
      "promotion",
      "rabais",
      "date",
      "prochaine étape",
      "engagement",
      "réserver",
    ],
  },
};

const state = {
  persona: null,
  vehicleType: "neuve",
  started: false,
  messages: [],
  matched: {
    qualification: new Set(),
    presentation: new Set(),
    closing: new Set(),
  },
};

const personaSelect = document.getElementById("personaSelect");
const vehicleType = document.getElementById("vehicleType");
const personaSummary = document.getElementById("personaSummary");
const startBtn = document.getElementById("startBtn");
const chatLog = document.getElementById("chatLog");
const messageForm = document.getElementById("messageForm");
const salesInput = document.getElementById("salesInput");
const globalScore = document.getElementById("globalScore");
const qualificationScore = document.getElementById("qualificationScore");
const presentationScore = document.getElementById("presentationScore");
const closingScore = document.getElementById("closingScore");
const qualificationValue = document.getElementById("qualificationValue");
const presentationValue = document.getElementById("presentationValue");
const closingValue = document.getElementById("closingValue");
const feedbackList = document.getElementById("feedbackList");

function init() {
  personaSelect.innerHTML = personas
    .map((persona) => `<option value="${persona.id}">${persona.nom}</option>`)
    .join("");
  state.persona = personas[0];
  updatePersonaSummary();
  refreshScore();
}

function updatePersonaSummary() {
  const persona = getSelectedPersona();
  state.persona = persona;
  personaSummary.innerHTML = `
    <strong>${persona.nom}</strong><br />
    ${persona.situation}<br /><br />
    <strong>Objectifs:</strong> ${persona.objectifs.join(", ")}<br />
    <strong>Contraintes:</strong> ${persona.contraintes.join(", ")}<br />
    <strong>Préférences:</strong> ${persona.preferences.join(", ")}
  `;
}

function getSelectedPersona() {
  return personas.find((persona) => persona.id === personaSelect.value) ?? personas[0];
}

function addMessage(role, text) {
  const time = new Date().toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  state.messages.push({ role, text, time });

  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.innerHTML = `
    <div class="meta">${role === "agent" ? "Représentant" : "Client IA"} • ${time}</div>
    <div>${text}</div>
  `;
  chatLog.appendChild(item);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function resetConversation() {
  chatLog.innerHTML = "";
  state.messages = [];
  state.matched = {
    qualification: new Set(),
    presentation: new Set(),
    closing: new Set(),
  };
  feedbackList.innerHTML = "";
  refreshScore();
}

function detectStageCoverage(text) {
  const clean = text.toLowerCase();
  Object.entries(stageConfig).forEach(([stage, config]) => {
    config.keywords.forEach((keyword) => {
      if (clean.includes(keyword)) {
        state.matched[stage].add(keyword);
      }
    });
  });
}

function scoreFor(stage) {
  const cfg = stageConfig[stage];
  const ratio = state.matched[stage].size / cfg.keywords.length;
  return Math.round(Math.min(1, ratio) * 100);
}

function refreshScore() {
  const q = scoreFor("qualification");
  const p = scoreFor("presentation");
  const c = scoreFor("closing");
  const total = Math.round(
    (q * stageConfig.qualification.weight +
      p * stageConfig.presentation.weight +
      c * stageConfig.closing.weight) /
      100
  );

  qualificationScore.value = q;
  presentationScore.value = p;
  closingScore.value = c;
  qualificationValue.textContent = `${q}%`;
  presentationValue.textContent = `${p}%`;
  closingValue.textContent = `${c}%`;
  globalScore.textContent = `${total}%`;

  const feedback = generateFeedback(q, p, c, total);
  feedbackList.innerHTML = feedback.map((line) => `<li>${line}</li>`).join("");
}

function generateFeedback(q, p, c, total) {
  const notes = [];

  if (q < 60) {
    notes.push(
      "Qualification à améliorer : posez davantage de questions sur le budget, l'usage réel et les contraintes financières du client."
    );
  } else {
    notes.push("Bonne qualification : vos questions permettent de cerner les besoins du client.");
  }

  if (p < 60) {
    notes.push(
      "Présentation partielle : détaillez plus précisément les équipements, la sécurité, la consommation et les avantages concrets du véhicule."
    );
  } else {
    notes.push("Présentation efficace : vous reliez bien les caractéristiques du véhicule aux besoins du client.");
  }

  if (c < 60) {
    notes.push(
      "Finalisation insuffisante : clarifiez les prochaines étapes, les options de paiement, l'offre finale et la livraison."
    );
  } else {
    notes.push("Bonne finalisation : vous avancez vers une décision claire avec une offre structurée.");
  }

  if (total >= 80) {
    notes.push("Excellent niveau global. Continuez à valider les objections et à confirmer l'engagement du client.");
  } else if (total >= 60) {
    notes.push("Performance solide, mais quelques zones restent à approfondir pour maximiser le taux de conversion.");
  } else {
    notes.push("Priorité : structurer l'entretien en 3 phases (qualification, démonstration, conclusion).");
  }

  return notes;
}

function replyToSalesMessage(message) {
  const lower = message.toLowerCase();
  const persona = state.persona;

  if (lower.includes("bonjour") || lower.includes("bonsoir")) {
    return `Bonjour, je suis ${persona.nom}. ${persona.situation} J'aimerais voir une voiture ${state.vehicleType}.`;
  }

  if (
    lower.includes("budget") ||
    lower.includes("mensual") ||
    lower.includes("paiement") ||
    lower.includes("acompte")
  ) {
    return `Côté budget, ${persona.contraintes[0]}. Je veux surtout éviter de dépasser ce montant, même avec assurances et entretien.`;
  }

  if (lower.includes("besoin") || lower.includes("utilisation") || lower.includes("kilométrage")) {
    return `Mes besoins principaux sont : ${persona.objectifs.join(", ")}. Je veux une auto qui reste adaptée pendant plusieurs années.`;
  }

  if (lower.includes("garantie") || lower.includes("inspection") || lower.includes("fiabilité")) {
    return state.vehicleType === "occasion"
      ? "Pour une occasion, j'ai besoin d'un rapport d'inspection détaillé et d'un historique clair pour être rassuré."
      : "Pour une neuve, je veux comprendre exactement la garantie de base et les options prolongées.";
  }

  if (
    lower.includes("caractéristique") ||
    lower.includes("équipement") ||
    lower.includes("sécurité") ||
    lower.includes("technologie")
  ) {
    return `Ce qui compte le plus pour moi : ${persona.preferences.join(", ")}. Pouvez-vous me montrer clairement ce que la version inclut?`;
  }

  if (lower.includes("essai") || lower.includes("test") || lower.includes("conduire")) {
    return "Oui, un essai routier est important pour moi. Je veux évaluer le confort, le bruit et la visibilité.";
  }

  if (lower.includes("offre") || lower.includes("prix") || lower.includes("rabais")) {
    return `${persona.objectionPrix} J'aimerais aussi que vous détailliez les frais avant signature.`;
  }

  if (
    lower.includes("signature") ||
    lower.includes("contrat") ||
    lower.includes("réserver") ||
    lower.includes("livraison")
  ) {
    return `${persona.closingSignal} J'aimerais revoir un résumé écrit avant de confirmer.`;
  }

  if (lower.includes("reprise") || lower.includes("échange")) {
    return "J'ai un véhicule à échanger. Je veux une estimation réaliste basée sur le marché actuel.";
  }

  return `Merci pour ces détails. J'apprécie quand vous prenez le temps d'aller en profondeur. De mon côté, mes priorités restent : ${persona.objectifs.join(", ")}.`;
}

startBtn.addEventListener("click", () => {
  state.started = true;
  state.vehicleType = vehicleType.value;
  state.persona = getSelectedPersona();
  resetConversation();
  addMessage(
    "client",
    `Bonjour, je suis ${state.persona.nom}. ${state.persona.situation} Je souhaite explorer une voiture ${state.vehicleType}.`
  );
});

personaSelect.addEventListener("change", updatePersonaSummary);

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = salesInput.value.trim();

  if (!message) {
    return;
  }

  if (!state.started) {
    addMessage("client", "Veuillez démarrer une simulation avant d'envoyer un message.");
    salesInput.value = "";
    return;
  }

  addMessage("agent", message);
  detectStageCoverage(message);
  refreshScore();

  const reply = replyToSalesMessage(message);
  addMessage("client", reply);

  salesInput.value = "";
});

init();
