ATLaS — Solution Calculator
Local development draft 0.2.1
Copyright (c) 2026 Ugur Comlekcioglu. MIT License.

Open atlas-solution-calculator.html in Chrome, Edge or Firefox.
No Python, installation, server, internet connection or account is required.
The font and calculation code are included in the HTML file.

Included calculators
- Percent solution preparation: % w/v and % w/w with mass-assay correction; % v/v for a pure liquid.
- Percent and molarity conversion: % w/v, and % w/w with solution density.
- Molar solution preparation and molarity from a weighed mass, with mass-assay correction.
- Dilution: molar, mass concentration, % w/v, % v/v and mass-based % w/w.
- Concentrated reagents: stock mass assay, density and molar mass to target molarity.
- Unit conversion: mass, volume, molar concentration and mass concentration.
- Mass concentration <-> molarity with molar mass; % w/v <-> mass concentration.
- Serial dilution with a tube-by-tube plan and retained/mixed volume definitions.

Choose a calculator and enter the values and units, then Calculate.
Load example fills and calculates a worked example for that calculator.
Use a decimal point or comma without thousands separators; scientific notation is accepted.
Ambiguous entries such as 1.000 and 2,500 are blocked. Use 1.0 or 1000, and 2.50 or 2500.
Leading-zero decimals such as 0.500, 0,250 and 0.001 are accepted. Negative physical amounts
are still rejected; signed decimals do not produce a thousands-separator warning.
Changing an input clears the old result so that it cannot be copied as a current calculation.
Copy result copies the inputs, result, formula and assumptions. Save text downloads this record.
Print prepares the same full record for your browser's print dialog.

History lists completed calculations and Copy all includes every full record and serial table.
Entries and history are kept only in memory during this session. Reloading or closing the app clears them.
There is no data upload, analytics, cloud connection or automatic network request.
Reference links in About & sources require internet only if you choose to open them.

Use the molar mass of the exact chemical form being weighed, including hydrates.
Mass assay means chemical content by mass, not chromatographic area purity.
For volume-based preparation, enter the final solution volume, not the solvent volume.
For % w/w preparation and dilution, enter final solution mass instead of volume.
Use current stock-label or certificate values for concentrated reagents and your laboratory
procedure and reagent SDS for handling and preparation.

This is the solution-calculation part of ATLaS. Buffer recipes, pH, titration, normality and
chemical-database lookup are not included in this draft. Enter reagent properties manually.

The application and accompanying documentation are in English.
Credits: designed by Ugur Comlekcioglu; developed with ChatGPT (OpenAI), with draft 0.2 review notes from Claude (Anthropic).
Original ATLaS publication details supplied in the notebook are preserved in About & sources.
The application uses the MIT License (LICENSE.txt); Instrument Sans uses the SIL Open Font
License (FONT-LICENSE.txt).

This draft has not been uploaded to GitHub or published online.

Serial dilution defaults to Same transfer volume in every tube (standard). Choose
Same final volume left in every tube for equal remaining volumes using varying transfers. The table shows transfer,
diluent, mixed and retained volumes, and every concentration. Mix before each onward transfer.
The final tube has no onward transfer. Volumes are treated as additive.

Citation: Comlekcioglu, U. and Comlekcioglu, N. (2021). Tehnicki glasnik 15(4), 541-545.
https://doi.org/10.31803/tg-20210326070107
