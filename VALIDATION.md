# Validation — draft 0.2.1

Validated locally on 2026-11-08. No GitHub upload, repository changes or remote deployment. Culture Collection was not changed.

## Automated checks

`node verify.cjs`: 343 passing checks against the engine embedded in the delivered HTML.

Original coverage is retained: all unit-pair round-trips, positive/zero rules, number parsing, impossible dilution targets, equality, assay correction, inverse calculations, numerical overflow/underflow, syntax and offline assets.

New checks cover:
- Ambiguous separators, error messages and field association; explicit decimals and scientific notation.
- Mass concentration <-> molarity, mixed units and inverse round-trips.
- Percent w/v <-> mass concentration: 1% = 10 g/L = 10 mg/mL.
- Percent mass assay, pure-solute/reagent/solvent masses, bounds and impossible w/w targets.
- Both serial volume modes: concentrations, transfer continuity, retained volume, one-tube case, total volume conservation, factors near one, 1–100 tubes and invalid/overflow inputs.
- No automatic network calls or persistent browser-storage APIs in the embedded scripts.
- An isolated relocated copy builds using only source files and vendor/. Its HTML hash matches the tested build.

## Browser checks

All seven calculators were used through their examples at 390, 1024 and 1440 px. No horizontal document overflow, overflowing controls or console errors were observed. Serial tables scroll inside their container on narrow screens.

Additional cases:
- 5% w/v in 250 mL at 80% assay: 15.625 g reagent for 12.5 g pure solute.
- 5% w/w in 100 g at 80% assay: 6.25 g reagent and 93.75 g solvent. A target of 81% w/w at 80% assay is rejected.
- 1.000 and 2,500 show a field warning; Calculate rejects them without adding history. Entering 1000 resolves the ambiguity.
- 1 mg/mL at 58.44 g/mol: 17.1116 mM. 100 mM: 5.844 mg/mL. 1% w/v: 10 mg/mL, converting back to 1% w/v.
- Five ten-fold steps from 100 mM: 10, 1, 0.1, 0.01, 0.001 mM. Retained mode leaves 1 mL in every tube. Mixed mode mixes 1 mL per tube and leaves 0.9 mL after onward transfer in earlier tubes; 1 mL remains in the last.
- Factor 1 is rejected and creates no history record.
- History lists valid records. Copy all includes the entire serial table and other calculations. Empty history disables Copy all. Reload resets the count to zero.
- The DOI link matches the independently verified HRCAK record.
- Copy result, Copy all and Save text were exercised. No physical print job was submitted; printing uses the same full-record formatter, including serial tables.

## Verification limits

The controlled browser permits HTTP(S) only and blocks file:// navigation. Direct-file opening is not claimed as tested. No alternate browser surface or indirect file execution was used to bypass that restriction. UI tests used a local HTTP preview. The HTML embeds its engine, styles and fonts and makes no automatic network requests; direct opening in the user's normal browser remains a manual check.

No wet-laboratory validation or chemical-product database verification is claimed. Results use user-supplied properties and the displayed assumptions. Six significant digits are display precision, not experimental precision.

## Draft 0.2.1 targeted regression

343 checks pass. New cases accept 0.500, 0,250, 0.001 and signed -0.125 at the parsing layer, retain physical-domain rejection of negative amounts, keep 1.000/2,500 flagged, and verify the default serial engine is mixed mode. In browser, the same decimal cases were checked; the selected default is Same transfer volume in every tube (standard), with equal 0.1 mL transfers and 0.9 mL diluent in the worked example. Both serial formulas remain covered by the existing conservation and concentration tests.

Targeted serial-form layout checks at viewport overrides 390, 1024 and 1440 showed no page-wide horizontal overflow. The default and Reset select mixed mode; retained mode still leaves the requested volume in every tube. No browser warning or error logs were captured.

## Version 0.2.2 release patch

Presentation-only release: updated version and publication wording. Calculation engine, interface logic and formulas are unchanged from 0.2.1. Rebuilt the offline HTML and reran all 343 checks, including isolated reproducible builds.
