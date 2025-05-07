import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

/**
 * Write content to a Notion page
 * @param {string} pageId - The ID of the Notion page to write to
 * @param {object} content - The content to write to the page
 * @param {string} content.title - The title of the page (optional)
 * @param {array} content.blocks - Array of block objects to add to the page
 */
async function writeToNotionPage(pageId, content) {
    try {
        // Update page title if provided
        if (content.title) {
            await notion.pages.update({
                page_id: pageId,
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: content.title,
                                },
                            },
                        ],
                    },
                },
            });
            console.log(`Updated page title to: ${content.title}`);
        }

        // Add blocks if provided
        if (content.blocks && content.blocks.length > 0) {
            const response = await notion.blocks.children.append({
                block_id: pageId,
                children: content.blocks,
            });
            console.log(`Added ${response.results.length} blocks to the page`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error writing to Notion page:', error.message);
        return { success: false, error: error.message };
    }
}

// Example usage
// Replace this with your actual Notion page ID
const pageId = '1ea7b4e662e180dc9dfafcf84404ecd8'; // e.g., '1ea7b4e662e180dc9dfafcf84404ecd8'

console.log('Reading Notion page...');
readNoteFromNotion(pageId).then(() => {
    console.log('\nTo use this script:');
    console.log('1. Replace YOUR_PAGE_ID_HERE with your actual Notion page ID');
    console.log('2. Run the script with: node read_notion_page.js');
});

// Example of writing to a Notion page
/*
writeToNotionPage(pageId, {
    title: 'Updated Page Title',
    blocks: [
        {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'This is a new paragraph added programmatically.',
                        },
                    },
                ],
            },
        },
        {
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'A New Section',
                        },
                    },
                ],
            },
        },
    ],
}).then(result => {
    console.log('Write operation result:', result);
});
*/

// Note: To find your page ID, open the page in Notion and look at the URL
// The ID is the part after the last slash and before any query parameters
// Example: https://www.notion.so/myworkspace/My-Page-1ea7b4e662e180dc9dfafcf84404ecd8
//                                                    ↑ This is the page ID

