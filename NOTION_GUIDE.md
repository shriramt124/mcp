# Reading Content from Notion Pages

This guide explains how to read content from your Notion pages using the provided script.

## Prerequisites

- Node.js installed on your system
- Notion integration token (already configured in the script)
- Notion page ID that you want to read

## How to Find Your Notion Page ID

To find your Notion page ID:

1. Open the Notion page in your browser
2. Look at the URL in your address bar
3. The page ID is the part after the last slash and before any query parameters

Example URL: `https://www.notion.so/myworkspace/My-Page-1ea7b4e662e180dc9dfafcf84404ecd8`

In this example, the page ID is: `1ea7b4e662e180dc9dfafcf84404ecd8`

## Using the Script

1. Open the `read_notion_page.js` file
2. Replace `YOUR_PAGE_ID_HERE` with your actual Notion page ID
3. Save the file
4. Open a terminal/command prompt
5. Navigate to the project directory
6. Run the script:

```
node read_notion_page.js
```

## What the Script Does

The script will:

1. Connect to the Notion API using your integration token
2. Retrieve the specified page's title and content
3. Display the content in the console, formatted based on block types (paragraphs, headings, lists, etc.)

## Troubleshooting

If you encounter errors:

- Verify your page ID is correct
- Ensure your Notion integration has access to the page you're trying to read
- Check that the page has the expected structure (with a Name property for the title)

## Integration with Your Project

You can also use the `readNoteFromNotion` function directly in your main application. The function is already implemented in your `index.js` file as a tool that can be called with a page ID parameter.