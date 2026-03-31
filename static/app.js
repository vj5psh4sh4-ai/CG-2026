/**
 * Le chemin de l'idée — Frontend App
 * Comptoir Gruérien · Bulle 2026
 *
 * Configuration API :
 *   Si vous souhaitez appeler directement un LLM externe (OpenAI, Perplexity…),
 *   décommentez et renseignez les constantes ci-dessous.
 *   Par défaut, le frontend envoie les requêtes au backend local /api/analyze.
 *
 *   const API_BASE_URL = "https://api.openai.com/v1/chat/completions";
 *   const API_KEY      = "sk-VOTRE_CLE_ICI";
 *   const MODEL_NAME   = "gpt-4.1-mini";
 */

// ============================================================
// SYSTEM PROMPT (copie exacte de la spec)
// ============================================================
const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la transformation d'idées en concepts de projets, d'orientation et de prototypage pour un salon intitulé "Le chemin de l'idée".

L'utilisateur décrit une idée. Tu dois répondre en UNE FOIS, en suivant STRICTEMENT les sections ci-dessous. Pas de questions de ta part, pas de dialogue multi-tours.

Structure de ta réponse (en Markdown simple) :

### L'IDÉE
- Reformule l'idée de façon claire, neutre et synthétique.
- Maximum 200 caractères.
- N'ajoute aucune interprétation excessive.

### ET SI ÇA DEVENAIT UN PRODUIT ?
- Décris sous quelle forme de produit ou service l'idée pourrait être développée.
- Maximum 250 caractères.

### QUELLE FORMATION CORRESPOND À CETTE IDÉE ? (VOIE HES)
Propose UNE ou PLUSIEURS formations de Bachelor de la voie HES (HES-SO), en te basant sur les familles suivantes (extraites de listes officielles de bachelors HES/SO et UNIFR) :
- Numérique / Informatique : Informatique et systèmes de communication (HEIA-FR), Informatique de gestion (HEG), Information Science, International Business Management, etc.
- Ingénierie / Technique : Génie civil, Génie électrique, Génie mécanique, Microtechniques, Énergie et techniques environnementales, Industrial Design Engineering, Ingénierie et gestion industrielles, Ingénierie des sciences du vivant.
- Chimie / Matériaux : Chimie (HEIA-FR).
- Construction / Architecture : Architecture (HEIA-FR), Architecture du paysage, Génie civil.
- Business / Tourisme : Économie d'entreprise, Informatique de gestion, Tourisme, Hôtellerie et professions de l'accueil, Droit économique.
- Santé / Social / Éducation : Soins infirmiers, Psychomotricité, Travail social.
- Arts / Design : Architecture d'intérieur, Arts visuels, Cinéma, Communication visuelle, Conservation-restauration.

Règles :
- Choisis 1 à 3 bachelors HES pertinents par rapport à l'idée.
- Quand c'est technique/ingénierie/numérique, privilégie si possible une filière HEIA-FR.
- Pour chaque formation, indique :
  - le nom exact du Bachelor,
  - une courte justification (1 phrase).
- Ne JAMAIS inventer de filière hors de ces familles.

### QUELLE FORMATION CORRESPOND À CETTE IDÉE ? (VOIE UNIVERSITAIRE)
Propose UNE ou PLUSIEURS formations universitaires, surtout à l'Université de Fribourg (UNIFR) et liées à l'Adolphe Merkle Institute (AMI), selon les familles :
- Management / Économie / Business : Management, Économie politique, Études économiques et juridiques, Communication et médias, Informatique de gestion (UNIFR SES).
- Sciences exactes / Matériaux : Sciences exactes et naturelles (chimie, physique, biologie), Informatique et digitalisation, liens possibles avec AMI (matériaux avancés, nanosciences).
- Lettres / Langues / Culture : Lettres et langues, Langues et littératures, Philosophie, Plurilinguisme et didactique.
- Sciences sociales / Éducation / Santé : Sciences sociales, Pédagogie et enseignement, Médecine humaine / sciences du sport (si idée liée au sport/santé).

Règles :
- Choisis 1 à 3 bachelors universitaires pertinents.
- Pour chaque formation, indique :
  - le nom du Bachelor,
  - une courte justification (1 phrase).
- Ne JAMAIS inventer de filière hors de ces familles.

### POTENTIEL DE L'IDÉE ?
Affiche EXACTEMENT le texte suivant, sans modification :
Une idée seule n'a pas de valeur tant qu'elle n'est pas réalisée. Alors comment faire?
**1) Prototype**:
Pour commencer, il faut définir un prototype pour voir si ça fonctionne.
--> Découvre la zone 2 dédiée au prototypage.
**2) Marché**:
Ensuite, il faut voir si des personnes sont intéressées et disposées à payer pour cela.
--> Découvre la zone 4 dédiée à l'entrepreneuriat.

### QUELQUES IDÉES POUR LE PROTOTYPAGE
- Propose un design de prototype ou un concept de test simple.
- Maximum 500 caractères.
- Exemple de formats : maquette papier, sketch d'interface, questionnaire court, mini-expérimentation, interview de quelques personnes.

### ET APRÈS ?
- En une seule phrase, invite à visiter les autres zones du stand.
- Exemple : "Va maintenant découvrir les autres zones du stand pour en parler avec les équipes.".

Ton style :
- Clair, accessible, pédagogique, sans jargon inutile.
- Pas d'emojis.
- Réponse courte, structurée avec ces titres EXACTS.
- Tu ne poses PAS de questions : tu produis directement la meilleure synthèse possible.`;

// ============================================================
// THEME TOGGLE
// ============================================================
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateToggleIcon(toggle, theme);

  toggle && toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateToggleIcon(toggle, theme);
    toggle.setAttribute('aria-label', `Basculer vers le thème ${theme === 'dark' ? 'clair' : 'sombre'}`);
  });

  function updateToggleIcon(btn, t) {
    if (!btn) return;
    if (t === 'dark') {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
    } else {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }
})();

// ============================================================
// CHAR COUNT
// ============================================================
const textarea = document.getElementById('idea-input');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');

textarea.addEventListener('input', () => {
  const len = textarea.value.length;
  charCount.textContent = `${len} / 1000`;
  analyzeBtn.disabled = len < 5;
});

// ============================================================
// MARKDOWN → HTML (minimal, no external lib)
// ============================================================
function markdownToHtml(md) {
  // Process line by line for better control
  const lines = md.split('\n');
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // H3
    if (/^###\s+/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      const text = line.replace(/^###\s+/, '').trim();
      html += `<h3>${escapeHtml(text)}</h3>`;
      continue;
    }

    // List items
    if (/^-\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      let itemContent = line.replace(/^-\s+/, '').trim();
      itemContent = inlineMarkdown(itemContent);
      // Transform --> lines into styled spans
      itemContent = itemContent.replace(/^--&gt;\s*/g, '<span class="arrow-line">→ </span>');
      html += `<li>${itemContent}</li>`;
      continue;
    }

    // Close list if needed
    if (inList && line.trim() !== '') {
      html += '</ul>';
      inList = false;
    }

    // --> standalone lines
    if (/^-->\s*/.test(line.trim())) {
      const content = line.replace(/^-->\s*/, '').trim();
      html += `<p><span class="arrow-line">→ ${escapeHtml(content)}</span></p>`;
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }

    // Default paragraph
    html += `<p>${inlineMarkdown(line)}</p>`;
  }

  if (inList) html += '</ul>';
  return html;
}

function inlineMarkdown(text) {
  text = escapeHtml(text);
  // Bold **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // --> at start of text (after escaping > becomes &gt;)
  text = text.replace(/^--&gt;\s*/g, '<span class="arrow-line">→ </span>');
  return text;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// API CALL
// ============================================================
/**
 * analyzeIdea — envoie l'idée au backend local /api/analyze
 *
 * Pour appeler directement un LLM externe, adaptez cette fonction :
 *
 *   async function analyzeIdea(ideaText) {
 *     const API_BASE_URL = "https://api.openai.com/v1/chat/completions";
 *     const API_KEY      = "sk-VOTRE_CLE_ICI";
 *     const MODEL_NAME   = "gpt-4.1-mini";
 *
 *     const resp = await fetch(API_BASE_URL, {
 *       method: "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *         "Authorization": "Bearer " + API_KEY
 *       },
 *       body: JSON.stringify({
 *         model: MODEL_NAME,
 *         messages: [
 *           { role: "system", content: SYSTEM_PROMPT },
 *           { role: "user",   content: ideaText }
 *         ]
 *       })
 *     });
 *     const data = await resp.json();
 *     return data.choices[0].message.content;
 *   }
 */
async function analyzeIdea(ideaText) {
  const resp = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea: ideaText }),
  });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }

  const data = await resp.json();
  return data.result;
}

// ============================================================
// UI LOGIC
// ============================================================
const resultSection = document.getElementById('result-section');
const resultContent = document.getElementById('result-content');
const errorBanner   = document.getElementById('error-banner');
const resetBtn      = document.getElementById('reset-btn');

analyzeBtn.addEventListener('click', async () => {
  const ideaText = textarea.value.trim();
  if (!ideaText || ideaText.length < 5) return;

  // Reset state
  resultSection.hidden = true;
  errorBanner.hidden = true;

  // Loading state
  analyzeBtn.disabled = true;
  analyzeBtn.classList.add('loading');
  analyzeBtn.setAttribute('aria-busy', 'true');

  try {
    const rawResult = await analyzeIdea(ideaText);
    const html = markdownToHtml(rawResult);

    resultContent.innerHTML = html;
    resultSection.hidden = false;

    // Smooth scroll to result
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  } catch (err) {
    console.error('Analyze error:', err);
    errorBanner.hidden = false;
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.classList.remove('loading');
    analyzeBtn.removeAttribute('aria-busy');
  }
});

// Reset button
resetBtn.addEventListener('click', () => {
  textarea.value = '';
  charCount.textContent = '0 / 1000';
  analyzeBtn.disabled = true;
  resultSection.hidden = true;
  errorBanner.hidden = true;
  textarea.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Allow Ctrl+Enter / Cmd+Enter to submit
textarea.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!analyzeBtn.disabled) analyzeBtn.click();
  }
});
