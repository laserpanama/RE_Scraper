/**
 * posterGenerator.jsx
 *
 * An Adobe InDesign script to automatically generate a rock concert poster.
 * This script is designed to be modular and configurable.
 */

//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// § 1. Configuration
//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

function getConfig() {
    // File & Path Settings
    var basePath = File($.fileName).parent.parent;
    var outputFolder = Folder(basePath + "/output");
    if (!outputFolder.exists) outputFolder.create();

    // Document Settings
    var mmToPt = 72 / 25.4;

    return {
        // System
        os: getOS(),

        // Paths
        basePath: basePath,
        outputFile: File(outputFolder + "/woodstock_poster.pdf"),
        logFile: File(outputFolder + "/poster_audit.log"),
        grainFile: File(basePath + "/assets/grain.png"),
        heroArtworkFile: File(basePath + "/assets/dock_guitar_silhouette.ai"),

        // Document
        pageWidth: 297 * mmToPt,
        pageHeight: 420 * mmToPt,
        bleedPt: 3 * mmToPt,
        contentMarginX: (297 * mmToPt) * 0.05,
        contentMarginY: (420 * mmToPt) * 0.05,
        gridPercents: [22, 3, 45, 4, 12, 2, 12],

        // Colors (Hex)
        colors: {
            bg: "0B2545",
            offWhite: "F2EDE3",
            ropeTan: "C2A878",
            tarBlack: "111111",
            harborRust: "8B3A3A"
        },

        // Fonts
        fonts: {
            headline: "HelveticaNeue-CondensedBold",
            body: "HelveticaNeue-Bold"
        },

        // Content
        badgeText: ["30", "AGO", "SÁBADO"],
        eventName: "WOODSTOCK CLASSIC ROCK",
        showtime: "SHOWTIME 6:30",
        venue: "- TITO - TOMAS - CHAGO -"
    };
}

//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// § 2. Main Execution
//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

function main() {
    var config = getConfig();
    var log = setupLogger(config.logFile);
    log("Script started on " + config.os);

    try {
        var doc = createDocument(config);
        var swatches = defineSwatches(doc, config.colors);

        drawBackground(doc, config, swatches);
        drawGrid(doc, config);
        drawEventName(doc, config, swatches);
        drawHero(doc, config);
        drawBadge(doc, config, swatches);
        drawPerformerStrip(doc, config, swatches);
        drawVenueFooter(doc, config, swatches);

        exportPdf(doc, config.outputFile);
        computeHash(config.outputFile, config.os, log);

        log("Script completed successfully.");
        alert("Poster generated and PDF hashed. See audit log in output folder.");
    } catch (e) {
        log("FATAL ERROR: " + e.toString());
        alert("Script failed: " + e);
    } finally {
        if (log.close) log.close();
        if (doc) doc.close(SaveOptions.no);
    }
}

//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// § 3. Helper Functions
//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// System Helpers
function getOS() {
    if (/^win/i.test($.os)) return "WINDOWS";
    if (/^mac/i.test($.os)) return "MACINTOSH";
    return "UNKNOWN";
}

function setupLogger(logFile) {
    if (!logFile.open("w")) {
        alert("Cannot open audit log at: " + logFile.fsName);
        return { log: function(m){}, close: function(){} };
    }
    var logger = {
        file: logFile,
        log: function(msg) { this.file.writeln((new Date()).toISOString() + "  " + msg); },
        close: function() { this.file.close(); }
    };
    return logger;
}

// Document Setup
function createDocument(c) {
    log("Creating new document.");
    return app.documents.add({
        documentPreferences: {
            pageWidth: c.pageWidth,
            pageHeight: c.pageHeight,
            facingPages: false,
            documentBleedTop: c.bleedPt,
            documentBleedBottom: c.bleedPt,
            documentBleedInside: c.bleedPt,
            documentBleedOutside: c.bleedPt
        }
    });
}

function defineSwatches(doc, colors) {
    log("Defining CMYK swatches.");
    function addCMYK(name, hex) {
        var rgb = [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
        var cmyk = app.convertSampleColor(ColorModel.process, { space: ColorSpace.RGB, colorValue: rgb }, ColorModel.process, ColorSpace.CMYK).colorValue;
        return doc.colors.add({ name: name, model: ColorModel.process, colorValue: cmyk });
    }
    return {
        bg: addCMYK("Weathered Navy", colors.bg),
        offWhite: addCMYK("Off-White", colors.offWhite),
        ropeTan: addCMYK("Rope Tan", colors.ropeTan),
        tarBlack: addCMYK("Tar Black", colors.tarBlack),
        rust: addCMYK("Harbor Rust", colors.harborRust)
    };
}

// Drawing Functions
function drawBackground(doc, c, sw) {
    log("Drawing background rectangle + applying grain.");
    var page = doc.pages[0];
    var bgLayer = doc.layers.add({ name: "Background" });

    page.rectangles.add(bgLayer, {
        geometricBounds: [-c.bleedPt, -c.bleedPt, c.pageHeight + c.bleedPt, c.pageWidth + c.bleedPt],
        fillColor: sw.bg,
        strokeWeight: 0
    });

    var grainFileObj = c.grainFile;
    if (!grainFileObj.exists) throw "Missing grain texture: " + grainFileObj.fsName;

    var grainRect = page.rectangles.add(bgLayer, {
        geometricBounds: [-c.bleedPt, -c.bleedPt, c.pageHeight + c.bleedPt, c.pageWidth + c.bleedPt],
        strokeWeight: 0
    });
    grainRect.place(grainFileObj);
    grainRect.transparencySettings.blendingSettings.blendMode = BlendMode.MULTIPLY;
    grainRect.transparencySettings.blendingSettings.opacity = 15;
}

function drawGrid(doc, c) {
    log("Building locked grid guides.");
    var page = doc.pages[0];
    var gridLayer = doc.layers.add({ name: "Grid" });
    var yTop = c.contentMarginY;

    for (var i = 0; i < c.gridPercents.length; i++) {
        var h = (c.pageHeight - 2 * c.contentMarginY) * (c.gridPercents[i] / 100);
        var zone = page.rectangles.add(gridLayer, {
            geometricBounds: [yTop, c.contentMarginX, yTop + h, c.pageWidth - c.contentMarginX],
            strokeWeight: 0.5,
            fillColor: doc.swatches.item("None")
        });
        zone.transparencySettings.blendingSettings.opacity = 20;
        yTop += h;
    }
    gridLayer.locked = true;
}

function drawEventName(doc, c, sw) {
    log("Adding Event Name Block.");
    var page = doc.pages[0];
    var bounds = [
        c.contentMarginY,
        c.contentMarginX,
        c.contentMarginY + (c.pageHeight - 2 * c.contentMarginY) * 0.22,
        c.pageWidth - c.contentMarginX
    ];

    var evFrame = page.textFrames.add({ geometricBounds: bounds, contents: c.eventName });
    evFrame.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;

    var evTxt = evFrame.texts[0];
    evTxt.appliedFont = c.fonts.headline;
    evTxt.pointSize = (bounds[2] - bounds[0]) * 0.6;
    evTxt.fillColor = sw.offWhite;
}

function drawHero(doc, c) {
    log("Importing hero artwork.");
    var page = doc.pages[0];
    var heroY = c.contentMarginY + (c.pageHeight - 2 * c.contentMarginY) * (0.22 + 0.03);
    var heroH = (c.pageHeight - 2 * c.contentMarginY) * 0.45;
    var heroFrame = page.rectangles.add({
        geometricBounds: [heroY, c.contentMarginX, heroY + heroH, c.pageWidth - c.contentMarginX],
        strokeWeight: 0
    });

    var heroFile = c.heroArtworkFile;
    if (!heroFile.exists) throw "Missing hero artwork: " + heroFile.fsName;
    heroFrame.place(heroFile);
}

function drawBadge(doc, c, sw) {
    log("Drawing date badge.");
    var page = doc.pages[0];
    var heroY = c.contentMarginY + (c.pageHeight - 2 * c.contentMarginY) * (0.22 + 0.03);
    var heroH = (c.pageHeight - 2 * c.contentMarginY) * 0.45;
    var badgeH = heroH * 0.2, badgeW = badgeH * 1.2;

    var badgeFrame = page.graphicFrames.add({
        geometricBounds: [
            heroY + 12,
            c.pageWidth - c.contentMarginX - badgeW - 12,
            heroY + badgeH + 12,
            c.pageWidth - c.contentMarginX - 12
        ],
        fillColor: sw.ropeTan,
        strokeWeight: 0,
        cornerRadius: badgeH * 0.12
    });

    var badgeTF = badgeFrame.texts.add({ contents: c.badgeText.join("\r") });
    badgeTF.parentStory.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
    badgeTF.appliedFont = c.fonts.body;
    badgeTF.pointSize = badgeH * 0.5;
    badgeTF.fillColor = sw.tarBlack;
    badgeTF.justification = Justification.CENTER_ALIGN;
}

function drawPerformerStrip(doc, c, sw) {
    log("Creating performer strip.");
    var page = doc.pages[0];
    var heroY = c.contentMarginY + (c.pageHeight - 2 * c.contentMarginY) * (0.22 + 0.03);
    var heroH = (c.pageHeight - 2 * c.contentMarginY) * 0.45;
    var stripY = heroY + heroH + (c.pageHeight - 2 * c.contentMarginY) * 0.04;
    var stripH = (c.pageHeight - 2 * c.contentMarginY) * 0.12;

    page.rectangles.add({
        geometricBounds: [stripY, c.contentMarginX, stripY + stripH, c.pageWidth - c.contentMarginX],
        fillColor: sw.rust,
        strokeWeight: 0
    });

    var stripTF = page.textFrames.add({
        geometricBounds: [stripY, c.contentMarginX, stripY + stripH, c.pageWidth - c.contentMarginX],
        contents: c.showtime
    });
    stripTF.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;

    var st = stripTF.texts[0];
    st.appliedFont = c.fonts.body;
    st.pointSize = stripH * 0.4;
    st.fillColor = sw.offWhite;
}

function drawVenueFooter(doc, c, sw) {
    log("Adding venue footer.");
    var page = doc.pages[0];
    var heroY = c.contentMarginY + (c.pageHeight - 2 * c.contentMarginY) * (0.22 + 0.03);
    var heroH = (c.pageHeight - 2 * c.contentMarginY) * 0.45;
    var stripY = heroY + heroH + (c.pageHeight - 2 * c.contentMarginY) * 0.04;
    var stripH = (c.pageHeight - 2 * c.contentMarginY) * 0.12;
    var footerY = stripY + stripH + (c.pageHeight - 2 * c.contentMarginY) * 0.02;
    var footerH = (c.pageHeight - 2 * c.contentMarginY) * 0.12;

    page.rectangles.add({
        geometricBounds: [footerY, c.contentMarginX, footerY + footerH, c.pageWidth - c.contentMarginX],
        fillColor: sw.ropeTan,
        strokeWeight: 0
    });

    var footTF = page.textFrames.add({
        geometricBounds: [footerY, c.contentMarginX, footerY + footerH, c.pageWidth - c.contentMarginX],
        contents: c.venue
    });
    footTF.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;

    var ft = footTF.texts[0];
    ft.appliedFont = c.fonts.body;
    ft.pointSize = footerH * 0.25;
    ft.fillColor = sw.bg;
    ft.justification = Justification.CENTER_ALIGN;
}

// Finalization Helpers
function exportPdf(doc, outputFile) {
    log("Exporting PDF/X-1a to " + outputFile.fsName);
    doc.exportFile(
        ExportFormat.pdfType,
        outputFile,
        false,
        app.pdfExportPresets.itemByName("PDF/X-1a:2001")
    );
}

function computeHash(outputFile, os, log) {
    log("Computing SHA-256 hash for " + os);
    var hashCmd = "echo Unsupported OS for hashing.";
    var hashOutput = "";
    var hash = "N/A";

    if (os === "WINDOWS") {
        hashCmd = 'certutil -hashfile "' + outputFile.fsName.replace(/\\/g, '\\\\') + '" SHA256';
        hashOutput = system.callSystem(hashCmd);
        var lines = hashOutput.split(/[\r\n]/);
        if (lines.length > 1) hash = lines[1].replace(/\s/g, '');
        else hash = "Error parsing certutil output.";
    } else if (os === "MACINTOSH") {
        hashCmd = 'shasum -a 256 "' + outputFile.fsName + '"';
        hashOutput = system.callSystem(hashCmd);
        hash = hashOutput.split(" ")[0];
    }

    log("Hash command: " + hashCmd);
    log("Raw hash output:\n" + hashOutput);
    log("Parsed hash: " + hash);
}


//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// § 4. Execution Trigger
//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// The logger needs to be accessible in the global scope for the main function
var log;
(function() {
    // This self-executing function ensures that the script runs when launched from InDesign.
    // It also contains a reference to the global 'log' variable so it can be used inside main().
    main();
})();
