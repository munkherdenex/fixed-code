/**
 * Mongolian translation for Editor.js.
 *
 */
export const editorjsI18nMn = {
  /**
   * General UI messages
   */
  ui: {
    "blockTunes": {
      "toggler": {
        "Click to tune": "Тохируулах бол дарна уу",
        "or drag to move": "эсвэл зөөх бол чирнэ үү"
      }
    },
    "inlineToolbar": {
      "converter": {
        "Convert to": "Хувиргах"
      }
    },
    "toolbar": {
      "toolbox": {
        "Add": "Нэмэх"
      }
    },
    "popover": {
        "Filter": "Шүүх",
        "Nothing found": "Юу ч олдсонгүй"
    }
  },

  /**
   * Tool names displayed in the toolbox
   */
  toolNames: {
    "Text": "Текст", // Default Paragraph tool
    "Heading": "Гарчиг",
    "List": "Жагсаалт",
    "Embed": "Шигтгэх",
    "Image": "Зураг", // If you add the Image tool
    "Quote": "Ишлэл", // Example if you add a Quote tool
    "Table": "Хүснэгт", // Example if you add a Table tool
    // Add other tool names here corresponding to the keys in your EDITOR_TOOLS
    "Paragraph": "Цогцолбор", // Explicitly naming Paragraph if used
  },

  /**
   * Tools specific messages
   */
  tools: {
    /**
     * Each tool variable should correspond to the key in the 'tools' section of the Editor.js configuration
     */
    "header": { // Corresponds to 'header' tool key
      "Heading 1": "Гарчиг 1",
      "Heading 2": "Гарчиг 2",
      "Heading 3": "Гарчиг 3",
      "Heading 4": "Гарчиг 4",
      "Heading 5": "Гарчиг 5",
      "Heading 6": "Гарчиг 6",
      "Enter a header": "Гарчиг оруулна уу", // Placeholder message from config
    },
    "paragraph": { // Corresponds to 'paragraph' tool key
        "Enter a paragraph": "Параграф оруулна уу" // Placeholder (if Paragraph tool has one)
    },
    "list": { // Corresponds to 'list' tool key
      "Unordered": "Эрэмбэлээгүй",
      "Ordered": "Эрэмбэлсэн"
    },
    "embed": { // Corresponds to 'embed' tool key
      "Enter a caption": "Тайлбар оруулна уу",
      "Link": "Холбоос",
      "Paste a link to embed content": "Агуулга шигтгэхийн тулд холбоосыг буулгана уу"
    },
    // Add translations for other tools if needed (e.g., Image, Quote)
    // "image": {
    //   "Caption": "Зургийн тайлбар",
    //   "Select an Image": "Зураг сонгох",
    //   "With border": "Хүрээтэй",
    //   "Stretch image": "Зургийг сунгах",
    //   "With background": "Дэвсгэртэй"
    // }
  },

  /**
   * BlockTunes specific messages
   * Note: These might overlap with ui.blockTunes but provide more specific context
   */
  blockTunes: {
    /**
     * Each block tune variable should correspond to the key in the 'tunes' section of the Editor.js configuration
     */
    "delete": {
      "Delete": "Устгах",
      "Click to delete": "Устгах бол дарна уу" // Example tooltip
    },
    "moveUp": {
      "Move up": "Дээш зөөх"
    },
    "moveDown": {
      "Move down": "Доош зөөх"
    },
  }
};