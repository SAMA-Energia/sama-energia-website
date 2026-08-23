# SAMA Energia — Content Architecture Audit & Improvement Plan

**Date:** 2026-08-23 · **Branch:** `draft` (state as of commit `fae14bc`) · **Status: ANALYSIS ONLY — no site changes were made in this task.**
**Method:** seven independent subagent audits (information architecture, cold-reader buyer simulation, copy & tone, heading structure, conversion paths, media plan, future-brand tension), each reading all 20 pages in both languages without seeing each other's output, synthesized by the lead agent. Raw reports in the Appendix.
**Governing constraints:** every recommendation respects the business doctrine (savings first; reserve income scenarios-only; DSO-first; nothing undocumented; provenance tags; no partner names, references, or bios; financing as possibility; hardware-neutral; no fake install imagery; all FI/ET wording is direction only — Madis's native pass owns final copy).
**Access note:** this `docs/` directory is blocked from the published site via `_redirects` (`/docs/* → 404`), same pattern as `/src/*`. The repo itself is public on GitHub.

---

## 1. Executive summary — the five findings that matter most

1. **The FI battery page breaks its own promise at its climax, and it cannot convert.** `/energiavarastot/` promises "Tehomaksu-esimerkki alempana" and delivers a literal `[X,XX €/kW/kk — TARKISTETAAN]` placeholder — the single worst CFO moment on the site (cold reader: verdict NO, the only NO on 20 pages) — and the page has **zero kartoitus CTAs**: a convinced buyer can only exit through the consulting side door or the nav burger. The ET mirror is simultaneously the best page on the site (fully documented Elektrilevi example, callout + CTA). The primary market gets the weakest version of the strongest proof. Fix order: closing CTA now (needs no figures), the documented FI example the moment the anchor-DSO decision lands.

2. **The provenance system — the site's core differentiator — is never explained anywhere.** Six tag grades circulate on both languages (LASKETTAVISSA/ARVUTATAV, KOHDEKOHTAINEN/OBJEKTIPÕHINE, SKENAARIO/STSENAARIUM, DOKUMENTOITU/DOKUMENTEERITUD, MALLINNETTU/MODELLEERITUD, TARKISTETAAN/KONTROLLITAKSE) with **no legend on any page**. Unexplained, a public TARKISTETAAN tag reads as an unfinished site leaked to production; explained, it is the most credible thing on the site — a company showing its own open verification queue. One legend block (home "Miksi meihin voi luottaa" + a one-line version at first tag use per page) is the cheapest, highest-leverage fix in this audit, and it forces a healthy consolidation of the drifting tag taxonomy.

3. **The site's most differentiated offer is inert, three times.** The free second-opinion / quote-review offer ("teemme sen riippumatta siitä, ostatteko meiltä koskaan mitään") appears on the front page (no link), in "Kolme kysymystä mille tahansa toimittavalle" (no link), and as one buried consulting bullet (the only button) — and the contact page never acknowledges quote-review intent at all. The comparing-suppliers buyer — the highest-value audience — has the least-built path on the site.

4. **The conversion page collects but does not re-sell, and the thank-you pages waste the highest-intent moment.** Every reassurance a cold arrival needs (free, non-binding, written output you keep, reply within a working day, "sometimes the answer is no") already exists on the site — none of it is on `/yhteystiedot/`–`/kontakt/`, where ads/search/forwarded traffic lands cold. `/kiitos/`–`/aitah/` offer only a *backwards* ghost button to the front page; doctrine fully allows a what-happens-next strip, a /prosessi/ link, and a prepare-your-data checklist lifted verbatim from step 01.

5. **The future story the founder wants is already on the site — scattered, muted, and framed as compliance.** The hero h1 ("Yhteinen verkko. Itsenäinen energia.") makes the claim; its proof (the ten-thousand-batteries passage) is parked as the last section of a second-tier page; the interactive five-mode diagram — the site's only artifact of "the future already operating" — is filed under retrofit compliance; the monthly-reset arithmetic is bullet two of three. No agent found OVERREACH anywhere: the failure mode is fragmentation, not hype. The fix is routing and emphasis, not new vocabulary — the site never needs the word "tulevaisuus."

Also standing, from the mission-fit sweep: the battery-first "disease" recurs in exactly two places — **ET `/energiasalvestid/` is 51 % tariff calculation** (explainer content outgrowing a service page) and **`/aurinko-ja-akku/` promises solar delivery but spends half its words on retrofit engineering** while home routes "Varavoima" and "Oma tuotanto" promises to it. Nav order, by contrast, is already correct — no reshuffle recommended.

---

## 2. Per-page dossiers

Format per page-pair: mission verdict · h1 verdict + direction · target section outline (numbered; direction, not final copy) · kill list · gap list · media slots · ET/FI parity notes.
Line refs are `src/fi.html` / `src/et.html` as of `fae14bc`.

### 2.1 Front page — `/` · `/`

- **Mission: FIT.** Routes to every main page; legitimately owns "Kenelle" and the three doctrine principles.
- **h1: MOOD (fails the subject test — the only h1 whose SEO title shares zero words with it).** Agents disagree on the fix (see §6.1): fold a subject clause into the h1, or register the mood h1 as a deliberate exception and rely on eyebrow + title. **Founder decision.** Cold reader adds: the kirjallisesti differentiator is the last clause of the lede — below the mobile fold; move it to sentence one regardless of the h1 decision.
- **Target outline:**
  1. Hero — h1 (per decision) + lede leading with the written-answer promise; CTA pair unchanged.
  2. *(decision)* Frequency signature — keep in hero (future-brand/media view) or move below the offer section (cold-reader view); see §6.2.
  3. Mitä toimitamme — offer trio, **given a real h2** (currently the offer lives in `<b>` tags, invisible to outline and assistive tech).
  4. Mitä se tarkoittaa kohteessanne — six benefit cards; card 6 (Reservitulo) becomes a plain chip linking /reservimarkkinat/ without its second "hinnat puolittuvat" restatement.
  5. **NEW: provenance legend block** inside "Miksi meihin voi luottaa" (finding #2) — names the grades, states the rule ("what cannot be marked does not ship; TARKISTETAAN means we flagged it before you could").
  6. Kaksi lähtötilannetta — doors compressed toward routing (~half the words); stop enumerating all four retrofit questions (owner: /aurinko-ja-akku/); callout gets its missing link (§3.3).
  7. Kenelle — unchanged.
  8. **NEW (short): the two-sentence distributed-infrastructure bridge** ("one connection point is a business decision; ten thousand are regional infrastructure") linking the full reserve-page passage — undertold spot #1. Must travel with its closing line ("Energiaomavaraisuutta ei rakenneta julistuksilla").
  9. Miksi meihin voi luottaa + refslot — add the missing link to /meista/ (de-orphans the About page).
  10. Closing CTA band — unchanged; natural host for the one-sentence data-engine method statement.
- **Kill list:** duplicate reserve disclaimer (card 6 vs Periaate 02 — keep Periaate 02); four-questions enumeration in the doors section; "Akku parantaa investointia" absolute (→ conditional-on-analysis, copy §1.1); "aate"/"veendumus" register mismatch (pick the safer pair).
- **Gap list:** provenance legend; distributed-infrastructure bridge; link on the second-opinion callout; /meista/ link; first-use glosses for aggregaattori and tasekäsittely (or cut tasekäsittely — it is never explained site-wide); freqnote should link /reservimarkkinat/.
- **Media slots (max 3 — page is at cap):** hero photo (exists — 2x upscale + cold regrade toward Sügav Salu dusk); frequency trace (exists — keep, self-labelled illustrative); offer triptych (exists — upscale; regenerate `of-aurinko` in a colder register; `of-varasto` is first to retire on real photography). **No additions.**
- **Parity:** ET benefit card 1 deep-links `#voimsustasu`; FI must gain `#tehomaksu` parity when the FI example lands. Otherwise mirrors.

### 2.2 Energiavarastot — `/energiavarastot/` · Energiasalvestid — `/energiasalvestid/`

- **Mission: FI FIT (post-restructure) · ET DRIFT** — the näidisarvutus block is 415 of 817 words (51 %): the battery page's second half is a tariff-explainer page. Mechanism + one worked example belong here; the 8-row rate appendix and "Kaks lisahooba" outgrow it (→ future explainer pair, §3.4). *Tension noted in §6.6: this same section is also, by three agents' judgment, the best single artifact on the site — extract the appendix depth only, never the worked example.*
- **h1: SUBJECT — passes.** This page is the reference test; no change.
- **Target outline (FI shown; ET mirrors with §-noted differences):**
  1. Hero — unchanged (subject h1 + independence lede).
  2. Mitä saatte — three chips; **NEW argument slot:** promote the "connection you already own" insight from the news aside (queue documented → existing liittymä gains relative value → battery activates it; source-linked, no scarcity forecasts) — undertold spot #5.
  3. Järjestelmä itse — kW/kWh prose → **table** (house rules: tables where clearer); keep "Kaappi tai kontti".
  4. Näin etenemme — chips; link-line count per §6.3 (founder decision).
  5. Tehomaksu-esimerkki — FI: mechanism + **number-free peak-shave SVG** now; full ET-mirror example (numbers, split columns, exclusions) the moment the anchor tariff is documented. Elevate the monthly-reset sentence to the section's organizing idea. Close the section with the ET-style callout + kartoitus CTA (the callout's first sentence works today without a single number). ET: insert the **numbered peak-shave SVG** (§4); move appendix + levers out when the explainer page exists.
  6. RAHOITUS refslot — unchanged (single-hedge fix, copy §2.1).
  7. Konsultointi — give it an **anchor id** (becomes the second-opinion offer's owner, §3.3).
  8. **NEW: closing kartoitus CTA** — the page currently ends through the consulting door. (FI: this is the page's most urgent single fix.)
- **Kill list:** FI workflow-apology sentence ("Täysi esimerkkilasku laaditaan, kun ankkuriverkkoyhtiön hinnasto on valittu…" — exposes internal editorial state); the naked `[X,XX]` bullet (replace with prose mechanism until the rate exists); "varasto ansaitsee 12 kertaa vuodessa" **inside the green DOKUMENTOITU column** (state the mechanism — measurement resets monthly, the *opportunity* recurs 12×/year — keep the earning verb out of the documented tier); "vielä viidentenä vuonna / kolmantena vuonna" bare presence claims (anchor to contractual follow-up / verifiable analysis instead).
- **Gap list:** closing CTA (FI); post-example callout+CTA (FI, gated); connection-as-asset argument; `tunnin keskiteho` vs `tuntikeskiteho` term fix (define once, then one form — both languages); ET: gloss that VKL5/VMA2 codes are Elektrilevi tariff packages; ET "2,06 s/kWh" → spell out "senti".
- **Media slots (target: exactly 2):** Stage-4 system hero (21:9, cabinet **and** container in frame if possible — otherwise a scale-silhouette SVG fallback for "Järjestelmä itse"); the peak-shave data visual (ET numbered / FI number-free — full spec §4). Everything else none-by-design.
- **Parity:** the depth gap is the site's #1 parity item (known, gated on the DSO-anchor decision). Hard rule from the media plan: **ET's 480/380/348/4 176 figures never migrate into FI** — they are Elektrilevi figures and would be invented data in a Finnish context.

### 2.3 Aurinkosähkö + akku — `/aurinko-ja-akku/` · Päikeseelekter + aku — `/paike-ja-aku/`

- **Mission: DRIFT.** Nav label and home's offer stack present solar as deliverable #1; the page spends ~50 % on retrofit-integration engineering and contains ~zero solar-delivery substance. Home routes "Oma tuotanto omaan käyttöön" and especially "Varavoima häiriöissä" here — backup power exists on this page only as one JS-injected button caption. Fix the page, not the label.
- **h1: SUBJECT (earned-clever, exemplary).** No change.
- **Target outline:**
  1. Hero — unchanged.
  2. Kaksi tietä — unchanged (visual heading-size flattening noted; cosmetic).
  3. **Retrofit section, re-led (undertold spot #4):** the five-mode diagram FIRST, framed as "what your connection point does in 24 hours," with the four questions as the engineering underlay that makes it approvable — inversion of emphasis, nothing cut. Add the missing one-sentence takasyöttö gloss (the page's organizing threat is never explained). The four question titles should surface at heading level (currently div text — the h2 promises four named questions the outline never delivers).
  4. **NEW: short backup-power / saarekekäyttö block** (KOHDEKOHTAINEN-tagged) — the honest landing for home's "Varavoima" card.
  5. **NEW (short): what the solar delivery consists of** — scope/sizing method, hardware-neutral, no partner names — the substance the label promises.
  6. Kokonaisuus kannattaa suunnitella kerralla — unchanged.
  7. Closing CTA — exists (best-converting page structure on the site; protect it). Add the one missing cross-link: → /prosessi/ after "Mitä selvitämme ennen tarjousta."
- **Kill list:** "Jälkikäteen sovitettavaa ei jää" absolute (→ design-intent phrasing); FI "lyhyillä toimitusajoilla" third-party performance promise (align to the weaker ET form).
- **Gap list:** takasyöttö gloss; hybridi-invertteri gloss; aggregaattori gloss or link at the checklist; backup-power block; solar-delivery substance; body link → /prosessi/ (page is currently a mid-funnel dead end); the economic stake of the four questions ("what the existing PV investment is worth protecting") stated once for the CFO.
- **Media slots:** the ops diagram (exists — the quality bar; maintenance only). Post-commissioning: a real retrofit photo may take the hero. Nothing else.
- **Parity:** mirrors are clean; ET drops FI's "suomalaisilta toimittajilta" claim — adopt ET's weaker form in FI.

### 2.4 Reservimarkkinat — `/reservimarkkinat/` · Reserviturud — `/reserviturud/`

- **Mission: FIT.** Best mission discipline of the content pages. The closing geopolitics section is brand narrative, not mechanism — tolerable as a single signature crescendo; do not let it grow (see §6.5 for the containment-vs-amplification disagreement).
- **h1: SUBJECT — passes** (declared scope including the "what we don't promise" clause).
- **Target outline:**
  1. Hero — unchanged (mild by-design timidity; ET's evidence section is what balances it — FI needs the mirror, item 5 below).
  2. Perusasia — unchanged.
  3. Tuotteet — surface FCR/aFRR/mFRR in the h2 (the SEO title sells exactly these terms; on-page they exist only in table cells — the site's clearest SEO/heading divergence).
  4. Miten kohde pääsee markkinalle — **resolve the one heading-vs-doctrine contradiction on the site:** steps read Aggregaattori → Esikvalifiointi → Mittaus → Verkkoyhtiön hyväksyntä, with DSO-first surviving only in a chip. Either reorder (DSO = 01) or let step 04's heading itself carry the "aina ensin." Madis's call which; the contradiction should not survive as-is. Cross-link → /prosessi/ (step 04 is literally its thesis).
  5. Miksi emme julkaise tuottolukuja — keep; **add the savings handoff** (morelink → FI `#tehomaksu` / ET `#voimsustasu`) — the doctrinally most important missing link on the site (the page argues savings-first and never links the savings evidence). Fix the unhedged "markkina palkitsee tehokkaat varat" forecast (→ mechanism phrasing). **FI gap:** build the FI mirror of ET's "Miks reservivajadus kasvab" documented-markers section from Fingrid-side sources (the Ajankohtaista tiedote already supplies one anchor).
  6. Kolme kysymystä — keep; add the actionable morelink under the callout (quote-review offer, §3.3).
  7. Closing vision section — keep last; consider letting the heading name the payoff (currently the "Yhdessä ne ovat jotain muuta" second half is the site's one deliberate-teaser heading); reroute "koska se maksaa itsensä takaisin" through the analysis ("koska laskelma osoittaa…").
- **Kill list:** "poikkeuksellisen hyvin / erakordselt hästi" (the only marketing-class intensifier in analysis on the site); ET 105-word paragraph at et:681 → split into three + **delete its duplicated doctrine sentence** (same statement appears in bold two paragraphs later).
- **Gap list:** savings-evidence link; FI evidence section; FCR acronym expansion at first use; prosessi cross-link; internal next-read for the just-researching visitor (page currently offers none).
- **Media slots:** ET only — reuse the existing `.statrow` pattern for the three documented Elering figures (markup reuse, no new asset; FI has no equivalent sourced block — do not synthesize one). The two-curve forecast chart is **rejected — never** (a drawn forecast with no dataset is exactly the "number nobody controls" the section refuses). Optional qualitative FCR-zones strip on the trace grammar: defer; none-by-design is the honest default.
- **Parity:** ET materially stronger (evidence section + fuller two-curve paragraph + Estonia-specific framing). The standing MADIS note (both files) already plans a full two-language reserve rewrite — fold every fix above into that single pass, not piecemeal.

### 2.5 Prosessi — `/prosessi/` · Protsess — `/protsess/`

- **Mission: FIT.** Cleanest page on the site; correct sole owner of the journey. Heading order embodies DSO-first doctrine.
- **h1: SUBJECT.** Minor: carry the noun (akkuhanke/akuprojekt) that the SEO title already has.
- **Target outline:** keep the seven steps exactly; add three text-level items — (1) a total-duration line ("tyypillisesti X–Y kuukautta kartoituksesta käyttöönottoon" — the reader currently has to sum seven ranges themselves); (2) the cost/commitment boundary (which steps are free, when the first commitment occurs — the site states kartoitus is free only on other pages; this is the commitment map and never says it); (3) "porrastettu tarjous" glossed or reworded. Step 07 cross-links /reservimarkkinat/ (aggregaattori appears unglossed). Drop or keep the "Se ei ole byrokratiaa" aside (minor tightening-pass item). Delete the cold-lander noise in the lede (the cross-reference to the battery page's four phases).
- **Kill list:** "suurin yksittäinen syy" unsourced market-statistics claim in the closing callout (source it or downgrade to "yleinen syy"; "täysin vältettävissä" can lose "täysin" without losing force).
- **Gap list:** total duration; cost boundary; step-01 reassurance that SAMA helps fill the field list; step-07 link.
- **Media slots: none-by-design** (the steps component IS the timeline; a Gantt would restate it with less density).
- **Parity:** identical mirrors.

### 2.6 Meistä — `/meista/` · Meist — `/meist/`

- **Mission: FIT (within doctrine).** But the page has **zero body in-links in both languages** — the trust page is unreachable except by nav, while home argues trust for 168 words without linking it.
- **h1: CLAIM (fails the test).** The correct subject line already exists as the first h2 ("Rehellinen analyysi ja toteutus samalta taholta") — promote it (direction); the commodity thesis becomes the supporting h2/lede. The two-market identity (the declared search intent) deserves heading level.
- **Target outline:**
  1. Hero — subject-first h1 (direction above); the 60-word chain lede → **4-item list** (the single highest-value copy edit on the site per the copy audit).
  2. Miksi tämä yritys on olemassa — unchanged.
  3. Perustaja — add **verifiable minima** doctrine already permits: founding year, Y-tunnus (it is in the footer; the trust page should carry it), founder-led, "you will deal with Madis directly" (a genuine one-person advantage claimable honestly). Name the category of the listed companies ("kantaverkko- ja jakeluverkkoyhtiöt" — they read as a name soup to outsiders and must never look like partner name-drops). Resolve the "Emme ole suomalainen yritys, jolla on vironkielinen sivu" sentence (founder decision, author-flagged in source: soften now vs wait for OÜ — as published it confuses cold readers in both languages against the Oy/Helsinki footer).
  4. **NEW (one sentence):** the founder's thesis connected to the ten-thousand-batteries horizon — the only page with no window to the future at all; one sentence, no new claims.
  5. Closing CTA — carry the kartoitus framing + "ei sido mihinkään" line rather than a bare "Ota yhteyttä" (this is where trust-shoppers finish).
- **Kill list:** "tekninen dokumentaatio neljällä kielellä" (which four? — either name them or drop the count); "rehellinen/aus" density site-wide is rationed to this page + footer (copy audit: 5×/8× is self-certification creep).
- **Gap list:** in-link from home; verifiable minima; future sentence; category word for the grid companies.
- **Media slots: none-by-design.** House rules close every option (no people → no portrait; no track record → no montage). If a founder portrait is ever wanted, that is a doctrine change to escalate, not a media decision.
- **Parity:** mirrors; the flagged sentence contradicts in opposite directions per language.

### 2.7 Yhteystiedot — `/yhteystiedot/` · Kontakt — `/kontakt/`

- **Mission: FIT** (form-first, verb-honest). But as a lander it collects without re-selling — finding #4.
- **h1: JOURNEY (fails the test), and a verbatim duplicate of home's closing h2.** The SEO title has it right ("Pyydä kohdekartoitus"). Direction: subject-first h1 naming the survey request; the consumption-data line becomes the lede. Give the direct-contact block a heading.
- **Target outline:**
  1. Hero — subject h1 (direction above) + existing lede.
  2. **NEW: the reassurance strip** (the single highest-leverage conversion fix on the site) — 3–4 sentences assembled from already-published copy, zero new claims: free & non-binding, written output you keep either way, reply within a working day + first step ≈ 1 viikko (link → /prosessi/), sometimes the answer is no. Plus one sentence acknowledging quote-review intent (the same form serves independent offer reviews).
  3. Form — move the optional-tier divider above yritys/puhelin (they are optional but sit above it, implying required); restate "nimi ja sähköposti riittävät" at the divider; a one-line pointer to where consumption data lives (Fingrid Datahub / e-elering) — the h1 says "let's start from your data" and never says how to get it.
  4. Direct-contact block — on mobile it sits below 12 fields; consider surfacing the phone/WhatsApp line higher for the time-poor caller.
  5. Partner-network note — keep (harmless), after the quote-review sentence.
- **Kill list:** nothing (mechanics are solid: no-JS fallback, honeypot, mailto fallback all verified).
- **Gap list:** as above; also converge the three different labels the site uses for this page (nav "Pyydä kartoitus", footer "Kohdekartoitus", footer "Yhteystiedot") toward the kartoitus framing except the literal contact-info link.
- **Media slots: none-by-design** — every element competes with the form; the named person with direct phone/WhatsApp IS the image.
- **Parity:** mirrors. FI trust wrinkle noted: +372 primary phone vs Helsinki footer — resolves itself with the Meistä verifiable-minima fix.

### 2.8 Kiitos — `/kiitos/` · Aitäh — `/aitah/` (noindex)

- **Mission: FIT by design — and the biggest wasted moment on the site.** Highest-intent visitor, sent backwards.
- **h1: SUBJECT** ("Viestinne on perillä") — keep.
- **Target outline:** confirmation h1 + reply promise (keep) → **NEW what-happens-next strip** (3 steps lifted from prosessi 01–03, ending on "nothing is bought before the DSO's written answer" — the differentiator at its most credible moment) → **NEW prepare-your-data checklist** (items verbatim from step 01; "jos nämä ovat käsillä, ensimmäinen viikko nopeutuu" — honest accelerator, no pressure) → ghost button re-targeted to /prosessi/ (demote "Takaisin etusivulle"). Explicitly out, per doctrine: any second CTA, upsell, or urgency.
- **Media slots: none-by-design** (must load instantly; also the no-JS form action target).
- **Parity:** mirrors.

### 2.9 Ajankohtaista — `/ajankohtaista/` · Uudised — `/uudised/`

- **Mission: FIT** (curated primary sources + why-it-matters — the most future-native page on the site without trying). Label slightly over-promises cadence; if items stay sparse, direction toward a sources/market-review framing is Madis's call.
- **h1: SUBJECT.** Item h2s are the plainest, most informative headings on the site — findings as headlines; keep the pattern.
- **Target outline:** add a **one-sentence who-this-is stitch** at the top (the page never says what SAMA sells — the only page that does not stand alone for a search lander); otherwise keep. Editorial gaps, not structure: FI needs a Finland-specific regulatory/economics item of equivalent customer value to ET's two Estonian-law items (FI currently 2 items vs ET 4, and the CFO-critical double-network-fee story has no FI counterpart — content backlog, not translation).
- **Kill list:** ET "…mitte müügivõte" meta-defense (denying salesmanship while creating urgency is itself a sales register; the documented deadline makes the point alone).
- **Media slots:** the `.statrow` pattern (exists) is the rule — one per item max, figures verbatim from the primary source, ALLIKAS line mandatory; bespoke charts only when a redrawn figure is fully sourced and beats the statrow. Ongoing editorial rule, not an asset.
- **Parity:** item-set asymmetry is justified (market-specific law) — but log the FI thinness as backlog.

### 2.10 Tietosuoja — `/tietosuoja/` · Andmekaitse — `/andmekaitse/`

- **Mission: FIT.** Bureaucratic by license — and secretly a brand page ("Ei evästeitä, ei analytiikkaa" is a promise most competitors cannot make).
- **h1: SUBJECT.** No changes to structure or tone.
- **Target outline:** unchanged; two mechanical fixes only — make the email addresses `mailto:` links (FI renders them as plain text) and add one quiet return path for the mid-form visitor who arrived from the form's privacy link (a morelink, not a button — a big CTA would be off-tone here).
- **Media slots: none-by-design** ("a privacy policy with decoration is a privacy policy you don't trust").
- **Parity:** ET correctly adds the Estonian supervisory authority; no action.

---

## 3. Site-level architecture

### 3.1 Nav order & labels

**Recommendation: keep the nav order exactly as is.** Current order (Energiavarastot · Aurinkosähkö + akku · Reservimarkkinat · Näin se etenee · Ajankohtaista · Meistä · CTA) already implements service → mechanism → process → proof/news → about → contact; the footer encodes the same mental model. The IA problem on this site is content allocation and cross-linking, not sequence. When the first documented reference project exists, the references page takes nav position 5 (the proof slot) and Ajankohtaista shifts right.

Labels: all deliver except **"Aurinkosähkö + akku" over-promises solar** — fix the page (§2.3), not the label. One open dispute (§6.7): the cold reader flags "Reservimarkkinat" as jargon-as-menu-item; the IA verdict is that the label delivers exactly what the page contains. Converge the three names used for the contact page (§2.7).

### 3.2 Duplication resolution table

| Content | Lives on | Owner | Everyone else |
|---|---|---|---|
| Four retrofit questions | home doors (full enumeration), battery-page chip, aurinko full treatment | **/aurinko-ja-akku/** | Battery chip is the model (one line + link); home stops enumerating, names that four questions exist, links owner |
| Journey / steps | prosessi (7 steps), battery chips, reservi market-entry steps | **/prosessi/** (customer timeline); reservi keeps market-entry mechanics as its own thing + cross-links prosessi | Battery chips link prosessi (count per §6.3) |
| Reserve-scenario disclaimer | home ×2, battery, aurinko caption, reservi (full), meistä, ET exclusions list | **/reservimarkkinat/ "Miksi emme julkaise tuottolukuja"** | Max once per page as a linking chip; home drops the duplicate |
| Tehomaksu/võimsustasu material | battery pages (`#tehomaksu`, `#voimsustasu`) | **Battery pages: mechanism + one worked example.** Appendix depth → future explainer pair (§3.4) | Home cards deep-link the anchors (FI parity pending) |
| Kenelle / audience qualification | home only (+ ~100 kW chip on battery) | **home** | No page build (§3.4); surface the qualification line near the contact form |
| Two-doors router | home, aurinko | **/aurinko-ja-akku/** | Home routes in ~half the words |
| Second-opinion / quote-review offer | home callout (no link), reservi tool (no link), battery consulting bullet (only button) | **battery-page consulting section — give it an anchor** | Home callout and reservi tool link the anchor; contact page acknowledges the intent; standalone page only after the first real review |
| Trust principles / "we say no" | home Periaatteet, meistä pillars, battery hero + chip | **home** (doctrine principles) · **meistä** (company character) | Chip-level brand repetition fine; vary the verbatim "Emme ole sidottuja yhteenkään valmistajaan" ×2 (Madis) |
| Fingrid >4 GW stat, 50,000 Hz explainer, aggregator explanation | see IA report | **/ajankohtaista/** · **/reservimarkkinat/** ×2 | The citation-link pattern (reservi → ajankohtaista) is the model — replicate; prosessi step 07 links owner |

### 3.3 Internal-linking additions (priority order)

1. `/energiavarastot/` (FI) → closing kartoitus CTA — *the* conversion fix; needs no figures.
2. Home second-opinion callout → battery consulting anchor (new anchor id) — the site's boldest offer currently links nowhere.
3. Reservi pages → savings evidence (FI `#tehomaksu`, ET `#voimsustasu`) — the doctrinally most important handoff (savings first) and currently absent.
4. `/aurinko-ja-akku/` → `/prosessi/` (after the pre-offer checklist; the page is a mid-funnel dead end).
5. `/kiitos/`–`/aitah/` → `/prosessi/` (replace the backwards ghost).
6. Home "Miksi meihin voi luottaa" → `/meista/` (de-orphans the About page, both languages).
7. Kolme kysymystä callout → contact (honest verb: request an independent review of your quote).
8. Prosessi step 07 → `/reservimarkkinat/`; reservi step 04 → `/prosessi/`.
9. FI home card 1 → `/energiavarastot/#tehomaksu` (parity, gated on the FI example).
10. ET reserviturud → `/uudised/` (or accept the asymmetry deliberately — FI models the cite-the-news-page pattern, ET abandons it); tietosuoja/andmekaitse mailto links + quiet return path.

### 3.4 Missing-pages verdicts

| Candidate | Verdict | Reasoning |
|---|---|---|
| Võimsustasu/tehomaksu explainer pair | **BUILD-LATER — soon, both languages together** | Relieves the ET battery-page drift; gives the only green-provenance savings artifact its own SEO surface (these are exactly the queries a qualifying buyer types). Gated on the FI DSO-anchor decision; never build ET-only. Battery pages keep mechanism + worked example + link; appendix table + levers move. |
| "Kenelle se sopii" qualification page | **NEVER (for now)** | Home's Kenelle + the ~100 kW chip already do it in ~120 words; a page would thin content and add an 11th pair to maintain. Cheaper same-effect fix: qualification line near the contact form. Revisit only if unqualified leads become a real cost. |
| FAQ page | **NEVER (until real questions exist)** | An invented FAQ is the content equivalent of an undocumented figure. Build it when actual kartoitus conversations have produced a documented question list — same "used twice before deploying" logic the business doctrine applies to tools. |
| References page (empty until projects) | **NEVER as an empty page; keep the refslot pattern** | An empty /referenssit/ in nav restates "no track record" on every load. The current refslot (evidence standard, no hollow URL) is strictly better. Create the page simultaneously with the first measured, source-documented project; it then takes nav position 5. |
| Second-opinion / quote-review page | **ANCHOR FIRST, page later** | Anchor + links now (§3.3); consider a standalone page after the first real review is delivered — it is the most differentiated, lowest-friction entry offer the company has. |
| Backup-power / saarekekäyttö | **BUILD as a section** (on /aurinko-ja-akku/), not a page | Home sells it as a card; the landing content is one button caption. |
| Glossary page | **NEVER** | kW/kWh is already explained in context at the right altitude; in-page first-use glosses (§2 gap lists) are the correct mechanism. |

### 3.5 Terminology glossaries (as actually used — canonical recommendations)

**Finnish** (full counts in Appendix, copy report §6a): kohdekartoitus (nav-short "kartoitus" OK) · mitoittaa-family (consistent) · **tunnin keskiteho vs tuntikeskiteho in adjacent bullets — define once, then "tuntikeskiteho"** · device tiering to codify: **energiavarasto** = offering/first mention, **varasto** = in-page shorthand, **akku** = physical battery + market-jargon contexts, **sähkövarasto** only when citing Fingrid · verkkoyhtiö = DSO / kantaverkkoyhtiö = TSO / jakeluverkkoyhtiö only at the contrast point (correct, keep) · liittymäpiste (consistent; do not let a future editor "fix" it to Fingrid's liittymispiste) · reservitulo (ours, modelled) vs tuottoluvut (their published claims) — load-bearing distinction, keep.

**Estonian**: objektikaardistus (nav-short OK) · dimensioneerima-family (consistent) · **tunni keskmine võimsus vs tunnikeskmine — same fix as FI** · energiasalvesti / salvesti / aku tiering as FI; salvestusüksus stays (statute term, legal-news items only); elektrisalvesti only citing Fingrid · võrguettevõte / põhivõrguettevõte / jaotusvõrguettevõte (correct pattern) · liitumispunkt consistent; **replace the one-off "liitumispiir" (et:104)** · reservitulu vs tulunumbrid — keep · **"Küsi" (nav) vs "Küsige" (all 12 body CTAs) — decide** (FI is uniform "Pyydä"); ET "ta" for the device (et:274) → "see" (native-pass call).

---

## 4. Media master plan (consolidated)

Full per-page tables, the peak-shave chart spec, and the video thesis are in the Media Director's report (Appendix §6). The consolidated calls:

**Inventory:** 4 generated Magnific photos (hero + 3 offer cards, all 1x, correctly `aria-hidden` while illustrative; `of-varasto` closest to the fake-install line — first to retire), brand mark, 2 live SVGs (frequency trace; the interactive ops diagram = the quality bar), the `.statrow` documented-figures pattern. All photos retire on real commissioning photography, at which point images flip from hidden decoration to captioned, provenanced evidence.

**Six of ten page-pairs are none-by-design** (prosessi, meistä, yhteystiedot, kiitos, tietosuoja + no additions to the front page, which is at its 3-element cap). Restraint is a published feature of this plan, not an omission.

**The one build-now asset: the ET peak-shave chart** (`/energiasalvestid/#voimsustasu`) — hand-built SVG in the house `.sysdia`/`.trace` grammar, 2:1, stepped hourly load curve (amber MODELLEERITUD), dashed 380 kW target, hatched shaved block with the feasibility annotation (150 kWh ≤ ~250 kWh → teostatav), and the one documented element (× 3,48 €/kW = 348 €/kuu) chipped green DOKUMENTEERITUD with the existing source line. Both provenance hues inside one graphic — which is the point. `role="img"` + aria-label (it is content, not decoration). **FI gets the same geometry with every numeral stripped** (mechanism only, single amber chip, no €, no source line) until the anchor tariff is documented — ET's numbers never migrate.

**Video thesis: motion is earned exactly once** — the monthly-reset mechanism, and as a ~3 KB SVG animation extension of the chart (progressive enhancement, `prefers-reduced-motion` respected), not as self-hosted MP4. The ops diagram already spends the site's motion budget; its scarcity is its value (see §6.4 for the reuse dispute). The first honest *video* is a post-commissioning monitoring-UI screen capture (muted, self-hosted, <4 MB, green DOKUMENTOITU caption) in the REFERENSSIT slot. Never: b-roll loops, generated installation video (a fake install at 24 fps), talking heads, any third-party embed.

**Production sequence:**
- **This week (no dependencies):** ET peak-shave chart · FI number-free variant · Magnific 2x upscales of hero + 3 offer cards (workflow + creation ids exist) · cold regrade of hero.webp toward the Sügav Salu dusk palette (same Magnific round trip) · ET reserviturud statrow (markup reuse).
- **Gated on Stage-4 hero delivery:** hero-system.webp conversion + heroimgd + preloads on both battery pages · the "Järjestelmä itse" decision (cabinet-vs-container silhouette SVG only if the hero shows one form factor) · of-aurinko regeneration in the register the approved hero sets.
- **Gated on the FI anchor-tariff decision:** FI chart upgrade to the numbered form (green chip + source line).
- **Gated on real projects:** real photography replaces hero + of-varasto first, then the rest; REFERENSSIT before/after data visuals; monitoring-UI capture; the monthly-reset animation sequenced after the static charts survive a native pass.

---

## 5. Prioritized roadmap

Effort: S < ½ day · M = ½–2 days · L > 2 days. Owner key: **Martin** (founder decisions/ops), **Madis** (native/authored copy), **CC** (Claude Code implementation), **Lab** (design lab).

### (a) Quick wins — implementable without new copy decisions

| # | Item | Effort | Owner |
|---|---|---|---|
| a1 | FI `/energiavarastot/`: closing kartoitus CTA (existing string "Pyydä kohdekartoitus") | S | CC |
| a2 | Kiitos/aitah ghost button → `/prosessi/`–`/protsess/` (existing label strings) | S | CC |
| a3 | Tietosuoja/andmekaitse: mailto links | S | CC |
| a4 | FI home benefit card 1 → `#tehomaksu` anchor (anchor exists; mirrors ET) | S | CC |
| a5 | Battery consulting section: anchor id (prerequisite for b/c linking items) | S | CC |
| a6 | ET reserviturud statrow from the three existing documented bullets (figures/labels verbatim; Madis eyeballs on draft) | S | CC |
| a7 | Magnific 2x upscales + cold hero regrade (backlogged workflow, creation ids in comments) | M | Martin+Lab |
| a8 | ET peak-shave chart SVG + FI number-free variant (labels drawn verbatim from published page text; native pass reviews labels on draft) | M | CC+Lab |

### (b) Founder decisions needed (as questions)

| # | Decision | Blocks |
|---|---|---|
| b1 | FI anchor DSO: Helen Sähköverkko, Caruna, or Elenia? (already open) | FI example, FI chart numbers, explainer page, FI home deep link |
| b2 | Home h1: fold a subject clause in, or register the mood slogan as a deliberate exception? (agents split — §6.1) | home hero copy |
| b3 | Frequency widget: stays in the hero or moves below the offer? (§6.2) | home hero structure |
| b4 | Journey chips: keep 4 identical prosessi links (your original spec) or dedupe to one after the grid? (two agents recommend dedupe — §6.3) | battery pages |
| b5 | "Emme ole suomalainen yritys…" sentence: soften now or hold until the OÜ exists? (author-flagged in source) | meistä/meist |
| b6 | "Palaamme arkipäivän kuluessa" ×5: confirmed as an operational SLA, or soften? | contact/kiitos strings |
| b7 | The 11 promise-shaped sentences (copy report §1): approve the fix directions, esp. "parantaa investointia", "ansaitsee 12×" (in the green column), "laskelma kestää", "maksaa itsensä takaisin", unsourced "suurin yksittäinen syy" | multiple pages |
| b8 | Ops-diagram second host: keep unique to aurinko pages (media view) or surface the mode-model on battery/home (future-brand view)? (§6.4) | battery/home media |
| b9 | Provenance legend: approve the concept + the taxonomy consolidation it forces | home + all pages |
| b10 | Meistä verifiable minima (founding year, Y-tunnus on-page, founder-led, "you deal with Madis directly"): approve? | meistä |
| b11 | Reserve market-entry steps: reorder DSO-first, or heading carries "aina ensin"? (with Madis) | reservi pages |
| b12 | ET CTA imperative: Küsige everywhere, or documented nav-brevity exception? | ET strings |

### (c) Items needing Madis-authored copy (native pass owns all wording)

| # | Item | Effort | Notes |
|---|---|---|---|
| c1 | Contact-page reassurance strip + quote-review sentence + data-source pointer | M | assembled from existing published sentences; highest-leverage conversion copy |
| c2 | Kiitos/aitah what-happens-next strip + prepare-your-data checklist | S | lifted from prosessi step 01–03 |
| c3 | Provenance legend copy (after b9) + one-line per-page variants | S | forces taxonomy consolidation |
| c4 | FI "Miksi reservitarve kasvaa" evidence section from Fingrid-side sources; fold into the already-planned two-language reserve rewrite along with the et:681 split + duplicate-doctrine deletion and the promise-sentence fixes on those pages | L | one pass, not piecemeal (standing MADIS note) |
| c5 | First-use glosses: takasyöttö, aggregaattori (front), hybridi-invertteri; tasekäsittely (gloss or cut); ET "s/kWh" → senti; VKL-code issuer note | S | |
| c6 | h1 rewrites: meistä (promote existing h2), yhteystiedot (subject-first), home per b2; prosessi noun; meistä lede → list; kW/kWh → table | M | |
| c7 | FI Tehomaksu-esimerkki full example mirroring ET structure (after b1), incl. the four waived placeholders being resolved | M | closes the site's #1 parity gap |
| c8 | Prosessi: total-duration line + cost/commitment boundary + porrastettu tarjous gloss | S | |
| c9 | Tone pass: delete "poikkeuksellisen/erakordselt", ration "rehellinen/aus", drop "mitte müügivõte", competitor-jab cap (max two per page), tunnikeskiteho/tunnikeskmine + liitumispiir term fixes | S | |
| c10 | FI Ajankohtaista: one Finland-specific regulatory/economics item (editorial research + copy) | M | content backlog, not translation |
| c11 | Aurinko page: backup-power block + solar-delivery substance + diagram re-lead framing (spot #4) | M | with b8 |
| c12 | Home: distributed-infrastructure bridge (spot #1, closing line travels verbatim) + doors compression + second-opinion callout link text | M | |

### (d) Larger builds

| # | Item | Effort | Owner | Gate |
|---|---|---|---|---|
| d1 | Võimsustasu/tehomaksu explainer page pair (moves ET appendix depth; new SEO surface) | L | Madis+CC | b1 + c7 shipped |
| d2 | Stage-4 system hero pipeline (image → webp → heroimgd → preloads) + "Järjestelmä itse" silhouette decision | M | Martin→CC | image delivery |
| d3 | Second-opinion standalone page | M | Madis+CC | first real review delivered |
| d4 | Monthly-reset SVG animation (progressive enhancement on the charts) | M | CC+Lab | charts through native pass |
| d5 | References page + before/after data visuals + monitoring-UI video | L | all | first commissioned project |

---

## 6. Where the subagents disagreed

Reported as found; not averaged away.

1. **Home h1.** Headings analyst: MOOD, fails the subject test, the only h1 sharing zero words with its SEO title — fold the subject in or formally register the exception. Cold reader: the hero underperforms for every persona; slogan gives zero information. Future-brand auditor: the h1 is "the thesis sentence of the whole brand," BALANCED — don't change the sentence, route the site's evidence *to* it. → Decision b2. (Note: these are compatible if the lede carries the subject and the kirjallisesti promise moves to sentence one — but whether the h1 itself changes is genuinely contested.)
2. **Frequency widget placement.** Cold reader: it occupies the decisive first screen before the offer is stated, answers an unasked question, and renders as an empty box without JS — move it to /reservimarkkinat/. Future-brand: "quietly the most future-acting artifact above the fold… it works because it is an instrument"; media director: keep, no changes. → Decision b3.
3. **Journey-chip links.** IA + conversion: 4 identical "Koko prosessi" morelinks in one grid is noise — one link after the grid. This reverses the founder's original batch instruction (each chip carries the link line). → Decision b4.
4. **Ops-diagram reuse.** Media director: **no** — scarcity is what makes it the quality bar; battery pages' media budget is spent (hero + chart); a variant would restate the chart's HUIPPU story and add a two-language maintenance liability. Future-brand: the diagram is the site's best "future operating" artifact seen only by retrofit readers — surface the mode-model on the battery page or home. Both agree on re-leading the aurinko section itself (diagram first, four questions as underlay). → Decision b8.
5. **The geopolitics/vision closing section.** IA: brand narrative on a mechanism page, would sit naturally on /meista/ — "tolerable as a single closing section; do not let it grow." Future-brand: the site's peak material, undertold — keep it as the reserve page's crescendo AND bridge it from home. The compromise both can live with (home carries two sentences + link; the passage itself stays put and does not grow) is what §2.1/§2.4 recommend — but the impulse (contain vs amplify) genuinely differs.
6. **ET battery-page tariff depth.** IA: DRIFT — 51 % of a service page is an explainer; extract appendix depth. Cold reader: the näidisarvutus is "the strongest single section on either site… if only one URL is ever shared in Estonia, it should be this one." Future-brand: "the model section for the entire site." Resolution recorded in §2.2: extract only the appendix table + two levers, never the worked example — but the founders should know three of seven agents count this section as the site's crown jewel before approving any surgery.
7. **"Reservimarkkinat" as a nav label.** Cold reader: jargon as a menu item — a cold owner doesn't know the word. IA: the label delivers exactly what the page contains; no change. (No third opinion; low stakes; flagged for the native pass rather than decided here.)

---

## 7. Appendix — raw subagent reports

The seven unedited reports follow, in full, in agent order.


---

## Appendix A1 · Information Architect

# Information Architecture Audit — SAMA Energia website

Auditor: Information Architect subagent · 2026-08-23
Sources: `src/fi.html` (941 lines), `src/et.html` (1019 lines), generated output (`index.html`, `et/**`, `sitemap.xml`, `_redirects`), repo + business CLAUDE.md.
Line references are `src/fi.html:NNN` unless prefixed `et:`. All copy recommendations are DIRECTION for Madis's native pass, never final copy.

---

## 1. Sitemap as shipped

10 page-pairs; 9 per language are public (in sitemap.xml), 1 per language is unlisted/noindex. ET is served on samaenergia.ee with bare slugs (`_redirects` host rules; `/et/` is a file location, never a visible URL).

| # | FI (samaenergia.fi) | ET (samaenergia.ee) | In nav | In footer | In sitemap.xml |
|---|---|---|---|---|---|
| 1 | `/` | `/` | brand logo | brand logo | yes |
| 2 | `/energiavarastot/` | `/energiasalvestid/` | pos 1 | Palvelut/Teenused 1 | yes |
| 3 | `/aurinko-ja-akku/` | `/paike-ja-aku/` | pos 2 | Palvelut 2 | yes |
| 4 | `/reservimarkkinat/` | `/reserviturud/` | pos 3 | Tietoa/Teave 1 | yes |
| 5 | `/prosessi/` | `/protsess/` | pos 4 ("Näin se etenee") | Palvelut 3 | yes |
| 6 | `/ajankohtaista/` | `/uudised/` | pos 5 | Tietoa 2 | yes |
| 7 | `/meista/` | `/meist/` | pos 6 | Tietoa 3 | yes |
| 8 | `/yhteystiedot/` | `/kontakt/` | CTA ("Pyydä/Küsi kartoitus") | twice: Palvelut 4 as "Kohdekartoitus" + Tietoa 4 as "Yhteystiedot/Kontakt" | yes |
| 9 | `/tietosuoja/` | `/andmekaitse/` | no | Tietoa 5 + legal line | yes |
| 10 | `/kiitos/` | `/aitah/` | no (form action target, `data-noindex`, fi:830/et:895) | no | no (correct) |

Notes:
- The footer already encodes the correct mental model: Palvelut = service+process+contact, Tietoa = mechanism+news+about. The nav follows the same logic. Good.
- `/yhteystiedot/` carries three different labels across the UI: nav CTA "Pyydä kartoitus", footer "Kohdekartoitus" and footer "Yhteystiedot", page eyebrow "Yhteystiedot", data-title "Pyydä kohdekartoitus" (fi:765). Minor naming inconsistency — direction: converge on the kartoitus-framing everywhere except the literal footer contact-info link.
- Language switcher is correctly rewritten per page in generated output (e.g. `energiavarastot/index.html` → `https://samaenergia.ee/energiasalvestid/`); hreflang pairs verified. No IA defect.

---

## 2. Per-page mission fit (10 pairs)

Word counts measured from stripped HTML (script over sources). "De-facto mission" = where the words actually go.

### 2.1 Home (`/` · `/`) — FI ~618w, ET ~660w
- **Intended:** orient, qualify, route, establish trust, convert (data-title fi:38: "Energiavarastot ja aurinkosähkö yrityksille").
- **De-facto:** hero + frequency signature ~14%, offer + benefit cards ~21%, two-doors ~14%, Kenelle ~16%, trust principles + refslot ~27%, closing CTA ~3%.
- **Verdict: FIT.** It routes to every main page and legitimately owns "Kenelle" and the three doctrine principles. Two blemishes: (a) it enumerates all four retrofit questions inside the doors section (fi:146) — that detail belongs to /aurinko-ja-akku/; (b) it carries the reserve-scenario disclaimer twice on one page (benefit card fi:126–129 and Periaate 02 fi:206–208) with near-identical "hinnat puolittuvat" phrasing.

### 2.2 Energiavarastot / Energiasalvestid — FI 498w, ET 817w
- **Intended:** the battery service page, "kartoituksesta käyttöönottoon" (fi:235).
- **De-facto FI:** hero/independence 8%, Mitä saatte 14%, Järjestelmä itse 22%, compressed journey 21%, Tehomaksu-esimerkki 22%, financing 5%, consulting 5%.
- **De-facto ET:** the Võimsustasu näidisarvutus is **415 of 817 words = 51 % of the page** (et:321–408), including an 8-row appendix rate table (et:391–406) and "Kaks lisahooba" (et:374–381).
- **Verdict FI: FIT** (post-e2919f3 battery-first restructure holds; journey is correctly compressed to chips that link /prosessi/).
- **Verdict ET: DRIFT** — the same disease the restructure just cured, in a new form: the battery page's second half is a tariff-calculation page. The mechanism + one worked example belong here; the appendix table and the two extra levers are explainer-depth that outgrows the page (see §5.1).
- Structural repetition inside the page: the identical link line "Koko prosessi — vaiheet ja kestot" appears 4× in one grid (fi:308,313,318,323; same in ET). Direction: one link after the grid.

### 2.3 Aurinko-ja-akku / Paike-ja-aku — FI 449w, ET 461w
- **Intended (nav label + data-title fi:393):** "Aurinkosähkö + akku — yksi järjestelmä"; desc promises both doors equally: retrofit battery AND full system.
- **De-facto:** two-paths router 12%, **retrofit four-questions engineering block 50%** (fi:421–507, 223w), full-system-from-scratch 25% (fi:509–522), hero 8%. There is no substance anywhere on the site about the solar delivery itself (sizing method, roof/ground, scope) beyond home's offer card 01 "Paneelit, invertterit ja asennus" (fi:83).
- **Verdict: DRIFT.** The label and home's offer stack present solar as deliverable #1; the page delivers a (very good) retrofit-integration argument. Additionally, two home cards route here promising content the page barely has: "Oma tuotanto omaan käyttöön" (fi:118) and especially "Varavoima häiriöissä" (fi:123) — backup/saarekekäyttö exists on this page only as one ops-button caption (fi:440). Direction: either grow a short "what the solar delivery consists of" + a backup-power subsection, or stop routing those promises here.

### 2.4 Reservimarkkinat / Reserviturud — FI 764w, ET 927w
- **Intended (fi:526):** "FCR, aFRR ja mFRR selitettynä … miksi emme julkaise tuottolukuja."
- **De-facto FI:** mechanism basics 11%, product table 19%, market-entry steps 12%, why-no-numbers 23%, three-questions tool 12%, geopolitics/vision closing 16%. ET adds "Miks reservivajadus kasvab" (86w, three DOKUMENTEERITUD Elering/ERR sources, et:691–702).
- **Verdict: FIT.** Best mission discipline of the content pages; the title promise is delivered exactly. One flag: the closing "Miksi tämä on tärkeämpää kuin yksi kohde" section (fi:654–672, 125w Baltic-desync vision) is brand narrative, not mechanism — it duplicates the home hero's energiaomavaraisuus theme and would sit naturally on /meista/. Tolerable as a single closing section; do not let it grow.

### 2.5 Prosessi / Protsess — FI 239w, ET 244w
- **Intended:** own the journey, 7 steps + durations (fi:676).
- **De-facto:** 100% process. **Verdict: FIT** — cleanest page on the site; correct single owner of the journey.

### 2.6 Meistä / Meist — FI 288w, ET 298w
- **Intended:** who/why, founder (fi:710).
- **De-facto:** positioning hero 17%, why-this-company-exists 45%, founder 32%.
- **Verdict: FIT.** Within doctrine (single founder section, no other bios). It restates savings-vs-reserve doctrine in one sentence (fi:728) without linking its owner — acceptable, see linking §4.

### 2.7 Yhteystiedot / Kontakt — FI 156w, ET 164w
- **Verdict: FIT.** Form-first, CTA verb honest ("Pyydä"/"Küsi", fi:763 comment documents the decision). The partner-network paragraph (fi:821–825) quietly serves a second audience through the same form — acceptable at this stage; revisit if partner volume appears.

### 2.8 Kiitos / Aitäh — 42w/45w, noindex, unlisted
- **Verdict: FIT** by design. Missed opportunity, not a defect: the only forward path is "Takaisin etusivulle" (fi:839). Post-submission is the exact moment the prospect asks "what happens now" — see §4 missing links.

### 2.9 Ajankohtaista / Uudised — FI 283w, ET 490w
- **Intended (fi:846):** primary sources + why they matter to an industrial owner; "omat analyysimme julkaistaan tällä sivulla."
- **De-facto:** exactly that. FI 2 items, ET 4 items (the two ET-only items are ET-market regulatory changes — justified asymmetry, et:922 comment documents the ordering decision).
- **Verdict: FIT.** Label note: "Ajankohtaista/Uudised" promises cadence; the page is really a documented-sources/authority page. Acceptable now; if items stay this sparse, give Madis direction toward a sources/market-review framing rather than "news."

### 2.10 Tietosuoja / Andmekaitse — FI 296w, ET 318w
- **Verdict: FIT.** Legal, footer-only, in sitemap. Zero body links (pure dead end) — correct for this page type.

---

## 3. Duplication map

| Content block | Appears on | Should OWN it | Others should |
|---|---|---|---|
| **Four technical questions (PV retrofit)** | home doors (fi:146, enumerates all four); energiavarastot "Mitä saatte" chip (fi:262); aurinko-ja-akku full treatment (fi:421–507) | **/aurinko-ja-akku/** | Energiavarastot chip is the model (one line + link). Home: stop enumerating; name that four questions exist, link owner. |
| **Journey / steps** | prosessi 7 steps (fi:685–706); energiavarastot compressed chips (fi:300–327); reservimarkkinat market-entry 4 steps (fi:589–615); home ghost button (fi:52) | **/prosessi/** (customer project timeline); /reservimarkkinat/ keeps market-entry mechanics as its own thing | Reservi steps overlap prosessi at "Verkkoyhtiön hyväksyntä · Ensin" (fi:608–612 ≈ prosessi step 03, fi:690) — keep, but cross-link /prosessi/. Energiavarastot: reduce 4 identical link lines to 1. |
| **Reserve-scenario disclaimer ("skenaariona, ei lupauksena / hinnat puolittuvat")** | home ×2 (fi:126–129, fi:206–208); energiavarastot (fi:266–269); aurinko-ja-akku ops caption (fi:439); reservimarkkinat full (fi:617–638); meista (fi:728); ET näidisarvutus exclusion (et:367) | **/reservimarkkinat/ "Miksi emme julkaise tuottolukuja"** | Chip-level restatement elsewhere is doctrine-correct branding — but max once per page. Home should carry it once (keep Periaate 02; make card 6 a plain chip that links, drop its second "hinnat puolittuvat"). |
| **Tehomaksu/võimsustasu material** | energiavarastot#tehomaksu (fi:333–355, placeholder); energiasalvestid#voimsustasu full 415w (et:321–408); home card 1 links it (ET deep-links et:95, FI does not fi:103) | **battery page for the mechanism + one worked example**; appendix depth → future explainer page (§5.1) | FI home card: add the `#tehomaksu` deep link for parity once the FI example lands. |
| **Kenelle / Kellele audience content** | home only (fi:160–189); related qualification chip "~100 kW" on battery page (fi:271) | **home** | No action — correctly single-homed. |
| **Two-doors ("jo aurinkosähkö" vs "puhtaalta pöydältä")** | home (fi:140–158); aurinko-ja-akku "Kaksi tietä" (fi:402–418) | **/aurinko-ja-akku/** | Home doors are the router — keep, but they currently argue at near-equal length with identical door labels. Direction: home routes in ~half the words, the argument lives on the owner page. |
| **Second-opinion / offer-review proposition** | home callout "tarjous kädessä…" (fi:184–187, **no link**); energiavarastot "Konsultointi ilman laitekauppaa" (fi:370–389); reservimarkkinat "Kolme kysymystä mille tahansa toimittajalle" (fi:640–653) | **energiavarastot consulting section** (give it an anchor) | Home callout links the anchor; reservi tool adds one line "we do this review for you" + link. This is the site's most differentiated entry offer and currently no page owns it. |
| **Trust principles / "we say no" / "not tied to any manufacturer"** | home Periaatteet (fi:198–214); meista pillars (fi:733–737); energiavarastot hero lede (fi:242) + journey chip 01 (fi:307); verbatim "Emme ole sidottuja yhteenkään valmistajaan" twice (fi:289, fi:516; et:278, et:568) | **home** owns the three doctrine principles; **meista** owns company character | Deliberate brand repetition is fine at chip level; flag only the verbatim sentence reuse for Madis to vary. |
| **Fingrid >4 GW queue stat** | ajankohtaista owner (fi:866–872); reservimarkkinat cites with link "lähde Ajankohtaista-sivulla" (fi:630) | **/ajankohtaista/** | Nothing — this is the model citation pattern; replicate it elsewhere. |
| **50,000 Hz frequency explainer** | home signature (fi:61–71); reservimarkkinat "Perusasia" (fi:535–549) | **/reservimarkkinat/** | Home signature is a visual teaser — keep; its freqnote names reservimarkkinat without linking (minor, add link). |
| **"Aloitetaan kulutustiedoistanne"** | home closing h2 (fi:226) = yhteystiedot h1 (fi:769) | — | Deliberate echo; keep. |
| **Aggregator explanation** | reservimarkkinat step 01 owner (fi:593–597); mentions: home offer card 03 (fi:95), aurinko-ja-akku checklist (fi:497), prosessi step 07 (fi:697, no link) | **/reservimarkkinat/** | Prosessi step 07 should link owner (§4). |

---

## 4. Internal-linking graph (body links only; nav/footer excluded)

### Out-links / in-links (FI shown; ET identical except noted)

| Page | Body out-links | Body in-links |
|---|---|---|
| home | yhteystiedot ×4, prosessi ×2, energiavarastot ×3, aurinko-ja-akku ×3, reservimarkkinat ×1 (ET additionally deep-links `/energiasalvestid/#voimsustasu`) | kiitos ("takaisin etusivulle") |
| energiavarastot | #tehomaksu, aurinko-ja-akku, reservimarkkinat (ET ×2), prosessi ×4, yhteystiedot | home ×3 — **only home routes here** |
| aurinko-ja-akku | yhteystiedot ×2 — **nothing else** | home ×3, energiavarastot ×1 |
| reservimarkkinat | ajankohtaista, yhteystiedot (ET: 3 external primaries + kontakt; **ET does not link /uudised/**) | home ×1, energiavarastot ×1 (ET ×2) |
| prosessi | yhteystiedot only | home ×2, energiavarastot ×4 |
| ajankohtaista | 2 external, yhteystiedot ×2 | reservimarkkinat ×1 — **ET /uudised/ has ZERO body in-links** |
| meista | yhteystiedot only | **ZERO body in-links (both languages)** — nav-only page |
| yhteystiedot | tietosuoja | every page (11 body in-links FI) |
| kiitos | home only | form action |
| tietosuoja | none (dead end, by design) | yhteystiedot form note |

### Findings

- **Orphans (no body in-links):** `/meista/`+`/meist/` (both languages) and `/uudised/` (ET). For meista that is tolerable for an About page, but home's "Miksi meihin voi luottaa" section (fi:193–221) argues trust for 168 words without ever linking the trust page. ET uudised is worse: FI reservimarkkinat cites it as its source page (fi:630) but the ET counterpart paragraph (et:681) cites nothing — the ET news page is reachable only via nav.
- **Dead ends (no forward body path except the CTA):** aurinko-ja-akku, prosessi, meista. Prosessi and meista are late-funnel, so CTA-only is half-defensible; aurinko-ja-akku is mid-funnel and stranding.
- **Anchors:** `#tehomaksu` (fi:333) is referenced only from within its own page (fi:258); ET's `#voimsustasu` gets a cross-page deep link from home (et:95). Not orphaned, but FI should gain the parallel deep link when the FI example lands.
- **Missing cross-links the buyer journey needs** (in priority order):
  1. **aurinko-ja-akku → /prosessi/** — after "Mitä selvitämme ennen tarjousta" (fi:488–500) the natural question is "then what?"; today the only answer is the contact CTA.
  2. **home second-opinion callout → energiavarastot consulting anchor** — the callout (fi:184–187) makes the site's boldest offer ("teemme sen riippumatta siitä, ostatteko meiltä koskaan mitään") and links nowhere.
  3. **prosessi step 07 → /reservimarkkinat/** — "Liittyminen aggregaattoriin" (fi:697) names a concept the reader may not know; owner is one link away.
  4. **reservimarkkinat "Miten kohde pääsee markkinalle" → /prosessi/** — its step 04 "Ensin" (fi:611) is literally prosessi's thesis.
  5. **kiitos → /prosessi/** — direction: replace/augment "Takaisin etusivulle" with "what happens next" pointing at the process page; the highest-intent reader on the whole site is standing here.
  6. **home "Miksi meihin voi luottaa" → /meista/** — de-orphans the About page where trust-seekers actually are.
  7. FI home "Tehomaksut alas" card → `#tehomaksu` deep link (parity with ET) — after the FI DSO anchor lands (blocked by that open item, noted only structurally).
  8. ET reserviturud → /uudised/ somewhere — or accept the asymmetry deliberately; today FI models the cite-the-news-page pattern and ET abandons it.

---

## 5. Missing-pages analysis

### 5.1 Standalone võimsustasu/tehomaksu explainer — **BUILD-LATER (soon, both languages together)**
The strongest documented money-content on the site (ET's Elektrilevi-sourced example) is buried as 51% of a service page. A standalone explainer: (a) relieves the ET battery-page drift found in §2.2; (b) gives the only green-provenance savings artifact its own SEO surface ("võimsustasu", "tehomaksu" are exactly the queries a qualifying buyer types); (c) is already deep-linkable (`#voimsustasu` pattern proves demand from home). Battery page keeps mechanism + one worked example + link; the appendix rate table and "kaks lisahooba" move to the explainer. **Timing:** blocked on the FI DSO-anchor decision — build both language versions when the FI example exists, so the 10+10 mirror holds. Do not build ET-only.

### 5.2 "Kenelle se sopii / Kellele see sobib" qualification page — **NEVER (for now)**
Home's Kenelle section (fi:160–189) plus the "~100 kW" qualification chip (fi:271) already do the work in ~120 words. A standalone page would thin the content, add an 11th pair to maintain, and duplicate home. Cheaper fix with the same effect: surface the qualification line ("tyypillinen kohde…") on /yhteystiedot/ near the form, so self-selection happens at the moment of conversion. Revisit only if unqualified leads become a real cost.

### 5.3 FAQ page — **NEVER (until real questions exist)**
The site's architecture already answers its questions in place (three questions to any supplier, four technical questions, why-no-profit-numbers, financing-as-possibility). An FAQ today would be invented questions — the content equivalent of an undocumented figure, against the site's whole ethos. Build it when actual kartoitus conversations have produced a documented question list; then it is provenance-clean and genuinely useful. (Same "used twice before deploying" logic the business doctrine applies to tools.)

### 5.4 References page that stays empty — **NEVER as a page; keep the refslot pattern**
Doctrine forbids track-record claims; an empty /referenssit/ in nav is a structural admission of no track record, restated on every page load. The current pattern is strictly better: the refslot on home (fi:216–219) states the evidence standard ("emme julkaise referenssejä, joita emme voi todentaa") without a hollow URL. Create the page only simultaneously with the first measured, source-documented project — and then put it in nav position 5 (the "proof" slot, before Ajankohtaista).

### 5.5 Other candidates identified
- **Second-opinion / offer-review ("tarjouksen tarkistus") page — BUILD-LATER; anchor first.** Three pages carry this proposition with no owner (§3). Step 1 (now): anchor on energiavarastot's consulting section + links from home callout and reservimarkkinat tool. Step 2 (after the first real review is delivered): consider a standalone page — it is the most differentiated, lowest-friction entry offer the company has.
- **Backup power / saarekekäyttö subsection — BUILD (as a section, not a page).** Home sells "Varavoima häiriöissä" as a benefit card (fi:121–124) and routes to a page where the topic exists only as one button caption (fi:440). Smallest honest fix: a short KOHDEKOHTAINEN-labelled block on /aurinko-ja-akku/ (or /energiavarastot/) that the card can legitimately land on.
- **Glossary/sanasto — NEVER.** kW/kWh already explained in context on the battery page (fi:283–291), which is the right altitude.
- **Downloadables (kohdetietolomake PDF)** — already planned in source comment (fi:816); a content item, not a page. No action.

---

## 6. Nav order assessment

Current: `Energiavarastot · Aurinkosähkö + akku · Reservimarkkinat · Näin se etenee · Ajankohtaista · Meistä · [Pyydä kartoitus]` (fi:18–29; ET mirrors).

**Mapped to the buyer journey: service → service → mechanism → process → news → about → contact. This is already the right sequence.** The service pair leads, the income mechanism is explained before the process that gets you there, Ajankohtaista sits in the proof/authority slot (its DOKUMENTOITU sourcing is currently the site's only proof surface), Meistä before the CTA. Reordering would not improve it; I recommend **no change to sequence**. When the first documented reference exists, the references page takes position 5 and Ajankohtaista shifts right.

**Do labels promise what pages deliver?**

| Label | Verdict | Direction |
|---|---|---|
| Energiavarastot | Delivers (post-e2919f3) | — |
| Aurinkosähkö + akku | **Over-promises solar** — page is 50% retrofit engineering, ~0 solar-delivery substance (§2.3) | Fix the page, not the label: home's offer stack (fi:79–84) makes solar deliverable #1, so the label must stay and the page must earn it. |
| Reservimarkkinat | Delivers exactly | — |
| Näin se etenee | Delivers exactly | — |
| Ajankohtaista / Uudised | Slightly over-promises cadence; page is curated primary sources | Acceptable now; if cadence stays low, give Madis direction toward a sources/market-review framing. |
| Meistä | Delivers | — |
| Pyydä kartoitus (CTA) | Honest per doctrine (no booking system) | Converge the three names for /yhteystiedot/ (nav CTA vs footer "Kohdekartoitus" vs footer "Yhteystiedot") toward the kartoitus-framing. |

---

## 7. Priority actions (IA only, doctrine-safe)

1. **De-drift ET energiasalvestid** by extracting appendix-depth võimsustasu content to a future explainer pair (§5.1) — sequenced after the FI DSO-anchor decision; until then, accept and do not add more tariff depth to the battery page.
2. **Give /aurinko-ja-akku/ its promised substance** (solar-delivery scope + backup-power block) or stop routing "Varavoima" and "Oma tuotanto" cards there unmodified.
3. **Fix the 8 missing cross-links** (§4), starting with aurinko-ja-akku→prosessi, home callout→consulting anchor, kiitos→prosessi.
4. **Cap the reserve-disclaimer at once per page** (home currently 2×) — chips elsewhere keep linking /reservimarkkinat/ as owner.
5. **Do not build**: empty references page, invented FAQ, standalone qualification page. **Build later**: võimsustasu/tehomaksu explainer, offer-review page (anchor first).
6. **Keep nav order as-is.** The IA problem on this site is page-content allocation and cross-linking, not sequence.

---

## Appendix A2 · Cold Reader (buyer simulation)

# Cold Reader Audit — SAMA Energia website

Sources read in full: `src/fi.html` (940 lines, 10 pages) and `src/et.html` (1019 lines, 10 pages).
Personas: **PM** = plant/production manager (technical, owns the bill problem) · **CFO** = numbers/risk/payback/who-stands-behind-this · **OWN** = time-poor owner on mobile (first screen decides).

Method: each page read top-to-bottom cold, hero judged as the only guaranteed screen on mobile. FI and ET compared per page. Doctrine constraints respected in every fix suggestion (savings first, reserve = scenario, DSO first, nothing undocumented, no partner names, financing = possibility, native pass for any new copy — all fixes below are *direction*, not final copy).

---

## Global findings (apply to almost every page)

1. **The provenance tag system is never explained anywhere.** LASKETTAVISSA / KOHDEKOHTAINEN / SKENAARIO / DOKUMENTOITU / MALLINNETTU / TARKISTETAAN (and ET equivalents) appear as colored chips on 6+ pages with **no legend on any page**. A cold reader cannot tell these are a deliberate honesty system — the site's single best differentiator reads as unexplained internal markup. Worst case: **TARKISTETAAN/KONTROLLITAKSE looks like an unfinished site leaked to production.** Fix direction: a one-line legend at first occurrence per page, or a tiny "what these labels mean" footer strip. This is the cheapest, highest-leverage fix in this audit.
2. **FI front-of-funnel has no numbers at all; ET does.** The FI tehomaksu example is a literal placeholder `[X,XX €/kW/kk — TARKISTETAAN]` while ET has a fully worked, source-stamped example (348 €/kk, 4 176 €/a, Elektrilevi rate card, rates table). A Finnish CFO who follows the promised anchor "Tehomaksu-esimerkki alempana" lands on a bracketed placeholder. **This is the single worst CFO moment on the FI site.**
3. **Signature interactive elements are JS-dependent with empty fallbacks.** The frequency trace (`<path id="wave" d="">`) and the operating-mode diagram captions (`data-cap`, `#opsCap` empty) render as blank boxes without JS. On a slow mobile connection the FI/ET front hero shows a labeled empty rectangle ("Verkon taajuus…") as the second thing on screen.
4. **"Who are these people" is answered too late and too thin.** No name, no company age, no locality signal on the front page. The site repeatedly asks "who stands behind the numbers in year five" — the answer (one founder, no photo, no verifiable history, no references yet) only appears on Meistä. Doctrine forbids fake references and extra bios; it does not forbid stating founding year, registration, or "founder-led, Helsinki-based, both markets natively" on the front page.
5. **Nav label "Reservimarkkinat"/"Reserviturud" is jargon as a menu item.** A cold OWN doesn't know the word before visiting the page it names.
6. **Ledes are long (40–80 words).** On mobile they push the CTA below the fold on most heroes. Every hero's first sentence should carry the whole message; most currently need sentence two or three.

---

## Page 1 — Front page (FI `/` · ET `/`)

### 1. First-screen takeaway
Quoted hero:
> **h1:** "Yhteinen verkko. Itsenäinen energia." / "Ühine võrk. Sõltumatu energia."
> **lede:** "Rakennamme yritysten energiaomavaraisuutta: aurinkosähkö, energiavarastot ja ohjaus tekevät liittymästänne aktiivisen osan sähköjärjestelmää. Ja mitä se kohteessanne oikeasti tuottaa — siihen vastaamme **kirjallisesti**, ennen kuin mitään allekirjoitetaan."

- **PM:** "Solar + batteries + some control system, for companies. They promise written answers." Understands the offer category only from the eyebrow, not the h1 — "Yhteinen verkko. Itsenäinen energia." is a slogan, not information. "tekevät liittymästänne aktiivisen osan sähköjärjestelmää" is abstract even for a PM.
- **CFO:** "A vendor that promises things in writing. No numbers, no company facts, no price signal." The kirjallisesti promise registers — it is the one hook that works for this persona.
- **OWN (mobile):** eyebrow + slogan + first line of lede is the realistic first screen. Takeaway: "energy company, batteries, businesses." The differentiator (kirjallisesti, before signing) sits at the END of the lede — below the fold. On mobile the strongest sentence on the site is likely unseen.

### 2. Where they got lost
- **All personas:** the frequency widget ("50,000 Hz…") sits INSIDE the hero, before the reader knows what SAMA sells. It answers a question nobody has asked yet ("why do grids need storage") using three unintroduced concepts (taajuus, kantaverkkoyhtiö, reservimarkkinat). PM reads it; CFO skims; OWN scrolls past a possibly-empty SVG box. It is the right content on the wrong screen — it belongs on /reservimarkkinat/ (where the same explanation already exists, better).
- **CFO** in "Mitä se tarkoittaa kohteessanne": six benefit cards, each stamped LASKETTAVISSA/KOHDEKOHTAINEN/SKENAARIO with no legend — the honesty system is invisible; the tags read as decoration.
- **OWN** in "Kenelle": the third segment ("Takaisinmaksu, tasekäsittely ja toimittaja…") drops *tasekäsittely* with zero support — a wall word.

### 3. Jargon inventory (front page)

| Term | Section | Explained in-page? | Stops whom |
|---|---|---|---|
| liittymä / liittymispunkt ("liittymästänne") | hero lede | No | OWN |
| taajuus 50,000 Hz | hero freq widget | Partly (one sentence) | OWN |
| kantaverkkoyhtiö (Fingrid/Elering) | freq note | Yes — named and role given | — |
| reservimarkkinat | freq note | Only "siihen reservimarkkinat perustuvat" | OWN, CFO |
| aggregaattori ("lisensoidun aggregaattorin kautta") | Mitä toimitamme 03 | **No** — first use, no gloss | OWN, CFO |
| tehomaksu / võimsustasu | benefit card 1 | No (mechanism on subpage only) | OWN, CFO |
| pörssisähkö / börsielekter | benefit card 2 | Partly ("lataus halvoilla tunneilla") | OWN |
| liittymän laajennus / huipputeho liittymän yli | benefit card 3 | No | OWN, CFO |
| saarekekäyttö / saartalitlus | benefit card 5 | **No** | OWN, CFO, PM pauses |
| reservitulo + "hinnat puolittuvat" | benefit card 6 | No context for *which* prices | OWN, CFO |
| takasyötön esto, tehonrajoitus | Kaksi lähtötilannetta | No (resolved on /aurinko-ja-akku/) | OWN |
| tasekäsittely / bilansihaldus | Kenelle, segment 3 | **No — never explained anywhere on the site** | OWN, CFO, even PM |
| verkkoyhtiö (vs kantaverkkoyhtiö) | Periaate 03 | No distinction made here | OWN |
| LASKETTAVISSA / KOHDEKOHTAINEN / SKENAARIO tags | benefit cards | **No legend** | all |
| kohdekartoitus / objektikaardistus | CTAs throughout | Only implicitly (free, written, non-binding — stated at page bottom) | OWN |

### 4. Unanswered questions after finishing the page
- **PM:** "How big is this thing physically, and what happens at my site during install?" (answered only on /energiavarastot/, not linked as such). "What does it do to my existing PV inverters?" (teased, not answered).
- **CFO:** "What does anything cost, even order of magnitude?" "Payback — years? ballpark?" "Who are you — how long have you existed, how many people?" Zero numbers on FI front page except 50,000 Hz.
- **OWN:** "Is this for someone my size?" (~100 kW threshold lives on /energiavarastot/ only, tagged TARKISTETAAN). "Who am I calling?" (no name until Meistä/Yhteystiedot).

### 5. Stop-reading point
- **OWN:** the frequency widget — second element on mobile; a physics aside (or an empty box) before the offer. Bails to nav or leaves.
- **CFO:** end of the six benefit cards — six claims, six "Lue lisää", no number; without the tag legend, no reason to believe the discipline. Skims the rest.
- **PM:** survives the page; slows at "tasekäsittely" and at aggregaattori-without-gloss.

### 6. VERDICT
**FI: MOSTLY.** The card grid, the two-doors section and the Periaatteet earn the scroll; the weakest link is the **hero itself** — slogan h1 + buried differentiator + physics widget occupying the decisive screen. **ET: MOSTLY, slightly better** — identical structure, but benefit card 1 deep-links to a real worked example (`/energiasalvestid/#voimsustasu`); FI's same card links to a page whose example is a placeholder. FI/ET difference: ET front page keeps its promise; FI front page doesn't yet.

---

## Page 2 — Energiavarastot (FI `/energiavarastot/`) · Energiasalvestid (ET `/energiasalvestid/`)

### 1. First-screen takeaway
> **h1 (FI):** "Teollisuuden energiavarasto — mitoitettuna teidän omista kulutustiedoistanne."
> **lede:** "Olemme riippumattomia valmistajista. Valitsemme laitteen kohteeseen emmekä sovita kohdetta laitteeseen, jota satumme myymään. Jos paras ratkaisu kohteeseenne ei tule meiltä, sanomme senkin."

- **PM:** "Industrial battery, sized from my actual consumption data, vendor-independent." Clear and credible. Best hero on the site for this persona.
- **CFO:** "Independent, will even say no." Trust-building, but still no what-do-I-get. The mono breadcrumb "KOHDEKARTOITUS → ANALYYSIPAKETTI → TOTEUTUS → ELINKAARI" is insider shorthand — four unexplained nouns as the third hero element.
- **OWN:** h1 works ("sized from your own data"); lede is about the vendor, not about the owner's problem. Passable.

### 2. Where they got lost
- **CFO, FI only — critical:** "Mitä saatte" promises "Tehomaksu-esimerkki alempana"; the anchor `#tehomaksu` delivers "Määrä: **[X,XX €/kW/kk — TARKISTETAAN: verkkoyhtiön tehosiirtohinnasto]**". A promised example that is a bracketed placeholder. This reads as either unfinished or evasive — fatal for the persona whose entire visit is about this section. (Doctrine forbids inventing the number; it does not forbid removing/softening the *promise* until the Helen/Caruna/Elenia anchor rate is documented, or showing the ET-style mechanism with the rate line clearly marked "hinnasto valitaan ja dokumentoidaan" in prose instead of a naked bracket.)
- **OWN:** "Tyypillinen kohde: keskijännite- tai suuri pienjänniteliittymä, kuukausihuiput alkaen ~100 kW `TARKISTETAAN`" — the size-gate sentence, the one thing OWN needs, is written in connection-class jargon and carries an unexplained warning chip.
- **ET, CFO minor:** "1,31 senti lisahooba iga nihutatud kWh kohta" and the notation "2,06 s/kWh" — "s" = senti reads as *seconds* to a cold reader. Also VKL5/VMA2/VKA4 package codes are used with no note that they are Elektrilevi tariff packages ("pakett" alone doesn't say whose).

### 3. Jargon inventory

| Term | Section | Explained in-page? | Stops whom |
|---|---|---|---|
| KOHDEKARTOITUS → ANALYYSIPAKETTI → TOTEUTUS → ELINKAARI | hero mono line | Later on the page (Näin etenemme) | OWN at first screen |
| tuntitiedot / tunniandmed | Mitä saatte | No ("hourly metering data" assumed known) | OWN |
| keskijännite / suuri pienjänniteliittymä · keskpinge / madalpinge | Tyypillinen kohde | **No** | OWN, CFO |
| ~100 kW + TARKISTETAAN chip | Tyypillinen kohde | No legend for the chip | all |
| kW vs kWh, kesto | Järjestelmä itse | **Yes — model explanation, best on the site** | — |
| liittymäpiste / liitumispunkt | Järjestelmä itse closing line | No | OWN |
| tunnin keskiteho / tunni keskmine võimsus | Tehomaksu example | **Yes** ("mitattu, ei hetkellinen huippu") | — |
| tehosiirtohinnasto (FI) | Tehomaksu DOKUMENTOITU column | No | OWN |
| VKL5, VMA2… package codes (ET) | näidisarvutus + lisa table | Partly (rates given; issuer named in source line only) | OWN, CFO pauses |
| käibemaksuta (ET) | rate lines | Yes (stated) | — |
| läbilaskevõime tasu, summaarne arvestus (ET) | Kaks lisahooba | Partly | OWN |
| tipuaja/öö edastamine "2,06 s/kWh" (ET) | Mida näide ei sisalda | **No — "s" ambiguous** | all |
| akukaod 10–15% (ET) | Mida näide ei sisalda | Yes | — |
| reservivalmius | Mitä saatte 3 | Link-out only | OWN |
| DOKUMENTOITU / MALLINNETTU stamps | Tehomaksu section | No legend | CFO (misses the point of the system) |

### 4. Unanswered questions
- **PM:** "Install: how long is my site disturbed, does production stop?" (Prosessi gives weeks but not disruption). "Lifetime, cycles, warranty, degradation?" — nowhere on the site. "Winter performance outdoors?" — "asennetaan ulos" raises it, nothing answers it.
- **CFO:** FI: "Show me one number." ET: has 4 176 €/a — next question "what does the 125 kW / 250 kWh device itself cost?" — never addressed, not even as "hinta selviää analyysipaketissa". "Payback on savings alone?" — the site tells vendors to answer this (reservimarkkinat, question 1) but never demonstrates its own answer even as a labeled model.
- **OWN:** "Am I big enough?" (~100 kW is chipped TARKISTETAAN), "What will the kartoitus ask of me?"

### 5. Stop-reading point
- **CFO (FI):** the `[X,XX]` placeholder — the page's own climax. Bails with "come back when it's finished."
- **OWN:** hero mono breadcrumb + "Mitä saatte" is survivable; bails at the connection-class sentence.
- **PM:** reads to the end; ET rate-package appendix table is the only skim zone.

### 6. VERDICT
**FI: NO — weakest link: the placeholder tehomaksu example that the page structure builds toward.** Everything before it earns the scroll; the destination breaks the promise. **ET: YES** — the worked example with source stamps is the strongest single section on either site; only the "s/kWh" notation and unglossed package codes chip at it.

---

## Page 3 — Aurinkosähkö + akku (FI `/aurinko-ja-akku/`) · Päikeseelekter + aku (ET `/paike-ja-aku/`)

### 1. First-screen takeaway
> **h1:** "Aurinko tuottaa.<br>Akku ajoittaa." / "Päike toodab. Aku ajastab."
> **lede:** "Yhdessä ne tekevät kiinteistöstänne tuottajan, joka käyttää oman sähkönsä silloin, kun se on arvokkainta. Toimitamme koko järjestelmän alusta asti — tai täydennämme sen, joka teillä jo on."

- **PM:** "PV + battery as one system; they retrofit onto existing PV." Clear. The best two-way h1 on the site — verb pair carries the mechanism.
- **CFO:** understands positioning; no economics on the first screen (or the whole page — this page has zero numbers).
- **OWN:** works on mobile — short h1, first lede sentence self-sufficient. Best first screen on the site for OWN.

### 2. Where they got lost
- **OWN:** the dark section "Neljä kysymystä, jotka ratkaistaan ensin" — four cells of takasyöttö/tehonrajoitus/mittaus/tiedonsiirto phrased as questions with no statement of *why they matter* ("what happens if you ignore them" is implied, never said). Then the SVG diagram with mode buttons whose captions are JS-injected — without JS an empty caption area. OWN bails here.
- **CFO:** same section — it is a PM conversation. Nothing on the page says what solving the four questions costs or protects in euros ("olemassa olevan investoinnin arvo" is the implicit stake; it's never stated).
- **PM:** does not get lost — this page is written for PM and lands. Minor: "aggregaattorin kanssa" appears in the pre-offer checklist with no in-page gloss (defined only on /reservimarkkinat/).

### 3. Jargon inventory

| Term | Section | Explained in-page? | Stops whom |
|---|---|---|---|
| takasyöttö / tagasitoide | Neljä kysymystä 01 | **No — what back-feed is / why forbidden is never said** | OWN, CFO |
| tehonrajoitus / võimsuse piiramine | Neljä kysymystä 02 | Partly (question form only) | OWN |
| liittymäpiste (mittaus liittymäpisteessä) | 03 + diagram | No definition; role explained | OWN |
| tiedonsiirron katkeaminen → "turvallinen tila" / vikaturvallinen | 04 + right column | **Yes — well explained** | — |
| invertteri / inverter | diagram + checklist | No (assumed) | OWN |
| hybridi-invertteri / hübriidinverter | Kokonaisuus 02 · ARKKITEHTUURI | **No** — named as a choice, not explained | OWN, CFO |
| saarekekäyttö (KATKOS/KATKESTUS data-cap) | mode buttons | Partly, JS-only text | OWN (no-JS: not at all) |
| aggregaattori | pre-offer checklist + RESERVI data-cap | No in-page gloss | OWN, CFO |
| kWp | — (only on contact form) | — | — |
| tehokatto ("HUIPPU" data-cap: "tehokaton alapuolella") | mode captions | No | OWN |

### 4. Unanswered questions
- **PM:** "Which inverter brands/protocols have you actually integrated?" (hardware-neutral doctrine limits naming, but "vakiotuotteita, vakiintuneilta suomalaisilta toimittajilta" is the only gesture). "Does my PV production stop during the retrofit?"
- **CFO:** "What does the retrofit cost relative to the original PV investment?" "Does adding the battery void my PV warranties?" — a real fear, never touched.
- **OWN:** "How big a battery for my 50 kWp array?" — no sizing intuition offered here (the kW/kWh explainer lives on /energiavarastot/ and is not linked from this page's body).

### 5. Stop-reading point
- **OWN:** the four-questions grid → diagram block (dark, dense, JS-dependent).
- **CFO:** mid "Neljä kysymystä" — no economic frame anywhere; skips to CTA or leaves.
- **PM:** none; reads fully.

### 6. VERDICT
**FI & ET: MOSTLY** (pages are near-identical mirrors; ET diagram labels properly localized). Weakest link: **takasyöttö is the page's organizing threat and is never explained** — one plain sentence ("verkkoon saa syöttää vain luvatun määrän; ylitys on liittymäehtojen rikkomus" — direction only, native pass needed) would let OWN and CFO understand why the four questions exist.

---

## Page 4 — Reservimarkkinat (FI `/reservimarkkinat/`) · Reserviturud (ET `/reserviturud/`)

### 1. First-screen takeaway
> **h1:** "Reservimarkkinat: mitä ne ovat, mitä ne vaativat ja mitä emme niistä lupaa"
> **lede:** "Tämä sivu selittää mekanismin. Se ei sisällä tuottolukuja — ja alempana kerromme, miksi."

- **PM:** "An explainer, and they refuse to publish revenue numbers." Reads as confident.
- **CFO:** "No revenue numbers, on purpose, reason below." Unusual enough to earn the scroll — for a CFO who arrived cold from search, though, the *word* reservimarkkinat is still undefined at this point (eyebrow and h1 assume the reader knows it's a revenue market at all).
- **OWN:** honest but abstract; "mitä emme lupaa" is intriguing. Survivable first screen.

### 2. Where they got lost
- **OWN:** the FCR-N/FCR-D/aFRR/mFRR product table — four acronyms, "symmetrisesti", "kesto suhteessa tehoon". Functions are explained (good) but the table is sized for PM. OWN's real question — "roughly what could this add?" — is deliberately unanswered, and the page never offers even the doctrine-legal alternative (scenario framing: "aggregaattorin arvio + puolitetut hinnat" is *described* but never *shown*, even as a labeled illustrative structure without figures).
- **CFO:** "Miksi emme julkaise tuottolukuja" is the best CFO copy on the site — but it ends without a bridge: "so what WILL I see, and when?" The answer (aggregator's estimate inside the analyysipaketti at step 04) exists on /prosessi/ and is not stated here.
- **PM:** nothing structural; the market-depth argument (">4 GW jonossa") requires following a link to Ajankohtaista to see the source — acceptable, slightly annoying.

### 3. Jargon inventory

| Term | Section | Explained in-page? | Stops whom |
|---|---|---|---|
| taajuus / 50,000 Hz | Perusasia | **Yes — clean explanation** | — |
| kantaverkkoyhtiö (Fingrid/Elering) | Perusasia + table footer | Yes | — |
| FCR-N / FCR-D / aFRR / mFRR | product table | Function yes; acronym names never expanded | OWN |
| symmetrinen otto/anto | table row FCR-N | Partly | OWN |
| energiamitoitus suhteessa tehoon | table lede | Assumes the kW/kWh explainer from /energiavarastot/ — **not linked** | OWN, CFO |
| aggregaattori / agregaator | steps 01 | **Yes — best first-use explanation on the site** | — |
| esikvalifiointi / eelkvalifitseerimine | steps 02 | **Yes** | — |
| jakeluverkkoyhtiö vs kantaverkkoyhtiö | steps 04 | **Yes — the only page that makes the distinction** | — |
| tasekäsittely | — | (not used here; used on front page unexplained) | — |
| liittymisjono / >4 GW (FI) | Miksi emme julkaise | Source behind a link | CFO pauses |
| tasakaalustamisvõimsuse kulu, ELTS-viited (ET extra section) | Miks reservivajadus kasvab | Yes, with sources | — |

### 4. Unanswered questions
- **CFO:** "Give me the shape of the number — is reserve income 5% or 50% of the case?" (Doctrine allows scenarios; the page describes the scenario method and shows none.) "When in your process do I see the aggregator's estimate?" — unanswered here.
- **PM:** "Which products would MY site realistically qualify for?" — page says the aggregator decides; fair, but not even a typical-case orientation ("yleisin lähtökohta FCR-D" is in the table — good, could be surfaced harder).
- **OWN:** "Is this money worth the complexity at all?" leaves the page unresolved by design; the geopolitics closer partially compensates emotionally.

### 5. Stop-reading point
- **OWN:** the product table (second section). The strong "Miksi emme julkaise" section sits BELOW it — the persona most susceptible to revenue-promise sales pitches never reaches the antidote.
- **CFO:** none before "Kolme kysymystä" — that section (three questions for any vendor) is a keeper and likely gets screenshotted.
- **PM:** none.

### 6. VERDICT
**FI: MOSTLY** — weakest link: product table ahead of the "why no numbers" argument; order inverts the persuasion. **ET: YES** — same order issue, but the extra section "Miks reservivajadus kasvab" (three documented Elering/ERR anchors) plus the Estonia-specific "every consumer pays from 2026" framing gives the ET reader a materially stronger, sourced case. FI has no equivalent of this section — a real FI/ET content gap.

---

## Page 5 — Prosessi (FI `/prosessi/`) · Protsess (ET `/protsess/`)

### 1. First-screen takeaway
> **h1:** "Seitsemän vaihetta, ja kauanko kukin kestää."
> **lede:** "Jokainen kohde etenee samalla tavalla. Se ei ole byrokratiaa — juuri siksi tiedämme etukäteen, mitä tapahtuu seuraavaksi. Energiavarastot-sivun neljä palveluvaihetta ovat tämä sama matka, tässä viikkotasolla."

- **PM:** "Seven steps with durations." Exactly what the persona wants; best page-purpose match on the site.
- **CFO:** "Structured process, durations stated." Good. The lede's third sentence ("Energiavarastot-sivun neljä palveluvaihetta…") is cross-referential bookkeeping that means nothing to a cold reader who hasn't seen that page — wasted first-screen words.
- **OWN:** clear.

### 2. Where they got lost
- **OWN:** Step 01 asks for "liittymisteho, pääsulake, muuntajan teho, olemassa oleva tuotanto, mittausjärjestely…" — a checklist of terms OWN cannot self-serve. The reassurance that SAMA helps fill it is absent (contact form says fields are optional; this page doesn't).
- **CFO:** Step 04 "Analyysipaketti … teette päätöksen" — decision about *what*? Price appears only at step 05 ("Porrastettu tarjous"). Whether steps 01–04 cost money is never stated on this page (the front page says kartoitus is free; whether the full analyysipaketti is free is stated nowhere on the site). Also "porrastettu tarjous" — tiered how? Unexplained.
- **All:** no total. Reader must sum 1+1+2–6+2–4+1–2+4–12 weeks ≈ 11–26 weeks themselves. One line ("tyypillisesti X–Y kuukautta kartoituksesta käyttöönottoon") would answer the calendar question every persona has.

### 3. Jargon inventory

| Term | Section | Explained in-page? | Stops whom |
|---|---|---|---|
| liittymisteho, pääsulake, muuntajan teho, mittausjärjestely, pääkeskus | Step 01 | No | OWN |
| verkkoyhtiön ennakkoselvitys | Step 03 | Mechanism yes ("kirjallinen kanta liittymäpisteestänne") | — |
| analyysipaketti | Step 04 | Contents never itemized on this page | CFO |
| porrastettu tarjous / astmeline pakkumine | Step 05 | **No** | CFO |
| aggregaattori | Step 07 | No gloss on this page | OWN |
| valtuutus (te allekirjoitatte valtuutuksen) | Step 03 | Partly | — |

### 4. Unanswered questions
- **CFO:** "What do steps 01–04 cost me?" "What am I committed to and when?" (kartoitus non-binding is said elsewhere; this page — the commitment map — never states the no-commitment boundary). "Total calendar time?"
- **PM:** "What do I need to physically provide at step 06 besides access?" "Downtime?"
- **OWN:** "Can you fill the step-01 form with me?"

### 5. Stop-reading point
- Nobody bails; the page is short and scannable. OWN skims step 01's noun list.

### 6. VERDICT
**FI & ET: YES** (identical mirrors). Weakest link: **money and commitment are invisible on the commitment page** — no cost-of-process statement, no total duration, "porrastettu tarjous" unexplained.

---

## Page 6 — Meistä (FI `/meista/`) · Meist (ET `/meist/`)

### 1. First-screen takeaway
> **h1:** "Laite on muuttunut hyödykkeeksi. Osaaminen ei." / "Seade on muutunud kaubaks. Oskus mitte."
> **lede:** "Akkujärjestelmän voi hankkia mistä tahansa. Arvo syntyy siitä, että joku kertoo rehellisesti, mitä se kohteessanne tekee, vie sen verkkoyhtiön prosessin läpi, sovittaa sen olemassa olevaan aurinkosähköön sitä vaarantamatta ja tuottaa dokumentaation, joka kestää tarkastelun kolmen vuoden päästä. Se on meidän työmme."

- **PM:** "Integrator whose product is diligence, not hardware." Lands.
- **CFO:** understands the thesis; opens the page hunting for facts about the firm — the first screen contains none (no age, size, registration, people).
- **OWN:** the h1 is an aphorism; OWN parses it on second read. The 60-word single-sentence lede is the longest on the site — mobile fold eats the payoff.

### 2. Where they got lost
- **CFO:** Perustaja section. It names one person, no photo, no dates, no employers, no project count — "Kaupallinen ja tekninen työ … parissa" is deliberately unfalsifiable, and this persona notices exactly that on a site whose whole pitch is falsifiability. The site's recurring promise ("toimittaja, joka vastaa luvuistaan vielä viidentenä vuonna") collides silently with what is visibly a one-person company with no references. Doctrine forbids padding — but it permits verifiable minima: founding date, Y-tunnus (already in footer, not here), "founder-led", and the honest referenssit-slot language that the FRONT page has and this page lacks.
- **FI-specific confusion:** "Emme ole suomalainen yritys, jolla on vironkielinen sivu." — on the FINNISH page, after the footer says SAMA Energia **Oy, kotipaikka Helsinki**. A Finnish cold reader stumbles: "so what are you?" On ET the same sentence contradicts the .fi domain and Oy footer (already flagged in a source comment). The line needs the founder's decision either way; as published it costs trust with cold readers in both languages.
- **OWN:** "tekninen dokumentaatio neljällä kielellä" — which four? Trivial but distracting.
- Named companies "Fingrid ja Elering, Caruna, Elenia, Helen, Vantaan Energia ja Elektrilevi" are listed without saying what they are — an OWN outside those DSO areas reads a name soup. (These are regulators/DSOs, not partners, so doctrine-safe — but say the category word.)

### 3. Jargon inventory

| Term | Section | Explained in-page? | Stops whom |
|---|---|---|---|
| verkkoyhtiön prosessi | hero lede | No | OWN |
| aggregaattorikumppanuudet | Perustaja | No | OWN, CFO |
| verkkovaatimusten täyttäminen olemassa olevan tuotannon rinnalle | Perustaja | No | OWN |
| reservimarkkinoille osallistumisen rahoitusmallit | Perustaja | No | CFO ("do you finance or not?" — collides with the possibility-only financing doctrine elsewhere) |
| Caruna, Elenia, Helen, Vantaan Energia, Elektrilevi | Perustaja | Not identified as DSOs | OWN |
| reservituloennuste | Miksi olemassa | Partly (page context) | — |

### 4. Unanswered questions
- **CFO:** "How long has this company existed? How many people? Balance sheet enough to honor a 5-year promise? Insurance?" — none addressed; company age is one Y-tunnus lookup away, so silence looks like avoidance rather than modesty.
- **OWN:** "Will I be dealing with Madis himself?" (implied, never said — a genuine one-person advantage that could be claimed honestly).
- **PM:** "Who actually does the electrical work?" (answered on /aurinko-ja-akku/ — "sertifioitu sähköurakoitsija" — not here).

### 5. Stop-reading point
- **CFO:** end of Perustaja block — leaves with the year-five question sharpened, not answered.
- **OWN:** mid-lede on mobile.
- **PM:** reads all; it's short.

### 6. VERDICT
**FI & ET: MOSTLY.** Weakest link: **the founder block undermines the site's own falsifiability standard** (no verifiable anchors) plus the "emme ole suomalainen yritys" sentence confusing both audiences. FI/ET differ only in that flagged sentence's direction of contradiction.

---

## Page 7 — Yhteystiedot (FI `/yhteystiedot/`) · Kontakt (ET `/kontakt/`)

### 1. First-screen takeaway
> **h1:** "Aloitetaan kulutustiedoistanne." / "Alustame teie tarbimisandmetest."
> **lede:** "Nopein tapa selvittää, sopiiko energiavarasto kohteeseenne, on kohdekartoitus. Kentät ovat alla — pakollisia ovat vain nimi ja sähköposti, loput nopeuttavat arviota."

- **All personas:** clear, low-friction, honest ("only name + email required"). Best-converting hero on the site. OWN on mobile sees exactly what's needed.

### 2. Where they got lost
- **OWN:** optional field labels — "Pääsulake tai liittymisteho", "Vuosikulutus … MWh/v", "kWp" — no help text beyond placeholders. Fields are optional so nobody is blocked; but OWN can't tell whether skipping them makes the answer worse ("nopeuttavat arviota" covers it — adequate).
- **CFO:** nothing on this page says what happens next in process terms (a one-line "saatte vastauksen arkipäivän kuluessa; kartoitus on maksuton eikä sido" exists in pieces — the maksuton/ei sido reassurance is NOT on this page's hero, only on the front page and in the meta description). Cold visitors landing directly here from search miss the free/non-binding promise entirely — it should be on this page.
- Trust wrinkle for FI cold readers: primary phone is +372 (Estonian), company footer says Helsinki. Minor, real.

### 3. Jargon inventory

| Term | Section | Explained in-page? | Stops whom |
|---|---|---|---|
| pääsulake / liittymisteho | form field | Placeholder example only ("esim. 400 A tai 250 kW") | OWN |
| vuosikulutus MWh/v | form field | Placeholder only | OWN |
| kWp | form field | No | OWN |
| verkkoyhtiö | form field | Placeholder ("esim. Elenia") | — |
| kohdekartoitus | hero | Not defined here (free? non-binding? not stated on this page) | CFO, OWN |

### 4. Unanswered questions
- **CFO/OWN:** "Is this free and non-binding?" — stated on the front page and in the data-desc, **absent from the visible page**. The single most important missing sentence on this page.
- **OWN:** "Where do I get my kulutustiedot?" (Fingrid Datahub / e-elering exports — a one-line pointer would remove the biggest practical blocker the h1 itself creates: the page is titled "let's start from your consumption data" and never says how to get them).

### 5. Stop-reading point
- None serious; the form is above the fold on desktop. On mobile the direct-contact block (Madis, phone, WhatsApp) sits below the full form — time-poor OWN who just wants to call scrolls through 12 fields to find the number.

### 6. VERDICT
**FI & ET: YES.** Weakest link: free/non-binding promise missing on the page where the decision is made; secondary: no pointer to where consumption data lives.

---

## Page 8 — Kiitos (FI `/kiitos/`) · Aitäh (ET `/aitah/`) — noindex

Hero-only page: "Viestinne on perillä." + response promise + direct contacts. Does its job for all personas; the repeated "arkipäivän kuluessa" commitment is good. Nothing to fix beyond keeping the noindex. **VERDICT: YES (both).**

---

## Page 9 — Ajankohtaista (FI `/ajankohtaista/`) · Uudised (ET `/uudised/`)

### 1. First-screen takeaway
> **h1:** "Mitä markkinalla tapahtuu — lähteineen."
> **lede:** "Emme pyydä teitä uskomaan meitä. Kokoamme tähän ensisijaisia lähteitä … ja kerromme lyhyesti, miksi ne ovat teollisuuskohteen omistajalle merkityksellisiä."

- **PM/CFO:** "Curated primary sources with commentary." Credible framing; "Emme pyydä teitä uskomaan meitä" is the best trust sentence on the site.
- **OWN:** understands it's a news page; unlikely to read items on mobile.

### 2. Where they got lost
- **Cold visitor from search:** this page never says what SAMA sells. Both items assume the reader already knows why a battery vendor is curating directives. The final CTA line is the only bridge. Weakest standalone page.
- **FI reader, structurally:** FI has **2 items**, ET has **4** — and ET's two extras (Elering metering transition deadline 31.12.2026; ELTS § 71 lg 10¹ double network-fee abolition) are the most commercially consequential facts on the entire ET site. Their absence from FI is *correct* (Estonian law) but leaves the FI page thin: no Finland-specific regulatory item beyond the shared Fingrid release.
- **OWN:** "10 TJ eli noin 2 700 MWh" — TJ is glossed with MWh (good); "liittymissopimus", "säätövoima", "sopimuskanta" not glossed.

### 3. Jargon inventory

| Term | Section | Explained in-page? | Stops whom |
|---|---|---|---|
| energiakatselmus(velvoite) / energiaaudit | item 1 (FI) / 3 (ET) | Mechanism yes | — |
| 10 TJ | same | **Yes** (≈2 700 MWh) | — |
| säätövoima / reguleerimisvõimsus | Fingrid item | No | OWN |
| liittymissopimus, sopimuskanta, liittymisjono | Fingrid item | No | OWN |
| salvestusüksuse mõõtmine, üleminekuperiood (ET) | item 1 | Yes, well | — |
| võrgutasu topeltarvestus, ELTS § 71 lg 10¹ (ET) | item 2 | **Yes — model explainer** | — |
| DOKUMENTOITU stamps | every item | No legend (same global issue) | all |

### 4. Unanswered questions
- **Cold search visitor:** "Who is publishing this and what do they sell?" — one intro sentence would fix it.
- **CFO (FI):** "Is there a Finnish equivalent of the ET double-fee story I should know about?" — the FI page gives no Finland-specific economics item.

### 5. Stop-reading point
- **OWN:** after the first item's source stamp. Fine — this page isn't for OWN.

### 6. VERDICT
**FI: MOSTLY** — thin (2 items) and doesn't stand alone. **ET: YES** — the two Estonian regulatory items are genuinely valuable cold content; only the missing who-we-are line keeps it from perfect standalone.

---

## Page 10 — Tietosuoja (FI `/tietosuoja/`) · Andmekaitse (ET `/andmekaitse/`)

Plain-language privacy page; "Keräämme vain sen, minkä annatte meille itse. Ei evästeitä, ei analytiikkaa." is on-brand and legible to all personas. ET correctly adds both supervisory authorities (FI + EE) and glosses Y-tunnus as "Soome registrikood". No jargon issues beyond GDPR article citations (expected here). **VERDICT: YES (both).** Note: this and the footer are the ONLY places the company's registration facts appear — Meistä should borrow them.

---

## Cross-page note — landing cold on front page vs. subpage

**Front-page lander misses:** nothing structurally — the front page links everything — but gets the weakest first screen (slogan + physics widget) and no numbers (FI) before committing to a click.

**Search lander on a subpage misses, per page:**
- **/energiavarastot/ (FI):** stands alone in structure but not in substance — its centerpiece example is a placeholder; the visitor also never learns kartoitus is free (said on front page + contact meta only).
- **/energiasalvestid/ (ET):** stands alone **best of all pages** — offer, device, process summary, worked example with sources, financing possibility, consulting. If only one URL is ever shared in Estonia, it should be this one.
- **/aurinko-ja-akku/:** assumes the reader knows SAMA is an integrator; no company-context sentence; no numbers; still coherent for PM.
- **/reservimarkkinat/:** stands alone well as an explainer; a search lander (likely searching "FCR-D korvaus" etc. — i.e., revenue-hunting) meets a page that refuses revenue numbers *after* the product table rather than before it.
- **/prosessi/:** stands alone; lede's cross-reference to "Energiavarastot-sivun neljä palveluvaihetta" is noise for cold landers.
- **/meista/:** stands alone; the nationality sentence confuses cold landers in both languages.
- **/yhteystiedot/:** stands alone EXCEPT it omits free/non-binding — the exact reassurance a cold lander needs before typing.
- **/ajankohtaista/:** does NOT stand alone — never says what SAMA is.
- **Every subpage:** provenance chips appear with no legend; the search lander has even less chance than the front-page lander of decoding TARKISTETAAN.

**The systemic cross-page gap:** the site's persuasion depends on three coined ideas — the provenance-tag system, the "kohdekartoitus → analyysipaketti" product ladder, and the savings-vs-scenario split. Each is *used* everywhere but *defined* only in one place (or nowhere: the tags). Cold entry order determines whether the reader ever meets the definition. A one-screen "how to read this site" pattern (legend + free/non-binding + who-we-are one-liner), repeated as a compact strip on every page, would make every page stand alone without adding new claims.

**Top priorities distilled (in order):**
1. FI `#tehomaksu` placeholder — unpublish the promise or ship the documented anchor rate (blocks FI CFO conversion).
2. Provenance-tag legend, all pages, both languages.
3. Free/non-binding statement onto /yhteystiedot/ + /kontakt/ visible copy.
4. Move/duplicate the frequency explainer off the front-page hero screen; put the kirjallisesti promise in the first lede sentence (native pass).
5. One-sentence glosses at first use for: takasyöttö (aurinko+akku), tasekäsittely (front), aggregaattori (front), hybridi-invertteri; fix ET "2,06 s/kWh" → spell out "senti".
6. FI parity items: an FI counterpart to ET's "Miks reservivajadus kasvab" sourced section, and a Finland-specific economics item on /ajankohtaista/.
7. Meistä: add verifiable minima (founding, registration, founder-led) and resolve the "emme ole suomalainen yritys" sentence.
8. /prosessi/: total duration line + what-costs-what boundary; /yhteystiedot/: where to get consumption data.

---

## Appendix A3 · Copy & Tone Editor

# Copy & Tone Audit — SAMA Energia website (src/fi.html + src/et.html)

Auditor: Copy & Tone Editor subagent. Scope: all published copy in the two source files (10 FI pages + 10 ET mirrors). HTML comments marked MADIS were excluded from copy analysis but mined for intent (see §9). Doctrine audited against: short declarative sentences; tables over prose; no marketing adjectives in analysis; two-hue provenance; savings-first; financing possibility-not-offer; no undocumented figures; CTA verb honesty.

Overall verdict up front: this is disciplined copy. The provenance system, the pending-markers, and the possibility-register financing language are applied consistently. The problems are concentrated: (a) a handful of unhedged outcome claims that slipped past the doctrine, (b) one 105-word paragraph, (c) an unresolved FI/ET depth gap on the tehomaksu example, and (d) self-certifying "honest" vocabulary used often enough to work against itself.

---

## 1. Promise-shaped sentences that overstep doctrine

| # | Quote | Page / line | Why it oversteps | Direction for fix |
|---|-------|-------------|------------------|-------------------|
| 1 | "Akku parantaa investointia, jonka olette jo tehneet." / "Aku parandab investeeringut, mille olete juba teinud." | Home, src/fi.html:145 / src/et.html:135 | Unconditional outcome claim made before any site-specific analysis. The site's own doctrine is "lasketaan teidän tiedoistanne" — this sentence asserts the result in advance. A CFO reads "parantaa" as a warranty. | Condition it on the analysis: the battery *can* improve the investment, and the kohdekartoitus shows whether it does in this case. Not "voi parantaa ehkä" — one clean conditional. |
| 2 | "…varasto ansaitsee 12 kertaa vuodessa." / "…salvesti teenib 12 korda aastas." | Energiavarastot, src/fi.html:344 / src/et.html:333 | "Earns 12 times a year" presumes successful peak-shaving every month of every year. The documented fact is only that metering resets monthly. The earning verb converts a billing mechanism into a revenue promise — inside the DOKUMENTOITU/DOKUMENTEERITUD column, which is worse. | State the mechanism, not the outcome: measurement resets monthly, so the saving opportunity recurs 12×/year. Keep the earning claim out of the green-tagged column. |
| 3 | "Laskelma kestää, vaikka markkina muuttuu." / "Arvutus peab vastu, isegi kui turg muutub." | Home P02, src/fi.html:207 / src/et.html:195 | Absolute claim about their own calculation's robustness under *any* market change. No calculation survives all markets; the honest claim is that it survives the reserve-price-halving scenario they actually model. | Bind the claim to the modelled scenario: the calculation holds *even with halved reserve prices* — which is what the preceding sentence already establishes. |
| 4 | "Jälkikäteen sovitettavaa ei jää" / "Tagantjärele sobitamist ei jää" | Aurinko+akku, src/fi.html:409 / src/et.html:462 | "Nothing remains to retrofit" is an absolute design-completeness guarantee. Real projects produce surprises; a lawyer reads this as a defect-free promise. | Design-intent phrasing: everything is resolved at the design table *so that* nothing is meant to be retrofitted; or scope it ("the four questions are resolved before the offer"). |
| 5 | "Olemme paikalla myös kolmantena vuonna, ja ensimmäisen vuoden luvut ovat edelleen tarkistettavissa." / "Oleme kohal ka kolmandal aastal…" — and "toimittaja, joka vastaa luvuistaan vielä viidentenä vuonna" / "tarnija, kes vastutab oma numbrite eest ka viiendal aastal" | Energiavarastot, src/fi.html:322 / src/et.html:311; Home, src/fi.html:181 / src/et.html:171 | Multi-year presence/accountability commitments from a company still in formation, with zero completed reference projects (the site says so itself at fi:218/et:206). Nothing documentable backs "year three" or "year five" today. | Keep the intent but anchor it to something real: contractual follow-up terms, the analysis remaining verifiable, the monitoring in vaihe 07. Avoid bare future-tense presence claims until there is a track record. |
| 6 | "Se on täysin vältettävissä, eikä välttäminen maksa mitään…" preceded by "Tämä on molemmilla markkinoilla suurin yksittäinen syy epäonnistuneisiin, viivästyneisiin ja budjetin ylittäneisiin akkuhankkeisiin." / ET mirror "See on mõlemal turul suurim üksik põhjus…" | Prosessi, src/fi.html:702 / src/et.html:766 | Two problems: "suurin yksittäinen syy" is an undocumented market-statistics claim (repo rule: no figures/claims without a documented source), and "täysin vältettävissä" is an absolute. | Either source the "biggest single cause" claim or downgrade it ("yleinen syy"). "Täysin" can go without losing force. |
| 7 | "…tasapainottumisen jälkeen markkina palkitsee tehokkaat varat" / "pärast tasakaalustumist premeerib turg efektiivseid varasid" | Reservimarkkinat, src/fi.html:630 / src/et.html:681 | Unhedged forecast of future market behaviour, in the very section whose thesis is "kukaan ei tiedä ennalta". Internally contradictory. | Mark it as expectation or mechanism ("markkinalogiikka suosii tehokkaita varoja"), not as a fact about the future. |
| 8 | "Sen rakentavat yritykset, jotka asentavat akun, koska se maksaa itsensä takaisin" / "kes paigaldavad aku, sest see teenib end tagasi" | Reservimarkkinat, src/fi.html:666 / src/et.html:730 | "Because it pays itself back" — generic payback assertion for batteries as a class. Elsewhere the site insists payback is case-specific and sometimes the answer is no (fi:307). | "koska laskelma osoittaa sen maksavan itsensä takaisin" — route the claim through the analysis, which is the whole brand. |
| 9 | "Komponentit ovat vakiotuotteita, saatavilla vakiintuneilta suomalaisilta toimittajilta lyhyillä toimitusajoilla." | Aurinko+akku, src/fi.html:483 (ET mirror src/et.html:535 drops "suomalaisilta") | "Lyhyillä toimitusajoilla" is a third-party performance promise SAMA does not control and has not documented. | Drop the delivery-time adverbial or scope it ("tyypillisesti"); availability claim alone carries the point. |
| 10 | "Kiitos — palaamme asiaan arkipäivän kuluessa." / "Aitäh — võtame ühendust tööpäeva jooksul." (also fi:835, fi:830 data-desc, et:900, et:895 data-desc) | Yhteystiedot + Kiitos, src/fi.html:805 / src/et.html:872 | One-business-day response is a hard service-level commitment for a one-person company. Fine if it is a real SLA — but it is stated five times across the two languages, so it must actually hold on holiday weeks. | Deliberate decision point, not a rewrite: keep only if operationally guaranteed; otherwise "mahdollisimman pian, viimeistään …". |
| 11 | "Teemme sen riippumatta siitä, ostatteko meiltä koskaan mitään." / "Teeme seda sõltumata sellest, kas ostate meilt kunagi midagi." | Home, src/fi.html:186 / src/et.html:176 | Unlimited free-work commitment (reviewing any third-party offer, for anyone, forever). Strong positioning — but legally an open-ended offer with no scope cap. | If intentional, keep; consider a quiet scope ("kohdekartoituksen laajuudessa"). Flagging for an explicit decision, not deletion. |

Not flagged (checked and found deliberate/compliant): "Mitään ei hankita, ennen kuin…" (fi:690, 701 / et:754, 765) — process commitments that ARE the doctrine; "Kohdekartoitus on maksuton eikä sido teitä mihinkään" (fi:227); the RAHOITUS blocks (fi:365 / et:418) — exemplary possibility-register wording with a goal-framed sentence ("Tavoite on, että…"); "Ei koskaan lupauksena" (fi:127) — an absolute about their own conduct, which is enforceable.

---

## 2. Hedges that undercut credibility

The site hedges with unusual discipline — most caution is single-hedge and load-bearing. Only a few spots collapse into mush:

| # | Quote | Page / line | Problem | Direction for fix |
|---|-------|-------------|---------|-------------------|
| 1 | "Hankinta voi olla mahdollinen myös ilman etumaksua…" / "Hange võib olla võimalik ka ilma ettemaksuta…" | Energiavarastot RAHOITUS, src/fi.html:365 / src/et.html:418 | "Voi olla mahdollinen" = "can be possible" — stacked modality that says nothing. The doctrine (possibility-not-offer) needs one hedge, not two. | Make the verb the action: "Selvitämme, onko hankinta ilman etumaksua mahdollinen rahoituskumppanin kautta." One hedge, active voice, same legal safety. |
| 2 | "Rahoitus rahoituskumppanin kautta voi olla mahdollinen — selvitämme vaihtoehdot, jos niin haluatte." / "…võib olla võimalik — selgitame võimalused välja, kui nii soovite." | Prosessi vaihe 05, src/fi.html:695 / src/et.html:759 | Three softeners in one sentence: voi + mahdollinen + jos niin haluatte. The opt-in is worth keeping; the double modal is not. Also "rahoitus rahoituskumppanin" is a clunky doublet. | Same fix as above; keep the opt-in clause. |
| 3 | "Täysi esimerkkilasku laaditaan, kun ankkuriverkkoyhtiön hinnasto on valittu ja dokumentoitu…" | Energiavarastot, src/fi.html:351 | Exposes internal editorial workflow ("we haven't picked our anchor DSO yet") to the customer. Reads as an apology for an unfinished page — especially next to the ET mirror, which has the full worked example. | Cut the workflow sentence. State what is true now (the mechanism + that the customer's number always comes from their own data) and ship the FI example (see §7.1). |
| 4 | "Määrä: [X,XX €/kW/kk — TARKISTETAAN: verkkoyhtiön tehosiirtohinnasto]" | Energiavarastot, src/fi.html:345 | A literal bracket placeholder in published copy, inside a green DOKUMENTOITU column. Honest, but it publicly displays an empty slot where the ET site shows 3,48 €/kW. Provenance discipline correct; credibility cost real. | Resolve before merge (MADIS notes confirm a verify-waiver covers it). If FI must ship first, drop the bullet entirely rather than show the blank. |
| 5 | "kuukausihuiput alkaen ~100 kW TARKISTETAAN" / "kuutipud alates ~100 kW KONTROLLITAKSE" | src/fi.html:271 / src/et.html:260 | Tilde + pending-tag = double uncertainty marker on the one number that qualifies the reader in or out. Compliant with the pending hue, but this is the highest-traffic pending marker on the site. | Confirm the threshold and drop the tag (already planned per MADIS comment); until then acceptable. |

Non-findings: "voi antaa huipputehon liittymän yli" (fi:112), "Vahvistetaan kohdekohtaisesti" (fi:122/et:114), "Harvemmin … ensisijainen tuote" (fi:580) — correct, single hedges. No apology tone found anywhere.

---

## 3. Sentence-length outliers (top 15 site-wide, by word count)

| # | Words | Location | Sentence (start) | Needs splitting? |
|---|------:|----------|------------------|------------------|
| 1 | 36 | src/et.html:974 | "Et vastata teie pöördumisele ja valmistada ette… (GDPR artiklid)" | No — legal-basis clause, genre-appropriate. |
| 2 | 35 | src/et.html:779 | "Väärtus sünnib sellest, et keegi ütleb ausalt, mida see teie objektil teeb, viib selle…" | **Yes** — four service claims chained; best converted to a 4-item list (see §4.10). |
| 3 | 33 | src/et.html:941 | "Uuendatud energiatõhususe direktiiv viib kohustusliku energiaauditi piiri…" | Yes — split at the colon; the threshold + deadline deserve their own sentence. |
| 4 | 32 | src/fi.html:894 | "Vastataksemme yhteydenottoonne ja valmistellaksemme… (tietosuoja-asetus)" | No — legal. |
| 5 | 32 | src/fi.html:715 | "Arvo syntyy siitä, että joku kertoo rehellisesti, mitä se kohteessanne tekee, vie sen…" | **Yes** — FI mirror of #2, same list fix. |
| 6 | 31 | src/fi.html:861 | "Uudistettu energiatehokkuusdirektiivi siirtää pakollisen energiakatselmuksen rajan…" | Yes — same as #3. |
| 7 | 29 | src/et.html:729 | "Kümme tuhat akut kümne tuhande tööstusliitumise taga — igaüks omanikule raha teenimas — on…" | No — deliberate rhetorical set-piece; the em-dashes carry the rhythm. |
| 8 | 29 | src/et.html:681 | "Pärast Venemaa sagedusalast väljumist vastutab Eesti ise oma süsteemi tasakaalu eest — Elering hangib…" | Yes — two facts (responsibility; consumer-bill line item) joined by a dash; split. |
| 9 | 27 | src/et.html:948 | "Fingridi andmetel tarbimise kasv kiireneb: ainuüksi andmekeskuste liitumislepinguid on ligi viie gigavati jagu, ja…" | Yes — split at ", ja"; the +40 % projection is its own claim (stats are already repeated in the statrow). |
| 10 | 27 | src/et.html:62 | "Kui sagedus sellest kõrvale kaldub, ei ole tootmine ja tarbimine tasakaalus — ja põhivõrguettevõtted…" | Borderline — hero caption; splitting after "tasakaalus" would help; low priority. |
| 11 | 26 | src/fi.html:868 | "Fingridin mukaan kulutuksen kasvu voimistuu: pelkästään datakeskushankkeiden liittymissopimuksia on…" | Yes — FI mirror of #9. |
| 12 | 25 | src/fi.html:665 | "Kymmenentuhatta akkua kymmenentuhannen teollisuusliittymän takana — jokainen tuottaen omistajalleen rahaa — on…" | No — mirror of #7, deliberate. |
| 13 | 24 | src/fi.html:70 | "Kun taajuus poikkeaa siitä, tuotanto ja kulutus eivät kohtaa — ja kantaverkkoyhtiöt, Suomessa Fingrid ja…" | Borderline — mirror of #10. |
| 14 | 24 | src/et.html:927 | "Pärast seda peab mõõtelahendus vastama nõuetele täies mahus — ja nõuetekohane mõõtmine on ühtlasi eeldus…" | Yes — split at the dash; two distinct regulatory points. |
| 15 | 24 | src/et.html:175 | "Kui teil on pakkumine käes ja soovite teada, kas selle tasuvusnumber peab kokkupuutele tegelikkusega vastu…" | No — single flowing conditional, lands well. (FI mirror fi:185, 22w, same.) |

Pattern: FI tops out at 32 words and is essentially compliant with the short-sentence rule. ET runs slightly longer than FI on mirrored sentences (translation expansion) and owns the worst offenders. The genuinely needed splits are #2/#5 (list), #3/#6, #8, #9/#11, #14 — six edits total.

---

## 4. Walls of text (10 longest unbroken `<p>` blocks site-wide)

| # | Words | Location (page · section) | Fix |
|---|------:|---------------------------|-----|
| 1 | **105** | src/et.html:681 — Reserviturud · "Miks me ei avalda tulunumbreid", ¶ "Vajadus kasvab. Hind ühiku kohta surutakse…" | **Split into three ¶** (structural need / supply compression / doctrine) — and **delete the duplicated doctrine**: this ¶ ends "Sellepärast ehitame tasuvuse säästudele ja näitame reservitulu stsenaariumidena…", then et:683 says the same thing again in bold ("Seepärast ehitame arvutuse säästudele ja esitame reservitulu lisana…"). Two doctrine statements 2 paragraphs apart on the same screen. Keep the bold one. |
| 2 | 57 | src/et.html:948 — Uudised · Fingrid item | Split at ", ja" (see §3.9). The numbers already live in the statrow — prose can shrink, not grow. |
| 3 | 55 | src/fi.html:868 — Ajankohtaista · Fingrid item | Same fix as #2. |
| 4 | 55 | src/fi.html:630 — Reservimarkkinat · "Tarve kasvaa — ja yksikköhinta puristuu" | Split into two ¶ (demand grows / storage floods in). Also fix the unhedged forecast (§1.7). |
| 5 | 50 | src/et.html:274 — Energiasalvestid · "kW on kiirus, kWh on maht" | **Table**, per house rules: three rows (Võimsus kW / Energia kWh / Kestus h) with one-line definitions, plus one prose sentence for the 125 kW / ~250 kWh / ~2 h example. Prose is doing a table's job. |
| 6 | 49 | src/fi.html:285 — Energiavarastot · "kW on nopeus, kWh on määrä" | Same table fix as #5. |
| 7 | 46 | src/et.html:534 — Päike+aku · measurement/controller ¶ | Split — it is three mechanisms (measure → limit → failsafe). A 3-step list would also work; the adjacent sysdia diagram already covers the topology, so no new diagram. |
| 8 | 45 | src/fi.html:482 — Aurinko+akku · same ¶ | Same as #7. |
| 9 | 45 | src/et.html:974 — Andmekaitse · legal basis | Leave — legal genre. (FI mirror fi:894, 40w, same.) |
| 10 | 44 | src/et.html:779 — Meist · hero lede (FI mirror fi:715, 41w) | **List** — the 35-word chain sentence becomes four bullets (honest assessment / DSO process / PV integration / durable documentation) under a one-line lede. This is the single highest-value copy edit on the site. |

---

## 5. Marketing-adjective sweep (analytical content)

Clean overall. No "ainutlaatuinen / erakordne / premium / johtava / world-class" anywhere in published copy. Findings:

| Word | Location | Verdict |
|------|----------|---------|
| "poikkeuksellisen hyvin" — "Akku sopii tähän poikkeuksellisen hyvin, koska se reagoi sekunneissa ja voi sekä ottaa vastaan että syöttää." | src/fi.html:545, Reservimarkkinat (analytical mechanism section) | **Overstep, replaceable.** The evidence clause carries the sentence; the superlative-class intensifier adds nothing a skeptic accepts. "Akku sopii tähän hyvin, koska…" or restructure: "Akku reagoi sekunneissa ja voi sekä ottaa että syöttää — siksi se sopii tähän tehtävään." |
| "erakordselt hästi" — "Aku sobib siia erakordselt hästi, sest see reageerib sekunditega…" | src/et.html:597, Reserviturud | Same verdict as FI mirror: downgrade to "hästi" or let the because-clause do the work. This is the only marketing-class intensifier inside analysis on either site — an easy 2-line fix. |
| "kattava luovutuspaketti" / "põhjalik üleandmispakett" | src/fi.html:317 / src/et.html:306; also footer fi:911 / et:991 ("kattava dokumentaatio" / "põhjalik dokumentatsioon") | Borderline, service description not analysis. Better concretized than intensified (name 2–3 contents of the paketti), but not a doctrine breach. |
| "rehellinen / rehellisesti" (FI ×5: 207, 710 data-desc, 715, 724, 911) · "aus / ausalt" (ET ×8 in published copy: 195, 774 data-desc, 779, 788, 928, 991, +) | Site-wide | Not a marketing adjective in the classic sense, but a **self-certifying virtue word** — and the site's own principle is show-don't-tell (provenance tags, sources). At current density it starts to protest too much, especially et:928 "See on aus kiirustamise põhjus — … mitte müügivõte" (explicitly denying a sales tactic *is* a sales register). Recommend rationing: keep it in the Meistä positioning ("Rehellinen analyysi ja toteutus samalta taholta") and the footer, cut the rest — the tags already prove the point. |
| "luotettavimmillaan" (fi:647) / "kõige usaldusväärsem" (et:711) | Reservi pages | Fine — analytical comparative with stated reason (the aggregator both qualifies the site and pays out). |

---

## 6. Terminology glossaries (within-language)

### 6a. Finnish (src/fi.html)

| Concept | Variants in use (count · example lines) | Canonical recommendation |
|---------|------------------------------------------|--------------------------|
| Site survey | **kohdekartoitus** 20 (51, 131, 227…) · plain "kartoitus" 3 (28 nav "Pyydä kartoitus", 504 "Pyydä kartoitus kohteeseenne", 894) | **kohdekartoitus**; plain "kartoitus" acceptable in the space-constrained nav CTA only. Consistent in practice. |
| Sizing | mitoittaa-family only: mitoitettuna (83, 241), mitoitetaan (152, 285, 515, 862), mitoitus (235, 689), yhteismitoitus (515), energiamitoitus (556) — 11 total, no rival term | **mitoittaa** — already fully consistent. |
| Peak | kulutushuippu 2 (102, 257) · huipputeho 1 (112) · kuukausihuippu 1 (271) · bare huippu 4 (285 ×2, 351, 437) · **"tunnin keskiteho" (343) AND "tuntikeskiteho" (344) in adjacent bullets** | Family use is fine (kulutushuippu when it's the load, huipputeho when it's the power). Fix the one real inconsistency: define "tunnin keskiteho (tuntikeskiteho)" once at fi:343, then use **tuntikeskiteho**. |
| Storage device | **energiavarasto** 29 (product/offering) · bare "varasto" ≈19 (page-internal shorthand: 102, 257, 285, 344…) · **akku** ≈38 forms (aurinko+akku pairing, reservi page: akkujärjestelmä 491, teollisuusakku 595, akkutarjous 624, akkuhanke 676) · sähkövarasto 3 (630, 868, 870 — all quoting Fingrid, whose own term it is) | Codify the working tiering: **energiavarasto** = the offering / first mention per page; **varasto** = shorthand after first mention; **akku** = the physical battery and market-jargon contexts (reservi, aurinko+akku); **sähkövarasto** only when citing Fingrid. Currently followed by instinct — write it down so it survives the next editor. |
| Grid company | plain **verkkoyhtiö** 22 (= DSO throughout) · kantaverkkoyhtiö 7 (TSO, always explicit: 70, 544, 584, 600, 610…) · jakeluverkkoyhtiö 1 (610, exactly where the DSO/TSO contrast is the point) | Current pattern is correct and consistent: **verkkoyhtiö** for the DSO, **kantaverkkoyhtiö** for the TSO, **jakeluverkkoyhtiö** only when contrasting the two. Keep. |
| Connection (point) | **liittymäpiste** 8 (429, 461, 478, 482, 493, 690…) · liittymispiste 0 · liittymä 23 incl. compounds · liittymisteho 3 (688, 792) · liittymissopimus/liittymisjono (630, 868, 870) | **liittymäpiste** — internally consistent (note: Fingrid's own texts say "liittymispiste"; within-language consistency is intact, just don't let a future editor "correct" half of them). |
| Reserve income | **reservitulo** 7 (126, 207, 439, 630, 632…) — no variants; supplier revenue claims are consistently "tuottoluvut" (336, 622, 526 data-desc), a deliberate distinct term | Keep both terms and the distinction — it is load-bearing (our modelled reservitulo vs their published tuottoluvut). |
| Analysis package | **analyysipaketti** 3 (243, 311, 691) — no variants | Consistent. |
| Power fee | **tehomaksu** family 12 (101, 202, 256, 258, 333–345) + tehosiirtohinnasto 2 | Consistent. |

### 6b. Estonian (src/et.html)

| Concept | Variants in use (count · example lines) | Canonical recommendation |
|---------|------------------------------------------|--------------------------|
| Site survey | **objektikaardistus** 23 (48, 123, 216…) · plain "kaardistus" 5 (28 nav "Küsi kaardistust", 223 data-desc, 292, 556, 974) | **objektikaardistus**; nav short form acceptable. Consistent. |
| Sizing | dimensioneerima-family only: dimensioneeritud (75, 229, 608), dimensioneeritakse (142, 274, 567, 942), dimensioneerimine (223, 753), ühisdimensioneerimine (567) — 10 total, no rival ("mõõtmestama" absent) | **dimensioneerima** — fully consistent. |
| Peak | tarbimistipp 3 (94, 246, 489) · tippvõimsus 1 (104) · kuutipp 1 (260) · bare tipp/tipu 9 (274, 332–376) · tipuaeg 2 (369) · **"tunni keskmine võimsus" (332) AND "tunnikeskmine" (333) in adjacent bullets** | Family fine. Same fix as FI: define "tunni keskmine võimsus (tunnikeskmine)" once, then **tunnikeskmine**. |
| Storage device | **energiasalvesti** 27 · bare "salvesti" ≈18 (94, 246, 274…) · **aku** ≈30 forms (tööstusaku 647, akupakkumine 676, akuprojekt 766, akusüsteem 543…) · elektrisalvesti 2 (948, 950 — Fingrid item, mirrors FI "sähkövarasto") · salvestusüksus/energiasalvestusüksus 3 (926–934 — Elering/ELTS statute term) | Same tiering as FI: **energiasalvesti** / salvesti / aku. **salvestusüksus** stays — it is the statute's term and appears only in the two legal-source news items (correct). "elektrisalvesti" only when citing Fingrid. |
| Grid company | plain **võrguettevõte** 19 (= DSO) · põhivõrguettevõte 7 (62, 596, 636, 652, 662…) · jaotusvõrguettevõte 1 (662, at the contrast point) | Same correct pattern as FI. Keep. |
| Connection (point) | **liitumispunkt** 11 (46, 481, 513, 530, 534…) · liitumine/liitumis- compounds 32 (liitumisvõimsus 752/859, liitumisleping 948/950) · **liitumispiir 1 (104)** — one-off coinage ("üle liitumispiiri"; FI mirror says "liittymän yli") | **liitumispunkt** consistent. Replace the one-off "liitumispiir" (et:104) with phrasing matching the rest of the site ("üle liitumise piiri" or mirror the FI construction). |
| Reserve income | **reservitulu** 10 — no variants; supplier claims = "tulunumbrid" (578 data-desc, 674, 324) | Consistent; keep the reservitulu/tulunumbrid distinction. |
| Analysis package | **analüüsipakett** 3 (231, 300, 755) | Consistent. |
| Power fee | **võimsustasu** 8 (93, 190, 245, 318–330) | Consistent. |
| **CTA imperative number** | "Küsi" 2nd-sg: nav (28) + data-title (832) · "Küsige" 2nd-pl: all 12 body CTAs (48, 123, 143, 216, 388, 556, 572, 733, 768, 955) | **Inconsistent — decide.** FI is uniform ("Pyydä" everywhere). Either "Küsige" everywhere (matches the formal teie-register of the body copy) or accept a documented nav-brevity exception. Note the FI form footnote quirk: honeypot label "Jättäkää" (pl) vs button "Lähetä" (sg) — same decision applies. |

---

## 7. ET↔FI asymmetries (materially different content on mirrored pages)

| # | Page pair | What differs | Justified or drift? |
|---|-----------|--------------|---------------------|
| 1 | Energiavarastot (fi:333–355) vs Energiasalvestid (et:318–407) | **The big one.** ET has a full documented Elektrilevi worked example: VKL5 rate 3,48 €/kW with Konkurentsiamet source line, a 6-row calculation table, "Mida see näide ei sisalda" (4 exclusions incl. 10–15 % battery losses), "Kaks lisahooba" (630 kW threshold, summing across liitumispunktid), and an 8-row per-package rate annex. FI has: a placeholder rate "[X,XX € — TARKISTETAAN]", no table, no exclusions block, no levers, no annex — plus a sentence explaining the example will come later (fi:351). | Market-specificity of Elektrilevi is justified; the **depth gap is drift with a documented pending decision** (MADIS comment fi:329–332: choose Helen Sähköverkko / Caruna / Elenia as anchor). Until the FI example ships, FI's "Tehomaksu-esimerkki" heading overpromises its own section. Highest-priority parity item. |
| 2 | Reservimarkkinat vs Reserviturud | ET has a whole extra section "Miks reservivajadus kasvab — kolm dokumenteeritud märki" (et:691–702) with three sourced Elering bullets (consumer-bill line item from 01.01.2026, 250–400 MW reserve procurement, 1300→2100 MW dispatchable-need trajectory). FI has no counterpart. ET's "why no revenue figures" ¶ (et:681, 105w) also carries Estonia-specific Elering framing vs FI's Fingrid-queue framing (fi:630, 55w). | Largely justified (ET-market sources), but note two things: (a) FI could carry a mirrored "kolme dokumentoitua merkkiä" section from Fingrid sources — the Fingrid tiedote on the Ajankohtaista page already provides one; (b) the ET ¶ duplicates doctrine internally (§4.1). A MADIS comment (fi:626–629, et:678–680) records a standing intent to rewrite the whole reserve section in both languages — fold this in then. |
| 3 | Ajankohtaista (2 items) vs Uudised (4 items) | ET-only items: Elering metering transition deadline 31.12.2026 (et:924–930) and ELTS § 71 lg 10¹ double-network-fee abolition (et:931–937). Both are Estonian-law items with Estonian sources. | Justified — but the FI page is left thin (2 items) and has no FI-market regulatory item of equivalent customer value. Accepted gap; log it as a content-backlog item, not a translation task. |
| 4 | Meistä (fi:753) vs Meist (et:820) | Identical sentence both sides: "Emme ole suomalainen yritys, jolla on vironkielinen sivu." / "Me ei ole Soome ettevõte, millel on eestikeelne leht." | **Both-language problem flagged by the author's own note** (MADIS, et:817–819): the claim currently contradicts reality — the legal entity is a Finnish Oy (footer: SAMA ENERGIA OY, kotipaikka Helsinki, both files) and ET is served under /et/. In the FI file the sentence is additionally strange for Finnish buyers (the company *is* Finnish). Needs the decision the comment asks for: soften now, or hold until the OÜ exists. Do not leave as-is past OÜ formation. |
| 5 | Aurinko+akku (fi:483) vs Päike+aku (et:535) | FI: "vakiintuneilta **suomalaisilta** toimittajilta lyhyillä toimitusajoilla" — ET drops the nationality: "väljakujunenud tarnijatelt". | Probably deliberate market adaptation, but it means FI makes an extra unverified claim (Finnish suppliers + short lead times) that ET does not. Align on the weaker (ET) form; see also §1.9. |
| 6 | Home benefit card link (fi:103 vs et:95) | ET "Loe edasi" deep-links to /energiasalvestid/#voimsustasu; FI links to /energiavarastot/ with no anchor, although fi.html has an equivalent #tehomaksu anchor (fi:333). | Drift — trivial fix: FI card → /energiavarastot/#tehomaksu. |
| 7 | Tietosuoja (fi:897) vs Andmekaitse (et:977) | ET lists two complaint authorities (Finnish DPA + Estonian AKI); FI lists only the Finnish DPA. | Justified (ET visitors may be Estonian data subjects). No action. |
| 8 | Home "Kenelle" (fi:168 vs et:158) | FI: "Omistajat, joilla on **aate**" (ideology/creed) vs ET: "Omanikud, kellel on **veendumus**" (conviction). | Semantic strength differs — "aate" is markedly stronger/quirkier than "veendumus". Minor; pick one register (veendumus/vakaumus is the safer pair). |
| 9 | Reservi hero eyebrow (fi:529 / et:581) | "päivitetään säännöllisesti" / "uuendatakse regulaarselt" — identical, but this is itself a recurring-maintenance promise on both sides. | Symmetric; just noting the commitment exists twice and must be kept. |

Structural mirror integrity is otherwise excellent — section order, provenance tags, CTA placement and callouts match 1:1 on all ten page pairs.

---

## 8. Register consistency

House register (as practiced): formal address (te/teie), short declaratives, dry confidence, evidence before adjectives. Breaks, by page:

| Where | Break | Characterization |
|-------|-------|------------------|
| Reservimarkkinat/Reserviturud, closing section (fi:657–672 / et:721–735) | "Kymmenentuhatta akkua… alueellista infrastruktuuria, jota ei katkaista ankkurilla…"; "Energiaomavaraisuutta ei rakenneta julistuksilla." | **Manifesto register** — geopolitical imagery (anchor-cut cables), decade-scale vision. It is the most elevated, least analytical passage on the site. Contained in one clearly framed "why this matters" section, so defensible as signature — but it should stay the *only* such section, and §1.8's payback absolute inside it needs the fix. |
| Energiavarastot "Näin etenemme" chips (fi:307, 312, 317 / et:296, 301, 306) | "olette menettänyt keskustelun ettekä vuotta"; "kokouksessa, jossa myyjä ei ole läsnä"; "ette kansiota, joka kasattiin kiireessä viimeisenä iltapäivänä" | **Competitor-jab register** — punchy, chatty, borderline smug. Two of the three land; the "kansio kasattiin kiireessä viimeisenä iltapäivänä" one is the chattiest sentence on the site and pure innuendo about unnamed competitors. Keep at most two jabs per page. |
| Uudised, Elering metering item (et:928) | "See on aus kiirustamise põhjus — avalik ja dokumenteeritud tähtaeg, mitte müügivõte." | **Meta-defensive register** — explicitly denying salesmanship while creating urgency is itself a sales move. Cut the denial; the documented deadline makes the point alone. |
| Site-wide | "rehellinen/rehellisesti" ×5, "aus/ausalt" ×8 (see §5) | **Self-certification creep** — each use is mild; the density is the break. Ration to the Meistä page + footer. |
| Prosessi lede (fi:681 / et:745) | "Se ei ole byrokratiaa — juuri siksi tiedämme etukäteen, mitä tapahtuu seuraavaksi." | Mild defensive aside ("this isn't bureaucracy") — anticipating an objection nobody raised. Harmless; could go in a tightening pass. |
| Tietosuoja/Andmekaitse | Fully bureaucratic-legal | **Not a break** — genre-appropriate, and the ledes ("Keräämme vain sen, minkä annatte meille itse") admirably keep the house voice. |
| ET pronoun detail (et:274) | "kui kaua **ta** seda jaksab" — animate pronoun for the device | Slightly colloquial for the register ("see" is the formal choice); one occurrence. Native-speaker pass call. |
| ET CTA imperative mix (nav "Küsi" vs body "Küsige") | See §6b last row | Register inconsistency within ET; FI is uniform. |

---

## 9. What the MADIS comments reveal (intent, not published copy)

- CTA verb honesty is a **recorded decision**, applied everywhere: all "Varaa/Broneeri" strings found in the files exist only inside comments documenting the correction (fi:25, 763; et:25, 387, 830). Published copy is clean.
- The FI tehomaksu placeholder and the ~100 kW threshold are **known pending items with verify-waivers**, to be resolved before main-merge (fi:247–250, 329–332).
- Financing possibility-register is a **written rule** in both files (fi:357–360, et:410–413): no financier names, no rates, no certainty verbs until terms are in the number register. Published copy complies.
- A **full rewrite of the reserve section in both languages is already on the roadmap** (fi:626–629, et:678–680) — the §4.1/§7.2 fixes should be folded into that pass, not done twice.
- The workflow is Martin drafts → Madis native-language pass ("keelekontroll/kielentarkistus") — several sections on both sides are flagged as awaiting that pass; §8's ET pronoun and CTA-number calls belong to it.
- The "not a Finnish company" contradiction (§7.4) is **author-acknowledged and awaiting an explicit decision** (et:817–819).

## Priority shortlist

1. Ship or cut the FI tehomaksu example (§7.1, §2.3–2.4) — the ET/FI credibility gap is visible to any bilingual prospect.
2. Fix the four hard outcome claims: "parantaa investointia", "ansaitsee 12 kertaa vuodessa", "laskelma kestää", "maksaa itsensä takaisin" (§1.1–1.3, 1.8) — in both languages.
3. Break et:681 (105-word ¶) and delete its duplicated doctrine sentence (§4.1).
4. Convert the Meistä chain sentence to a list in both languages (§4.10) and the kW/kWh ¶ to a table (§4.5–4.6).
5. Delete "poikkeuksellisen/erakordselt" (§5) and ration "rehellinen/aus" (§5, §8).
6. Decide ET "Küsi vs Küsige" and the "not a Finnish company" sentence (§6b, §7.4).

---

## Appendix A4 · Heading & Semantic Structure Analyst

# 04 — Heading & Semantic Structure Audit

Scope: `src/fi.html` (10 pages) + `src/et.html` (10 mirrors), branch draft.
Reference test: energiavarastot h1 — does the h1 name the SUBJECT, not a journey/mood/claim?
Eyebrows shown in (parentheses); they are kickers, not headings, and are noted where they carry
structural weight the headings don't.

Verdict legend: SUBJECT / JOURNEY / MOOD / CLAIM. Classification: PLAIN / EARNED-CLEVER / OPAQUE.
All wording suggestions are DIRECTION only — native pass (Madis) owns final FI/ET copy.

---

## 1 · Home — `/` (p-home) · FI + ET

### Outline as shipped — FI
- h1 (eyebrow: "Energiavarastot ja aurinkosähkö · yrityksille ja maanomistajille"): **"Yhteinen verkko. Itsenäinen energia."**
- *(eyebrow only, NO heading: "Mitä toimitamme" — offer cards use `<b>` labels: AURINKOSÄHKÖ / ENERGIAVARASTOT / RESERVIMARKKINAYHTEYS)*
- h2: "Mitä se tarkoittaa kohteessanne."
  - h3: "Tehomaksut alas" · h3: "Pörssisähkö eduksi" · h3: "Liittymän laajennus vältettävissä" · h3: "Oma tuotanto omaan käyttöön" · h3: "Varavoima häiriöissä" · h3: "Reservitulo lisänä"
- h2 (eyebrow: "Kaksi lähtötilannetta"): "Aurinkosähköä tai ei — aloitamme samasta paikasta: kulutustiedoistanne."
  - h3: "Akku parantaa investointia, jonka olette jo tehneet." · h3: "Suunnittelemme kokonaisuuden yhtenä järjestelmänä."
- h2 (eyebrow: "Kenelle"): "Aloitamme sieltä, missä energia on arvovalinta."
  - h3: "Omistajat, joilla on aate" · h3: "Maaseudun yritykset" · h3: "Yritys- ja teollisuuskohteet"
- h2 (eyebrow: "Miksi meihin voi luottaa"): "Investointipäätöstä ei tehdä kenenkään sanan varassa."
  - h3: "Säästöt ennen tuottoja" · h3: "Reservitulo on lisä, ei lupaus" · h3: "Verkkoyhtiön kanta ensin"
- h2: "Aloitetaan kulutustiedoistanne."

### Outline as shipped — ET (structurally identical)
- h1 (eyebrow: "Energiasalvestid ja päikeseelekter · ettevõtetele ja maaomanikele"): **"Ühine võrk. Sõltumatu energia."**
- *(eyebrow only, NO heading: "Mida tarnime" — `<b>` labels PÄIKESEELEKTER / ENERGIASALVESTID / RESERVITURU ÜHENDUS)*
- h2: "Mida see teie objektil tähendab." → h3: "Võimsustasud alla" · "Börsielekter kasuks" · "Liitumise laiendamine välditav" · "Oma toodang omaks tarbeks" · "Varutoide rikete ajal" · "Reservitulu lisana"
- h2 (eyebrow: "Kaks lähtekohta"): "Päikeseelekter olemas või mitte — alustame samast kohast: teie tarbimisandmetest." → h3: "Aku parandab investeeringut, mille olete juba teinud." · "Projekteerime terviku ühe süsteemina."
- h2 (eyebrow: "Kellele"): "Alustame sealt, kus energia on väärtusvalik." → h3: "Omanikud, kellel on veendumus" · "Maapiirkonna ettevõtted" · "Äri- ja tööstusobjektid"
- h2 (eyebrow: "Miks meid saab usaldada"): "Investeerimisotsust ei tehta kellegi sõna peale." → h3: "Sääst enne tulusid" · "Reservitulu on lisa, mitte lubadus" · "Võrguettevõtte seisukoht enne"
- h2: "Alustame teie tarbimisandmetest."

**Anomalies (both languages):** (a) The core offer section ("Mitä toimitamme" / "Mida tarnime") has NO heading — the three deliverables live in `<b>` tags, invisible to the outline and to assistive tech navigation. (b) Consequence: the very next h2 opens with an unresolved referent — "Mitä **se** tarkoittaa…" — "se/see" points at content the outline never introduced. (c) The closing h2 ("Aloitetaan kulutustiedoistanne." / "Alustame teie tarbimisandmetest.") is the exact string reused as the contact page h1 — see page 7. No h-level skips.

**h1 verdict: MOOD** (both languages). "Yhteinen verkko. Itsenäinen energia." is a positioning couplet; it names neither batteries, solar, nor the buyer. The eyebrow carries the entire subject. A homepage has the strongest case for a brand statement, so this is a *deliberate* mood h1 — but under the energiavarastot test it fails, and it is the only h1 on the site where the SEO title (subject-rich) and h1 (subject-free) share zero words. Direction: either fold the subject into the h1 (mood clause + subject clause) or accept the mood h1 as a registered exception and rely on eyebrow+title — decide, don't drift.

**Heading-only story (FI, mirrors ET):** "Shared grid, independent energy. What *it* means at your site: demand charges down, spot prices to your advantage, connection upgrade avoidable, own production for own use, backup in outages, reserve income as extra. Solar or not, we start from your consumption data. We start where energy is a values choice. Investment decisions aren't made on anyone's word. Let's start from your consumption data." — The benefits, two doors, audience, trust doctrine, and CTA are all there, in the doctrinally correct order (savings h3s first, reserve income last and labeled "lisä"). **Grade: B.** Missing beat: WHAT is being sold never appears in any heading — the story describes effects of an unnamed thing.

**Classification:** h1 — **OPAQUE** (withholds the offer; eyebrow rescues it). "Mitä se tarkoittaa kohteessanne." — PLAIN but dangling referent. "Aurinkosähköä tai ei — aloitamme samasta paikasta: kulutustiedoistanne." — PLAIN. "Aloitamme sieltä, missä energia on arvovalinta." — EARNED-CLEVER (defines the audience by values; still informs). "Investointipäätöstä ei tehdä kenenkään sanan varassa." — PLAIN. "Aloitetaan kulutustiedoistanne." — PLAIN.

---

## 2 · Energiavarastot — `/energiavarastot/` · Energiasalvestid — `/energiasalvestid/`

### Outline as shipped — FI
- h1 (eyebrow: "Energiavarastot"): **"Teollisuuden energiavarasto — mitoitettuna teidän omista kulutustiedoistanne."** *(hero also carries a mono pseudo-outline: KOHDEKARTOITUS → ANALYYSIPAKETTI → TOTEUTUS → ELINKAARI — not a heading)*
- (eyebrow: "Mitä saatte") h2: "Tehomaksut alas" · h2: "Aurinkosähkö + varasto — yksi järjestelmä" · h2: "Reservivalmius"
- h2 (eyebrow: "Järjestelmä itse"): "Mikä laite tämä on — teho, energia ja kesto."
  - h3: "kW on nopeus, kWh on määrä." · h3: "Kaappi tai kontti."
- h2 (eyebrow: "Näin etenemme"): "Kartoituksesta toimivaan, dokumentoituun ja tuottavaan järjestelmään."
  - h3: "01 · Kohdekartoitus" · h3: "02 · Analyysipaketti" · h3: "03 · Toteutus" · h3: "04 · Elinkaari"
- h2 (eyebrow: "Tehomaksu-esimerkki"): "Emme julkaise tuottolukuja, joita kukaan ei hallitse. Tehomaksu on eri asia."
  - h3: "Miten verkkoyhtiö laskuttaa tehosta" · h3: "Teidän lukunne lasketaan teidän datastanne"
- *(RAHOITUS block: mono label only, no heading — correct for possibility-only financing)*
- h2 (eyebrow: "Erikseen"): "Konsultointi ilman laitekauppaa."

### Outline as shipped — ET
- h1 (eyebrow: "Energiasalvestid"): **"Tööstuslik energiasalvesti — dimensioneeritud teie enda tarbimisandmetest."**
- (eyebrow: "Mida saate") h2: "Võimsustasu alla" · h2: "Päikeseelekter + salvesti — üks süsteem" · h2: "Reservivalmidus"
- h2 (eyebrow: "Süsteem ise"): "Mis seade see on — võimsus, energia ja kestus." → h3: "kW on kiirus, kWh on maht." · h3: "Kabinett või konteiner."
- h2 (eyebrow: "Kuidas selleni jõuame"): "Kaardistusest töötava, dokumenteeritud ja tootva süsteemini." → h3: "01 · Objektikaardistus" · "02 · Analüüsipakett" · "03 · Teostus" · "04 · Elukaar"
- h2 (eyebrow: "Võimsustasu näidisarvutus"): "Me ei avalda tulunumbreid, mida keegi ei kontrolli. Võimsustasu on teistsugune."
  - h3: "Kuidas Elektrilevi võimsustasu arvestab" · h3: "Näidisobjekt — eeldused eraldi"
  - (eyebrow: "Mida see näide ei sisalda") h3: "Reservitulu" · "Börsihinna optimeerimine ja tipuaja edastamise vahe" · "Akukaod" · "Teie objekt"
  - (eyebrow: "Kaks lisahooba samast hinnakirjast") h3: "Üle 630 kW osa" · h3: "Mitu liitumispunkti"
  - *(eyebrow only, NO heading: "Lisa: võrguühenduse kasutusvõimsuse määrad paketiti" — the rate table has no heading)*
- *(RAHASTUS block: mono label only, no heading)*
- h2 (eyebrow: "Eraldi"): "Konsultatsioon ilma seadmemüügita."

**Anomalies:** (a) Same qa-grid component appears at two heading levels on one page — "Mitä saatte" cards are h2, "Näin etenemme" cards are h3. The demotion of the journey chips to h3 is *correct* (journey subordinated after the restructure), but the level split of an identical component is worth knowing. (b) ET appendix rate table is introduced by an eyebrow only. (c) FI heading "Tehomaksu on eri asia" + lede "Hinta on julkinen" write a check the FI body can't yet cash — the amount is a `[X,XX — TARKISTETAAN]` placeholder (waivered, but it is a heading-vs-body integrity gap until the anchor DSO is chosen). ET cashes it in full (Elektrilevi VKL5, sourced).

**h1 verdict: SUBJECT** (both) — this is the reference test itself and it passes: subject ("teollisuuden energiavarasto") + the differentiator (sized from your own consumption data). The old journey h1 now correctly serves as the h2 of the "Näin etenemme" section.

**Heading-only story (FI):** "An industrial battery, sized from your own data. You get: demand charges down, solar+storage as one system, reserve readiness. What the device is: kW is speed, kWh is amount; cabinet or container. How we proceed: survey → analysis → delivery → lifecycle. We don't publish revenue numbers no one controls — demand charge is different: here's how the DSO bills, and your number comes from your data. Consultancy also without an equipment sale." **Grade FI: A-** — complete argument in the right order; the only soft spot is the placeholder-backed example beat. **Grade ET: A** — the documented worked example plus "what this example does NOT include" (reserve income explicitly excluded, scenarios-only) makes the ET heading story the best on the site.

**Classification:** h1 — PLAIN. "Kartoituksesta toimivaan, dokumentoituun ja tuottavaan järjestelmään." — PLAIN (journey wording, now legitimately subordinate under a "Näin etenemme" kicker). "kW on nopeus, kWh on määrä." / "kW on kiirus, kWh on maht." — **EARNED-CLEVER**, the best heading on the site: metaphor that fully informs. "Kaappi tai kontti." — PLAIN. "Emme julkaise tuottolukuja… Tehomaksu on eri asia." — PLAIN (a claim in form, but it states the page's actual policy and pivot). All others PLAIN. No OPAQUE.

---

## 3 · Aurinko + akku — `/aurinko-ja-akku/` · Päike + aku — `/paike-ja-aku/`

### Outline as shipped — FI
- h1 (eyebrow: "Aurinkosähkö + akku"): **"Aurinko tuottaa.<br>Akku ajoittaa."**
- (eyebrow: "Kaksi tietä samaan järjestelmään") h2: "Koko järjestelmä kerralla." (kicker: ALOITATTE PUHTAALTA PÖYDÄLTÄ) · h2: "Akku täydentää investoinnin." (kicker: TEILLÄ ON JO AURINKOSÄHKÖ)
- h2 (eyebrow: "Teillä on jo aurinkosähkö"): "Neljä kysymystä, jotka ratkaistaan ensin."
  - *(the four questions — 01 · Takasyöttö / 02 · Tehonrajoitus / 03 · Mittaus / 04 · Tiedonsiirto — are styled `div.gcell` titles, NOT headings)*
  - h3: "Mittaus liittymäpisteessä ja ohjaus, jolla on vikaturvallinen tila."
- h2 (eyebrow: "Ei vielä aurinkosähköä?"): "Kokonaisuus kannattaa suunnitella kerralla."
  - h3: "Oikea koko molemmille" · h3: "Valinta perustellaan" · h3: "Tehonhallinta sisään, ei päälle" · h3: "Yksi suunnitelma, yksi toimitus"

### Outline as shipped — ET (structurally identical)
- h1: **"Päike toodab.<br>Aku ajastab."**
- h2: "Kogu süsteem korraga." · h2: "Aku täiendab investeeringut."
- h2: "Neli küsimust, mis lahendatakse kõigepealt." *(gcell titles 01 · Tagasitoide / 02 · Võimsuse piiramine / 03 · Mõõtmine / 04 · Side — not headings)* → h3: "Mõõtmine liitumispunktis ja juhtimine, millel on tõrkekindel olek."
- h2: "Tervik tasub projekteerida korraga." → h3: "Õige suurus mõlemale" · "Valik põhjendatakse" · "Võimsusjuhtimine sisse, mitte peale" · "Üks projekt, üks tarne"

**Anomalies:** The h2 "Neljä kysymystä, jotka ratkaistaan ensin" promises four named questions, but the four names themselves are div text — a screen-reader or outline reader gets the promise without the list. The two "Kaksi tietä" h2s are visually styled at h3 size (22px), flattening the perceived hierarchy.

**h1 verdict: SUBJECT** (both). The couplet names both subjects and their division of labour (solar produces, battery times). It is clever *and* subject-bearing — passes the test. No change needed.

**Heading-only story (FI, mirrors ET):** "Solar produces, battery times. Two roads: whole system at once, or battery completes an existing investment. Four questions are solved first. Measurement at the connection point, fail-safe control. If no solar yet: the whole is worth designing at once — right size for both, choice justified, power management built in, one responsible party." **Grade: B+.** Missing beat: the four questions — the page's central deliverable — never surface at heading level; the story says "four questions" without saying what they are.

**Classification:** h1 — **EARNED-CLEVER** (exemplary: rhythm + full information). "Tehonhallinta sisään, ei päälle" / "Võimsusjuhtimine sisse, mitte peale" — EARNED-CLEVER (in vs. bolted-on, informs). All other h2/h3 PLAIN. No OPAQUE.

---

## 4 · Reservimarkkinat — `/reservimarkkinat/` · Reserviturud — `/reserviturud/`

### Outline as shipped — FI
- h1 (eyebrow: "Reservimarkkinat · päivitetään säännöllisesti"): **"Reservimarkkinat: mitä ne ovat, mitä ne vaativat ja mitä emme niistä lupaa"**
- h2 (eyebrow: "Perusasia"): "Sähköverkko on tasapainossa vain silloin, kun tuotanto ja kulutus ovat yhtä suuret joka hetki."
- h2 (eyebrow: "Tuotteet"): "Reservituotteet ja mitä kukin vaatii akulta" *(FCR-N/FCR-D/aFRR/mFRR live only in table cells)*
- (eyebrow only as parent: "Miten kohde pääsee markkinalle") — steps, each an h2:
  - h2: "Aggregaattori" (chip: Pakollinen) · h2: "Esikvalifiointi" (chip: Ennen tuloja) · h2: "Mittaus ja tiedonsiirto" (chip: Tekninen ehto) · h2: "Verkkoyhtiön hyväksyntä" (chip: **Ensin**)
- h2 (eyebrow: "Tärkein kohta tällä sivulla"): "Miksi emme julkaise tuottolukuja"
- h2 (eyebrow: "Käytännön työkalu"): "Kolme kysymystä mille tahansa toimittajalle"
  - h3: "1 · Erottele säästöt ja reservitulo. Mikä on takaisinmaksu pelkillä säästöillä?" · h3: "2 · Mikä takaisinmaksu on, jos reservihinnat puolittuvat?" · h3: "3 · Kuka tuotti reserviarvion ja mitä hän on valmis laittamaan kirjallisesti?"
- h2 (eyebrow: "Miksi tämä on tärkeämpää kuin yksi kohde"): "Jokainen asentamamme akku on liiketoimintapäätös. Yhdessä ne ovat jotain muuta."

### Outline as shipped — ET
Identical through the steps, plus ONE extra section FI does not have:
- h1: **"Reserviturud: mis need on, mida need nõuavad ja mida me nende kohta ei luba"**
- h2: "Elektrivõrk on tasakaalus ainult siis, kui tootmine ja tarbimine on igal hetkel võrdsed."
- h2: "Reservitooted ja mida igaüks akult nõuab"
- steps h2: "Agregaator" · "Eelkvalifitseerimine" · "Mõõtmine ja side" · "Võrguettevõtte kooskõlastus" (chip: Kõigepealt)
- h2: "Miks me ei avalda tulunumbreid"
- **h2 (eyebrow: "Miks reservivajadus kasvab"): "Kolm dokumenteeritud märki samast struktuursest vajadusest." — ET-ONLY** (Elering balancing-cost line item, 250–400 MW procurement, dispatchable-need growth; all sourced)
- h2: "Kolm küsimust mis tahes tarnijale" → h3 x3 (mirror)
- h2: "Iga meie paigaldatud aku on äriotsus. Koos on need midagi muud."

**Anomalies:** (a) **Heading order vs DSO-first doctrine.** The market-access steps read, in heading order: Aggregator → Prequalification → Metering → DSO approval. The doctrine (and the body) says DSO approval comes FIRST — but that lives only in the tiny "Ensin"/"Kõigepealt" chip on step 04. A headings-only reader takes away the *opposite* order of the one the process doctrine mandates. Direction: either reorder the steps so the DSO is 01, or retitle step 04 so the heading itself carries the "first" (e.g. subject direction: "Verkkoyhtiön hyväksyntä — aina ensin"). Flag for Madis; the current layout may be a deliberate reveal, but it's the one place on the site where headings contradict doctrine. (b) The steps have no parent heading — four h2s hang under an eyebrow. (c) FCR/aFRR/mFRR — the terms the SEO title sells — never appear in a heading (see SEO table).

**h1 verdict: SUBJECT** (both). Textbook subject-first with declared scope, including the "what we don't promise" clause that mirrors doctrine. Best h1 on the site after energiavarastot.

**Heading-only story (FI):** "Reserve markets: what they are, require, and what we don't promise. The grid balances only when production=consumption every moment. Reserve products and what each demands of a battery. Aggregator, prequalification, metering, DSO approval. Why we don't publish revenue figures. Three questions for any vendor. Every battery we install is a business decision — together they are something else." **Grade FI: B+** — the argument is fully present; docked for the step-order problem and the withheld final beat. **Grade ET: A-** — the added "three documented signs" section supplies the structural-need evidence beat that FI carries only in body copy.

**Classification:** h1 — PLAIN. "Sähköverkko on tasapainossa vain silloin…" — PLAIN (a full-sentence teaching heading, works). "Miksi emme julkaise tuottolukuja" — PLAIN. Closing h2 "…Yhdessä ne ovat jotain muuta." / "…Koos on need midagi muud." — **OPAQUE second half**: withholds the payoff (a distributed fleet = regional infrastructure that can't be cut with an anchor). First sentence informs, so it's a deliberate teaser — but on a headings-only read the page ends on a blank. Direction if fixed: let the heading name what the "something else" is.

---

## 5 · Prosessi — `/prosessi/` · Protsess — `/protsess/`

### Outline as shipped — FI
- h1 (eyebrow: "Näin se etenee"): **"Seitsemän vaihetta, ja kauanko kukin kestää."**
- steps, each h2 (duration chips in parentheses): "Kvalifiointi" (≈1 vk) · "Tekninen esiselvitys" (≈1 vk) · "Verkkoyhtiön ennakkoselvitys" (2–6 vk) · "Analyysipaketti" (2–4 vk) · "Tarjous ja rahoitus" (1–2 vk) · "Toteutus" (4–12 vk) · "Markkinoille pääsy ja seuranta" (Jatkuva)

### Outline as shipped — ET (identical)
- h1: **"Seitse etappi, ja kui kaua igaüks kestab."** → h2: "Kvalifitseerimine" · "Tehniline eeluuring" · "Võrguettevõtte eelpäring" · "Analüüsipakett" · "Pakkumine ja rahastus" · "Teostus" · "Turulepääs ja seire"

**Anomalies:** none. This is the page that OWNS the journey, and its heading order embodies the doctrine: DSO enquiry (03) sits before offer/financing (05) and delivery (06). "Tarjous ja rahoitus" as a heading is fine — the possibility-only financing wording lives in the body, where it belongs.

**h1 verdict: SUBJECT.** The journey IS this page's subject; "seven phases and how long each takes" names exactly that. Minor: the h1 never says seven phases *of what* — "akkuhanke" appears only in the data-title. Direction: consider carrying the noun (akkuhanke / akuprojekt) into the h1; the SEO title already does.

**Heading-only story:** "Seven phases and their durations: qualification, technical pre-study, DSO pre-enquiry, analysis package, offer and financing, delivery, market access and monitoring." = the page's whole argument, in doctrine order. **Grade: A.** No missing beat (the "nothing is purchased before the DSO's written position" hammer is a callout, not a heading — acceptable, it's emphasis, not structure).

**Classification:** all PLAIN. No OPAQUE.

---

## 6 · Meistä — `/meista/` · Meist — `/meist/`

### Outline as shipped — FI
- h1 (eyebrow: "Meistä"): **"Laite on muuttunut hyödykkeeksi. Osaaminen ei."**
- h2 (eyebrow: "Miksi tämä yritys on olemassa"): "Rehellinen analyysi ja toteutus samalta taholta."
  - h3: "Riippumattomia valmistajista" · h3: "Kaikki dokumentoituna" · h3: "Sanomme myös ei"
- h2 (eyebrow: "Perustaja"): "Madis Maastik"

### Outline as shipped — ET (identical)
- h1: **"Seade on muutunud kaubaks. Oskus mitte."**
- h2: "Aus analüüs ja teostus samalt osapoolelt." → h3: "Tootjatest sõltumatud" · "Kõik dokumenteeritud" · "Ütleme ka ei"
- h2: "Madis Maastik"

**Anomalies:** "Madis Maastik" as an h2 is a founder section, not a partner bio — reads as a registered exception to the no-bios rule (founder + contact person), noting it only for completeness. The two-market identity ("we serve FI and ET in both languages" — the thing the data-desc leads with) exists only in body copy, never at heading level.

**h1 verdict: CLAIM** (both). "Hardware has become a commodity. Expertise hasn't." is a market thesis, not the page's subject (who SAMA is / what it does). The subject-first statement already exists on the page — it's the first h2: "Rehellinen analyysi ja toteutus samalta taholta." Direction: promote that subject (honest analysis + delivery from one party, FI+ET) into the h1 and let the commodity thesis become the supporting h2 or lede. The thesis is good copy; it's just in the wrong slot under the test.

**Heading-only story:** "Hardware is a commodity, expertise isn't. Honest analysis and delivery from one party: manufacturer-independent, everything documented, we also say no. Madis Maastik." **Grade: B.** Missing beat: the two-market, two-language identity — the page's declared search intent — never appears in a heading.

**Classification:** h1 — **EARNED-CLEVER as a line, but mis-slotted as h1** (it informs a thesis while withholding who "we" are). "Rehellinen analyysi ja toteutus samalta taholta." — PLAIN. h3s — PLAIN. "Madis Maastik" — PLAIN (name as heading; carries nothing for someone who doesn't know the name, but that's inherent to founder sections).

---

## 7 · Yhteystiedot — `/yhteystiedot/` · Kontakt — `/kontakt/`

### Outline as shipped — FI
- h1 (eyebrow: "Yhteystiedot"): **"Aloitetaan kulutustiedoistanne."**
- *(no other headings on the page — form labels + eyebrow "Suoraan" for the direct-contact block)*

### Outline as shipped — ET (identical)
- h1 (eyebrow: "Kontakt"): **"Alustame teie tarbimisandmetest."**

**Anomalies:** (a) Single-heading page: the form and the direct-contact block ("Suoraan"/"Otse", with name, phone, email) have no headings at all. (b) **h1 duplication:** this h1 is the verbatim string of the home page's closing h2, in both languages. As an internal echo it's deliberate rhetoric; as document structure it means two pages carry the same headline and neither names this page's own subject.

**h1 verdict: JOURNEY.** It names the first step of the process ("let's start from your consumption data"), not the page's subject (request a free site survey / contact us). The data-title has it right: "Pyydä kohdekartoitus" / "Küsi objektikaardistust". Direction: subject-first h1 that names the kohdekartoitus/objektikaardistus request (free, written, non-binding); the consumption-data line works as lede or subordinate clause. Also gives the site a heading for the direct-contact block (h2 direction: direct contact / straight to a person).

**Heading-only story:** "Let's start from your consumption data." — one beat; a reader scanning headings cannot tell this is the contact/survey-request page. **Grade: C.** Missing beat: the mission itself (survey request + how to reach a human).

**Classification:** h1 — **OPAQUE** in this slot (withholds the page's function; on the home page the same string is PLAIN because context supplies it).

---

## 8 · Kiitos — `/kiitos/` · Aitäh — `/aitah/` (noindex)

- FI h1 (eyebrow: "Kiitos"): **"Viestinne on perillä."** — only heading.
- ET h1 (eyebrow: "Aitäh"): **"Teie sõnum on kohal."** — only heading.

**h1 verdict: SUBJECT** (status statement — exactly what a confirmation page should say). **Story grade: A** (single beat, complete). Classification: PLAIN. No anomalies; noindex, out of SEO scope.

---

## 9 · Ajankohtaista — `/ajankohtaista/` · Uudised — `/uudised/`

### Outline as shipped — FI
- h1 (eyebrow: "Ajankohtaista"): **"Mitä markkinalla tapahtuu — lähteineen."**
- (eyebrow: "Luettavaa muualla") item h2s (each an outbound link):
  - h2: "Energiakatselmusvelvoite laajenee: raja on jatkossa kulutus, ei yrityksen koko ↗"
  - h2: "Sähkönkulutus on kääntymässä voimakkaaseen kasvuun – rinnalle tarvitaan lisää säätövoimaa ↗"

### Outline as shipped — ET
- h1 (eyebrow: "Uudised"): **"Mis turul toimub — koos allikatega."**
- (eyebrow: "Lugemist mujalt") item h2s — FOUR items, Estonian-market items first (source comment says the order is deliberate):
  - h2: "Salvestusüksuse mõõtmise üleminekuperiood lõpeb 31.12.2026 ↗" *(ET-only)*
  - h2: "Võrgutasu topeltarvestus salvestatud energialt lõppes ↗" *(ET-only)*
  - h2: "Energiaauditi kohustus laieneb: piir on edaspidi tarbimine, mitte ettevõtte suurus ↗"
  - h2: "Elektritarbimine on pöördumas tugevasse kasvu – kõrvale on vaja rohkem reguleerimisvõimsust (soome keeles) ↗"

**h1 verdict: SUBJECT** (both) — names the content type and the provenance discipline ("with sources"). Slightly generic, but for a news page that's the subject.

**Heading-only story (FI):** "What's happening in the market, with sources: audit obligation now follows consumption, not company size; consumption is turning to strong growth and balancing power is needed." **Grade FI: A-** (two beats, both real). **Grade ET: A** — four beats, Estonia-first, each heading a complete finding. Item h2s are the plainest, most informative headings on the site — findings as headlines, not teasers.

**Classification:** all PLAIN. No OPAQUE.

---

## 10 · Tietosuoja — `/tietosuoja/` · Andmekaitse — `/andmekaitse/`

- FI h1: **"Tietosuojaseloste"** → h2: "Rekisterinpitäjä" · "Mitä tietoja käsittelemme" · "Miksi käsittelemme" · "Kenelle tietoja siirretään" · "Kuinka kauan säilytämme" · "Oikeutenne" · "Muutokset"
- ET h1: **"Andmekaitsetingimused"** → h2: "Vastutav töötleja" · "Milliseid andmeid töötleme" · "Miks töötleme" · "Kellele andmeid edastatakse" · "Kui kaua säilitame" · "Teie õigused" · "Muudatused"

**h1 verdict: SUBJECT.** **Story grade: A.** All PLAIN. ET "Teie õigused" body adds the Estonian supervisory authority (AKI) — correct localization, not a heading divergence.

---

## SEO divergence table

Declared intent = Madis's data-title/data-desc (deliberate; flag, don't overrule). ET mirrors share the verdict unless noted.

| Page | Declared search intent (title/desc) | On-page heading intent (h1+h2) | Divergence? | Direction |
|---|---|---|---|---|
| Home `/` · `/et/` | Category + audience: "Energiavarastot ja aurinkosähkö yrityksille" / "Energiasalvestid ja päikeseelekter ettevõtetele"; written answer before signing | Mood slogan h1; h2s cover benefits/trust/CTA; the offer never named in a heading | **YES — largest on site.** Title and h1 share zero words | h1 (or an added early h2) should move toward the title's subject. Title stays. |
| Energiavarastot / Energiasalvestid | "Teollisuuden energiavarastot — kartoituksesta käyttöönottoon" — subject + journey tail | Subject-first h1 (sizing differentiator); journey demoted to h2 | Minor, inverted | After the battery-first restructure the *title's* journey tail ("kartoituksesta käyttöönottoon") is now the last journey-phrase in the h1/title pair — /prosessi/ owns the journey. Flag to Madis whether the tail should follow the h1's move; his call. |
| Aurinko-ja-akku / Paike-ja-aku | "Aurinkosähkö + akku — yksi järjestelmä"; four questions solved in writing | h1 names both subjects + roles; "yksi järjestelmä" argument appears in h2s; four questions promised in an h2 | No | None. Closest title↔heading alignment on the site. |
| Reservimarkkinat / Reserviturud | "Reservimarkkinat: FCR, aFRR ja mFRR selitettynä" — explicit product terms | h1 = what/require/don't-promise; FCR/aFRR/mFRR appear ONLY in table cells, never in a heading | **YES — moderate** | Headings should move toward the title: surface the product names in the "Tuotteet"/"Tooted" h2 (direction: "Reservituotteet FCR, aFRR ja mFRR — mitä kukin vaatii akulta"). A searcher arriving on the title's terms finds no heading answering them. |
| Prosessi / Protsess | "Näin akkuhanke etenee — seitsemän vaihetta" | "Seitsemän vaihetta, ja kauanko kukin kestää." + seven step h2s | Minor | h1 lacks the subject noun (akkuhanke/akuprojekt) the title carries. Direction: add it. |
| Meistä / Meist | "Meistä"; desc = "Rehellinen analyysi ja toteutus samalta taholta" + two markets, both languages | h1 = commodity claim; desc's sentence is the first h2; two-market identity in no heading | Partial | h1 should move toward the desc (which already matches the best h2). Two-market beat deserves heading level. |
| Yhteystiedot / Kontakt | "Pyydä kohdekartoitus" / "Küsi objektikaardistust" — transactional | h1 "Aloitetaan kulutustiedoistanne." — journey line, no kartoitus, no contact | **YES** | h1 moves toward the title: name the survey request. Title is right. |
| Kiitos / Aitäh | Confirmation (noindex) | Confirmation | No | — |
| Ajankohtaista / Uudised | News with primary sources, meaning for industrial owners | Same, plus finding-as-headline item h2s | No | — |
| Tietosuoja / Andmekaitse | Privacy: what/why/how long, no cookies/analytics | Same | No | — |

---

## Cross-language meaning divergences (mirror pages)

1. **Energiavarastot vs Energiasalvestid — the demand-charge example.** ET ships a full documented worked example: named DSO in an h3 ("Kuidas Elektrilevi võimsustasu arvestab"), model object h3, "what the example does NOT include" h3 block (Reservitulu / Börsihinna optimeerimine / Akukaod / Teie objekt), "Kaks lisahooba" h3s, and a per-package rate appendix. FI has the generic h3 "Miten verkkoyhtiö laskuttaa tehosta" and a `[X,XX — TARKISTETAAN]` placeholder pending anchor-DSO choice (Helen/Caruna/Elenia question open in source comment). Documented, deliberate — but until resolved, the FI heading promise ("Tehomaksu on eri asia") outruns its body, and the two languages make materially different-strength cases.
2. **Reservimarkkinat vs Reserviturud — evidence section.** ET-only h2 "Kolm dokumenteeritud märki samast struktuursest vajadusest." (three sourced Estonian signals). FI carries the equivalent two-curve framing only inside body copy of "Miksi emme julkaise tuottolukuja" with one Fingrid anchor. FI has no headed evidence beat; ET does.
3. **Ajankohtaista vs Uudised — item sets.** FI 2 items, ET 4 (two Estonia-specific: Elering metering transition deadline; ELTS §71 double network-fee abolition). Ordering deliberately Estonia-first on ET (source comment). Correct market localization, not drift — but note FI readers get no equivalent of the "double-fee ended" tailwind story for their market.
4. Everything else (home, aurinko/paike, prosessi/protsess, meistä/meist, kontakt, kiitos/aitäh, tietosuoja/andmekaitse): headings are meaning-equivalent translations. ET home benefit card links to `/energiasalvestid/#voimsustasu` anchor where FI links to the bare page — link-level only, not a heading divergence.

---

## Site-wide structural findings (ranked)

1. **Three h1 failures under the energiavarastot test:** Home (MOOD, both languages), Meistä/Meist (CLAIM), Yhteystiedot/Kontakt (JOURNEY). In two of the three, the correct subject-first line already exists on the page (Meistä's first h2; the contact data-title) — these are slot problems, not writing problems.
2. **Headings contradict DSO-first doctrine once:** reservimarkkinat/reserviturud market-access steps put "Verkkoyhtiön hyväksyntä"/"Võrguettevõtte kooskõlastus" last in heading order, correcting it only via a chip ("Ensin"/"Kõigepealt"). Only place on the site where the heading-order story and doctrine disagree.
3. **Core content hidden below heading level, pattern:** home offer trio in `<b>` tags; aurinko-ja-akku's four questions in `div.gcell`; FCR/aFRR/mFRR only in table cells; ET rate appendix under an eyebrow. The site's eyebrow system is disciplined, but in these four spots the eyebrow/div carries what the outline needs.
4. **h1 duplication:** contact h1 = home closing h2, verbatim, both languages.
5. **Component-level inconsistency:** identical card components at h2 in one section, h3 in another (energiavarastot "Mitä saatte" h2 vs "Näin etenemme" h3; reservi steps h2 vs prosessi steps h2 vs qa h3s). No hierarchy skips anywhere — levels are always h1→h2→h3 in order.
6. **Opaque headings, full list:** Home h1 FI+ET (withholds the offer); Kontakt h1 FI+ET (withholds the page function); reservimarkkinat closing h2 second half "Yhdessä ne ovat jotain muuta." / "Koos on need midagi muud." (withholds the fleet-as-infrastructure payoff). Meistä h1 is earned-clever mis-slotted rather than opaque. Everything else on the site is PLAIN or EARNED-CLEVER — by heading discipline this is a strong site; the failures are concentrated in exactly three h1s and one teaser h2.

---

## Appendix A5 · Conversion Path Analyst

# 05 — Conversion Path Audit (FI + ET)

Sources audited: `/Users/martinrautio/Projects/sama-energia/website/src/fi.html` (941 lines), `/Users/martinrautio/Projects/sama-energia/website/src/et.html` (1019 lines), branch `draft`. Build-script link rewriting verified (`scripts/build-pages.mjs`): ET visible URLs without `/et/` prefix and the cross-language switcher are correct — no plumbing bugs.

**Headline findings (ranked):**

1. **FI `energiavarastot` — the core product page — has zero kartoitus CTAs.** Its only button is "Ota yhteyttä", at the bottom, inside the consulting-without-equipment side-offer. The ET mirror has a proper "Küsige objektikaardistust" button after the võimsustasu example; the FI page lost that block because its tehomaksu example is still a `[X,XX] TARKISTETAAN` placeholder.
2. **The stage-(b) quote-review offer exists in three places and is actionable in none of them.** Front-page callout: no link. "Kolme kysymystä" callout on reservi page: no link. Only the consultancy bullet list on energiavarastot has a button, and the contact page never acknowledges quote-review intent.
3. **The contact page collects but does not re-sell.** Every reassurance a cold arrival needs (free, no commitment, written output, reply within a working day, "sometimes the answer is no") exists elsewhere on the site — none of it is on the form page.
4. **Thank-you pages waste the highest-intent moment**: acknowledgment + contacts + a *backwards* link to the front page. No what-happens-next, no prosessi link, no prepare-your-data checklist.
5. **tietosuoja/andmekaitse are total dead ends** (footer only). kiitos/aitah nearly so.

---

## 1 · Full CTA map

Nav CTA on **every** page (both languages): "Pyydä kartoitus" / "Küsi kaardistust" → contact page (`navcta` style). Footer on every page links "Kohdekartoitus"/"Objektikaardistus" and "Yhteystiedot"/"Kontakt". These are excluded from the per-page rows below (body content only).

### FI pages

| Page | CTA text (verbatim) | Target | Position | Style |
|---|---|---|---|---|
| **Front** `/` | Pyydä kohdekartoitus | /yhteystiedot/ | hero | btn |
| | Katso miten prosessi etenee | /prosessi/ | hero | btn ghost |
| | Lue lisää (×3) | /energiavarastot/ | mid (bene cards) | morelink |
| | Lue lisää (×2) | /aurinko-ja-akku/ | mid (bene cards) | morelink |
| | Lue lisää (×1) | /reservimarkkinat/ | mid (bene cards) | morelink |
| | Pyydä kohdekartoitus | /yhteystiedot/ | mid (after bene) | btn |
| | Lue miten se ratkaistaan | /aurinko-ja-akku/ | dark-section (Kaksi lähtötilannetta) | btn ghost |
| | Pyydä kohdekartoitus | /yhteystiedot/ | dark-section (Kaksi lähtötilannetta) | btn |
| | Näin se etenee | /prosessi/ | mid (Miksi meihin voi luottaa) | inline link |
| | Pyydä kohdekartoitus | /yhteystiedot/ | end (dark) | btn |
| **energiavarastot** | Tehomaksu-esimerkki alempana | #tehomaksu | mid (Mitä saatte) | morelink |
| | Lue miten se ratkaistaan | /aurinko-ja-akku/ | mid (Mitä saatte) | morelink |
| | Reservimarkkinat — mitä ne ovat | /reservimarkkinat/ | mid (Mitä saatte) | morelink |
| | Koko prosessi — vaiheet ja kestot (×4) | /prosessi/ | mid (Näin etenemme) | morelink |
| | Ota yhteyttä | /yhteystiedot/ | end (dark, consulting section) | btn |
| **aurinko-ja-akku** | Pyydä kartoitus kohteeseenne | /yhteystiedot/ | dark-section (after 4 questions) | btn |
| | Pyydä kohdekartoitus | /yhteystiedot/ | end | btn |
| **reservimarkkinat** | lähde Ajankohtaista-sivulla | /ajankohtaista/ | dark-section (Miksi emme julkaise) | inline link |
| | Pyydä kohdekartoitus | /yhteystiedot/ | end (dark) | btn |
| **prosessi** | Pyydä kohdekartoitus | /yhteystiedot/ | end (after callout) | btn |
| **meista** | Ota yhteyttä | /yhteystiedot/ | end (dark, founder section) | btn |
| **yhteystiedot** | Lähetä (submit) | POST → /kiitos/ | mid (form) | btn dk |
| | Tietosuojaseloste | /tietosuoja/ | mid (under form) | inline link |
| | madis.maastik@samaenergia.fi (error fallback + direct block) | mailto | mid | inline link |
| **kiitos** | Takaisin etusivulle | / | hero | btn ghost |
| | mailto + phone/WhatsApp | direct contact | hero | inline |
| **ajankohtaista** | 2 source links (EUR-Lex, Fingrid) ↗ | external | mid | inline external |
| | kohdekartoitus | /yhteystiedot/ | end paragraph | inline link |
| | Pyydä kohdekartoitus | /yhteystiedot/ | end | btn |
| **tietosuoja** | — none. Email addresses appear as plain text, not even mailto links. | — | — | — |

### ET pages (differences from FI mirror in bold)

| Page | CTA text (verbatim) | Target | Position | Style |
|---|---|---|---|---|
| **Avaleht** `/` | Küsige objektikaardistust | /kontakt/ | hero | btn |
| | Vaadake, kuidas protsess kulgeb | /protsess/ | hero | btn ghost |
| | Loe edasi (×1) | **/energiasalvestid/#voimsustasu** (deep anchor — FI goes to page top) | mid (bene) | morelink |
| | Loe edasi (×2) | /energiasalvestid/ | mid (bene) | morelink |
| | Loe edasi (×2) | /paike-ja-aku/ | mid (bene) | morelink |
| | Loe edasi (×1) | /reserviturud/ | mid (bene) | morelink |
| | Küsige objektikaardistust | /kontakt/ | mid (after bene) | btn |
| | Lugege, kuidas see lahendatakse | /paike-ja-aku/ | dark-section | btn ghost |
| | Küsige objektikaardistust | /kontakt/ | dark-section | btn |
| | Kuidas see kulgeb | /protsess/ | mid | inline link |
| | Küsige objektikaardistust | /kontakt/ | end (dark) | btn |
| **energiasalvestid** | Näidisarvutus sellel lehel | #voimsustasu | mid (Mida saate) | morelink |
| | Lugege, kuidas see lahendatakse | /paike-ja-aku/ | mid | morelink |
| | Reserviturud — mis need on | /reserviturud/ | mid | morelink |
| | Kogu protsess — etapid ja kestused (×4) | /protsess/ | mid | morelink |
| | Miks, loe siit → | /reserviturud/ | mid (näidisarvutus) | inline link |
| | **Küsige objektikaardistust** | /kontakt/ | **mid (after näidisarvutus callout) — NO FI equivalent** | btn |
| | Võtke ühendust | /kontakt/ | end (dark, consulting section) | btn |
| **paike-ja-aku** | Küsige kaardistust oma objektile | /kontakt/ | dark-section | btn |
| | Küsige objektikaardistust | /kontakt/ | end | btn |
| **reserviturud** | **3 source links (Elering ×2, ERR) ↗** | external | mid ("Miks reservivajadus kasvab" — section FI lacks) | inline external |
| | Küsige objektikaardistust | /kontakt/ | end (dark) | btn |
| **protsess** | Küsige objektikaardistust | /kontakt/ | end | btn |
| **meist** | Võtke ühendust | /kontakt/ | end (dark) | btn |
| **kontakt** | Saada (submit) | POST → /aitah/ | mid (form) | btn dk |
| | Andmekaitsetingimused | /andmekaitse/ | mid | inline link |
| | mailto (error fallback + direct block) | mailto | mid | inline |
| **aitah** | Tagasi avalehele | / | hero | btn ghost |
| **uudised** | 4 source links (Elering, Riigi Teataja, EUR-Lex, Fingrid) ↗ | external | mid | inline external |
| | objektikaardistus | /kontakt/ | end paragraph | inline link |
| | Küsige objektikaardistust | /kontakt/ | end | btn |
| **andmekaitse** | — none | — | — | — |

CTA verb honesty: **pass everywhere.** All conversion CTAs use Pyydä/Küsi/Ota yhteyttä/Võtke ühendust; the two "Varaa/Broneeri" drafts were caught and corrected in source comments (fi.html:763, et.html:830, et.html:387).

---

## 2 · Per page: intended next step, ending, dilution

| Page | Intended next step | Ends with forward path? | Dilution verdict |
|---|---|---|---|
| Front FI/ET | kartoitus | **Yes** — dedicated dark closing band, well written ("maksuton eikä sido mihinkään… pidätte sen joka tapauksessa") | 4 kartoitus buttons + 9 distributor links on one page; hierarchy is clean (btn vs ghost vs morelink), acceptable. The one flaw: the quote-review callout is inert text between two CTA bands (see §3b). |
| energiavarastot FI | kartoitus | **Weak.** Ends with "Ota yhteyttä" inside the consulting side-offer — a convinced *buyer* exits through the consultancy door. **No kartoitus-verb CTA anywhere on the page.** | 7 morelinks (4 identical to /prosessi/ — one would do) vs 1 button. The page informs but never asks. |
| energiasalvestid ET | kartoitus | Mid-page CTA after näidisarvutus is excellent (callout: "Just seda kontrollib tasuta objektikaardistus…" → button). But the page *ends* with "Võtke ühendust" (consulting) after two rate tables + rahastus block — momentum from the example decays before page end. | Post-CTA content (annex table of 8 tariff packages) is reference material; fine, but the closing CTA should re-state kartoitus, not consulting. |
| aurinko-ja-akku FI/ET | kartoitus | **Yes** — clean double close (dark-section CTA after the technical proof, end CTA after the greenfield pitch). Best-converting page structure on the site. | None. |
| reservimarkkinat FI / reserviturud ET | kartoitus (after deliberately refusing numbers) | **Yes** — end dark CTA after the "why this matters beyond one site" section. | The page's rhetorical bridge ("we build on savings") has no link to the savings evidence — see §7 journey E. Kolme kysymystä callout is inert — see §3b. |
| prosessi FI/ET | kartoitus | **Yes** — callout ("Mitään ei hankita ennen…") + button. Clean. | None. |
| meista/meist | contact | **Yes** — "Ota yhteyttä / Võtke ühendust" after founder section. Acceptable, but this is the page trust-shoppers finish on; the button could carry the kartoitus framing + the "ei sido mihinkään" line instead of a bare verb. | None. |
| ajankohtaista/uudised | kartoitus | **Yes** — inline sentence + button. Good pattern (the inline sentence gives the button a reason). | External ↗ links leak attention by design (sources doctrine) — compensated. |
| yhteystiedot/kontakt | submit | Yes (the form is the ending) | See §5 — the partner-network note at the very bottom is the last thing a hesitant reader sees; harmless but off-message for a lander. |
| kiitos/aitah | (none defined) | **No** — only a backwards ghost to the front page. | See §6. |
| tietosuoja/andmekaitse | (none defined) | **No** — nothing. Not even mailto links on FI. | See §4. |

---

## 3 · Awareness-stage paths

**(a) Just researching.** Well served: front hero ghost → prosessi; 6 bene morelinks; reservi/uudised pages are genuine reading destinations; ajankohtaista carries documented sources. Gaps: reservimarkkinat gives a researcher **no internal next-read** — its only internal links are one inline source pointer and the end CTA. A researcher who isn't ready to convert has nowhere to go but back. Cheap fix (direction): a morelink from the "miksi emme julkaise tuottolukuja" section to the savings evidence (`/energiavarastot/#tehomaksu` FI, `/energiasalvestid/#voimsustasu` ET) — this is also the doctrinally correct move (savings first).

**(b) Comparing suppliers — the deliberate tool, judged.** The site's stage-(b) assets:
1. Front-page callout: "Jos teillä on tarjous kädessä ja haluatte tietää kestääkö sen takaisinmaksuluku kosketuksen todellisuuteen — se on täsmälleen sitä työtä, jota me teemme. / Teemme sen riippumatta siitä, ostatteko meiltä koskaan mitään." — **strongest offer on the site, zero affordance.** No link, no verb, no target. A reader must independently decide the nav CTA covers this.
2. "Kolme kysymystä mille tahansa toimittajalle" (reservimarkkinat/reserviturud): excellent content, again ends in a linkless callout ("Hyvä toimittaja vastaa niihin mielellään").
3. The only *actionable* path: energiavarastot consulting section bullet "Muilta toimittajilta saatujen tarjousten riippumaton arviointi" + "Ota yhteyttä" button — buried at the bottom of the one FI page with the weakest CTA structure.

**Findability verdict: not findable enough.** A stage-(b) reader arrives via front page or energiavarastot (search for battery + payback), not via reservimarkkinat mechanism education. Where they actually are (front callout), the offer is inert; where the tool lives (kolme kysymystä), there's no handoff; where the button is (consulting section), the offer is one bullet among four. And on the contact page there is **zero acknowledgment that quote reviews are welcome** — the form is kartoitus-shaped, so a quote-holder must improvise in the free-text field. Doctrine-safe fixes (direction, not copy): (i) inline-link the front callout to the contact page; (ii) add one morelink under the kolme-kysymystä callout — honest verb, e.g. "Pyydä riippumaton arvio tarjouksestanne" → contact; (iii) one sentence on the contact page: the same form serves independent quote reviews, free, regardless of whether you ever buy (all claims already published verbatim on the front page).

**(c) Ready to act.** Served everywhere except: FI energiavarastot (no kartoitus CTA — the ready reader must fall back to nav), tietosuoja/andmekaitse (nothing), kiitos/aitah (already converted, but see §6). Nav CTA is a constant safety net on desktop; on mobile it's behind the burger — which makes the missing body CTAs on FI energiavarastot more costly than they look.

---

## 4 · Dead ends (verification of this week's fixes + what's still weak)

The closing-CTA fixes are **in and verified**: aurinko-ja-akku, reservimarkkinat, prosessi, meista, ajankohtaista and the front-page closing band all end with a forward button in both languages.

Still weak, in order:

1. **tietosuoja/andmekaitse — full dead end.** No links at all in body; FI even renders the email as plain text. Typical visitor is mid-form (arrived from the label under the submit button) — the page's job is to send them *back to the form* reassured. Doctrine-safe: one quiet inline line at the end ("Kysymys tiedoistanne? Sama lomake tai sähköposti käy" → link), or at minimum make the email addresses mailto links. A big button would be off-tone here; a morelink is enough. Note the page content itself is a conversion asset ("Emme käytä evästeitä emmekä analytiikkaa… Emme käytä tietoja muuhun markkinointiin") that nothing on the form page surfaces — see §5.
2. **kiitos/aitah — one backwards ghost.** See §6.
3. **FI energiavarastot** — not literally CTA-less but conversion-dead for the kartoitus path (§2). The root cause is legitimate (no undocumented FI figures → no näidisarvutus → the ET callout+CTA block had nothing to attach to), but the CTA doesn't need the figures: the ET callout's first sentence ("Just seda kontrollib tasuta objektikaardistus teie enda tarbimisandmete põhjal") works in FI *today* without a single number.
4. **Front-page callout + kolme-kysymystä callout** — inert stage-(b) text (§3b).
5. **meista/meist** — has a button, but as the trust page it closes with the site's thinnest CTA framing (bare "Ota yhteyttä", no maksuton/ei-sido line).

---

## 5 · The form page as a lander (yhteystiedot/kontakt)

**What a direct arrival gets:** eyebrow "Yhteystiedot", H1 "Aloitetaan kulutustiedoistanne.", one lede sentence (fastest way to find out; only name + email required), then 12 form fields, then direct contacts. That's it.

**What it does NOT say — even though every claim already exists on the site:**
- *What it costs / what it commits you to*: "maksuton eikä sido teitä mihinkään… pidätte sen joka tapauksessa" — front-page closing band, verbatim. Absent here. (The meta description says it; the page body doesn't. Ad/search arrivals were promised it by the snippet and land on a page that doesn't repeat it.)
- *What you get*: "kirjallinen näkemys" — meta description only.
- *What happens next*: "palaamme asiaan arkipäivän kuluessa" appears only in the post-submit success message; first step "≈ 1 viikko" only on prosessi.
- *Why it's safe to ask*: "Joskus vastaus on ei. Sanomme sen, ja olette menettänyt keskustelun ettekä vuotta" (energiavarastot); "Ei evästeitä, ei analytiikkaa, ei markkinointikäyttöä" (tietosuoja).

**The ONE reassurance block doctrine allows:** a short strip between the lede and the form (or beside the form, above the direct-contact block) assembling 3–4 of the above already-published sentences — free & non-binding, written output you keep either way, reply within a working day + first step ≈1 week (link → /prosessi/), sometimes the answer is no. Zero new claims, zero pressure, all sourced from existing pages. This is the single highest-leverage conversion fix on the site: every other page pours into this one, and paid/search/forwarded traffic lands here cold.

**Field burden.** 2 required (nimi, email) + 10 optional = 12 visible controls + textarea + submit. Judgments:
- The two-tier split is honestly *labeled* (every field carries "· pakollinen/valinnainen", and there's a divider "Nämä nopeuttavat arviota · kaikki valinnaisia") — but **the layout muddles it**: yritys and puhelin are optional yet sit *above* the divider, implying they belong to the required tier. Move the divider above them or restate.
- Scariest fields for a cold lead: **Pääsulake tai liittymisteho**, **Vuosikulutus**, **Verkkoyhtiö**, **teho (kWp)** — technical homework questions. The value-driven segment the front page explicitly courts (retriittikeskukset, luomutilat, kulttuuritalot) mostly can't answer them and may read the form as "for engineers only". The lede's "pakollisia ovat vain nimi ja sähköposti" is the right antidote but is one clause in a sentence; the reassurance block should repeat that not knowing these is fine — "aloitetaan kulutustiedoistanne" literally means SAMA will pull the data together with them.
- The sheer visual mass (12 fields on one screen) reads as a qualification interview. Direction options within doctrine: visually de-emphasize/collapse the optional tier, or accept the mass but lead with the "name+email is enough" promise more prominently.
- The partner-network paragraph at the very bottom repurposes the form for a second audience; harmless, but it's the last thing a hesitating lead reads. The missing *third* audience is the quote-holder (§3b) — one sentence would fix it.
- Mechanics are solid: no-JS fallback action, honeypot, mailto fallback on error, identical field names FI/ET into one Netlify form. No complaints.

---

## 6 · Thank-you pages (kiitos/aitah)

**Current offer:** "Viestinne on perillä." + reply-within-a-working-day + direct contacts + ghost button *back to the front page* — i.e. the site's highest-intent visitor is sent backwards to page one. `noindex` correctly set; page also serves as the no-JS form action, so it must stand alone — it does, barely.

**What doctrine allows (all sourced from already-published content, no upsell, no urgency):**
1. **What-happens-next strip** (3 steps, lifted from prosessi 01–03): we reply within a working day → kvalifiointi ≈ 1 viikko, you fill the kohdetietolomake and we analyze your consumption data → verkkoyhtiön ennakkoselvitys, and nothing is bought before its written answer. This converts the wait into confidence and repeats the site's core differentiator at the exact moment it's most credible.
2. **Link to /prosessi/ / /protsess/** ("Näin se etenee — vaiheet ja kestot") as a ghost button instead of, or before, "Takaisin etusivulle".
3. **Prepare-your-data checklist** — items verbatim from prosessi step 01: liittymisteho, pääsulake, muuntajan teho, olemassa oleva tuotanto, mittausjärjestely, asennuspaikka, voimassa olevat sähkösopimukset (+ tuntikulutustiedot). "Jos nämä ovat käsillä, ensimmäinen viikko nopeutuu" — an honest accelerator, not pressure.
4. Optionally a quiet pointer to ajankohtaista/uudised as reading-while-you-wait.

Explicitly out (doctrine): any second CTA, any "meanwhile, have you considered…", any countdown/urgency framing.

---

## 7 · Cross-page funnel — most plausible 3-page journeys and their leaks

**A. Front → energiavarastot → yhteystiedot (FI, the canonical buyer journey).**
Leaks: (1) landing page of step 2 has **no kartoitus CTA** — the journey's middle page can only convert via nav burger; (2) the tehomaksu example dead-ends at "[X,XX € — TARKISTETAAN]" with no callout/CTA after it — a reader arriving on the promise of a calculation finds a placeholder and no next action; (3) the page exits through the consulting door. This is the leakiest mainline journey on the site. Fix order: closing kartoitus CTA now (needs no figures), callout+CTA after tehomaksu when the anchor tariff is documented (mirror ET), dedupe the 4× prosessi morelinks.

**B. Avaleht → energiasalvestid#voimsustasu → kontakt (ET).**
Strongest funnel on the site: deep anchor lands directly on a fully documented calculation, callout + CTA immediately below. Minor leaks: deep-link arrival skips the "Mida saate" overview above the anchor; a reader who scrolls past the mid CTA descends through annex tables + rahastus + consulting and exits on "Võtke ühendust". Small.

**C. Front → prosessi → yhteystiedot (trust-first buyer, via hero ghost).**
Clean: prosessi ends callout → CTA; contact page follows. The leak is at step 3 — prosessi has just promised a rigorous 7-step process, and the form page does nothing to confirm the visitor entered it (§5). A "step 1 of the process starts here" echo would close the loop.

**D. Search → energiavarastot (consulting bullet) → yhteystiedot (stage-b, quote in hand).**
Leaks at both ends: the offer is a buried bullet (§3b), and the destination form never mentions quote reviews — the quote-holder has to self-classify into a kartoitus form. Highest-value *audience* with the least-built path.

**E. Search → reservimarkkinat/reserviturud → ? (organic entry for FCR/tuotto queries).**
The page deliberately refuses numbers (correct), argues "savings first" — but never links to the savings evidence one click away. FI reader can't reach #tehomaksu from here at all; ET reader isn't pointed to #voimsustasu either (the link only runs the other direction). One morelink fixes the doctrinally most important handoff on the site.

**F. Search/social → ajankohtaista/uudised → external source ↗.**
Attention leaks outward by design (documented-sources doctrine — a feature, not a bug); the inline "kohdekartoitus on nopein tapa saada vastaus" + end CTA is the right compensation. No change needed.

---

## Fix shortlist (all doctrine-compatible, direction-not-copy)

1. FI energiavarastot: add closing "Pyydä kohdekartoitus" CTA now; mirror ET's post-example callout+CTA when the FI tariff anchor is documented.
2. Contact page: one reassurance block (free/non-binding · written output you keep · reply in a working day + prosessi link · sometimes we say no) + "name and email are enough" restated at the optional-fields divider; move the divider above yritys/puhelin.
3. Stage-(b) plumbing: link the front-page callout; morelink under kolme kysymystä → contact; one quote-review sentence on the contact page.
4. kiitos/aitah: what-happens-next steps + prosessi link + prepare-your-data checklist; demote "back to front page".
5. reservimarkkinat → savings-evidence morelink (FI #tehomaksu, ET #voimsustasu).
6. tietosuoja/andmekaitse: mailto links + one quiet return path.
7. energiavarastot/energiasalvestid: close the page on kartoitus, not the consulting side door; dedupe 4× prosessi morelinks.

---

## Appendix A6 · Media Director

# 06 — MEDIA DIRECTOR: Media Plan for the SAMA Energia Website

Audit of `src/fi.html` (940 lines, 10 pages) + `src/et.html` (1019 lines, 10 mirrors), branch `draft`.
Doctrine applied: no people, no fake installs presented as real, no stock aesthetics, illustrative-generated allowed now with a retirement path, provenance colors extend to visuals (amber = modelled, green = documented), max 2–3 media elements per page, none-by-design is a valid call, no third-party embeds.

House visual grammar confirmed in `assets/site.css`: diagrams = IBM Plex Mono 10.5px labels, 1.5px `--tx2d` strokes, `--signal` green accents, dashed `--ctrl` control lines (`.sysdia`); provenance chips `.tg.las` (green) / `.tg.ske` and `.tg.chk` (amber); documented stat rows `.statrow`.

---

## 1. Media inventory as shipped

| Asset / element | What it is | Where used | State / judgment |
|---|---|---|---|
| `assets/hero.webp` (1344×752, 49 KB) | Generated photo (Magnific creation `rgUUJVTxtc`): winter dusk, transmission pylons + substation, snow field, warm copper horizon light | FI + ET front hero (`.heroimgd`, cover + scrim, `fetchpriority=high`) | Illustrative-generated, reads as such (empty landscape, no fake install). 1x only — 2x retina upscale is backlogged. Known clash: copper light vs the new Sügav Salu green palette (memory backlog confirms). Cold regrade or regenerate; retire when real photography exists. |
| `assets/of-aurinko.webp` (800×533) | Generated photo: PV panel close-up, low sun flare, warm clouds | Offer card 01 background, both fronts (scrimmed, `aria-hidden`) | The weakest of the three: sun-flare-on-panel is a stock-photo cliché. Works under scrim, but first candidate for regeneration in a colder Nordic register. |
| `assets/of-varasto.webp` (800×533, 47 KB) | Generated photo: outdoor battery cabinet on gravel pad beside dark industrial facade, dusk, green status LED | Offer card 02 background, both fronts | Closest to the "fake installation" line. Acceptable today because it is scrimmed, anonymous (no brand, no site) and used as texture, not evidence — but this one MUST retire on first real commissioning photo. |
| `assets/of-verkko.webp` (800×533) | Generated photo: pylon silhouettes at dusk over forest/lake horizon | Offer card 03 background, both fronts | Fine. Landscape, clearly atmospheric, no claims. Same retirement path. |
| `assets/mark.webp` (95×96) | Brand mark | Header + footer, every page | Fine. |
| Frequency trace SVG (`.trace`, path `#wave` animated by `site.js`) | Live animated line, signal-green stroke, dashed 50 Hz midline; honestly captioned "Havainnekuva taajuuden vaihtelusta" / "Illustratsioon sageduse kõikumisest" | FI + ET front hero, SIGNATURE block | The precedent: an illustrative visual that *labels itself illustrative*. Keep. This caption discipline is the model for every future visual. |
| Ops diagram (`.sysdia`, 620×372) + 5-mode buttons (`.ops`, `data-cap`) | Interactive animated system topology: PANEELIT→INVERTTERI→AKKU→bus→M→VERKKO + OHJAIN, flows per mode (PÄIVÄ/HUIPPU/YÖ/RESERVI/KATKOS) | `/aurinko-ja-akku/` + `/paike-ja-aku/` dark section | **The quality bar.** First-party, mono labels, thin strokes, fail-safe caption line under it. Nothing on the site should ship below this standard. |
| `.statrow` (Fingrid item) | Documented big-number row: ~5 GW / >4 GW / +40 % with mono ALLIKAS line | `/ajankohtaista/` + `/uudised/` | The house pattern for documented data visuals (green class). Reuse it before inventing chart forms. |
| Micro-icons: `.ochip`/`.oico` (3 offer icons), `.segico` (3 audience icons) | Hand-drawn stroke SVG icons | Front pages | Fine; below the "media element" threshold. |
| **Pending:** `assets/src-hero-system.png` → `hero-system.webp` (1344w, 21:9) | Stage-4 system-hero photo for battery pages, not yet delivered; carries the MADIS illustrative-until-real note | `/energiavarastot/` + `/et/energiasalvestid/` heroes | The quality bar for photos. Everything below plans around it. |

All photos ship with `alt=""` + `aria-hidden="true"` — correctly declared decorative. That is the right posture while imagery is illustrative; it flips only when a photo becomes evidence (a real installation), at which point it gets a real alt and a caption with provenance.

---

## 2. Per-page media plans

Columns: location (section anchor/eyebrow) | medium | subject | what it must communicate | aspect ratio | doctrine class | production route | priority.

### 2.1 Front page — FI `/` · ET `/` (`#p-home`)

Already at the 3-element cap: hero photo, frequency animation, offer-photo triptych. **No additions. Work here is maintenance, not creation.**

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Hero (`heroimgd`) | Photo (exists) | Winter dusk pylons + substation — regrade cold: kill the copper horizon, pull toward deep-forest green/blue dusk; 2x upscale for retina | The grid is real infrastructure in *our* landscape; we work at the connection point, not in a showroom | 16:9 (1344×752), cropped to 66% band | Illustrative-generated-now (retires on real photography) | Magnific: 2x upscale + cold regrade (or one regeneration pass) | Now (upscale), regrade with it |
| Hero → SIGNATURE (`.freq`) | Animated diagram (exists) | Live frequency trace around dashed 50,000 Hz line | Why reserve markets exist: imbalance is continuous and machines are paid to correct it in seconds | full-width strip ~9:1 | First-party-diagram (self-labelled illustrative) | Exists — keep, no changes | — |
| "Mitä toimitamme / Mida tarnime" offer cards | 3 photos (exist) | 01 PV close-up (regenerate colder — current one is the stock-cliché outlier) · 02 battery cabinet at dusk · 03 pylon silhouettes | The three deliverables are physical, outdoor, industrial objects — not renders of a brochure | 3:2 (800×533), scrimmed card backgrounds | Illustrative-generated-now (02 first to retire post-commissioning) | Magnific: 2x upscales now; regenerate 01 in-palette | Now (upscales); 01 regen after Stage-4 hero sets the look |
| All remaining sections (Kaksi lähtötilannetta, Kenelle, Periaatteet, Referenssit, CTA) | None-by-design | — | The trust argument is typographic: tags, principles, the empty REFERENSSIT slot. An image here would soften a page whose whole point is restraint | — | — | — | — |

FI/ET difference: none — mirrors share every asset.

### 2.2 Energiavarastot `/energiavarastot/` · Energiasalvestid `/energiasalvestid/` (`#p-energiavarastot`)

Currently **zero media** on the site's money page. Target state: exactly 2 elements (hero photo + tariff chart). This is the highest-priority page in this plan.

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Hero | Photo (pending Stage 4) | Containerized BESS unit **and** a fridge-sized cabinet unit together on a gravel pad, Nordic industrial yard, winter dusk, cold green-blue light, snow traces, no people, no vendor branding, no fake site signage | What the machine physically is, at both scales the page describes ("Kaappi tai kontti / Kabinett või konteiner") — so the "Järjestelmä itse" section can stay text-only | 21:9 (1344w) | Illustrative-generated-now — carries the MADIS retire-on-real-photography note verbatim | Blocked: Martin places `src-hero-system.png`, then webp q82 + `heroimgd` + preloads (per memory backlog) | Gated on Stage 4 |
| ET `#voimsustasu` (Võimsustasu näidisarvutus), between the DOKUMENTEERITUD/MODELLEERITUD split and the step table | Data visual (SVG) | Load-profile day with the shaved peak — full spec in §4 | The mechanism the table states: 480→380 kW, the 150 kWh ≤ ~250 kWh feasibility check, and the monthly reset that makes the battery earn 12×/year | 2:1 (viewBox 720×360), full column width | Documented-data-visual (rate, green) wrapping a modelled example (curve, amber) — dual-chip, see §4 | Hand-built SVG in house `.sysdia`/`.trace` grammar | **Now** — zero dependencies, all numbers already published on the page |
| FI `#tehomaksu` (Tehomaksu-esimerkki), same slot | Data visual (SVG), number-free variant | Same geometry, **no numerals, no €** — see §4 | The mechanism only (hourly average, monthly reset, shaved band); explicitly not a calculation, because FI's rate is still `[X,XX — TARKISTETAAN]` | 2:1 | First-party-diagram, amber MALLINNETTU chip | Same SVG, labels stripped; upgraded to numbered version when the anchor-DSO tariff is documented | Now (mechanism variant); numbered version gated on tariff anchor |
| "Järjestelmä itse / Süsteem ise" | None-by-design — **conditional** | — | kW/kWh/duration is carried by the text; the hero (spec'd to show both form factors) carries the physique. If the delivered Stage-4 image shows only a container: add a small cabinet-vs-container scale silhouette SVG (two outlines, dimension line "≈2 m" vs "≈6 m", mono labels) | (fallback: ~3:1 strip) | (fallback: first-party-diagram) | (fallback: hand-built SVG) | Decide on Stage-4 delivery |
| Näin etenemme / RAHOITUS / Konsultointi sections | None-by-design | — | Journey chips and refslots are the design; the process has its own page | — | — | — | — |

FI/ET difference: **yes — the chart differs.** ET carries the full numbered chart (its figures are documented on-page with the Elektrilevi/Konkurentsiamet source line). FI carries the number-free mechanism variant until the anchor tariff is filled. Never let the FI chart borrow ET's 480/380/348 numbers — those are Elektrilevi-VKL5 figures and would be invented data in a Finnish context.

### 2.3 Aurinko + akku `/aurinko-ja-akku/` · Päike + aku `/paike-ja-aku/` (`#p-aurinko`)

Already owns the site's best media element. Protect it; add nothing now.

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Dark section "Teillä on jo aurinkosähkö" | Interactive animated diagram (exists) | System topology + 5 operating modes with captioned flows | Where the meter sits, what the controller does, what fail-safe means — the four questions, answered visually | 5:3 (620×372) | First-party-diagram | Exists — quality bar. Only maintenance: keep FI/ET geometry identical (verified: they are) | — |
| Hero "Aurinko tuottaa. Akku ajoittaa." | None-by-design now → real photo later | Post-commissioning: real rooftop/ground PV with the retrofit battery cabinet visible in frame, documented site, no people | That the retrofit case is real and done — evidence, not atmosphere | 21:9 if promoted to `heroimgd` | Real-photography-only-post-commissioning | First-project photo shoot | After first project |
| Neljä kysymystä grid, Mitä selvitämme checklists, Kokonaisuus section | None-by-design | — | The numbered grid cells *are* the diagram of the four questions | — | — | — | — |

FI/ET difference: none (diagram labels already localized: INVERTTERI/INVERTER, KIINTEISTÖ/HOONE, OHJAIN/KONTROLLER).

### 2.4 Reservimarkkinat `/reservimarkkinat/` · Reserviturud `/reserviturud/` (`#p-reservi`)

The page's authority comes from refusing to show numbers nobody controls. Media must not undercut that.

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| "Tuotteet / Tooted" (product table section) | SVG diagram — optional, defensible to skip | Static (non-animated) frequency trace in `.trace` grammar with **qualitative** activation zones: FCR-N shading hugging the midline, FCR-D zones at the excursion edges, one aFRR "restore" arrow. **No numeric Hz thresholds, no durations** — the page itself says current TSO terms are checked live, never recalled from memory; baking thresholds into an SVG would contradict that stance and rot | Products differ by *when* they act and *how long* they hold — the one thing the table says in words | ~4:1 strip above the table | First-party-diagram | Hand-built SVG reusing the front-page trace geometry | Defer — nice, not necessary. None-by-design is the honest default here |
| ET only: "Miks reservivajadus kasvab" | Data visual — reuse `.statrow`, not a chart | Three documented figures already in the checklist: consumer bill line from 01.01.2026 · 250–400 MW procurement · ~1300→~2100 MW (2030→2035), each with its existing ALLIKAS line | The need is structural and documented — in the same green big-number pattern the news page already uses | existing statrow | Documented-data-visual (green) | Markup reuse, no new asset | Now (cheap), ET only — FI has no equivalent sourced block |
| "Miksi emme julkaise tuottolukuja" two-curve framing (demand grows / unit price compresses) | **Rejected — never** | — | A drawn two-curve chart would be a forecast visual with no dataset behind it — precisely the "number nobody controls" this section exists to refuse. The text does it honestly; a chart would fake precision | — | — | — | Never |
| Steps, three questions, Baltic-cables section | None-by-design | — | The steps component and the callouts carry it | — | — | — | — |

FI/ET difference: yes — the statrow item is ET-only (FI's page has no equivalent documented block; do not synthesize one).

### 2.5 Prosessi `/prosessi/` · Protsess `/protsess/` (`#p-prosessi`)

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Entire page | None-by-design | — | The `.steps` component (glass bead index + duration pill per step) already **is** a timeline visualization. A Gantt/timeline SVG would restate it with less information density. The page's persuasive object is the bolded "Mitään ei hankita…" sentence inside step 03 — typography, not imagery | — | — | — | — |

FI/ET difference: none.

### 2.6 Meistä `/meista/` · Meist `/meist/` (`#p-meista`)

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Entire page, incl. Perustaja/Asutaja section | None-by-design | — | House rules close every option: no people (no founder portrait, despite the named section), no track-record claims (no logo walls, no project montage). The founder section's credibility device is the list of named grid operators — text. Adding generic imagery here would *reduce* trust | — | — | — | — |

FI/ET difference: none. If a portrait is ever wanted, that is a doctrine change to escalate, not a media decision to make here.

### 2.7 Yhteystiedot `/yhteystiedot/` · Kontakt `/kontakt/` (`#p-yhteys`)

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Entire page | None-by-design | — | This is the conversion page; every media element competes with the form. The right column already has the strongest possible "image": a named person with direct phone/WhatsApp/email | — | — | — | — |

### 2.8 Kiitos `/kiitos/` · Aitäh `/aitah/` (`#p-kiitos`, noindex)

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Entire page | None-by-design | — | Confirmation pages should load instantly and say one thing | — | — | — | — |

### 2.9 Ajankohtaista `/ajankohtaista/` · Uudised `/uudised/` (`#p-ajankohtaista`)

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Fingrid 18.08.2026 item | Data visual (exists) | `.statrow`: ~5 GW / >4 GW / +40 % + mono ALLIKAS line | Documented figures at a glance, with source | existing | Documented-data-visual (green) | Exists — this is the page's house pattern | — |
| Future news items | Data visual, per item, only when the source itself is numeric | Rule, not asset: one `.statrow` per item max, figures verbatim from the primary source, ALLIKAS line mandatory. Bespoke charts (e.g., redrawing a Fingrid queue graph) only if the redrawn figure is fully sourced and adds reading value over the statrow — default no | — | strip | Documented-data-visual (green) | Markup reuse | Ongoing editorial rule |

FI/ET difference: item sets already differ by market (ET has Elering/ELTS items, FI the EED + Fingrid items) — the statrow rule applies per item, per language.

### 2.10 Tietosuoja `/tietosuoja/` · Andmekaitse `/andmekaitse/` (`#p-tietosuoja`)

| Location | Medium | Subject | Must communicate | Aspect | Doctrine class | Route | Priority |
|---|---|---|---|---|---|---|---|
| Entire page | None-by-design | — | A privacy policy with decoration is a privacy policy you don't trust | — | — | — | — |

---

## 3. Video thesis

**Where motion earns its cost on this site: almost nowhere — and where it does, it is SVG animation, not video files.**

1. **The tehomaksu monthly-reset mechanism — yes to motion, no to video.** This is the one mechanism on the site that is genuinely *temporal*: the meter restarts at zero every month, so the battery "earns 12 times a year." A 15-second animation of a 12-month strip (each month's peak bar rises, the shaved band caps it in amber, the counter resets) would teach the mechanism faster than the table. But as self-hosted video it would cost 2–5 MB, need poster/controls/captions, and break theme-awareness. As an animated SVG extension of the §4 chart (CSS/JS, same infrastructure `site.js` already uses for `#wave` and the ops flows) it costs ~3 KB, stays crisp, inherits the palette, and respects `prefers-reduced-motion` with one media query. **Build the static chart first (now); add the reset animation as progressive enhancement (defer).**
2. **The ops diagram already spends the site's motion budget.** It is interactive, self-captioned, and unique to one page-pair — that scarcity is why it works. Nothing else on the site has a mechanism that motion would reveal better than a still: the process is a list, the reserve products are a table, the doctrine sections are arguments.
3. **The first honest video is a screen capture of the monitoring UI** (peak-shave event or reserve activation on real project data), post-commissioning: muted loop, 10–20 s, single self-hosted MP4 (H.264, <4 MB), poster frame, no autoplay-with-sound, lazy-loaded. It would slot into the REFERENSSIT block as evidence, with a green DOKUMENTOITU caption naming site and date. There is no product to capture yet — **defer, do not fake it.**
4. **Real installation footage** (short locked-off or slow drone pass of the first commissioned site, no people in frame) could eventually replace the front hero. Worth the self-hosting cost only as background-quality loop ≤3 MB; otherwise a still photo does the same job cheaper. After first project, and only if the still isn't enough.
5. **Vanity — never:** front-page generic energy b-roll loops; AI-generated "cinematic" video (a generated video of an installation is a fake install at 24 fps — hard doctrine violation); talking-head explainers (no-people rule); any YouTube/Vimeo embed (banned outright; every candidate above must be weighed at self-hosted cost, which is exactly why the list is short).

---

## 4. Näidisarvutus data-visual — full specification

**Verdict: yes, the ET example table deserves one bespoke chart.** It is the only place on the site where documented tariff mechanics and a modelled load meet in numbers — the exact intersection the provenance system was built to display. One chart, not two: a load-profile day with the shaved peak. (The monthly-reset story becomes this chart's animation later — see §3.1 — not a second chart.)

**What it shows (ET, `/energiasalvestid/#voimsustasu`, placed between the DOKUMENTEERITUD/MODELLEERITUD split and the step table):**

- **Form:** hand-built inline SVG, viewBox `720×360` (2:1), `.sysdia`/`.trace` grammar — IBM Plex Mono 10.5px labels, 1.4–1.5px strokes, no fills except the two marked areas, transparent background so glass cards and dark-guard both work.
- **X-axis:** one day, 00–24 h, ticks every 6 h, mono labels. Caption under axis: `ÜKS PÄEV · TUNNI KESKMISED` — reinforcing the documented "hourly average, not instantaneous peak" point.
- **Y-axis:** kW, ticks at 0 / 350 / 380 / 480 only (the numbers the page already publishes — no invented intermediate values).
- **Load curve:** stepped hourly-average line (honest about hourly metering — steps, not a smooth spline), base ~350 kW with a morning-startup excursion to 480 kW lasting ≤1,5 h. Stroke: `--amber`. Chip top-right of the plot: `MODELLEERITUD` in the existing `.tg.ske` style.
- **Target line:** horizontal dashed line at 380 kW, `--amber-ink`, label `SIHT 380 kW`.
- **Shaved block:** the area between the curve and the 380 line during the excursion, hatched in amber at low opacity. Label with leader line: `100 kW × 1,5 h = 150 kWh ≤ ~250 kWh → teostatav` — the feasibility check drawn, not just tabulated.
- **Battery trace (optional second pass):** thin `--signal` stepped line mirroring the shaved block below the curve, label `SALVESTI TÜHJENEB` — ties the chart to the ops diagram's HUIPPU mode vocabulary. Include only if it doesn't crowd 720×360; the chart works without it.
- **The one documented element:** annotation anchored to the shaved block: `× 3,48 €/kW kuus = 348 €/kuu` with a green `DOKUMENTEERITUD` chip (`.tg.las` style), and beneath the SVG the page's existing mono source line pattern: `ALLIKAS: ELEKTRILEVI VÕRGUTEENUSE HINNAKIRI 1.06.2026 · KONKURENTSIAMETI OTSUS NR 7-3/2026-028 · DOKUMENTEERITUD`. The chart thus carries **both chips** — the split section's amber/green distinction reproduced inside one graphic, which is precisely the point.
- **Monthly-reset note:** single mono caption line under the chart: `MÕÕTMINE ALGAB IGA KUU NULLIST — SALVESTI TEENIB 12 KORDA AASTAS.` (Text now; animation later per §3.)
- **Accessibility:** `role="img"` + `aria-label` summarizing "Näidisgraafik: kuu tipp 480 kW lõigatakse 380 kW-le, sääst 348 € kuus" — this chart is content, not decoration, so it is NOT `aria-hidden` (unlike the shipped photos).

**Can the FI Tehomaksu-esimerkki carry the same visual without inventing numbers? Yes — stripped.** FI's rate is still `[X,XX — TARKISTETAAN]` and its section explicitly promises the full example only after an anchor DSO is chosen. So the FI variant is the **same geometry with every numeral removed**: unlabeled kW axis, unlabeled time axis (`YKSI VUOROKAUSI · TUNTIKESKITEHOT`), dashed target line labeled only `TAVOITETASO`, shaved band labeled `LEIKATTU HUIPPU`, single amber `MALLINNETTU` chip, **no € annotation, no green chip, no source line**, caption: `Havainnekuva mekanismista — teidän lukunne lasketaan teidän omista tuntitiedoistanne.` It communicates hourly-average + monthly-reset + shaving without asserting one figure. When the anchor tariff (Helen/Caruna/Elenia decision) is documented, the FI chart upgrades to the numbered form with its own green chip and source line. **Hard rule: ET's 480/380/348/4 176 numbers never appear in the FI chart — they are Elektrilevi VKL5 figures and would be invented data in a Finnish context.**

---

## 5. The system-diagram reuse question

**Verdict: no. The ops diagram stays unique to the aurinko/päike pages.**

- **Front page:** clearly no. The front is at its 3-element cap, and the diagram needs its surrounding explanation (four questions, fail-safe paragraph, mode captions) to mean anything. Dropped into the front page it becomes an animated logo.
- **Battery pages:** tempting but wrong. The battery page's two planned elements already divide the work: the Stage-4 hero shows *what the machine is*, the §4 chart shows *what it does to the bill*. A battery-only ops variant (drop the PV column, keep AKKU–bus–M–VERKKO + OHJAIN with HUIPPU/YÖ/RESERVI modes) would mostly restate the chart's HUIPPU story, push the page past its cap, and create a second interactive to maintain in two languages. The page already links to the diagram in its own words ("Aurinkosähkö + varasto — yksi järjestelmä → Lue miten se ratkaistaan"). Scarcity is what makes the diagram the quality bar; duplication spends that.
- **One registered contingency:** if Stage 4 keeps slipping and the battery pages must ship media before the hero exists, a *static, non-interactive* battery-topology strip in `.sysdia` grammar (AKKU → M → VERKKO/LIITTYMÄPISTE + OHJAIN, no modes, no animation) is an acceptable interim hero-slot occupant — first-party, zero doctrine risk, deleted the day the hero lands. Prefer waiting.

---

## 6. Production sequence

**This week (no dependencies):**
1. ET peak-shave chart (§4) — all numbers already documented on the page. Hand-built SVG. The single highest-value new asset available today.
2. FI mechanism-only variant (§4) — same SVG, numerals stripped.
3. Magnific 2x retina upscales: `hero.webp` + all three `of-*.webp` (workflow exists; creation ids in `index.html` comments; backlog item already open).
4. Cold regrade of `hero.webp` toward the Sügav Salu dusk palette (same Magnific pass as the upscale — one round trip).
5. ET reserviturud `.statrow` for the three documented figures (markup reuse, no asset production).

**Gated on Stage-4 hero delivery:**
6. `hero-system.webp` conversion (1344w q82, 21:9) + `heroimgd` + preloads on both battery pages (per memory backlog).
7. The "Järjestelmä itse" decision: if the delivered image shows only one form factor, produce the cabinet-vs-container scale SVG; if it shows both, that section stays none-by-design.
8. Regeneration of `of-aurinko.webp` in the register the approved hero establishes.

**Gated on the FI anchor-tariff decision (Helen/Caruna/Elenia + documented rate):**
9. FI chart upgrade to numbered form with green chip + source line.

**Gated on real projects / commissioning:**
10. Real installation photography → replaces `hero.webp` and `of-varasto.webp` first (the two closest to the doctrine line), then the remaining offer cards; retires every MADIS illustrative note; photos flip from `aria-hidden` decoration to captioned, provenanced evidence.
11. REFERENSSIT before/after documented data visuals (green class) from measured data.
12. Monitoring-UI screen capture (first honest video, §3.3) and optional installation footage.
13. Tehomaksu monthly-reset SVG animation (§3.1) — technically buildable earlier, but sequence it after the static charts have survived a native pass.

**Never:** stock photography; people in imagery; generated imagery presented as a real installation; generated video of any installation; the reserve two-curve forecast chart; numeric Hz/duration thresholds baked into reserve diagrams; background video loops; any third-party embed.

---

## Appendix A7 · Future-Brand Tension Auditor

# 07 — Future-Brand Tension Audit

Auditor: future-brand tension subagent · Sources read in full: `/Users/martinrautio/Projects/sama-energia/website/src/fi.html` (940 lines), `/Users/martinrautio/Projects/sama-energia/website/src/et.html` (1019 lines). Line refs below are `FI n / ET n` against those source files. No repo files were modified.

**The tension in one sentence:** the site's hero already makes the future claim ("Yhteinen verkko. Itsenäinen energia.") and the site already contains the material that proves it — but the proof is scattered across inner pages, framed as compliance, and never assembled into the story the h1 promises.

---

## 1. Tension map — page by page

Classification scale: **DATED/BUREAUCRATIC** (compliance tone where it needn't be) · **TIMID** (honesty collapses into under-selling) · **BALANCED** · **OVERREACH** (futurism that would cheapen the auditor stance if pushed further).

### Etusivu / Avaleht (FI 38–232 / ET 38–220)

| Section (eyebrow/heading) | Lines | Verdict |
|---|---|---|
| Hero — "Yhteinen verkko. Itsenäinen energia." + lede | FI 47–53 / ET 44–50 | **BALANCED** — the strongest future claim on the site, grounded immediately by "vastaamme kirjallisesti". This h1 is the thesis sentence of the whole brand; see §2. |
| Frequency trace ("Verkon taajuus — miksi energiavarastoja tarvitaan") | FI 60–71 / ET 52–63 | **BALANCED**, quietly the most future-acting artifact above the fold: a living grid signal as the signature graphic, honestly labeled "havainnekuva". Do not decorate it further; it works because it is an instrument, not an ornament. |
| "Mitä toimitamme" offer trio | FI 75–97 / ET 67–89 | **BALANCED, catalog-flat.** Cards 01–02 read like any installer's brochure; card 03 ("Reservimarkkinayhteys") is the genuinely novel offer and gets the least explanation. Mild DATED lean. |
| "Mitä se tarkoittaa kohteessanne" benefit cards with tags | FI 98–130 / ET 90–122 | **BALANCED — but the tag grammar (LASKETTAVISSA / KOHDEKOHTAINEN / SKENAARIO) is dropped on the reader cold.** The provenance system's first public appearance has no legend. See undertold spot #2. |
| "Kaksi lähtötilannetta" | FI 137–158 / ET 127–148 | **BALANCED.** |
| "Kenelle — Aloitamme sieltä, missä energia on arvovalinta" + callout | FI 160–189 / ET 150–179 | **BALANCED.** The callout ("Teemme sen riippumatta siitä, ostatteko meiltä koskaan mitään", FI 185–186) is quiet confidence done right. |
| "Miksi meihin voi luottaa" — PERIAATE 01–03 + REFERENSSIT slot | FI 193–221 / ET 181–209 | **BALANCED with one buried gem.** "Jokainen luku kantaa lähteensä — ja se, mitä emme voi dokumentoida, ei päädy tarjoukseemme" (FI 197 / ET 185) is the provenance doctrine in one line, sitting as a sub-lede. The empty REFERENSSIT slot (FI 216–219) is *not* timid — an announced empty slot with a verification policy is the brand behaving like the future; keep it exactly this shape. |
| Closing dark CTA "Aloitetaan kulutustiedoistanne" | FI 223–231 / ET 211–219 | **BALANCED**; natural host for the data-engine method statement (see §2). |

**Page-level:** no OVERREACH anywhere on home. The gap is assembly, not restraint: the h1 promises a future the page never shows — the section that proves it lives at the bottom of the reserve page.

### Energiavarastot / Energiasalvestid (FI 235–390 / ET 223–443)

| Section | Lines | Verdict |
|---|---|---|
| Hero — battery-first h1 "mitoitettuna teidän omista kulutustiedoistanne" | FI 236–245 / ET 224–233 | **BALANCED** — the data-engine story in a headline. Good. |
| "Mitä saatte" + "~100 kW TARKISTETAAN" threshold | FI 251–273 / ET 240–262 | **BALANCED, with a caveat:** a public TARKISTETAAN tag is radical honesty *if the reader knows the grammar*; without a legend it reads like an editor's leftover. Same fix as undertold #2. |
| "Järjestelmä itse — kW on nopeus, kWh on määrä" | FI 278–294 / ET 267–283 | **BALANCED**, first-rate plain teaching. |
| "Näin etenemme" 01–04 chips | FI 300–327 / ET 289–316 | **BALANCED.** "Päätös tehdään kokouksessa, jossa myyjä ei ole läsnä" (FI 312) is one of the best sentences on the site. |
| **FI "Tehomaksu-esimerkki"** | FI 333–355 | **TIMID / unfinished-looking.** Mechanism prose plus a literal `[X,XX €/kW/kk — TARKISTETAAN]` placeholder (FI 345), while the ET mirror carries the site's single strongest proof artifact. See undertold #3. |
| **ET "Võimsustasu näidisarvutus"** | ET 321–408 | **BALANCED — the model section for the entire site.** DOKUMENTEERITUD vs MODELLEERITUD split columns, Konkurentsiamet decision number in the source stamp (ET 336), a worked table, an explicit "Mida see näide ei sisalda" negative-space list (ET 365–372), and an appendix rate table. A sales page behaving like a regulator's decision. The appendix table (ET 391–406) borders on BUREAUCRATIC but earns its keep as reference material. |
| RAHOITUS slot | FI 361–368 / ET 414–421 | **BUREAUCRATIC by necessity** — undocumented financier terms, correctly caveated ("voi olla mahdollinen"). Acceptable; upgrade only when terms enter the number register, as the source comments already mandate. |
| "Konsultointi ilman laitekauppaa" | FI 370–389 / ET 423–442 | **BALANCED.** |

### Aurinko + akku / Päike + aku (FI 393–523 / ET 446–575)

| Section | Lines | Verdict |
|---|---|---|
| Hero — "Aurinko tuottaa. Akku ajoittaa." | FI 394–400 / ET 447–453 | **BALANCED** — the best headline pair on the site: future-flavored, zero hype vocabulary. |
| "Kaksi tietä samaan järjestelmään" | FI 402–418 / ET 455–471 | **BALANCED.** |
| "Neljä kysymystä" grid + **interactive five-mode system diagram** | FI 421–507 / ET 473–559 | **BALANCED but mis-framed.** The only interactive artifact on the site — PÄIVÄ/HUIPPU/YÖ/RESERVI/KATKOS, a day in the life of an active connection point — is buried inside a retrofit-compliance section, so only "you already have solar" readers meet it. See undertold #4. The deflation line "Tässä ei ole mitään eksoottista" (FI 484 / ET 536) is correct auditor judo — keep it — but combined with the framing, the page presents its most future-native asset as an appendix. |
| "Ei vielä aurinkosähköä? — Kokonaisuus kannattaa suunnitella kerralla" | FI 509–522 / ET 561–574 | **BALANCED.** |

### Reservimarkkinat / Reserviturud (FI 526–673 / ET 578–737)

| Section | Lines | Verdict |
|---|---|---|
| Hero — "…ja mitä emme niistä lupaa" | FI 527–533 / ET 579–585 | **Mildly TIMID by design** — defining the page by negation is the right auditor move, but negation only earns trust when the page also shows what *is* claimed. ET does (see below); FI does less. |
| "Perusasia" 50,000 Hz physics | FI 535–549 / ET 587–601 | **BALANCED.** "Akku sopii tähän poikkeuksellisen hyvin" (FI 545) is a physics claim, not a marketing adjective — fine. |
| Reserve products table FCR-N/FCR-D/aFRR/mFRR | FI 551–587 / ET 603–639 | **BALANCED**, spec-table by nature; the closing "voimassa oleva ehto, ei muistinvarainen luku" line (FI 584) turns even the table into a provenance statement. |
| "Miten kohde pääsee markkinalle" steps | FI 589–615 / ET 641–667 | **BALANCED.** |
| "Miksi emme julkaise tuottolukuja" — the two-curve synthesis | FI 617–638 / ET 669–689 | **BALANCED — and the ET version is markedly stronger.** ET 681 carries the full structural argument (Elering's own balancing responsibility, 2026 consumer-bill line, "faas, mitte languse lugu", "lisaväärtus, mille te omandate — mitte eeldus, millest projekt sõltub"). FI 630 is the compressed cousin resting on one Fingrid figure. |
| **ET-only: "Miks reservivajadus kasvab" — three documented markers** | ET 691–702 | **BALANCED, exemplary** — three sourced Elering markers with DOKUMENTEERITUD stamps. **FI has no equivalent section**; the FI negation-hero therefore tilts timid. Direction: build the FI mirror from Fingrid-side documented markers. |
| "Kolme kysymystä mille tahansa toimittajalle" | FI 640–653 / ET 704–717 | **BALANCED** — arming the customer against everyone including yourself is future-brand behavior. |
| **"Kymmenentuhatta akkua…" distributed infrastructure** | FI 654–672 / ET 718–736 | **BALANCED at the OVERREACH boundary — and held inside it by its own closing line.** "Energiaomavaraisuutta ei rakenneta julistuksilla" (FI 666) is the license for the whole passage; any amplification must keep that closer verbatim. This is the site's peak future material and it is the last section of a second-tier page. See undertold #1. |

### Prosessi / Protsess (FI 676–707 / ET 740–771)

Seven steps with honest durations; the lede pre-empts the bureaucracy charge itself ("Se ei ole byrokratiaa — juuri siksi tiedämme etukäteen", FI 681). Step 01's field list (FI 688) is the driest text on any market page but is doing legitimate work. Callout FI 700–703 ("järjestys on meillä prosessin kiinteä osa, ei joustokohta") is strong. **BALANCED throughout — dated in the right way.** No change needed for the future story except that step 07 ("seuranta antamaamme analyysiin verrattuna", FI 697) is the year-one-verification promise and could carry one more sentence of weight.

### Meistä / Meist (FI 710–760 / ET 774–827)

Hero "Laite on muuttunut hyödykkeeksi. Osaaminen ei." — **BALANCED**, sharp. "Miksi tämä yritys on olemassa" — **BALANCED**. Founder section — **BALANCED**; the DSO/TSO names (FI 753 / ET 820) are institutional market-coverage facts, not partner name-drops — compliant. **Watch item (mild OVERREACH):** "Emme ole suomalainen yritys, jolla on vironkielinen sivu" (FI 753 / ET 820) claims ahead of corporate reality (Oy only, .fi domain) — already flagged in the ET source comment (ET 817–819); resolve per Madis's decision, don't let it ship unexamined. Structural note: **this is the only page with no window to the future at all** — it explains independence and documentation but never says what the company thinks the grid becomes. One sentence connecting the founder's thesis to the ten-thousand-batteries horizon would fix it; no new claims required.

### Yhteystiedot / Kontakt (FI 763–827 / ET 830–892)

**BALANCED.** The form itself quietly performs the method: it asks for liittymisteho, vuosikulutus, verkkoyhtiö, aurinko-kWp (FI 791–798) — a company that computes from data asks data questions. The CTA-verb honesty decision ("Pyydä", not "Varaa", FI 25–28) is doctrine working. No changes for the future story.

### Kiitos / Aitäh (FI 830–843 / ET 895–908)

**BALANCED** utility page, correctly invisible.

### Ajankohtaista / Uudised (FI 846–878 / ET 911–958)

**BALANCED — the most future-native page on the site.** Primary sources only, DOKUMENTOITU stamps, stat rows, and analysis that always lands on "why this matters to you." ET's Elering measurement-deadline item even models honest urgency: "See on aus kiirustamise põhjus — avalik ja dokumenteeritud tähtaeg, mitte müügivõte" (ET 928) — quotable doctrine. One buried gem: the existing-connection insight (FI 869 / ET 949) — see undertold #5.

### Tietosuoja / Andmekaitse (FI 881–902 / ET 961–982)

**BUREAUCRATIC by license — and secretly a brand page.** "Emme käytä evästeitä emmekä analytiikkaa" (FI 886) is a differentiating promise most competitors cannot make. Leave the body legal; the lede already does the brand work. No changes.

**Taxonomy note (cross-page):** the tag vocabulary drifts — home uses LASKETTAVISSA/KOHDEKOHTAINEN/SKENAARIO, tehomaksu uses DOKUMENTOITU/MALLINNETTU, thresholds use TARKISTETAAN, news uses DOKUMENTOITU (ET: ARVUTATAV/OBJEKTIPÕHINE/STSENAARIUM/DOKUMENTEERITUD/MODELLEERITUD/KONTROLLITAKSE). A published legend (undertold #2) would force consolidation into one graded scale, which the system needs anyway.

---

## 2. The thesis — what "company of the future" should mean here

**Verdict: fuse (e) and (a); make (d) the visible signature; keep (c) as the standing demonstration and (b) as the weather report.**

Candidate ranking, honestly assessed:

1. **(e) + (a) fused — "the future grid is made of customers, and it is computed, not declared."** The future electric company is not a supplier; it is ten thousand connection points acting in the grid — and the only honest way to build that is one computed, written, source-tagged case at a time. (e) alone is vision without method (and standing alone would drift toward OVERREACH); (a) alone is method without horizon (and reads as consultancy). Together they are precisely the hero h1 that is *already on the page*: "Yhteinen verkko. Itsenäinen energia." The site does not need a new thesis sentence — it needs to route its existing evidence to the sentence it already leads with. The proof passage (FI 654–672) even supplies the register: infrastructure, ownership, physics, and a closing line that forbids proclamation.
2. **(d) the provenance system as futurist honesty — the behavioral signature.** Fingrid and Elering publish sources; regulators stamp decisions; SAMA's website already behaves the same way (Konkurentsiamet decision numbers on a sales page, ET 336). A supplier whose marketing ships with a grading system for its own figures *behaves like the future* — but only if the system is visible as a system, not as scattered chips. This is the thing no agency-built competitor can copy cheaply, because copying it requires actually having the sources.
3. **(c) monthly-reset arithmetic — the demonstration piece, not the identity.** "The meter starts from zero every month; the battery earns twelve times a year" is compounding, legible money and the best on-ramp for a CFO. But it is a tariff mechanism, not a company thesis; it proves the method rather than defining the mission. Keep it as the flagship worked example (ET already does; FI must catch up).
4. **(b) the two-curve synthesis — the honesty frame, already well told (in ET).** Structural need grows, unit price compresses, and the honest company plans for both. Indispensable as the reason reserve income is a scenario, not a promise — but as an identity it would make the brand about a market phase. It is supporting steel, not the flag.

**The one-paragraph resolution of the founder's tension:** "electric company of the future" and "sober auditor" are not two pillars to balance — on this site, the second is the *evidence* for the first. A company that publishes graded figures, empty reference slots with a verification policy, deadlines only when documented, and a physics-first account of the grid is not describing the future; it is already operating the way the future's institutions operate. The site never needs the word "tulevaisuus." It needs the ten-thousand-batteries horizon visible from the front door, and the provenance discipline named as the way there.

---

## 3. Five undertold spots

### 1. The distributed-infrastructure vision is the site's crescendo — parked at the bottom of a second-tier page

- **Where:** Reservimarkkinat, eyebrow "Miksi tämä on tärkeämpää kuin yksi kohde" (FI 654–672 / ET 718–736).
- **What's there:** the complete vision — Baltic desynchronization, damaged Gulf of Finland cables, "kymmenentuhatta akkua kymmenentuhannen teollisuusliittymän takana", ownership by users, and the anti-declaration closer.
- **Why undertold:** it is the final section of an explainer page most visitors will never finish; home never gestures at it — even though home's h1 ("Yhteinen verkko. Itsenäinen energia.") is this passage's thesis sentence, currently two clicks from its proof.
- **Direction:** add a short home-page bridge (natural slot: between "Kenelle" and "Miksi meihin voi luottaa", or replacing the pre-CTA lull) carrying the two-sentence version — one connection point is a business decision; ten thousand of them are regional infrastructure — linking to the full passage. On the reserve page keep it last (it is a legitimate crescendo) but let the hero lede signal the page ends somewhere larger than mechanism. Non-negotiable: the closer "Energiaomavaraisuutta ei rakenneta julistuksilla…" travels with any excerpt — it is the license that keeps the passage on the auditor's side of the line.

### 2. The provenance system operates in public but is never introduced

- **Where:** first tag appears at FI 103 (LASKETTAVISSA) with no legend; the doctrine sentence exists at FI 197 / ET 185 ("Jokainen luku kantaa lähteensä…"); grades in circulation: LASKETTAVISSA, KOHDEKOHTAINEN, SKENAARIO, DOKUMENTOITU, MALLINNETTU, TARKISTETAAN (+ ET equivalents); source stamps at ET 336, 389, 696–698, FI 863, 871.
- **What's there:** a genuinely unusual discipline — including a *publicly visible unresolved item* (`~100 kW TARKISTETAAN`, FI 271 / ET 260, and FI 345's `[X,XX]`).
- **Why undertold:** the reader meets the grammar cold. Unexplained, TARKISTETAAN reads as an editorial leftover; explained, it is the single most credible thing on the site — a company that shows you its own open verification queue.
- **Direction:** one compact block inside home's "Miksi meihin voi luottaa" that names the grades and states the rule: every figure on this site carries one of these marks; what cannot be marked does not ship; TARKISTETAAN means we have flagged it before you could. Optionally a one-line legend at first tag use on each market page. This converts scattered chips into the behavioral signature claimed in §2, and will force the healthy side effect of consolidating the tag taxonomy across pages.

### 3. FI tehomaksu is a placeholder where ET has the site's best artifact

- **Where:** FI "Tehomaksu-esimerkki" (FI 333–355) vs ET "Võimsustasu näidisarvutus" (ET 321–408).
- **What's there:** FI has the mechanism prose, one buried gold sentence ("mittaus alkaa joka kuukausi nollasta — varasto ansaitsee 12 kertaa vuodessa", FI 344), and a bracketed rate placeholder. ET has the full engine: documented/modelled split, worked table, exclusion list, two extra levers, appendix rates, regulator decision number.
- **Why undertold:** the Finnish market — the .fi domain's primary audience — receives the weakest version of the strongest proof; and the monthly-reset idea, which is the *compounding-money* story (12 independent earning cycles a year, each one legible on the invoice), sits as bullet two of three.
- **Direction:** resolve the open anchor-DSO choice (source comment FI 332: Helen Sähköverkko / Caruna / Elenia), then mirror ET's structure exactly. Elevate the monthly-reset sentence to the section's organizing idea — first line or heading-adjacent, the arithmetic told as rhythm (reset → cut → earn, twelve times) — with the DOKUMENTOITU/MALLINNETTU split and negative-space list preserved verbatim in shape. No new claims needed; only the documented rate and the ET template.

### 4. The five-mode interactive diagram is the future operating — filed under retrofit compliance

- **Where:** Aurinko + akku, inside "Teillä on jo aurinkosähkö → Neljä kysymystä" (FI 433–478 / ET 485–530; mode captions in `data-cap`, FI 436–440).
- **What's there:** the site's only interactive artifact — a connection point living a full day: solar surplus stored, peak shaved under the cap, night charging, seconds-fast reserve response, island-mode backup. The captions already carry the doctrine (reserve "näytetään aina skenaariona, ei lupauksena").
- **Why undertold:** it renders the home lede's central claim — "liittymästänne aktiivisen osan sähköjärjestelmää" — visible and manipulable, but only readers on the retrofit path ever reach it, and the framing presents it as an illustration of takasyöttö prevention.
- **Direction:** re-lead the section: the diagram first, framed as "this is what your connection point does in 24 hours," with the four questions as the engineering underlay that makes it approvable — inverting current emphasis without cutting anything. Then surface the mode-model beyond this page: "Järjestelmä itse" on energiavarastot (FI 278–294) is a natural second host, or a static day-cycle reference on home. Keep the deflation line (FI 484) adjacent — "nothing exotic here" *next to* a machine doing five jobs is exactly the register the brand wants.

### 5. "The connection you already own" — the sharpest customer-side future argument lives in a news aside

- **Where:** Ajankohtaista, Fingrid item (FI 869, stat row 870 / ET 949–950): "uusia liittymiä voi paikoin joutua odottamaan pitkään. Akku olemassa olevan liittymän takana hyödyntää liittymää, joka teillä jo on."
- **What's there:** the insight that in the coming grid an existing liittymä is an appreciating scarce asset — 5 GW of data centers and 4 GW of storage queueing for connections (documented) — and a battery is the instrument that activates the asset the customer already holds.
- **Why undertold:** it is labeled a "hiljainen viesti" and is exactly that — two sentences under a news annotation, invisible to anyone not reading the news page, while the related home card ("Liittymän laajennus vältettävissä", FI 111–114) tells only the defensive half (avoid an upgrade), not the asset half (own something increasingly valuable).
- **Direction:** promote to a standing argument on energiavarastot (near "Mitä saatte", FI 251–273) with the shape: connection queue grows [DOKUMENTOITU, link to the Ajankohtaista item as source] → existing connections gain relative value → the battery converts that value into monthly, computed money. Guard-rail: never promise queue outcomes or scarcity trajectories — the Fingrid tiedote is the only load-bearing source, and the claim must stay "documented queue today," not "prices tomorrow."

*(Cross-cutting note: the data-engine story — "your own hourly data, not a brochure" — appears as a clause roughly ten times across both files but never once as its own argument. It does not need a sixth spot: whichever of fixes #1 or #2 lands on the home page should carry its method sentence — data in, computed analysis out, written number, verifiable against year one.)*

---

## 4. Anti-recommendations — what a normal agency would do here, and must be refused

1. **"Future" vocabulary and rendered battery farms.** Hero video, glow renders, and the "innovatiivinen / tulevaisuuden ratkaisu / edelläkävijä" register. One undocumentable adjective voids the site's entire evidentiary posture — the brand's futurism must stay in artifacts (frequency trace, mode diagram, provenance tags), never in adjectives.
2. **An instant-ROI calculator widget.** The standard conversion play — and a machine for generating exactly the undocumented, un-owned numbers the doctrine forbids. The site's answer to "what would I save?" is deliberately *a person computes it from your data and signs it in writing*; a widget that spits payback from three sliders is the anti-SAMA. (It would also drag in the third-party scripts the no-analytics doctrine bans.)
3. **Logo walls, testimonials, and "trusted by" strips.** Repo rules already forbid partner names and track-record claims; the empty REFERENSSIT slot with a verification policy (FI 216–219) *is* the reference section. Filling it with stock quotes or manufactured social proof would replace a differentiator with noise every competitor already has.
4. **Generalized urgency.** "Hinnat nousevat — toimi nyt" banners, countdowns, limited-slot claims. The site already models the only permissible urgency: a public, documented deadline framed explicitly as "aus kiirustamise põhjus… mitte müügivõte" (ET 928). If a date has no source stamp, it is not a reason to hurry.
5. **Sanding off the negations — and bolting on the standard tracking stack.** An agency would soften "mitä emme niistä lupaa," "joskus vastaus on ei," and "emme julkaise tuottolukuja" into positive-only messaging, and would install analytics, chat, and personalization by default. The negations are the trust engine, and "ei evästeitä, ei analytiikkaa" (FI 886) is a published promise; both are load-bearing brand, not copy to optimize.

---

## 5. One-line vibe check per page

| Page | Felt age |
|---|---|
| Etusivu / Avaleht | A serious engineering firm that briefly lets you watch the grid breathe — the frequency trace is the future; the rest is a very good present tense. |
| Energiavarastot (FI) | A competent consultancy photographed mid-renovation — the bracketed tariff placeholder shows the workshop, not the machine. |
| Energiasalvestid (ET) | The finished room: a sales page that behaves like a regulator's decision — the most future-acting artifact on the site. |
| Aurinko + akku / Päike + aku | An excellent electrical contractor with an interactive machine in the basement — reframe it and the page reads like the future already operating. |
| Reservimarkkinat / Reserviturud | Four-fifths patient physics teacher circa now; the last section is suddenly 2035 — the page ends where it should begin. |
| Prosessi / Protsess | A well-run project office — dated in exactly the right way; leave it. |
| Meistä / Meist | A founder's honest memo — entirely present tense; the only page with no window to the future at all. |
| Yhteystiedot / Kontakt | A form that already practices the method — it asks data questions because the company computes from data. |
| Kiitos / Aitäh | A utility page, correctly invisible. |
| Ajankohtaista / Uudised | An analyst's terminal: primary sources, stamps, stat rows — the most future-native page and it doesn't try to be. |
| Tietosuoja / Andmekaitse | Bureaucratic by license — and its first line ("no cookies, no analytics") is secretly a brand page. |
