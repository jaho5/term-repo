<script lang="ts">
	interface Term {
		term: string;
		definition: string;
		technicalDefinition: string;
		examples: string[];
		usage: string;
		scope: string;
		relationships: Array<{ relatedTerm: string; relationshipType: string }>;
		createdAt: string;
	}

	let topic = $state('');
	let level = $state('intermediate');
	let loading = $state(false);
	let terms = $state<Term[]>([]);
	let expandedStates = $state<Record<number, boolean>>({});
	let allExpanded = $state(false);

	async function generateTerms() {
		if (!topic.trim()) return;

		loading = true;
		try {
			const response = await fetch('/api/create-term', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic, level })
			});

			const data = await response.json();
			if (data.success) {
				terms = data.terms;
				expandedStates = {};
				allExpanded = false;
			}
		} catch (error) {
			console.error('Failed to generate terms:', error);
		} finally {
			loading = false;
		}
	}

	function toggleTerm(index: number) {
		expandedStates[index] = !expandedStates[index];
	}

	function toggleAll() {
		allExpanded = !allExpanded;
		terms.forEach((_, i) => {
			expandedStates[i] = allExpanded;
		});
	}

	function truncate(text: string, maxLength: number = 80) {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + '...';
	}
</script>

<div class="container">
	<h1>Term Registry</h1>

	<div class="input-section">
		<input type="text" bind:value={topic} placeholder="Enter topic" />
		<button onclick={generateTerms} disabled={loading || !topic.trim()}>
			{loading ? 'Generating...' : 'Generate Terms'}
		</button>
		<select bind:value={level}>
			<option value="beginner">Beginner</option>
			<option value="intermediate">Intermediate</option>
			<option value="advanced">Advanced</option>
			<option value="expert">Expert</option>
		</select>
	</div>

	{#if terms.length > 0}
		<div class="actions">
			<button onclick={toggleAll}>
				{allExpanded ? 'Collapse All' : 'Expand All'}
			</button>
		</div>

		<div class="terms-list">
			{#each terms as term, i (term.term)}
				<div class="term-item" onclick={() => toggleTerm(i)}>
					{#if !expandedStates[i]}
						<div class="term-header-collapsed">
							<strong>{term.term}</strong>
							<span class="definition">{truncate(term.definition)}</span>
						</div>
					{:else}
						<div class="term-header">
							<strong>{term.term}</strong>
						</div>
					{/if}
					{#if expandedStates[i]}
						<div class="term-details">
							<p><strong>Definition:</strong> {term.definition}</p>
							<p><strong>Technical Definition:</strong> {term.technicalDefinition}</p>
							<p><strong>Usage:</strong> {term.usage}</p>
							<p><strong>Scope:</strong> {term.scope}</p>
							{#if term.examples && term.examples.length > 0}
								<p><strong>Examples:</strong></p>
								<ul>
									{#each term.examples as example, idx (idx)}
										<li>{example}</li>
									{/each}
								</ul>
							{/if}
							{#if term.relationships.length > 0}
								<p><strong>Relationships:</strong></p>
								<ul>
									{#each term.relationships as rel, idx (idx)}
										<li>{rel.relationshipType}: {rel.relatedTerm}</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.input-section {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	input,
	select,
	button {
		padding: 0.5rem;
	}

	input {
		flex: 1;
	}

	.actions {
		margin-bottom: 1rem;
	}

	.terms-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.term-item {
		padding: 1rem;
		border: 1px solid #ccc;
		cursor: pointer;
	}

	.term-header {
		line-height: 1.5;
	}

	.term-header-collapsed {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		line-height: 1.5;
	}

	.term-header-collapsed .definition {
		text-align: right;
	}

	.term-details {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.term-details p {
		margin: 0.5rem 0;
	}

	ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}
</style>
