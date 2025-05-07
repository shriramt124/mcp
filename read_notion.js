import { Client } from "@notionhq/client";

// Initialize Notion client with your integration token
const notion = new Client({ auth: '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' });

/**
 * Read content from a Notion page
 * @param {string} pageId - The ID of the Notion page to read
 */
async function readNoteFromNotion(pageId) {
    try {
        // Retrieve the page
        const page = await notion.pages.retrieve({ page_id: pageId });
        console.log('Page title:', page.properties.Name?.title[0]?.text?.content || 'No title found');

        // Retrieve the page content (blocks)
        const blocks = await notion.blocks.children.list({ block_id: pageId });

        console.log('\nPage content:');
        blocks.results.forEach(block => {
            if (block.type === 'paragraph' && block.paragraph.rich_text.length > 0) {
                console.log(block.paragraph.rich_text.map(rt => rt.text.content).join(''));
            } else if (block.type === 'heading_1' && block.heading_1.rich_text.length > 0) {
                console.log(`# ${block.heading_1.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'heading_2' && block.heading_2.rich_text.length > 0) {
                console.log(`## ${block.heading_2.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'heading_3' && block.heading_3.rich_text.length > 0) {
                console.log(`### ${block.heading_3.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item.rich_text.length > 0) {
                console.log(`• ${block.bulleted_list_item.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'numbered_list_item' && block.numbered_list_item.rich_text.length > 0) {
                console.log(`1. ${block.numbered_list_item.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'to_do' && block.to_do.rich_text.length > 0) {
                const checkbox = block.to_do.checked ? '[x]' : '[ ]';
                console.log(`${checkbox} ${block.to_do.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'code' && block.code.rich_text.length > 0) {
                console.log(`\`\`\`${block.code.language}\n${block.code.rich_text.map(rt => rt.text.content).join('')}\n\`\`\``);
            }
        });

        return { page, blocks };
    } catch (error) {
        console.error('Error reading Notion page:', error.message);
        return null;
    }
}

// Get page ID from command line arguments
const pageId = '1ea7b4e662e180dc9dfafcf84404ecd8'

if (!pageId) {
    console.log('Please provide a Notion page ID as a command line argument');
    console.log('Usage: node read_notion.js YOUR_PAGE_ID');
    console.log('\nExample: node read_notion.js 1ea7b4e662e180dc9dfafcf84404ecd8');
    process.exit(1);
}

console.log('Reading Notion page...');
readNoteFromNotion(pageId).then(() => {
    console.log('\nNote: To find your page ID, open the page in Notion and look at the URL');
    console.log('The ID is the part after the last slash and before any query parameters');
    console.log('Example: https://www.notion.so/myworkspace/My-Page-1ea7b4e662e180dc9dfafcf84404ecd8');
    console.log('                                                   ↑ This is the page ID');
});