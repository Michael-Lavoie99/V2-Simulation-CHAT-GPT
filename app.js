const personas = [
  {
    id: "famille",
    nom: "Sophia Tremblay",
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

const intentLexicon = {
  budget: ["budget", "mensual", "paiement", "acompte", "financement", "argent"],
  usage: ["utilisation", "usage", "kilométrage", "trajet", "route", "ville"],
  vehicle: ["version", "moteur", "équipement", "caractéristique", "technologie", "sécurité"],
  trust: ["garantie", "inspection", "fiabilité", "historique", "entretien"],
  offer: ["offre", "prix", "rabais", "promotion", "frais", "taxe"],
  close: ["signature", "contrat", "livraison", "date", "réserver", "prochaine étape"],
  tradeIn: ["reprise", "échange", "ancien véhicule"],
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
  discussedTopics: new Set(),
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

function pick(options) {
  return options[Math.floor(Math.random() * options.length)];
}

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
  state.discussedTopics = new Set();
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

function detectIntents(message) {
  const lower = message.toLowerCase();
  const intents = Object.entries(intentLexicon)
    .filter(([, keywords]) => keywords.some((keyword) => lower.includes(keyword)))
    .map(([intent]) => intent);

  intents.forEach((intent) => state.discussedTopics.add(intent));

  return intents;
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

function askFollowUpQuestion(persona, intents) {
  if (intents.includes("budget")) {
    return "Est-ce que vous pouvez me montrer deux scénarios de paiement pour comparer facilement?";
  }

  if (intents.includes("vehicle")) {
    return "Parmi les versions disponibles, laquelle serait la plus logique pour mon usage réel?";
  }

  if (intents.includes("offer") || intents.includes("close")) {
    return "Si on s'entend aujourd'hui, pouvez-vous me résumer toutes les étapes jusqu'à la livraison?";
  }

  if (intents.includes("usage")) {
    return "Selon mon rythme de conduite, vous iriez vers quelle motorisation et pourquoi?";
  }

  const notDiscussed = ["budget", "usage", "vehicle", "offer", "close"].filter(
    (intent) => !state.discussedTopics.has(intent)
  );

  if (notDiscussed.length > 0) {
    const next = notDiscussed[0];
    if (next === "budget") {
      return "Avant d'aller plus loin, j'aimerais clarifier le budget total mensuel, incluant les frais.";
    }
    if (next === "usage") {
      return "Je veux être certain que le véhicule est adapté à mon utilisation au quotidien, vous pouvez valider ça avec moi?";
    }
    if (next === "vehicle") {
      return `Quels équipements vous recommandez en priorité pour répondre à mes besoins: ${persona.objectifs.slice(0, 2).join(" et ")}?`;
    }
    if (next === "offer") {
      return "Quand on parlera du prix, j'aurai besoin d'un détail transparent de chaque poste.";
    }
    if (next === "close") {
      return "J'aimerais savoir les délais exacts et ce qu'il faut signer pour avancer.";
    }
  }

  return pick([
    "Pouvez-vous me conseiller franchement, comme si c'était pour vous?",
    "Je veux éviter une mauvaise surprise après l'achat; qu'est-ce que je devrais vérifier en priorité?",
    "Je suis ouvert, mais j'ai besoin d'arguments concrets pour prendre une décision aujourd'hui.",
  ]);
}

function composeIntentAnswer(intent, persona) {
  if (intent === "budget") {
    return `Côté budget, ${persona.contraintes[0]}. Je veux une mensualité stable et prévisible.`;
  }

  if (intent === "usage") {
    return `Mon usage principal tourne autour de ${persona.objectifs.slice(0, 2).join(" et ")}, donc je veux quelque chose de durable.`;
  }

  if (intent === "vehicle") {
    return `Ce qui m'intéresse surtout: ${persona.preferences.join(", ")}. Si vous reliez ça à mon quotidien, ça m'aide beaucoup.`;
  }

  if (intent === "trust") {
    return state.vehicleType === "occasion"
      ? "J'ai besoin d'un rapport d'inspection complet et d'un historique limpide pour avoir confiance."
      : "Je veux comprendre la garantie de base, ses limites, puis les options prolongées pertinentes.";
  }

  if (intent === "offer") {
    return `${persona.objectionPrix} Je veux aussi un détail clair des frais avant toute signature.`;
  }

  if (intent === "close") {
    return `${persona.closingSignal} Si vous m'expliquez les prochaines étapes simplement, je peux avancer.`;
  }

  if (intent === "tradeIn") {
    return "J'ai un véhicule à échanger. Je veux une évaluation juste, avec une logique de marché claire.";
  }

  return "";
}

function fallbackSpontaneousReply(message, persona) {
  const lastAgentMessages = state.messages
    .filter((item) => item.role === "agent")
    .slice(-3)
    .map((item) => item.text)
    .join(" ")
    .toLowerCase();

  const isQuestion = message.includes("?");

  if (lastAgentMessages.includes("pourquoi") || lastAgentMessages.includes("expliquer")) {
    return `Bonne question. Dans ma situation, je priorise ${persona.objectifs[0]} et ${persona.objectifs[1]}, donc j'ai besoin d'une recommandation vraiment justifiée.`;
  }

  if (isQuestion) {
    return `Je n'ai pas forcément tous les détails techniques, mais je peux vous dire ce qui compte pour moi: ${persona.preferences.slice(0, 2).join(" et ")}.`;
  }

  return pick([
    `Je vous suis, mais j'ai encore besoin d'être rassuré sur ${persona.objectifs[0]} avant de me décider.`,
    "Merci, c'est clair jusqu'ici. Si vous me donnez un exemple concret, je vais me projeter plus facilement.",
    "J'apprécie l'approche. Continuez avec des chiffres simples et je vais pouvoir comparer rapidement.",
  ]);
}

function replyToSalesMessage(message) {
  const persona = state.persona;
  const intents = detectIntents(message);
  const greeting = /\b(bonjour|bonsoir|salut)\b/i.test(message);

  if (greeting) {
    return `Bonjour, je suis ${persona.nom}. ${persona.situation} Je regarde actuellement une voiture ${state.vehicleType}.`;
  }

  if (intents.length === 0) {
    const freeReply = fallbackSpontaneousReply(message, persona);
    const followUp = askFollowUpQuestion(persona, intents);
    return `${freeReply} ${followUp}`;
  }

  const parts = intents
    .map((intent) => composeIntentAnswer(intent, persona))
    .filter(Boolean)
    .slice(0, 2);

  const followUp = askFollowUpQuestion(persona, intents);
  return `${parts.join(" ")} ${followUp}`;
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
