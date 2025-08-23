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
├── output/
│   ├── poster_audit.log           (Generated log file)
│   └── woodstock_poster.pdf       (Generated PDF file)
├── src/
│   └── posterGenerator.jsx        (The main InDesign script)
└── README.md                      (This file)
```

- **`output/`**: The default location for all generated files (PDFs and logs).
- **`src/`**: Contains the core InDesign script.

## Installation and Usage

1.  **Clone or download this repository.**
2.  **Install Dependencies**: Make sure you have the required fonts and Adobe InDesign installed (see below).
3.  **Run the script in InDesign**:
    *   Open Adobe InDesign.
    *   Open the Scripts panel (`Window` > `Utilities` > `Scripts`).
    *   Right-click on the `User` folder and choose `Reveal in Finder` (macOS) or `Reveal in Explorer` (Windows).
    *   Place the `src/posterGenerator.jsx` file (or a shortcut/alias to it) in this folder.
    *   Return to InDesign, and the script will appear in the Scripts panel. Double-click it to run.
    *   The script will then prompt you to select the grain texture and hero artwork files from your computer.

## Dependencies

### Software
- Adobe InDesign (tested with CC)
- Fonts:
  - `HelveticaNeue-CondensedBold`
  - `HelveticaNeue-Bold`

### Assets
The script will prompt you to select the following files when it runs:
- A **grain texture** file (e.g., PNG, JPG, TIFF).
- A **hero artwork** file (e.g., AI, PDF, EPS).

## Configuration

All major settings can be adjusted in the `getConfig()` function at the top of the `src/posterGenerator.jsx` script. This includes page dimensions, colors, fonts, and all text content.
