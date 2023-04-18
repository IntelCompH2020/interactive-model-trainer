import { Injectable } from '@angular/core';
import { BlueprintRequestState } from '@app/core/enum/blueprint-request-state.enum';
import { BlueprintTemplateKey } from '@app/core/enum/blueprint-template-key.enum';
import { BlueprintTemplateType } from '@app/core/enum/blueprint-template-type.enum';
import { IsActive } from '@app/core/enum/is-active.enum';
import { LanguageType } from '@app/core/enum/language-type.enum';
import { RoleType } from '@app/core/enum/role-type.enum';
import { BaseEnumUtilsService } from '@common/base/base-enum-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { CorpusValidFor } from '../enum/corpus-valid-for.enum';
import { TopicModelSubtype } from '../enum/topic-model-subtype.enum';
import { TopicModelType } from '../enum/topic-model.-type.enum';

@Injectable()
export class AppEnumUtils extends BaseEnumUtilsService {
	constructor(private language: TranslateService) { super(); }

	public toRoleTypeString(value: RoleType): string {
		switch (value) {
			case RoleType.Admin: return this.language.instant('APP.TYPES.APP-ROLE.ADMIN');
			case RoleType.User: return this.language.instant('APP.TYPES.APP-ROLE.USER');
			case RoleType.DatasetAdmin: return this.language.instant('APP.TYPES.APP-ROLE.DATASET-ADMIN');
			case RoleType.DatasetViewer: return this.language.instant('APP.TYPES.APP-ROLE.DATASET-VIEWER');
			case RoleType.AccessAdmin: return this.language.instant('APP.TYPES.APP-ROLE.ACCESS-ADMIN');
			case RoleType.AccessViewer: return this.language.instant('APP.TYPES.APP-ROLE.ACCESS-VIEWER');
			default: return '';
		}
	}

	public toIsActiveString(value: IsActive): string {
		switch (value) {
			case IsActive.Active: return this.language.instant('APP.TYPES.IS-ACTIVE.ACTIVE');
			case IsActive.Inactive: return this.language.instant('APP.TYPES.IS-ACTIVE.INACTIVE');
			default: return '';
		}
	}

	public toLanguageTypeString(value: LanguageType): string {
		switch (value) {
			case LanguageType.English: return this.language.instant('APP.TYPES.LANGUAGE-TYPE.ENGLISH');
			case LanguageType.Greek: return this.language.instant('APP.TYPES.LANGUAGE-TYPE.GREEK');
			default: return '';
		}
	}

	public toLanguageFlagPath(value: LanguageType): string {
		switch (value) {
			case LanguageType.English: return 'fi fi-gb mr-2';
			case LanguageType.Greek: return 'fi fi-gr mr-2';
			default: return '';
		}
	}

	public toCorpusValidForString(value: CorpusValidFor): string {
		switch (value) {
			case CorpusValidFor.ALL: return this.language.instant('APP.COMMONS.SELECT.ALL');
			case CorpusValidFor.TM: return this.language.instant('APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.NEW-CORPUS-DIALOG.VALID-FOR-OPTIONS.TM');
			case CorpusValidFor.DC: return this.language.instant('APP.CORPUS-COMPONENT.LOGICAL-CORPUS-LISTING-COMPONENT.NEW-CORPUS-DIALOG.VALID-FOR-OPTIONS.DC');
			default: return '-';
		}
	}

	public toTopicModelTypeString(value: TopicModelType): string {
		switch (value) {
			case TopicModelType.all: return this.language.instant('APP.COMMONS.SELECT.ALL');
			case TopicModelType.mallet: return this.language.instant('APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.TOPIC-MODEL-TYPES.MALLET-LDA');
			case TopicModelType.prodLDA: return this.language.instant('APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.TOPIC-MODEL-TYPES.PROD-LDA');
			case TopicModelType.CTM: return this.language.instant('APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.TOPIC-MODEL-TYPES.CTM');
			case TopicModelType.sparkLDA: return this.language.instant('APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.TOPIC-MODEL-TYPES.SPARK-LDA');
			default: return '-';
		}
	}

	public toTopicModelSubtypeString(value: TopicModelSubtype): string {
		switch (value) {
			case TopicModelSubtype.Mallet: return this.language.instant('APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.TOPIC-MODEL-SUBTYPES.MALLET');
			case TopicModelSubtype.Hierarchical: return this.language.instant('APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.TOPIC-MODEL-SUBTYPES.HIERARCHICAL');
			case TopicModelSubtype.All: return this.language.instant('APP.MODELS-COMPONENT.TOPIC-MODELS-LISTING-COMPONENT.TOPIC-MODEL-SUBTYPES.ALL');
			default: return '-';
		}
	}

	public toBlueprintRequestStateString(value: BlueprintRequestState): string {
		switch (value) {
			case BlueprintRequestState.Completed: return this.language.instant('APP.TYPES.BLUEPRINT-REQUEST-STATE.COMPLETED');
			case BlueprintRequestState.Error: return this.language.instant('APP.TYPES.BLUEPRINT-REQUEST-STATE.ERROR');
			case BlueprintRequestState.Send: return this.language.instant('APP.TYPES.BLUEPRINT-REQUEST-STATE.SEND');
			default: return '';
		}
	}

	public toBlueprintTemplateTypeString(value: BlueprintTemplateType): string {
		switch (value) {
			case BlueprintTemplateType.Docx: return this.language.instant('APP.TYPES.BLUEPRINT-TEMPLATE-TYPE.DOCX');
			case BlueprintTemplateType.Xlsx: return this.language.instant('APP.TYPES.BLUEPRINT-TEMPLATE-TYPE.XLSX');
			case BlueprintTemplateType.Pptx: return this.language.instant('APP.TYPES.BLUEPRINT-TEMPLATE-TYPE.PPTX');
			default: return '';
		}
	}

	public toBlueprintTemplateKeyString(value: BlueprintTemplateKey): string {
		switch (value) {
			case BlueprintTemplateKey.DatasetListingReport: return this.language.instant('APP.TYPES.BLUEPRINT-TEMPLATE-KEY.DATASET-LISTING');
			default: return '';
		}
	}
}
