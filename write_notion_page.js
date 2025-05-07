import { Client } from "@notionhq/client";
 
const notion = new Client({ auth: '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' });

async function writeToNotionPage(pageId, content) {
    try {
        
        if (content.title) {
            await notion.pages.update({
                page_id: pageId,
                properties: {
                    title: {
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
const pageId = '1ea7b4e662e180dc9dfafcf84404ecd8';
writeToNotionPage(pageId, {
    title: 'Artificial Intelligence: Understanding the Technology Shaping Our Future',
    blocks: [
       
        {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'Artificial Intelligence (AI) represents one of the most transformative technologies of our era, revolutionizing industries, reshaping human-computer interaction, and raising profound questions about the future of work, creativity, and society itself. This document explores the fundamentals of AI, its current applications, recent breakthroughs, and the ethical considerations surrounding its development and deployment.',
                        },
                    },
                ],
            },
        },
        {
            object: 'block',
            type: 'heading_1',
            heading_1: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'What is Artificial Intelligence?',
                        },
                    },
                ],
            },
        },
        {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'At its core, artificial intelligence refers to computer systems designed to perform tasks that typically require human intelligence. These include learning from experience, recognizing patterns, understanding natural language, making decisions, and solving complex problems. While the concept of AI has existed for decades, recent advances in computing power, algorithm design, and data availability have accelerated its development and practical applications.',
                        },
                    },
                ],
            },
        },
        {
            object: 'block',
            type: 'numbered_list_item',
            numbered_list_item: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'Education: Personalized learning, automated grading, and intelligent tutoring systems.',
                        },
                    },
                ],
            },
        },
        {
            object: 'block',
            type: 'numbered_list_item',
            numbered_list_item: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'Manufacturing: Predictive maintenance, quality control, and supply chain optimization.',
                        },
                    },
                ],
            },
        },
      
        {
            object: 'block',
            type: 'heading_1',
            heading_1: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: 'Ethical Considerations and Challenges',
                        },
                    },
                ],
            },
        },
   
      

    ],
}).then(result => {
    console.log('Write operation result:', result);
});

console.log('\nTo use this script:');
console.log('1. Replace the pageId variable with your actual Notion page ID');
console.log('2. Modify the content object to include the blocks you want to add');
console.log('3. Run the script with: node write_notion_page.js');
 