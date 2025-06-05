import htmlValidator from "html-validator";
import fs from "fs";

function log(message, isError) {
  const logLabel = "11ty-plugin-html-validator: ";

  if (isError) {
    console.error(logLabel + message);
  } else {
    console.log(logLabel + message);
  }
}

function createValidator(config) {
  return async function validateHTMLFiles(buildOutput) {
    const htmlFilePaths = buildOutput.results
      .map((r) => r.outputPath)
      .filter((path) => path.match(/.html$/));

    let everythingPassed = true;

    htmlFilePaths.forEach(async (filePath, i) => {
      if (fs.existsSync(filePath)) {
        try {
          const options = {
            format: "text",
            data: fs.readFileSync(filePath, "utf8"),
            ...config,
          };

          const result = await htmlValidator(options);
          const pass = result.includes(
            "The document validates according to the specified schema(s)."
          );

          if (!pass) {
            everythingPassed = false;
            log(filePath + " ❌", true);
            log(result);
          }
        } catch (error) {
          log(error, true);
        }
      }
      if (htmlFilePaths.length - 1 === i && everythingPassed) {
        log("All your HTML passed validation! 🎉");
      }
    });
  };
}

export default function (eleventyConfig, config) {
  eleventyConfig.on("eleventy.after", createValidator(config));
};
