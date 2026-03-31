"""
Backend FastAPI — Le chemin de l'idée
Comptoir Gruérien, Bulle 2026
"""

import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Gemini API config ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDOSlt0ZurjvDgCva-XfCyFDj10kTU_JmQ")
GEMINI_MODEL   = "gemini-2.5-flash"
GEMINI_URL     = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

app = FastAPI(title="Le chemin de l'idée")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """Tu es un assistant spécialisé dans la transformation d'idées en concepts de projets, d'orientation et de prototypage pour un salon intitulé "Le chemin de l'idée".

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
- Tu ne poses PAS de questions : tu produis directement la meilleure synthèse possible."""


class IdeaRequest(BaseModel):
    idea: str


@app.post("/api/analyze")
async def analyze_idea(req: IdeaRequest):
    if not req.idea or not req.idea.strip():
        raise HTTPException(status_code=400, detail="L'idée ne peut pas être vide.")

    try:
        payload = {
            "system_instruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "contents": [
                {"role": "user", "parts": [{"text": req.idea.strip()}]}
            ],
            "generationConfig": {
                "maxOutputTokens": 2048,
                "temperature": 0.4
            }
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(GEMINI_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()

        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"result": response_text}

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Erreur Gemini API: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Serve static files
app.mount("/", StaticFiles(directory="static", html=True))