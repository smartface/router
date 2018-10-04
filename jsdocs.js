const jsdoc2md = require("jsdoc-to-markdown");
const fs = require("fs");
const path = require("path");

/* input and output paths */
const inputFile = "./src/*.js";
const outputDir = "../docs";

/* get template data */
const templateData = jsdoc2md.getTemplateDataSync({ files: inputFile });

/* reduce templateData to an array of class names */
const classNames = templateData.reduce((classNames, identifier) => {
  if (identifier.kind === "module") {
    classNames.push(identifier.name);
  }

  return classNames;
}, []);

var output = "";

/* create a documentation file for each class */
classNames.forEach(className => {
  const template = `{{#module name="${className}"}}{{>docs}}{{/module}}`;

  output =
    jsdoc2md.renderSync({ data: templateData, template: template }) + "\n";
  fs.writeFileSync(path.resolve(outputDir, `${className}.md`), output);
});

// const output = jsdoc2md.renderSync({ data: templateData, template: "{{>modules}}" });
// fs.writeFileSync(path.resolve(outputDir, `Api.md`), output);
