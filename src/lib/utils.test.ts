import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
	it('cn merges classes correctly', () => {
		expect(cn('p-4', 'text-center')).toBe('p-4 text-center');
		expect(cn('p-4', 'p-8')).toBe('p-8'); // tailwind-merge should handle this
	});
});
