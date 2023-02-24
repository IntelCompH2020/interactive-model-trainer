import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { atLeastItems, BackendErrorValidator } from '@common/forms/validation/custom-validator';
import { ValidationErrorModel } from '@common/forms/validation/error-model/validation-error-model';
import { Validation, ValidationContext } from '@common/forms/validation/validation-context';
import { BaseEditorModel } from '@common/base/base-editor.model';
import { Equivalence, EquivalenceItem, EquivalencePersist } from '@app/core/model/equivalence/equivalence.model';
import { WordListVisibility } from '@app/core/enum/wordlist-visibility.enum';
import { Moment } from 'moment';

export class EquivalenceEditorModel extends BaseEditorModel implements EquivalencePersist {
	public validationErrorModel: ValidationErrorModel = new ValidationErrorModel();
	protected formBuilder: FormBuilder = new FormBuilder();

	constructor() { super(); }
	wordlist: EquivalenceItem[] = [];
	name: string;
	description: string;
  visibility: WordListVisibility;
	creator: string;
	location: string;
	term: string;
	equivalence: string;
	creation_date: Moment;

	public fromModel(item: Equivalence): EquivalenceEditorModel {
		if (item) {
			super.fromModel(item);
			this.name = item.name;
			this.description = item.description;
			this.visibility = item.visibility;
			this.creator = item.creator;
			this.location = item.location;
			this.term = item.term;
			this.equivalence = item.equivalence;
			this.wordlist = item.wordlist ?? [];
			this.creation_date = item.creation_date;
		}
		return this;
	}

	buildForm(context: ValidationContext = null, disabled: boolean = false): FormGroup {
		if (context == null) { context = this.createValidationContext(); }

		return this.formBuilder.group({
			id: [{ value: this.id, disabled: disabled }, context.getValidation('id').validators],
			name: [{ value: this.name, disabled: disabled }, context.getValidation('name').validators],
			location: [{ value: this.location, disabled: disabled }, context.getValidation('location').validators],
			creator: [{ value: this.creator, disabled: disabled }, context.getValidation('creator').validators],
			description: [{ value: this.description, disabled: disabled }, context.getValidation('description').validators],
			visibility: [{ value: this.visibility, disabled: disabled }, context.getValidation('visibility').validators],
			creation_date: [{ value: this.creation_date, disabled: disabled }, context.getValidation('creation_date').validators],
			term: [{ value: this.term, disabled: disabled }, context.getValidation('term').validators],
			equivalence: [{ value: this.equivalence, disabled: disabled }, context.getValidation('equivalence').validators],
			wordlist: this.formBuilder.array(this.wordlist, context.getValidation('wordlist').validators),
			hash: [{ value: this.hash, disabled: disabled }, context.getValidation('hash').validators],
		});
	}

	createValidationContext(): ValidationContext {
		const baseContext: ValidationContext = new ValidationContext();
		const baseValidationArray: Validation[] = new Array<Validation>();
		baseValidationArray.push({ key: 'id', validators: [] });
		baseValidationArray.push({ key: 'name', validators: [Validators.required, Validators.pattern(/[\S]/)] });
		baseValidationArray.push({ key: 'description', validators: [] });
		baseValidationArray.push({ key: 'creator', validators: [] });
		baseValidationArray.push({ key: 'location', validators: [] });
		baseValidationArray.push({ key: 'visibility', validators: [] });
		baseValidationArray.push({ key: 'creation_date', validators: [] });
		baseValidationArray.push({ key: 'wordlist', validators: [atLeastItems(1)] });
		baseValidationArray.push({ key: 'term', validators: [] });
		baseValidationArray.push({ key: 'equivalence', validators: [] });
		baseValidationArray.push({ key: 'hash', validators: [] });
		baseContext.validation = baseValidationArray;
		return baseContext;
	}
}