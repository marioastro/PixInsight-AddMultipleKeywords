// Redesigned PixInsight Script with integrated folder selection, presets, and metadata GUI
#feature-id Utilities > Add Multiple Keywords
#feature-info Adds custom FITS keywords with GUI, log, presets, validation, and preview
#feature-icon AddMultipleKeywords.png
// Version: 1.2.0

#include <pjsr/Sizer.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdButton.jsh>

function isValidDateObs(value) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value);
}

function setOrUpdateKeywords(win, keywordList) {
    let keywords = win.keywords;
    for (let i = 0; i < keywordList.length; ++i) {
        let entry = keywordList[i];
        let found = false;
        for (let j = 0; j < keywords.length; ++j) {
            if (keywords[j].name === entry.name) {
                keywords[j].value = entry.value;
                keywords[j].comment = entry.comment;
                found = true;
                break;
            }
        }
        if (!found) keywords.push(new FITSKeyword(entry.name, entry.value, entry.comment));
    }
    win.keywords = keywords;
}

function getFiles(folderPath, extensions) {
    let search = new FileFind();
    let files = [];
    for (let i = 0; i < extensions.length; ++i) {
        if (search.begin(folderPath + "/*." + extensions[i])) {
            do {
                files.push({ name: search.name, path: folderPath + "/" + search.name });
            } while (search.next());
        }
    }
    return files;
}

function loadPreview(filePath) {
    let opened = ImageWindow.open(filePath);
    if (!opened || opened.length === 0) return [];
    let win = opened[0];
    let keywords = win.keywords;
    win.close();
    return keywords;
}

function savePreset(filePath, keywords) {
    let lines = keywords.map(k => k.name + "|" + k.value + "|" + k.comment);
    File.writeTextFile(filePath, lines.join("\n"));
}

function loadPreset(filePath) {
    let lines = File.readLines(filePath);
    return lines.map(line => {
        let parts = line.split("|");
        return { name: parts[0], value: parts[1], comment: parts[2] || "" };
    });
}

function showMainDialog() {
    let dlg = new Dialog();
    dlg.windowTitle = "Add FITS Keywords to Images";
    dlg.setMinSize(800, 600);

    // Description label
    let descriptionLabel = new Label(dlg);
    descriptionLabel.text = "This script allows you to batch-apply custom FITS keywords to all .xisf or .fits files in a selected folder.\n" +
                            "You can preview existing metadata, add or update standard or custom keywords, and write them back to the files.";
    descriptionLabel.wordWrap = true;

    let folderPath = "";
    let keywordList = [];
    let fileList = [];

    // Folder selection
    let folderEdit = new Edit(dlg);
    folderEdit.readOnly = true;
    folderEdit.toolTip = "Select folder containing .xisf or .fits files.";
    let browseBtn = new PushButton(dlg);
    browseBtn.text = "Browse...";
    let previewText = new TextBox(dlg);
    previewText.readOnly = true;
    previewText.wordWrap = true;
    previewText.minHeight = 140;

    browseBtn.onClick = function () {
        let dirDlg = new GetDirectoryDialog;
        dirDlg.caption = "Select folder with image files";
        if (dirDlg.execute()) {
            folderPath = dirDlg.directory;
            folderEdit.text = folderPath;
            fileList = getFiles(folderPath, ["xisf", "fits"]);
            previewText.text = "";
            if (fileList.length > 0) {
                let preview = loadPreview(fileList[0].path);
                for (let i = 0; i < preview.length; ++i) {
                    let k = preview[i];
                    previewText.text += k.name + " = " + k.value + "  // " + k.comment + "\n";
                }
            } else {
                previewText.text = "No .xisf or .fits files found.";
            }
        }
    };

    // Keyword entry
    let standardKeywords = ["FILTER", "OBJECT", "OBSERVER", "TELESCOP", "INSTRUME", "DATE-OBS", "EXPTIME", "FOCALLEN", "SITELONG", "SITELAT"];
    let fieldSizer = new VerticalSizer();
    fieldSizer.spacing = 6;

    function createKeywordRow(name, value, comment) {
        let nameCombo = new ComboBox(dlg);
        nameCombo.editEnabled = true;
        for (let i = 0; i < standardKeywords.length; ++i)
            nameCombo.addItem(standardKeywords[i]);
        nameCombo.editText = name || "";

        let valueEdit = new Edit(dlg);
        valueEdit.text = value || "";

        let commentEdit = new Edit(dlg);
        commentEdit.text = comment || "";

        let removeBtn = new PushButton(dlg);
        removeBtn.text = "🗑";

        let rowSizer = new HorizontalSizer();
        rowSizer.spacing = 6;
        rowSizer.add(nameCombo);
        rowSizer.add(valueEdit);
        rowSizer.add(commentEdit);
        rowSizer.add(removeBtn);

        fieldSizer.add(rowSizer);

        let row = {
            nameCombo: nameCombo,
            valueEdit: valueEdit,
            commentEdit: commentEdit,
            sizer: rowSizer,
            removeBtn: removeBtn
        };
        keywordList.push(row);

        removeBtn.onClick = function () {
            fieldSizer.remove(rowSizer);
            keywordList.splice(keywordList.indexOf(row), 1);
            dlg.adjustToContents();
        };
    }

    // Show one empty row initially
createKeywordRow();

    let addButton = new PushButton(dlg);
    addButton.text = "+ Add Keyword";
    addButton.onClick = function () { createKeywordRow(); };

    let savePresetBtn = new PushButton(dlg);
    savePresetBtn.text = "💾 Save Preset";

    let loadPresetBtn = new PushButton(dlg);
    loadPresetBtn.text = "📂 Load Preset";

    savePresetBtn.onClick = function () {
        let fileDialog = new SaveFileDialog();
        fileDialog.caption = "Save Preset";
        fileDialog.filters = [["Preset files", "*.txt"]];
        if (fileDialog.execute()) {
            let toSave = [];
            for (let i = 0; i < keywordList.length; ++i) {
                let k = keywordList[i];
                let name = k.nameCombo.editText.trim();
                let value = k.valueEdit.text.trim();
                let comment = k.commentEdit.text.trim();
                if (name !== "" && value !== "")
                    toSave.push({ name: name, value: value, comment: comment });
            }
            savePreset(fileDialog.fileName, toSave);
            new MessageBox("Preset saved.", "Info").execute();
        }
    };

    loadPresetBtn.onClick = function () {
        let fileDialog = new OpenFileDialog();
        fileDialog.caption = "Load Preset";
        fileDialog.filters = [["Preset files", "*.txt"]];
        if (fileDialog.execute()) {
            let preset = loadPreset(fileDialog.fileName);
            for (let i = keywordList.length - 1; i >= 0; --i) {
                let row = keywordList[i];
                fieldSizer.remove(row.sizer);
                keywordList.splice(i, 1);
            }
            if (preset.length === 0) {
                createKeywordRow();
            } else {
                for (let i = 0; i < preset.length; ++i) {
                    let k = preset[i];
                    createKeywordRow(k.name, k.value, k.comment);
                }
            }
            dlg.adjustToContents();
        }
    };

    let applyButton = new PushButton(dlg);
    applyButton.text = "Apply to All Files";

    applyButton.onClick = function () {
        if (!folderPath || fileList.length === 0) {
            new MessageBox("No valid folder or files selected.", "Error", StdIcon_Error).execute();
            return;
        }

        let finalKeywords = [];
        for (let i = 0; i < keywordList.length; ++i) {
            let k = keywordList[i];
            let name = k.nameCombo.editText.trim();
            let value = k.valueEdit.text.trim();
            let comment = k.commentEdit.text.trim();
            if (name === "DATE-OBS" && !isValidDateObs(value)) {
                new MessageBox("DATE-OBS must follow ISO 8601 format.", "Validation Error", StdIcon_Error).execute();
                return;
            }
            if (name !== "" && value !== "") {
                finalKeywords.push({ name: name, value: value, comment: comment });
            }
        }

        for (let i = 0; i < fileList.length; ++i) {
            let file = fileList[i];
            Console.writeln("📂 Processing: " + file.path);
            let opened = ImageWindow.open(file.path);
            if (!opened || opened.length === 0) {
                Console.writeln("❌ Could not open: " + file.path);
                continue;
            }
            let win = opened[0];
            setOrUpdateKeywords(win, finalKeywords);
            if (!win.saveAs(file.path, false, false, false, false)) {
                Console.writeln("❌ Failed to save: " + file.path);
            } else {
                Console.writeln("💾 Saved successfully.");
            }
            win.close();
        }

        Console.writeln("✅ All files processed.");
        dlg.ok();
    };

    // Layout
    let topSizer = new HorizontalSizer();
    topSizer.spacing = 6;
    topSizer.add(folderEdit);
    topSizer.add(browseBtn);

    dlg.sizer = new VerticalSizer();
    dlg.sizer.margin = 12;
    dlg.sizer.spacing = 10;
    dlg.sizer.add(descriptionLabel);
    dlg.sizer.add(topSizer);
    dlg.sizer.add(previewText);
    dlg.sizer.add(fieldSizer);

    let presetRow = new HorizontalSizer();
    presetRow.spacing = 6;
    presetRow.add(savePresetBtn);
    presetRow.add(loadPresetBtn);
    dlg.sizer.add(presetRow);

    dlg.sizer.add(addButton);
    dlg.sizer.add(applyButton);

    let authorLabel = new Label(dlg);
    authorLabel.text = "Developed by Mario Sandri - Visit: ";
    let link = new Label(dlg);
    link.useRichText = true;
    link.text = "<html><style>a { color: #007acc; text-decoration: underline; }</style><a href=\"https://www.astronomiavallidelnoce.it\">www.astronomiavallidelnoce.it</a></html>";
    let linkRow = new HorizontalSizer();
    linkRow.spacing = 4;
    linkRow.add(authorLabel);
    linkRow.add(link);
    linkRow.addStretch();
    dlg.sizer.add(linkRow);

    dlg.execute();
}

showMainDialog();
