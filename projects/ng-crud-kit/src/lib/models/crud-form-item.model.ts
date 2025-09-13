export interface NgCrudFormItem {
	label?: string,
	name?: string,
	type?: 'input'|'text'|'number'|'checkbox'|'select',
	required?: boolean,
	defaultValue?: any;
	placeholder?: string,
	autocomplete?: string,
	hint?: string,
	rows?: number,
	min?: number,
	max?: number,
	options?: any[],
	multiple?: boolean,
}