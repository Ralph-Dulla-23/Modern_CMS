const fs = require('fs');
const path = require('path');

const requestFile = path.join(__dirname, 'src/pages/Student/request.jsx');
let requestCode = fs.readFileSync(requestFile, 'utf8');

// 1. Move the definitions outside.
const inputFieldDefRegex = /  const InputField = \(\{ label, type = "text", name, placeholder \}\) => \([\s\S]*?  \);\n/;
const textAreaDefRegex = /  const TextAreaField = \(\{ label, name, placeholder \}\) => \([\s\S]*?  \);\n/;
const selectionCardDefRegex = /  const SelectionCard = \(\{ value, label, category \}\) => \{[\s\S]*?    \);\n  \};\n/;

let inputFieldCode = requestCode.match(inputFieldDefRegex)[0];
let textAreaCode = requestCode.match(textAreaDefRegex)[0];
let selectionCardCode = requestCode.match(selectionCardDefRegex)[0];

requestCode = requestCode.replace(inputFieldDefRegex, '');
requestCode = requestCode.replace(textAreaDefRegex, '');
requestCode = requestCode.replace(selectionCardDefRegex, '');

// Update definitions to take props
inputFieldCode = inputFieldCode.replace('({ label, type = "text", name, placeholder })', '({ label, type = "text", name, placeholder, formData, handleChange })').replace(/^  /gm, '');
textAreaCode = textAreaCode.replace('({ label, name, placeholder })', '({ label, name, placeholder, formData, handleChange })').replace(/^  /gm, '');
selectionCardCode = selectionCardCode.replace('({ value, label, category })', '({ value, label, category, formData, handleCheckboxChange })').replace(/^  /gm, '');

// Prepend right before export default function Request()
const exportIndex = requestCode.indexOf('export default function Request() {');
requestCode = requestCode.slice(0, exportIndex) + inputFieldCode + '\n' + textAreaCode + '\n' + selectionCardCode + '\n' + requestCode.slice(exportIndex);


// 2. Add props to invocations
requestCode = requestCode.replace(/<InputField /g, '<InputField formData={formData} handleChange={handleChange} ');
requestCode = requestCode.replace(/<TextAreaField /g, '<TextAreaField formData={formData} handleChange={handleChange} ');
requestCode = requestCode.replace(/<SelectionCard /g, '<SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} ');

fs.writeFileSync(requestFile, requestCode, 'utf8');
console.log('Fixed Request.jsx');


const formsFile = path.join(__dirname, 'src/pages/faculty/forms.jsx');
let formsCode = fs.readFileSync(formsFile, 'utf8');

const formsSelectionCardRegex = /  const SelectionCard = \(\{ value, label \}\) => \{[\s\S]*?    \);\n  \};\n/;
const formsSelectionCardMatch = formsCode.match(formsSelectionCardRegex);

if (formsSelectionCardMatch) {
    let formSelCode = formsSelectionCardMatch[0];
    formsCode = formsCode.replace(formsSelectionCardRegex, '');

    formSelCode = formSelCode.replace('({ value, label })', '({ value, label, formData, handleCheckboxChange })').replace(/^  /gm, '');

    const formExportIndex = formsCode.indexOf('export default function Forms() {');
    formsCode = formsCode.slice(0, formExportIndex) + formSelCode + '\n' + formsCode.slice(formExportIndex);

    formsCode = formsCode.replace(/<SelectionCard /g, '<SelectionCard formData={formData} handleCheckboxChange={handleCheckboxChange} ');
    fs.writeFileSync(formsFile, formsCode, 'utf8');
    console.log('Fixed forms.jsx');
}
