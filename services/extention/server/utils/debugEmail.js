import fs from "fs";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function renderEmailTemplate(templateName, context) {
    const templatePath = path.join(__dirname, "..", "templates", `${templateName}.ejs`);
    const templateContent = fs.readFileSync(templatePath, "utf-8");
    return ejs.render(templateContent, context);
}

async function debugEmail(templateName, context) {
    const renderedEmail = await renderEmailTemplate(templateName, context);
    const outputPath = path.join(__dirname, `test_${templateName}.html`);
    fs.writeFileSync(outputPath, renderedEmail, "utf-8");
    console.log(`Debug email written to ${outputPath}`);
}

await debugEmail("email_template", {
    user: "Abanoub",
    product_title: "Real-Time Analysis App",
    product_link: "https://example.com"
})