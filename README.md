# InDesign Concert Poster Generator

This project contains an Adobe InDesign script (`.jsx`) that automates the creation of a vintage-style rock concert poster. The script is configurable and builds a poster from scratch, including colors, layout, text, and graphics, and then exports it as a print-ready PDF.

## Features

- **Automated Poster Generation**: Creates a complete A3 poster with bleed.
- **Configurable**: Easily change colors, fonts, text, and asset files from a central configuration object.
- **Cross-Platform**: Automatically computes a SHA-256 hash of the output PDF on both Windows and macOS.
- **Modular Code**: The script is organized into logical, easy-to-read functions.
- **Audit Logging**: Creates a detailed log file for each run.

## Project Structure

The project is organized into the following directories:

```
.
├── assets/
│   ├── dock_guitar_silhouette.ai  (Placeholder for hero artwork)
│   └── grain.png                  (Texture file for background)
├── output/
│   ├── poster_audit.log           (Generated log file)
│   └── woodstock_poster.pdf       (Generated PDF file)
├── src/
│   └── posterGenerator.jsx        (The main InDesign script)
└── README.md                      (This file)
```

- **`assets/`**: Contains all the external graphic assets required by the script.
- **`output/`**: The default location for all generated files (PDFs and logs).
- **`src/`**: Contains the core InDesign script.

## Installation and Usage

1.  **Clone or download this repository.**
2.  **Install Dependencies**: Make sure you have the required fonts and Adobe InDesign installed (see below).
3.  **Place Assets**:
    *   Place your grain texture in `assets/grain.png`.
    *   Place your hero illustration in `assets/dock_guitar_silhouette.ai`.
4.  **Run the script in InDesign**:
    *   Open Adobe InDesign.
    *   Open the Scripts panel (`Window` > `Utilities` > `Scripts`).
    *   Right-click on the `User` folder and choose `Reveal in Finder` (macOS) or `Reveal in Explorer` (Windows).
    *   Place the `src/posterGenerator.jsx` file (or a shortcut/alias to it) in this folder.
    *   Return to InDesign, and the script will appear in the Scripts panel. Double-click it to run.

## Dependencies

### Software
- Adobe InDesign (tested with CC)
- Fonts:
  - `HelveticaNeue-CondensedBold`
  - `HelveticaNeue-Bold`

### Assets
The script requires two asset files to be present in the `assets/` directory:
- `grain.png`: A texture file used for the background. A sample can be created or found from a stock texture site.
- `dock_guitar_silhouette.ai`: An Adobe Illustrator file for the central artwork. This is a placeholder and should be replaced with your own artwork.

## Configuration

All major settings can be adjusted in the `getConfig()` function at the top of the `src/posterGenerator.jsx` script. This includes page dimensions, colors, fonts, and all text content.
