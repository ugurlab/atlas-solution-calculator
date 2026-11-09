# ATLaS — Solution Calculator

Version **0.2.1** (preview), designed by Ugur Comlekcioglu. Developed with ChatGPT; draft 0.2 incorporates review notes from Claude (Anthropic). Download the offline app from [the tool page](https://ugurlab.github.io/atlas-solution-calculator/) or [Release v0.2.1](https://github.com/ugurlab/atlas-solution-calculator/releases/tag/v0.2.1).

## Run

Open `app/atlas-solution-calculator.html` in a current browser. The single HTML file includes the calculation engine, interface, styles and Instrument Sans font. It requires no Python, installation, server, account or internet connection. User entries and session history are kept in memory only and clear on reload or close.

## Build and test

With Node.js available, run from this directory:

```text
node build.cjs
node verify.cjs
```

No package installation is needed. All build inputs, fonts and licence texts are in this directory. `vendor/` contains three Instrument Sans font files and the font/application licence texts; no sibling projects are referenced. Tests rebuild a copy in an unrelated temporary directory and compare its generated HTML with the tested build.

For HTTP browser QA only, `node serve.cjs` starts a local preview on port 8791. This server is a development aid; the app itself is a standalone HTML file.

## Calculators

- Percent solution preparation: % w/v and % w/w with mass-assay correction; % v/v assumes a pure liquid.
- Percent/molarity conversions, including solution density for % w/w.
- Molar preparation and its inverse, with mass-assay correction.
- Single dilution, with separate concentration bases and a mass-based % w/w mode.
- Preparation from concentrated reagent mass assay, density and molar mass.
- Mass concentration ↔ molarity using molar mass, with selectable units.
- % w/v ↔ mass concentration.
- Serial dilution defaults to Same transfer volume in every tube (standard). The optional Same final volume left in every tube mode is retained. Both produce a tube-by-tube plan and concentrations.
- Unit conversions for mass, volume, molar concentration and mass concentration.

Every successful Calculate/Load example adds an immutable text record to Session history. Copy all includes inputs, results, formulas, assumptions and serial dilution tables. Failed calculations do not enter history. Reset clears the current form, not the session history. Reload clears all session data.

Ambiguous values with a nonzero integer part, such as `1.000` and `2,500`, are blocked. Use `1.0` or `1000`, and `2.50` or `2500`. Leading-zero decimals such as `0.500`, `0,250` and `0.001` are accepted. Signed decimals parse without a separator warning; positive/nonnegative quantity validation still applies.

See `VALIDATION.md` for tests and their limits. Shared site rules are maintained in [Desk & Bench DESIGN.md](https://github.com/ugurlab/desk-and-bench/blob/main/DESIGN.md).

## Citation

Comlekcioglu, U. and Comlekcioglu, N. (2021). ATLaS: Assistant Software for Life Scientists to Use in Calculations of Buffer Solutions. *Tehnički glasnik*, 15(4), 541–545. https://doi.org/10.31803/tg-20210326070107

Verified against https://hrcak.srce.hr/en/265006. This draft is the separate solution calculator; the buffer application is planned separately.

## Licence and credits

MIT License, copyright Ugur Comlekcioglu (`LICENSE`). Instrument Sans is distributed under the SIL Open Font License (`vendor/FONT-LICENSE.txt`). The application folder contains both licence texts. Development: ChatGPT (OpenAI). Review notes: Claude (Anthropic). Preserve the original authorship and third-party licence notices when sharing.
