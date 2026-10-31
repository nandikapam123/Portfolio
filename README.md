# Nandika Pampana — Laboratory & Field Notebook

A dependency-free static portfolio for GitHub Pages: `index.html` (contents), `style.css` (paper-notebook theme), `charts.js` (chart and statistics helpers), and one entry per project in `articles/`.

## Publish
1. Push this folder to the `main` branch of a GitHub repository (include `.github`).
2. Settings → Pages → Source: **GitHub Actions**. The workflow deploys on every push.

## Editorial rules (please keep them)
- Every chart is computed in the page by `charts.js` from a model, a seeded random generator, or an algorithm counting its own operations. "Simulated" means exactly that.
- Robotics pages (`rouse`, `cad25`, `cad26`) contain a parameter table or acceptance targets. Values marked *assumed* are placeholders: replace them with measurements from your robot, and update the pages when you have test data.
- Literature claims are summarized from the cited papers; check each against the original before publishing a formal claim.
- Replace the synthetic trace in `articles/iot-badminton.html` with a logged sensor CSV once you have real data, and then say so in the caption.
