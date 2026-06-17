# Product Requirements Document (PRD)
## Nurse Shift Management App — Indonesia

| | |
|---|---|
| **Product name** | Nurses Management App (working title: *JadwalPerawat*) |
| **Document version** | 1.0 (Draft) |
| **Date** | 2026-06-16 |
| **Owner** | Product / Engineering |
| **Market** | Indonesia (Bahasa Indonesia first, English secondary) |
| **Status** | Draft for review |

> ⚠️ **Legal disclaimer.** This document summarizes Indonesian labor, health, and nursing
> regulations to inform product design. It is **not legal advice**. Concrete compliance logic
> (especially overtime pay, maternity wage tiers, and SIP workplace caps) must be confirmed with
> Indonesian labor counsel and against the primary regulation texts and their latest implementing
> rules before release. Regulations change — the app is designed so rules are **configurable data,
> not hard-coded constants** (see §7, Flexible Rule Engine).

---

## 1. Overview

### 1.1 Problem
Indonesian hospitals, clinics, and *puskesmas* run **24/7** and staff their wards with a
**3-shift system** (pagi / siang / malam). Today most units build the monthly roster manually in
spreadsheets or on paper. This is slow, error-prone, and produces rosters that are:

- **Non-compliant** — they accidentally violate labor-hour caps, minimum rest, women's night-work
  protections, or required skill mix.
- **Unfair** — the same nurses repeatedly get night shifts, weekends, or holidays, which is the
  single biggest source of staff resentment (*kecemburuan sosial*).
- **Fatiguing** — patterns like *malam-lalu-pagi* (a morning shift right after a night shift) are
  common and dangerous for both nurses and patients.
- **Hard to change** — a single swap (*tukar shift*) or sudden sick leave forces a manual rebuild.

### 1.2 Solution
A shift-management app, built **Indonesia-first**, that lets a head nurse (*kepala ruangan*)
generate, edit, and publish compliant and fair monthly rosters in minutes. It encodes Indonesian
labor and nursing rules as a **flexible, configurable rule engine** so each facility — and the
nation's evolving regulations — can be accommodated without code changes.

### 1.3 Goals
1. Cut roster-building time from days to under an hour per ward per month.
2. Guarantee every published roster is checked against statutory and facility rules.
3. Distribute nights, weekends, and holidays fairly and transparently.
4. Reduce fatigue-inducing patterns to near zero.
5. Give nurses self-service: view roster, request leave, propose shift swaps.

### 1.4 Non-goals (v1)
- Payroll processing (we expose data/exports for payroll, but do not run payroll).
- Patient-care/EMR features.
- Full HRIS (recruitment, performance reviews).
- Biometric attendance hardware (we may integrate later via API).

---

## 2. Target Users & Personas

| Persona | Role | Key needs |
|---|---|---|
| **Kepala Ruangan** (Head Nurse / ward manager) | Builds & owns the roster | Fast generation, compliance safety net, fairness, easy edits, approve swaps & leave |
| **Perawat Pelaksana** (Staff nurse) | Works the shifts | See my schedule, request *libur*/cuti, swap shifts, get reminders |
| **Bidang Keperawatan / Manajer Keperawatan** (Nursing dept manager) | Oversees many wards | Cross-ward staffing view, WISN/workload reports, compliance dashboard |
| **HRD / Kepegawaian** | Compliance & payroll feed | Overtime & leave exports, audit log, employment-class handling (PNS vs kontrak) |
| **Admin / IT** | Configures the facility | Set up wards, shift definitions, rule profiles, holiday calendar |

**Workforce note:** Indonesian nursing is **majority female**, so women's legal protections
(§5) are first-class scheduling constraints, not edge cases. Staff also split into two employment
classes with different leave entitlements: **ASN/PNS** (civil servants, governed by PP 11/2017)
and **private/contract** (governed by UU Ketenagakerjaan / UU 6/2023 & PP 35/2021). The app must
model both.

---

## 3. Regulatory Foundation (Research Summary)

This section is the factual basis for the rule engine. Each rule below maps to a configurable
parameter in §7. **Numbers are defaults; every facility can override within legal bounds.**

### 3.1 Working hours — UU 6/2023 (omnibus, supersedes UU 13/2003 hours articles) & PP 35/2021

> Citation note: many sources still cite "UU Cipta Kerja No. 11/2020." That base law was revoked;
> the operative parent law is now **UU No. 6/2023** (via Perppu No. 2/2022). The numbers are
> unchanged. Use **PP 35/2021** as the operational source.

| Rule | Default value | Source |
|---|---|---|
| Scheme A (6-day week) | 7 hours/day, 40 hours/week | UU 6/2023 Pasal 77(2)a; PP 35/2021 Pasal 21 |
| Scheme B (5-day week) | 8 hours/day, 40 hours/week | UU 6/2023 Pasal 77(2)b; PP 35/2021 Pasal 21 |
| Weekly cap | 40 hours/week | Pasal 77 |
| Rest after continuous work | ≥ 30 min after 4 hours | UU 6/2023 Pasal 79(2)a |
| Weekly rest | 1 day (6-day week) / 2 days (5-day week) | UU 6/2023 Pasal 79(2)b |
| Annual leave (*cuti tahunan*) | ≥ 12 working days after 12 months service | UU 6/2023 Pasal 79(3); PP 35/2021 Pasal 22 |

### 3.2 Overtime (*lembur*) — PP 35/2021

| Rule | Default value | Source |
|---|---|---|
| Max overtime | **4 hours/day, 18 hours/week** | PP 35/2021 Pasal 26(1) |
| Consent + pay | Mandatory worker consent; overtime always paid | PP 35/2021 Pasal 26(2) |
| Meal during overtime | Food & drink ≥ 1,400 cal if overtime ≥ 4h (not cash) | PP 35/2021 Pasal 29 |
| Hourly wage basis | 1/173 × monthly wage | PP 35/2021 Pasal 31 |
| Normal-day multipliers | 1st hour ×1.5; subsequent hours ×2 | PP 35/2021 Pasal 31 |
| Rest-day/holiday multipliers (6-day) | hours 1–7 ×2; 8th ×3; 9th–11th ×4 | PP 35/2021 Pasal 31 |
| Rest-day/holiday multipliers (5-day) | hours 1–8 ×2; 9th ×3; 10th–12th ×4 | PP 35/2021 Pasal 31 |

**No statutory night-shift premium** exists — extra pay arises only from overtime (hours over the
cap) or from company policy/CBA. The app should treat a night-differential as an *optional,
configurable* facility policy.

### 3.3 Continuous-operation exception — Kepmenakertrans 233/2003 (critical for hospitals)
**Health services (*jasa kesehatan*) are explicitly listed as a continuous-operation sector.**
Hospitals may therefore legally run 24/7 rotating shifts including nights, weekends, and holidays.
The exception relaxes *schedule arrangement* only — it does **not** waive overtime pay, rest
entitlements, the 30-min/4-hour rule, weekly rest, the overtime caps, the 12-day annual leave, or
women's night-work protections.

### 3.4 Night work & women's protections — UU 13/2003 (Arts. 76, 81, 82, 83; unchanged by UU 6/2023) + UU 4/2024 (KIA)

| Protection | Default rule | Source |
|---|---|---|
| Night window | 23:00–07:00 | UU 13/2003 Pasal 76 |
| Under-18 women | **Hard block** 23:00–07:00 | Pasal 76(1) |
| Pregnant (medically flagged) | **Block** 23:00–07:00 when doctor certifies risk | Pasal 76(2) |
| Women on night shift | Employer must provide nutritious meal (≥1,400 cal) + maintain decency/security | Pasal 76(3); Kepmenaker 224/2003 |
| Transport (*antar-jemput*) | Provide pickup/drop-off for women whose shift starts/ends **23:00–05:00** | Pasal 76(4); Kepmenaker 224/2003 |
| Menstrual leave (*cuti haid*) | Not obligated to work **day 1 & 2** if in pain, on notice | Pasal 81 |
| Maternity (*cuti melahirkan*) | **3 months** baseline (1.5 before + 1.5 after) | Pasal 82(1) |
| Maternity extended (KIA) | Up to **6 months** in medically-certified special conditions; wages: months 1–4 full, months 5–6 at 75% | UU 4/2024 Pasal 4–5 |
| Miscarriage (*cuti keguguran*) | 1.5 months | Pasal 82(2) |
| Lactation | Reasonable opportunity to breastfeed/express during work hours | Pasal 83 |

> KIA (UU 4/2024) is a framework law; some implementing PPs were still pending. Treat the
> 6-month extension and its wage tiers as **conditional + configurable**, and verify before
> hard-coding wage logic.

### 3.5 Nursing profession — UU 38/2014, UU 17/2023 (Omnibus Health) + PP 28/2024

| Item | Detail | Scheduling implication |
|---|---|---|
| **STR** (registration) | Now **lifetime** under UU 17/2023 (was 5-yr); issued via KTKI/SATUSEHAT | Store number; **no expiry gate** |
| **SIP/SIPP** (practice license) | Per-workplace; renew every **5 years**; renewal needs valid STR + workplace + SKP sufficiency | **Hard gate:** nurse must hold active SIP for the facility being scheduled |
| Workplace cap | Historically **max 2 workplaces** (Permenkes 26/2019) | Relevant for cross-site moonlighting; ⚠️ verify against PP 28/2024 before hard-coding |
| **SKP** (continuing-ed credits) | ~**25 SKP / 5 years**; administered by PPNI | Track balance; alert before SIP renewal |
| **Career ladder PK I–V** (Permenkes 40/2017) | Clinical competency levels: PK I (novice, supervised) → PK V (expert/consultant) | **Competency gate** for shift assignment |

**Skill-mix per shift** (e.g., "every shift needs ≥1 PK III+") is **not statutory** — it is set by
hospital accreditation (**KARS/SNARS**) and the facility's nursing committee. Therefore it must be
a **configurable facility policy**, not a fixed constant.

### 3.6 Staffing / workload calculation methods (Indonesian practice)
Used to compute *how many* nurses a ward needs (drives the demand side of scheduling). **There is
no single fixed nurse:patient ratio mandated nationally for general wards** — Indonesia uses
**workload-based calculation methods**, so the app must implement a calculator, not a hard ratio
constant.

- **Depkes 2005 method** (most used in wards) — care-hours per patient/day by ward type
  (internal medicine 3.5h, surgery 4.0h, pediatrics 4.5h, obstetrics 2.5h, critical 10h), divided
  by ~7 effective hours/shift, then add a **loss-day** factor and a **25% non-nursing job** factor.
- **Gillies formula** — annual nursing-hours staffing:
  `TP = (A × B × 365) / ((365 − C) × work-hours/day)`, where A = care hours/patient/24h (~4–5h),
  B = avg census (BOR × beds), C = off-days/year; commonly +~20% buffer.
- **Douglas method** (per-shift, by patient dependency — directly drives shift staffing). Nurses
  per shift = Σ (patients in care class × coefficient):

  | Care level | Pagi | Sore/Siang | Malam |
  |---|---|---|---|
  | Minimal | 0.17 | 0.14 | 0.10 |
  | Partial | 0.27 | 0.15 | 0.07 |
  | Total | 0.36 | 0.30 | 0.20 |

  > ⚠️ The often-quoted **"pagi 47% / siang 36% / malam 17%"** split is an approximate planning
  > *heuristic*, **not** the Douglas coefficients. Use the 9-cell table above for per-shift math.
- **WISN** (Workload Indicator of Staffing Need) — **Kemenkes-endorsed via Permenkes 33/2015**;
  uses available working time/year (~1,988 h), workload standards, and allowance (*kelonggaran*)
  factors. Considered more accurate than bed-ratio methods.

**Ward ratios (where they exist):**
- **ICU** — *Kepmenkes 1778/2010*: level-dependent. ICU **primer 1:3**; **sekunder/tersier up to
  1:1** for ventilated/fully-dependent patients (commonly 1:1–1:2). ⚠️ Verify against primary text
  before hard-coding (secondary sources only).
- **General wards** — no fixed national ratio; use a calculation method above.
- **Hospital classification** — *Permenkes 3/2020* (classes A–D); ICU beds must be **≥8% of total
  beds**. A "nurse:bed 2:3" figure circulates from older Depkes guidance but is unverified in
  Permenkes 3/2020 — treat as configurable, not statutory.

> **Configurable constants flag:** effective working days/year varies across sources
> (Depkes 280 vs 286; Gillies examples ~237). Expose as a facility parameter, don't hard-code.

**Accreditation (KARS):** SNARS Edisi 1 (2018) — likely **superseded by STARKES 2022** today;
confirm the target hospital's current standard. The **KKS** (staff qualification & competency)
chapter requires the hospital to collect, verify, and evaluate nurse credentials (education, STR,
SIPP/SIKP, clinical privileges) — this drives competency-based assignment in the app.

### 3.7 Shift patterns & fatigue best practice (Indonesian hospitals)
| Item | Default | Notes |
|---|---|---|
| Default shifts | **Pagi 07:00–14:00 (7h)**, **Siang 14:00–21:00 (7h)**, **Malam 21:00–07:00 (10h)** | Configurable; 8h-block variants (07–15–23) common |
| In-shift breaks | pagi ~11:00–12:00, siang ~18:00–19:00, malam ~03:00–04:00 | |
| Canonical rotation | **P-P-S-S-M-M-L-L** (2-2-2-2, 8-day cycle), **forward** (P→S→M) | Forward rotation eases circadian adaptation |
| Min rest between shifts | **11 hours** (intl standard; Indonesian sources cite 8–12h) | Hard constraint default |
| **No** *malam-lalu-pagi* | Block morning shift the day after a night shift | Most-cited fatigue rule |
| Max consecutive nights | Default **2** | Configurable |
| Days off/month | ward nurses ~4–5 *libur*/month | |

### 3.8 Leave/absence types to model
**Private/contract:** cuti tahunan (≥12d), cuti sakit, cuti melahirkan (3–6mo), cuti haid (1–2d),
cuti besar (~after 6yr), cuti penting/khusus, cuti bersama (optional, deducts annual).
**PNS/ASN (PP 11/2017):** cuti tahunan (12d), cuti besar (after 5yr → 3mo), cuti sakit, cuti
melahirkan, cuti alasan penting, cuti bersama, cuti di luar tanggungan negara (unpaid).
**Operational (non-statutory):** izin (short permission), libur (rostered off), **tukar shift**
(swap), lembur / on-call.
**Holidays:** national holidays + *cuti bersama* set annually by SKB 3 Menteri; hospitals operate
on holidays → flag for holiday-rate pay and fair distribution.

---

## 4. The Flexible Rule Engine (core differentiator)

> The user's headline requirement: **"deep research the rule and very flexible rule."** The
> regulatory facts in §3 are real, but they change (UU 11/2020 → UU 6/2023; STR 5-yr → lifetime;
> KIA maternity 3 → 6 months). So the app must **never hard-code** them. Instead it stores rules as
> editable data.

### 4.1 Rule model
Every scheduling rule is a record:

```
Rule {
  id, name, description,
  scope: GLOBAL | FACILITY | WARD | EMPLOYMENT_CLASS | ROLE | INDIVIDUAL,
  type: HARD | SOFT,           // HARD = cannot be violated; SOFT = optimization preference
  weight: number,             // for SOFT rules, used by the optimizer
  category: WORKING_HOURS | REST | OVERTIME | NIGHT_WORK | GENDER_PROTECTION
          | COMPETENCY | STAFFING | LEAVE | FAIRNESS | FATIGUE,
  params: { ... },            // e.g. { maxHoursPerWeek: 40 }
  legalReference: string,     // e.g. "PP 35/2021 Pasal 26"
  effectiveFrom, effectiveTo, // time-boxed so legal changes can be scheduled in advance
  enabled: boolean,
  overridable: boolean,       // may a lower scope override this?
}
```

### 4.2 Scope precedence (most flexible part)
`INDIVIDUAL > ROLE > EMPLOYMENT_CLASS > WARD > FACILITY > GLOBAL`
A national HARD rule (e.g., 40h/week cap) is GLOBAL and **non-overridable downward below the legal
floor**, but a facility may set a *stricter* value. SOFT rules can be re-weighted at any scope.

### 4.3 Rule profiles (presets)
Ship curated, versioned **rule profiles** so a new facility starts compliant in one click:
- **"Indonesia – RS Umum (default)"** — all §3 statutory defaults.
- **"Indonesia – Puskesmas"**, **"Indonesia – Klinik"**.
- **"ASN/PNS"** vs **"Karyawan Kontrak"** leave overlays.
Profiles are data, shippable as updates when laws change (e.g., a "KIA 2024" profile patch).

### 4.4 Worked examples (HARD vs SOFT)
- **HARD:** `maxHoursPerWeek = 40`; `minRestBetweenShifts = 11h`; `block night→morning`;
  `under18.nightShift = forbidden`; `nurse.must_have_active_SIP_for_facility`.
- **SOFT (weighted):** balance night shifts per nurse/month; honor *permintaan libur*; minimize
  weekend/holiday inequality; prefer forward rotation; respect personal preferences.

This HARD-constraint / weighted-SOFT-constraint split mirrors the academic approach (Constraint
Satisfaction + Goal Programming) used in Indonesian nurse-rostering research and gives both legal
safety and humane, fair schedules.

---

## 5. Functional Requirements

### 5.1 Facility & ward setup (Admin)
- FR-1 Create facility, set employment classes, work-week scheme (6-day/5-day), default shift
  definitions, holiday calendar (import yearly SKB 3 Menteri).
- FR-2 Define wards/units with type (ICU, IGD, rawat inap, etc.), required staffing per shift
  (manual or via Douglas/Gillies/WISN calculators), and required skill mix (PK levels).
- FR-3 Select and customize a **rule profile**; edit individual rules (§4).

### 5.2 Nurse profiles
- FR-4 Store: name, employment class (PNS/kontrak), role, **PK level (I–V)**, STR number,
  **SIP per workplace + expiry**, SKP balance, gender, date of birth (for under-18 check),
  pregnancy/lactation status flags (privacy-controlled), competencies, contract hours.
- FR-5 Track leave balances per type and per employment class.
- FR-6 Compliance alerts: SIP expiry, SKP shortfall before renewal.

### 5.3 Roster generation
- FR-7 **Auto-generate** a monthly roster satisfying all HARD rules and optimizing SOFT rules.
- FR-8 Show **why** a cell is what it is, and surface any unavoidable conflicts.
- FR-9 Manual edit with **live validation**: any HARD violation is blocked/flagged with the legal
  reference; SOFT degradations show as a fairness/fatigue score delta.
- FR-10 What-if: simulate a sick call or swap and see the ripple before committing.
- FR-11 Publish & notify; lock published rosters with an audit trail of changes.

### 5.4 Self-service (Staff nurse)
- FR-12 View personal & ward schedule (calendar + list), in Bahasa Indonesia.
- FR-13 Request leave/izin by type; route to *kepala ruangan* for approval; auto-check balance &
  rules.
- FR-14 Propose **tukar shift** with a colleague; system validates both nurses still pass HARD
  rules; head-nurse approves.
- FR-15 Shift reminders & change notifications (push/WhatsApp/email — channel configurable).

### 5.5 Compliance & fairness
- FR-16 **Pre-publish compliance check**: full roster validated; report lists every issue with
  legal reference and severity.
- FR-17 Women's night-work compliance flags: transport (*antar-jemput*) required, meal provision,
  under-18/pregnancy blocks.
- FR-18 **Fairness dashboard**: per-nurse counts of nights, weekends, holidays, total hours, with
  inequality indicators; period and YTD.
- FR-19 Fatigue checks: consecutive nights, *malam-lalu-pagi*, rest-gap violations.

### 5.6 Reporting & exports
- FR-20 Overtime (*lembur*) report with PP 35/2021 multiplier breakdown (for payroll).
- FR-21 Holiday/rest-day duty report (holiday-rate flags).
- FR-22 WISN/workload & staffing-gap reports for nursing management.
- FR-23 Export CSV/Excel/PDF; API for payroll/HRIS.
- FR-24 Immutable audit log (who changed what, when, and the rule context).

---

## 6. Non-Functional Requirements
- **Localization:** Bahasa Indonesia default; English optional. Local date/time, WIB/WITA/WIT
  time zones, Indonesian holiday calendar.
- **Accessibility & devices:** mobile-first for nurses (low-end Android common), web for managers;
  works on intermittent connectivity (offline view of published roster).
- **Performance:** generate a 30-day roster for a 30-nurse ward in < 30s.
- **Security & privacy:** role-based access; health/pregnancy data restricted; comply with
  **UU PDP No. 27/2022** (Indonesian personal-data protection). Audit logging.
- **Reliability:** rosters are operational-critical; target 99.9% uptime, daily backups.
- **Configurability:** all rules, shift definitions, and profiles editable without redeploy.
- **Auditability:** every published roster reproducible with the rule-set version used.

---

## 7. Data Model (high level)
`Facility, Ward, ShiftDefinition, Nurse, EmploymentClass, Credential(STR/SIP/SKP/PKLevel),
Rule, RuleProfile, RosterPeriod, Assignment, LeaveRequest, SwapRequest, Holiday, AuditLog,
ComplianceReport, FairnessMetric.`

Key relationships: a `RosterPeriod` holds `Assignment`s (nurse × date × shift); generation reads
the effective `Rule` set (resolved by scope precedence) + ward staffing demand; `LeaveRequest` and
`SwapRequest` mutate assignments subject to validation.

---

## 8. Success Metrics
- Roster build time ↓ (target: < 1 hour/ward/month).
- 100% of published rosters pass the HARD-rule compliance check.
- Reduction in fatigue-pattern occurrences (*malam-lalu-pagi*, >2 consecutive nights) to ~0.
- Night/weekend/holiday distribution inequality (e.g., Gini or max-min spread) reduced
  period-over-period.
- Staff satisfaction with schedule fairness (survey) ↑.
- Reduction in last-minute uncovered shifts.

---

## 9. Phased Roadmap

**Phase 1 — MVP (compliant manual rostering)**
Facility/ward/nurse setup, shift definitions, manual roster with live HARD-rule validation,
Indonesia default rule profile, staff schedule view, basic leave requests, holiday calendar.

**Phase 2 — Automation & fairness**
Auto-generation (HARD + weighted SOFT), fairness dashboard, fatigue checks, tukar-shift workflow,
overtime/holiday reports, notifications.

**Phase 3 — Intelligence & scale**
WISN/Gillies/Douglas staffing calculators, demand forecasting, multi-ward/multi-site management,
payroll/HRIS API, SATUSEHAT/credential integrations, advanced analytics.

---

## 10. Open Questions / To Verify Before Build
1. Exact **SIP workplace cap** under PP 28/2024 (still 2?) — verify against primary text.
2. **KIA** maternity 6-month wage tiers & implementing PP — confirm before wage logic.
3. Whether target facilities are **PNS-heavy, private, or mixed** (affects leave model priority).
4. Notification channel preference (WhatsApp is dominant in Indonesia — confirm provider).
5. Default staffing method preference per facility (Douglas vs Gillies vs WISN).
6. Accreditation target (KARS/SNARS edition) to align skill-mix policy templates.

---

## Appendix A — Primary Sources
- UU No. 13/2003 Ketenagakerjaan — https://peraturan.bpk.go.id/Details/43013
- UU No. 6/2023 (Cipta Kerja) — https://peraturan.bpk.go.id/Details/246523/uu-no-6-tahun-2023
- PP No. 35/2021 (waktu kerja, lembur, istirahat, cuti) — JDIH Kemnaker
- Kepmenakertrans No. 233/MEN/2003 (continuous-operation sectors incl. health)
- Kepmenakertrans No. 224/MEN/2003 (women's night-work protections)
- UU No. 38/2014 Keperawatan — https://peraturan.info/uu/2014/38/isi
- UU No. 17/2023 Kesehatan (Omnibus) + PP No. 28/2024 — https://peraturan.bpk.go.id/details/294077/pp-no-28-tahun-2024
- Permenkes No. 40/2017 (jenjang karir perawat klinis PK I–V)
- Permenkes No. 26/2019 (pelaksanaan UU Keperawatan)
- UU No. 4/2024 (Kesejahteraan Ibu dan Anak / KIA)
- PP No. 11/2017 (manajemen PNS — cuti ASN)
- UU No. 27/2022 (Pelindungan Data Pribadi)
- Permenkes No. 3/2020 (klasifikasi & perizinan rumah sakit) — https://peraturan.bpk.go.id/Details/152506/permenkes-no-3-tahun-2020
- Kepmenkes No. 1778/MENKES/SK/XII/2010 (pedoman ICU — rasio perawat ICU)
- Permenkes No. 33/2015 (perencanaan SDM kesehatan — menetapkan metode WISN)
- SNARS Edisi 1 / STARKES (KARS) — standar akreditasi, bab KKS (kredensial perawat)
- Depkes 2005, Gillies, WISN (WHO/Kemenkes), Douglas — metode beban kerja / kebutuhan tenaga perawat

*This appendix lists the regulations the rule engine encodes; full secondary-source URLs are
retained in the research log.*
