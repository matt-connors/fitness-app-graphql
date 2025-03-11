import { SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';


describe('User Query', () => {
	it('returns the appropriate response', async () => {
		const response = await SELF.fetch('http://localhost:8787/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "query": `
                    User {
                        email
                    }
                `
            })
        });
        const parsedResponse = await response.json();
		expect(parsedResponse).toMatchObject({
            
        })
	});
});


/**
 * TODO: initialize the test environment programatically using vitest
 *  - this would require a LOCAL test database with test data inserted into it
 */