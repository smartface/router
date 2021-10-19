const TypeDoc = require("typedoc");

const OUTPUT_DIR = 'docs';
const BASE_PATH = 'src';

async function main() {
  const app = new TypeDoc.Application();
  app.options.addReader(new TypeDoc.TSConfigReader());
  app.bootstrap({
    entryPoints: BASE_PATH,
    sort: ["source-order", "visibility"],
    excludePrivate: true,
    excludeProtected: true,
    excludeNotDocumented: false,
    excludeInternal: true,
    pretty: true,
    categorizeByGroup: true,
    emit: true
  });
  const project = app.convert();
  // Project may not have converted correctly
  if (project) {
    // Rendered docs
    await app.generateDocs(project, OUTPUT_DIR);
  }
}

main().catch(console.error);