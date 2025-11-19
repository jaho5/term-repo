import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { CEREBRAS_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { topic, level = 'intermediate' } = await request.json();

		console.log('[API] Request received:', { topic, level });

		if (!topic) {
			throw error(400, 'Topic is required');
		}

		const cerebras = new Cerebras({
			apiKey: CEREBRAS_API_KEY
		});

		const tools = [
			{
				type: 'function' as const,
				function: {
					name: 'create_terms',
					description:
						'Creates multiple term entries in the learning registry with core definition, scope, and relationships',
					parameters: {
						type: 'object',
						properties: {
							terms: {
								type: 'array',
								description: 'Array of term entries to create',
								items: {
									type: 'object',
									properties: {
										term: {
											type: 'string',
											description: 'The term name'
										},
										definition: {
											type: 'string',
											description: 'Core definition of the term'
										},
										technicalDefinition: {
											type: 'string',
											description: 'More technical/precise definition with formal terminology'
										},
										examples: {
											type: 'array',
											description: 'Practical examples demonstrating the term',
											items: {
												type: 'string'
											}
										},
										usage: {
											type: 'string',
											description: 'How and when to use this term/concept'
										},
										scope: {
											type: 'string',
											description: 'The scope or context where this term applies'
										},
										relationships: {
											type: 'array',
											description: 'Related terms and their relationship types',
											items: {
												type: 'object',
												properties: {
													relatedTerm: {
														type: 'string'
													},
													relationshipType: {
														type: 'string',
														description: 'e.g., "is-a", "part-of", "uses", "related-to"'
													}
												},
												required: ['relatedTerm', 'relationshipType']
											}
										}
									},
									required: [
										'term',
										'definition',
										'technicalDefinition',
										'examples',
										'usage',
										'scope'
									]
								}
							}
						},
						required: ['terms']
					}
				}
			}
		];

		const levelGuidance = {
			beginner:
				'Focus on fundamental concepts and basic terminology. Use simple language and foundational terms.',
			intermediate:
				'Include core concepts with moderate depth. Balance between foundational and advanced terms.',
			advanced: 'Include specialized terminology, nuanced concepts, and technical details.',
			expert:
				'Focus on highly specific terms, edge cases, advanced patterns, and domain-specific jargon.'
		};

		const systemPrompt = `You are a learning assistant that creates structured term entries for a knowledge registry.
For the given topic at ${level} level, identify the most important and relevant terms (aim for 5-10 terms).

Level guidance: ${levelGuidance[level as keyof typeof levelGuidance] || levelGuidance.intermediate}

Use the create_terms tool to create all terms at once. For each term include:
- A clear, concise definition appropriate for the level
- A technical definition with formal terminology
- Practical examples demonstrating the term (2-3 examples)
- Usage guidance on how and when to use this concept
- The appropriate scope/context
- Relevant relationships to other concepts in the list`;

		const userPrompt = `Generate the most important terms for learning about: "${topic}" at ${level} level.`;

		console.log('[API] Calling Cerebras API with model: gpt-oss-120b');

		const completion = await cerebras.chat.completions.create({
			model: 'gpt-oss-120b',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			tools,
			tool_choice: 'auto'
		});

		const message = completion.choices[0].message;

		console.log('[API] Received response with tool calls:', message.tool_calls?.length || 0);

		if (message.tool_calls && message.tool_calls.length > 0) {
			const toolCall = message.tool_calls[0];
			const data = JSON.parse(toolCall.function.arguments);

			console.log('[API] Tool call function:', toolCall.function.name);
			console.log('[API] Terms count:', data.terms?.length || 0);

			const terms = data.terms.map(
				(termData: {
					term: string;
					definition: string;
					technicalDefinition: string;
					examples?: string[];
					usage: string;
					scope: string;
					relationships?: Array<{ relatedTerm: string; relationshipType: string }>;
				}) => ({
					term: termData.term,
					definition: termData.definition,
					technicalDefinition: termData.technicalDefinition,
					examples: termData.examples || [],
					usage: termData.usage,
					scope: termData.scope,
					relationships: termData.relationships || [],
					createdAt: new Date().toISOString()
				})
			);

			console.log('[API] Successfully created', terms.length, 'terms');

			return json({
				success: true,
				topic,
				level,
				count: terms.length,
				terms
			});
		}

		throw error(500, 'No tool calls received from model');
	} catch (err) {
		console.error('Error creating terms:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to create terms');
	}
};
