import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: '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' }); // Set your token in .env

// Create server instance
const server = new McpServer({
    name: "weather",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});



async function getWeatherByCity(city) {
    if (city.toLowerCase() === 'indore') {
        return {
            temp: '30C',
            forcast: 'chances of high rain'
        }
    }
    if (city.toLowerCase() === 'delhi') {
        return {
            temp: '40C',
            forcast: 'chances of high heaat'
        }
    }
}

server.tool("getWeatherbyCityname", {
    city: z.string()
}, async ({ city }) => {
    return {
        content: [{
            type: "text", text:
                JSON.stringify(await getWeatherByCity(city))
        }]
    }
})

const fact = async (number) => {
    if (number === 1) return 1;
    return number * fact(number - 1);
}
server.tool("factorialOfNumber", {
    number: z.number()
}, async ({ number }) => {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(await fact(number))
            }
        ]
    }
})

// Default database ID for Notion operations
const DEFAULT_DATABASE_ID = '1ea7b4e662e180dc9dfafcf84404ecd8';


server.tool("readNoteFromNotion", {
    pageId: z.string(), // Accepts the ID of the Notion page
}, async ({ pageId }) => {
    try {
        // Retrieve the page to get the title
        const page = await notion.pages.retrieve({ page_id: pageId });
        const title = page.properties.Name?.title[0]?.text?.content || 'No title found';

        // Retrieve the page content (blocks)
        const blocks = await notion.blocks.children.list({ block_id: pageId });

        // Format the content based on block types
        const formattedContent = [];

        blocks.results.forEach(block => {
            if (block.type === 'paragraph' && block.paragraph.rich_text.length > 0) {
                formattedContent.push(block.paragraph.rich_text.map(rt => rt.text.content).join(''));
            } else if (block.type === 'heading_1' && block.heading_1.rich_text.length > 0) {
                formattedContent.push(`# ${block.heading_1.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'heading_2' && block.heading_2.rich_text.length > 0) {
                formattedContent.push(`## ${block.heading_2.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'heading_3' && block.heading_3.rich_text.length > 0) {
                formattedContent.push(`### ${block.heading_3.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item.rich_text.length > 0) {
                formattedContent.push(`• ${block.bulleted_list_item.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'numbered_list_item' && block.numbered_list_item.rich_text.length > 0) {
                formattedContent.push(`1. ${block.numbered_list_item.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'to_do' && block.to_do.rich_text.length > 0) {
                const checkbox = block.to_do.checked ? '[x]' : '[ ]';
                formattedContent.push(`${checkbox} ${block.to_do.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'code' && block.code.rich_text.length > 0) {
                formattedContent.push(`\`\`\`${block.code.language}\n${block.code.rich_text.map(rt => rt.text.content).join('')}\n\`\`\``);
            } else if (block.type === 'quote' && block.quote.rich_text.length > 0) {
                formattedContent.push(`> ${block.quote.rich_text.map(rt => rt.text.content).join('')}`);
            } else if (block.type === 'divider') {
                formattedContent.push('---');
            } else if (block.type === 'callout' && block.callout.rich_text.length > 0) {
                const emoji = block.callout.icon?.emoji || '📌';
                formattedContent.push(`${emoji} ${block.callout.rich_text.map(rt => rt.text.content).join('')}`);
            }
        });

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        title,
                        content: formattedContent.join('\n'),
                        blocks: blocks.results, // Include raw blocks for advanced usage
                    }),
                },
            ],
        };
    } catch (error) {
        console.error("Error reading Notion page:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error.message || "Error reading Notion page."
                    }),
                },
            ],
        };
    }
});

server.tool("writeToNotionPage", {
    pageId: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    formattedContent: z.array(z.object({})).optional(),
}, async ({ pageId, title, content, formattedContent }) => {
    try {

        if (title) {
            await notion.pages.update({
                page_id: pageId,
                properties: {
                    title: {
                        title: [
                            {
                                text: {
                                    content: title,
                                },
                            },
                        ],
                    },
                },
            });
        }

        let blocksToAdd = [];


        if (content) {
            s
            const contentLines = content.split('\n');

            contentLines.forEach(line => {

                if (line.startsWith('# ')) {
                    // Heading 1
                    blocksToAdd.push({
                        object: "block",
                        type: "heading_1",
                        heading_1: {
                            rich_text: [{ type: "text", text: { content: line.substring(2) } }]
                        }
                    });
                } else if (line.startsWith('## ')) {
                    // Heading 2
                    blocksToAdd.push({
                        object: "block",
                        type: "heading_2",
                        heading_2: {
                            rich_text: [{ type: "text", text: { content: line.substring(3) } }]
                        }
                    });
                } else if (line.startsWith('### ')) {
                    // Heading 3
                    blocksToAdd.push({
                        object: "block",
                        type: "heading_3",
                        heading_3: {
                            rich_text: [{ type: "text", text: { content: line.substring(4) } }]
                        }
                    });
                } else if (line.startsWith('• ') || line.startsWith('* ')) {
                    // Bulleted list item
                    blocksToAdd.push({
                        object: "block",
                        type: "bulleted_list_item",
                        bulleted_list_item: {
                            rich_text: [{ type: "text", text: { content: line.substring(2) } }]
                        }
                    });
                } else if (line.match(/^\d+\. /)) {
                    // Numbered list item
                    const content = line.substring(line.indexOf('. ') + 2);
                    blocksToAdd.push({
                        object: "block",
                        type: "numbered_list_item",
                        numbered_list_item: {
                            rich_text: [{ type: "text", text: { content } }]
                        }
                    });
                } else if (line.startsWith('> ')) {
                    // Quote
                    blocksToAdd.push({
                        object: "block",
                        type: "quote",
                        quote: {
                            rich_text: [{ type: "text", text: { content: line.substring(2) } }]
                        }
                    });
                } else if (line.startsWith('[x] ') || line.startsWith('[ ] ')) {
                    // To-do item
                    const checked = line.startsWith('[x] ');
                    const content = line.substring(4);
                    blocksToAdd.push({
                        object: "block",
                        type: "to_do",
                        to_do: {
                            rich_text: [{ type: "text", text: { content } }],
                            checked
                        }
                    });
                } else if (line === '---') {
                    // Divider
                    blocksToAdd.push({
                        object: "block",
                        type: "divider"
                    });
                } else if (line.trim() !== '') {
                    // Regular paragraph
                    blocksToAdd.push({
                        object: "block",
                        type: "paragraph",
                        paragraph: {
                            rich_text: [{ type: "text", text: { content: line } }]
                        }
                    });
                }
            });
        }

        // If formatted content is provided (advanced usage), use it instead
        if (formattedContent && formattedContent.length > 0) {
            blocksToAdd = formattedContent;
        }

        // Add blocks if we have any
        if (blocksToAdd.length > 0) {
            await notion.blocks.children.append({
                block_id: pageId,
                children: blocksToAdd,
            });
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "Successfully updated Notion page",
                        pageId: pageId
                    }),
                },
            ],
        };
    } catch (error) {
        console.error("Error writing to Notion page:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error.message,
                    }),
                },
            ],
        };
    }
});



// Tool to search content across Notion pages
server.tool("searchNotion", {
    query: z.string(), // The search query
    databaseId: z.string().optional(), // Optional database ID to limit search scope
}, async ({ query, databaseId }) => {
    try {
        // Prepare search parameters
        const searchParams = {
            query: query,
        };

        // Add filter by database if provided
        if (databaseId) {
            searchParams.filter = {
                property: 'parent',
                value: {
                    type: 'database_id',
                    database_id: databaseId
                }
            };
        }

        // Execute the search
        const response = await notion.search(searchParams);

        // Format the results
        const results = response.results.map(item => {
            // Get title based on object type
            let title = 'Untitled';
            if (item.object === 'page') {
                title = item.properties.Name?.title[0]?.text?.content || 'Untitled';
            } else if (item.object === 'database') {
                title = item.title[0]?.text?.content || 'Untitled Database';
            }

            return {
                id: item.id,
                type: item.object,
                title: title,
                url: item.url,
                last_edited_time: item.last_edited_time
            };
        });

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        results: results,
                        total: results.length,
                    }),
                },
            ],
        };
    } catch (error) {
        console.error("Error searching Notion:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error.message || "Error searching Notion",
                    }),
                },
            ],
        };
    }
});

// Tool to list pages from a Notion database
server.tool("listNotionPages", {
    databaseId: z.string().optional(), // Optional database ID, will use default if not provided
    limit: z.number().optional(), // Optional limit for number of pages to return
}, async ({ databaseId, limit = 10 }) => {
    try {
        // Use provided database ID or default
        const dbId = databaseId || DEFAULT_DATABASE_ID;

        // Query the database
        const response = await notion.databases.query({
            database_id: dbId,
            page_size: limit,
        });

        // Format the results
        const pages = response.results.map(page => {
            const title = page.properties.Name?.title[0]?.text?.content || 'Untitled';
            return {
                id: page.id,
                title: title,
                url: page.url,
                created_time: page.created_time,
                last_edited_time: page.last_edited_time
            };
        });

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        pages: pages,
                        total: pages.length,
                    }),
                },
            ],
        };
    } catch (error) {
        console.error("Error listing Notion pages:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error.message || "Error listing Notion pages",
                    }),
                },
            ],
        };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);

